import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Calendar, Newspaper, Info, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchAnimeNews, fetchAnimeFacts } from '../services/animeApi';
import { NewsItem, AnimeFact } from '../types';

type NewsCategory = 'trending' | 'upcoming' | 'facts' | 'updates';

export function AnimeNewsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('trending');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [facts, setFacts] = useState<AnimeFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const [newsData, factsData] = await Promise.all([
        fetchAnimeNews(),
        fetchAnimeFacts()
      ]);

      const allContent = {
        trending: newsData.slice(0, 6),
        upcoming: newsData.slice(6, 12),
        facts: factsData,
        updates: newsData.slice(12, 18)
      };

      if (activeCategory === 'facts') {
        setFacts(allContent.facts);
      } else {
        setNews(allContent[activeCategory]);
      }
      
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch anime content. Please try again later.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [activeCategory]);

  const handleItemClick = (item: NewsItem | AnimeFact) => {
    navigate(`/anime-news/${item.id}`, { 
      state: 'animeId' in item ? { 
        ...item.fullContent,
        id: item.id,
        type: 'fact'
      } : item 
    });
  };

  const categories = [
    { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'upcoming', label: 'Upcoming', icon: <Calendar className="w-5 h-5" /> },
    { id: 'updates', label: 'Updates', icon: <Newspaper className="w-5 h-5" /> },
    { id: 'facts', label: 'Facts', icon: <Info className="w-5 h-5" /> }
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Anime News & Facts</h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Stay updated with the latest anime news and interesting facts
          </p>
          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-500"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeCategory === category.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {category.icon}
                <span>{category.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            </div>
          ))
        ) : activeCategory === 'facts' ? (
          // Facts Grid
          facts.map(fact => (
            <div
              key={fact.id}
              onClick={() => handleItemClick(fact)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <img
                src={fact.imageUrl}
                alt={fact.title}
                className="w-full h-48 object-cover hover:opacity-90 transition-opacity duration-200"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {fact.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {fact.shortFact}
                </p>
                <button className="text-indigo-600 hover:text-indigo-500 flex items-center space-x-1">
                  <span>Read More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          // News Grid
          news.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover hover:opacity-90 transition-opacity duration-200"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleDateString()}
                    <span className="mx-2">•</span>
                    {item.source}
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-500 flex items-center space-x-1">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}