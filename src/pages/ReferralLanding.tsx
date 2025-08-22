import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { setAffiliateCookie, trackAffiliateClick, getAffiliateByCode } from '../lib/affiliate';
import { Gift, Star, Users, TrendingUp } from 'lucide-react';

export function ReferralLanding() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      handleReferralClick(code);
    }
  }, [code]);

  const handleReferralClick = async (referralCode: string) => {
    try {
      // Verify the referral code exists
      const affiliate = await getAffiliateByCode(referralCode);
      
      if (affiliate) {
        // Set the affiliate cookie
        setAffiliateCookie(referralCode);
        
        // Track the click
        await trackAffiliateClick(referralCode);
      }
    } catch (error) {
      console.error('Error handling referral click:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <div className="mb-8">
              <Gift className="mx-auto h-16 w-16 text-pink-400 mb-4" />
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Anime Central
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
                You've been invited by a friend! Join our community and discover the latest anime news, 
                play games, and earn rewards.
              </p>
            </div>

            {/* Special Offer Banner */}
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl p-8 mb-12 max-w-2xl mx-auto border border-pink-500/30">
              <h2 className="text-2xl font-bold text-white mb-4">🎉 Special Welcome Bonus!</h2>
              <p className="text-gray-200 mb-6">
                Sign up now and get <span className="text-pink-400 font-bold">100 bonus points</span> to start your journey!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center p-3 bg-white/10 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-white">Instant Rewards</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-white/10 rounded-lg">
                  <Users className="h-5 w-5 text-green-400 mr-2" />
                  <span className="text-white">Join Community</span>
                </div>
                <div className="flex items-center justify-center p-3 bg-white/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
                  <span className="text-white">Earn More Points</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                <Gift className="mr-2 h-5 w-5" />
                Sign Up & Claim Bonus
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
              >
                Explore First
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <TrendingUp className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Latest Anime News</h3>
                <p className="text-gray-300 text-sm">
                  Stay updated with trending anime series, upcoming releases, and industry news
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Play & Earn</h3>
                <p className="text-gray-300 text-sm">
                  Play mini-games, complete daily tasks, and earn points to unlock exclusive rewards
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Join Community</h3>
                <p className="text-gray-300 text-sm">
                  Connect with fellow anime fans and discover new series together
                </p>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 text-center">
              <p className="text-gray-400 text-sm mb-4">Trusted by anime fans worldwide</p>
              <div className="flex justify-center items-center space-x-8 text-gray-500">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>10,000+ Members</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span>Daily Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}