import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Star, Play, Users, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { fetchAnimeNews, fetchAnimeFacts } from '../services/animeApi';
import { NewsItem, AnimeFact } from '../types';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();
  const [trendingNews, setTrendingNews] = useState<NewsItem[]>([]);
  const [upcomingNews, setUpcomingNews] = useState<NewsItem[]>([]);
  const [animeFacts, setAnimeFacts] = useState<AnimeFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnimeContent();
  }, []);

  const loadAnimeContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [newsData, factsData] = await Promise.all([
        fetchAnimeNews(),
        fetchAnimeFacts()
      ]);

      // Separate news by source
      const trending = newsData.filter(item => item.source === 'AniList Trending').slice(0, 6);
      const upcoming = newsData.filter(item => item.source === 'AniList Upcoming').slice(0, 4);
      
      setTrendingNews(trending);
      setUpcomingNews(upcoming);
      setAnimeFacts(factsData.slice(0, 3));
    } catch (err) {
      setError('Failed to load anime content. Please try again later.');
      console.error('Error loading anime content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsClick = (item: NewsItem | AnimeFact) => {
    navigate(`/anime-news/${item.id}`, { 
      state: 'animeId' in item ? { 
        ...item.fullContent,
        id: item.id,
        type: 'fact'
      } : item 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading latest anime content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Anime Central
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Your ultimate destination for the latest anime news, trending series, and exclusive content
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/anime-news')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore All News
              </button>
              <button
                onClick={loadAnimeContent}
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                Refresh Content
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Trending Anime Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-pink-400 mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Trending Now</h2>
            </div>
            <button
              onClick={() => navigate('/anime-news')}
              className="text-pink-400 hover:text-pink-300 flex items-center transition-colors duration-200"
            >
              View All <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingNews.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNewsClick(item)}
                className="group cursor-pointer bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Trending
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-pink-300 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{item.source}</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Anime Section */}
      <section className="py-16 bg-black/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-400 mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Coming Soon</h2>
            </div>
            <button
              onClick={() => navigate('/anime-news')}
              className="text-purple-400 hover:text-purple-300 flex items-center transition-colors duration-200"
            >
              View All <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingNews.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNewsClick(item)}
                className="group cursor-pointer bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-xl overflow-hidden hover:from-purple-800/60 hover:to-pink-800/60 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <Clock className="h-5 w-5 text-purple-300" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  <div className="text-xs text-purple-300">
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anime Facts Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-400 mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">Did You Know?</h2>
            </div>
            <button
              onClick={() => navigate('/anime-news')}
              className="text-yellow-400 hover:text-yellow-300 flex items-center transition-colors duration-200"
            >
              More Facts <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {animeFacts.map((fact) => (
              <div
                key={fact.id}
                onClick={() => handleNewsClick(fact)}
                className="group cursor-pointer bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-sm rounded-xl overflow-hidden hover:from-yellow-800/40 hover:to-orange-800/40 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={fact.imageUrl}
                    alt={fact.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-200">
                      {fact.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 text-sm mb-4">
                    {fact.shortFact}
                  </p>
                  <div className="flex items-center text-yellow-400 text-sm font-semibold">
                    <Play className="h-4 w-4 mr-2" />
                    Learn More
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-pink-900/50 to-purple-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stay Updated with Anime Central
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Get the latest anime news, reviews, and exclusive content delivered straight to you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/anime-news')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Browse All News
            </button>
            <button
              onClick={() => navigate('/games')}
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
            >
              <Users className="mr-2 h-5 w-5" />
              Play Games & Earn Points
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}