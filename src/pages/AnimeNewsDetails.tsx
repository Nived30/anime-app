import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Globe, Clock, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NewsDetailsState {
  id: string | number;
  type?: 'fact';
  title: string;
  description?: string;
  imageUrl: string;
  date?: string;
  source?: string;
  link?: string;
  facts?: Array<{
    heading: string;
    content: string;
  }>;
}

export function AnimeNewsDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateDailyTask } = useAuth();
  const newsDetails = location.state as NewsDetailsState;
  const readingStartTime = useRef<number>(Date.now());
  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasUpdatedTask = useRef(false);

  useEffect(() => {
    if (!newsDetails) {
      navigate('/anime-news');
      return;
    }

    let readingTimer: NodeJS.Timeout;

    if (user && !user.dailyTasks?.tasks.newsRead && !hasUpdatedTask.current) {
      readingTimer = setTimeout(async () => {
        const readingTime = Math.floor((Date.now() - readingStartTime.current) / 1000);
        if (readingTime >= 300) {
          await updateDailyTask('newsRead');
          hasUpdatedTask.current = true;
        }
      }, 300000);

      readingTimerRef.current = readingTimer;
    }

    return () => {
      if (readingTimerRef.current) {
        clearTimeout(readingTimerRef.current);
      }
    };
  }, [user, newsDetails]);

  if (!newsDetails) {
    return null;
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: newsDetails.title,
        text: newsDetails.description,
        url: window.location.href,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/anime-news')}
        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-500 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to News</span>
      </button>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={newsDetails.imageUrl}
            alt={newsDetails.title}
            className="w-full h-[400px] object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-4xl font-bold mb-4">
              {newsDetails.title}
            </h1>
            {!newsDetails.type && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(newsDetails.date!).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {newsDetails.source}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {user ? "Reading for points" : "Sign in to earn points"}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="prose prose-lg max-w-none">
            {newsDetails.type === 'fact' ? (
              // Render fact content
              <div className="space-y-8">
                {newsDetails.facts?.map((fact, index) => (
                  <div key={index} className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {fact.heading}
                    </h2>
                    <div className="text-gray-700 whitespace-pre-line">
                      {fact.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Render news content
              <>
                <div className="mb-6 text-lg text-gray-600 font-medium">
                  {newsDetails.description}
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-4">
              {newsDetails.link && (
                <a
                  href={newsDetails.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-500"
                >
                  <Globe className="w-5 h-5" />
                  <span>View Original Source</span>
                </a>
              )}
            </div>
            <button
              onClick={handleShare}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-500"
            >
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}