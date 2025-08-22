import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Star, ArrowRight, RefreshCw } from 'lucide-react';
import { fetchAnimeNews, fetchAnimeFacts } from '../services/animeApi';
import { NewsItem, AnimeFact } from '../types';
import { useNavigate } from 'react-router-dom';

export function FeaturedProducts() {
  const navigate = useNavigate();
  const [featuredContent, setFeaturedContent] = useState<(NewsItem | AnimeFact)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    try {
      setLoading(true);
      const [newsData, factsData] = await Promise.all([
        fetchAnimeNews(),
        fetchAnimeFacts()
      ]);

      // Mix trending news and facts for featured section
      const featured = [
        ...newsData.slice(0, 2),
        ...factsData.slice(0, 1)
      ];

      setFeaturedContent(featured);
    } catch (error) {
      console.error('Error loading featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentClick = (item: NewsItem | AnimeFact) => {
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
      <section className="py-16 bg-gradient-to-br from-gray-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto mb-4"></div>
            <p className="text-white">Loading featured content...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Featured Content</h2>
            <p className="text-gray-300">Handpicked anime news and fascinating facts</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={loadFeaturedContent}
              className="flex items-center text-pink-400 hover:text-pink-300 transition-colors duration-200"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Refresh
            </button>
            <button
              onClick={() => navigate('/anime-news')}
              className="flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200"
            >
              View All <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredContent.map((item, index) => {
            const isFact = 'animeId' in item;
            return (
              <div
                key={item.id}
                onClick={() => handleContentClick(item)}
                className="group relative cursor-pointer bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    {isFact ? (
                      <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Fact
                      </span>
                    ) : index === 0 ? (
                      <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Trending
                      </span>
                    ) : (
                      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        News
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-300 transition-colors duration-200">
                      {item.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {isFact ? item.shortFact : item.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {isFact ? 'Anime Fact' : (item as NewsItem).source}
                    </span>
                    <span className="text-gray-400">
                      {new Date(isFact ? new Date().toISOString() : (item as NewsItem).date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}