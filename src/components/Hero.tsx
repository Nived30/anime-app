import React from 'react';
import { TrendingUp, Calendar, Star } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-pink-800/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8">
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Anime Central
            </span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
            Discover the latest anime news, trending series, upcoming releases, and fascinating facts 
            from the world of anime. Your ultimate destination for everything anime.
          </p>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <TrendingUp className="h-12 w-12 text-pink-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Trending News</h3>
              <p className="text-gray-300 text-center text-sm">
                Stay updated with the hottest anime series and latest developments
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <Calendar className="h-12 w-12 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Upcoming Releases</h3>
              <p className="text-gray-300 text-center text-sm">
                Get early access to information about upcoming anime series
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-xl">
              <Star className="h-12 w-12 text-yellow-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Anime Facts</h3>
              <p className="text-gray-300 text-center text-sm">
                Discover interesting facts and trivia about your favorite anime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}