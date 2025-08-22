import { NewsItem, AnimeFact } from '../types';

const ANILIST_API = 'https://graphql.anilist.co';
const ANN_RSS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.animenewsnetwork.com/all/rss.xml?ann-edition=w';

const ANILIST_QUERY = `
  query {
    trending: Page(page: 1, perPage: 10) {
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        startDate {
          year
          month
          day
        }
        status
        popularity
        meanScore
        studios(isMain: true) {
          nodes {
            name
          }
        }
        genres
        episodes
        duration
        source
      }
    }
    upcoming: Page(page: 1, perPage: 10) {
      media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED) {
        id
        title {
          romaji
          english
        }
        description
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
        startDate {
          year
          month
          day
        }
        status
        genres
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  }
`;

async function fetchAniListData() {
  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query: ANILIST_QUERY }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from AniList');
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0]?.message || 'Error fetching from AniList');
    }

    return data;
  } catch (error) {
    console.error('AniList fetch error:', error);
    throw error;
  }
}

async function fetchAnimeNewsNetwork() {
  try {
    const response = await fetch(ANN_RSS_PROXY);
    if (!response.ok) {
      throw new Error('Failed to fetch from ANN');
    }
    const data = await response.json();
    
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('Invalid response from ANN');
    }

    return data;
  } catch (error) {
    console.error('ANN fetch error:', error);
    throw error;
  }
}

function extractImageFromContent(content: string): string | null {
  if (!content) return null;

  const patterns = [
    /<img[^>]+src="([^">]+full[^">]+\.(jpg|png|webp))"[^>]*>/i,
    /<img[^>]+src="([^">]+large[^">]+\.(jpg|png|webp))"[^>]*>/i,
    /<img[^>]+src="([^">]+original[^">]+\.(jpg|png|webp))"[^>]*>/i,
    /<img[^>]+src="([^">]+\d{4}x\d{4}[^">]+\.(jpg|png|webp))"[^>]*>/i,
    /<img[^>]+src="([^">]+(?:anime|screenshot|visual)[^">]+\.(jpg|png|webp))"[^>]*>/i,
    /<img[^>]+src="([^">]+\.(jpg|png|webp))"[^>]*>/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      const url = match[1];
      try {
        new URL(url);
        return url;
      } catch {
        continue;
      }
    }
  }
  
  return null;
}

function getAnimeImage(anime: any): string {
  if (!anime) return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80';

  const fallbackImage = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80';

  try {
    // For anime entries, always use anime-specific images
    if (anime.coverImage) {
      // Prioritize the highest quality cover image
      return anime.coverImage.extraLarge || 
             anime.coverImage.large || 
             anime.coverImage.medium;
    }

    // Fallback to banner image if no cover image
    if (anime.bannerImage) {
      return anime.bannerImage;
    }

    return fallbackImage;
  } catch (error) {
    console.error('Error getting anime image:', error);
    return fallbackImage;
  }
}

function formatDate(year?: number, month?: number, day?: number): string {
  if (!year || !month || !day) return new Date().toISOString();
  return new Date(year, month - 1, day).toISOString();
}

export async function fetchAnimeNews(): Promise<NewsItem[]> {
  try {
    const [anilistData, annData] = await Promise.all([
      fetchAniListData(),
      fetchAnimeNewsNetwork()
    ]);

    if (!anilistData?.data?.trending?.media || !anilistData?.data?.upcoming?.media) {
      throw new Error('Invalid AniList response structure');
    }

    // Format trending anime news with anime-specific images
    const trendingNews: NewsItem[] = anilistData.data.trending.media
      .filter(anime => anime && anime.title)
      .map((anime: any) => ({
        id: anime.id,
        title: anime.title.english || anime.title.romaji,
        description: anime.description?.replace(/<[^>]*>/g, '') || 'No description available',
        imageUrl: getAnimeImage(anime),
        link: `https://anilist.co/anime/${anime.id}`,
        date: formatDate(anime.startDate.year, anime.startDate.month, anime.startDate.day),
        source: 'AniList Trending'
      }));

    // Format upcoming anime news with anime-specific images
    const upcomingNews: NewsItem[] = anilistData.data.upcoming.media
      .filter(anime => anime && anime.title)
      .map((anime: any) => ({
        id: `upcoming-${anime.id}`,
        title: anime.title.english || anime.title.romaji,
        description: anime.description?.replace(/<[^>]*>/g, '') || 'No description available',
        imageUrl: getAnimeImage(anime),
        link: `https://anilist.co/anime/${anime.id}`,
        date: formatDate(anime.startDate.year, anime.startDate.month, anime.startDate.day),
        source: 'AniList Upcoming'
      }));

    // Format ANN news with enhanced image extraction
    const annNews: NewsItem[] = annData.items
      .filter(item => item && item.title && (item.content || item.description))
      .map((item: any) => {
        const imageUrl = extractImageFromContent(item.content) || 
                        extractImageFromContent(item.description) ||
                        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80';

        return {
          id: item.guid || String(Math.random()),
          title: item.title,
          description: item.description?.replace(/<[^>]*>/g, '') || 'No description available',
          imageUrl,
          link: item.link,
          date: new Date(item.pubDate).toISOString(),
          source: 'Anime News Network'
        };
      });

    // Combine and sort by date
    const allNews = [...trendingNews, ...upcomingNews, ...annNews].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (allNews.length === 0) {
      throw new Error('No news items available');
    }

    return allNews;
  } catch (error) {
    console.error('Error fetching anime news:', error);
    return [];
  }
}

export async function fetchAnimeFacts(): Promise<AnimeFact[]> {
  try {
    const { data } = await fetchAniListData();
    
    if (!data?.trending?.media) {
      throw new Error('Invalid response structure for anime facts');
    }

    const facts = data.trending.media
      .filter(anime => anime && anime.title)
      .map((anime: any) => {
        const studios = anime.studios?.nodes?.map((s: any) => s.name).join(', ') || 'Unknown';
        const genres = anime.genres?.join(', ') || 'Not specified';
        const imageUrl = getAnimeImage(anime);
        
        return {
          id: `fact-${anime.id}`,
          animeId: anime.id,
          title: anime.title.english || anime.title.romaji,
          imageUrl,
          shortFact: `${anime.title.english || anime.title.romaji} has a mean score of ${anime.meanScore || 'N/A'}/100 with ${anime.popularity?.toLocaleString() || 0} fans.`,
          fullContent: {
            title: anime.title.english || anime.title.romaji,
            imageUrl,
            facts: [
              {
                heading: 'Popularity',
                content: `This anime has a mean score of ${anime.meanScore || 'N/A'}/100 and ${anime.popularity?.toLocaleString() || 0} fans on AniList.`
              },
              {
                heading: 'Production',
                content: `Produced by ${studios}`
              },
              {
                heading: 'Details',
                content: `
                  • Episodes: ${anime.episodes || 'TBA'}
                  • Episode Duration: ${anime.duration || 'Unknown'} minutes
                  • Genres: ${genres}
                  • Source Material: ${anime.source || 'Unknown'}
                `.trim()
              },
              {
                heading: 'Synopsis',
                content: anime.description?.replace(/<[^>]*>/g, '') || 'No synopsis available.'
              }
            ]
          }
        };
      });

    if (facts.length === 0) {
      throw new Error('No anime facts available');
    }

    return facts;
  } catch (error) {
    console.error('Error fetching anime facts:', error);
    return [];
  }
}