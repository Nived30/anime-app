import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trophy, Star, ChevronRight, Activity } from 'lucide-react';
import { TIER_THRESHOLDS, DAILY_TASK_REWARDS } from '../types';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, updateDailyTask } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Please log in to view your dashboard.</p>
      </div>
    );
  }

  const handleTaskClick = async (taskType: keyof typeof DAILY_TASK_REWARDS, path: string) => {
    await updateDailyTask(taskType);
    navigate(path);
  };

  const tiers = Object.entries(TIER_THRESHOLDS);
  const currentTierIndex = tiers.findIndex(([tier]) => tier === user.tier);
  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  
  const pointsToNextTier = nextTier ? nextTier[1] - user.points : 0;
  const progress = nextTier 
    ? ((user.points - tiers[currentTierIndex][1]) / (nextTier[1] - tiers[currentTierIndex][1])) * 100
    : 100;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-700';
      case 'silver': return 'text-gray-500';
      case 'gold': return 'text-yellow-500';
      case 'platinum': return 'text-blue-500';
      case 'diamond': return 'text-purple-500';
      case 'emerald': return 'text-emerald-500';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h1>
        <p className="text-gray-600">Manage your account, track rewards, and view purchase history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Points Balance</h2>
            <Trophy className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-2">{user.points}</p>
          <p className="text-sm text-gray-600">Available points to spend</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Member Tier</h2>
            <Star className={`h-6 w-6 ${getTierColor(user.tier)}`} />
          </div>
          <p className={`text-3xl font-bold mb-2 capitalize ${getTierColor(user.tier)}`}>
            {user.tier}
          </p>
          {nextTier && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {pointsToNextTier} points until {nextTier[0]}
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
          </div>
          {user.purchases.length > 0 ? (
            <ul className="space-y-4">
              {user.purchases.slice(0, 3).map((purchase) => (
                <li key={purchase.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Order #{purchase.id}</p>
                    <p className="text-sm text-gray-600">{new Date(purchase.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    purchase.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : purchase.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {purchase.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No orders yet</p>
          )}
        </div>
      </div>

      {/* Daily Tasks Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border ${
            user?.dailyTasks?.tasks.purchase 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Daily Purchase</h3>
              <span className="text-sm font-medium text-indigo-600">
                +{DAILY_TASK_REWARDS.purchase} points
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Make a purchase in the shop
            </p>
            {user?.dailyTasks?.tasks.purchase ? (
              <span className="text-green-600 text-sm font-medium">✓ Completed</span>
            ) : (
              <button
                onClick={() => handleTaskClick('purchase', '/shop')}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-500"
              >
                View Shop
              </button>
            )}
          </div>

          <div className={`p-4 rounded-lg border ${
            user?.dailyTasks?.tasks.gameAttempted 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Play a Game</h3>
              <span className="text-sm font-medium text-indigo-600">
                +{DAILY_TASK_REWARDS.gameAttempted} points
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Play any mini-game once
            </p>
            {user?.dailyTasks?.tasks.gameAttempted ? (
              <span className="text-green-600 text-sm font-medium">✓ Completed</span>
            ) : (
              <button
                onClick={() => handleTaskClick('gameAttempted', '/games')}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-500"
              >
                Play Games
              </button>
            )}
          </div>

          <div className={`p-4 rounded-lg border ${
            user?.dailyTasks?.tasks.newsRead 
              ? 'bg-green-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">Read News</h3>
              <span className="text-sm font-medium text-indigo-600">
                +{DAILY_TASK_REWARDS.newsRead} points
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Read news for 5 minutes
            </p>
            {user?.dailyTasks?.tasks.newsRead ? (
              <span className="text-green-600 text-sm font-medium">✓ Completed</span>
            ) : (
              <button
                onClick={() => handleTaskClick('newsRead', '/anime-news')}
                className="text-indigo-600 text-sm font-medium hover:text-indigo-500"
              >
                Read News
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {user.activities.length > 0 ? (
            user.activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'purchase' ? 'bg-green-100 text-green-600' :
                    activity.type === 'game_played' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'points_earned' ? 'bg-yellow-100 text-yellow-600' :
                    activity.type === 'points_spent' ? 'bg-red-100 text-red-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(activity.date).toLocaleDateString()}
                      {activity.points && (
                        <span className={activity.type === 'points_spent' ? 'text-red-600' : 'text-green-600'}>
                          {' '}{activity.type === 'points_spent' ? '-' : '+'}{activity.points} points
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center">No recent activity</p>
          )}
        </div>
      </div>

      {/* Tier Progress */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tier Progress</h2>
        <div className="space-y-6">
          {tiers.map(([tier, points], index) => {
            const isCurrentTier = tier === user.tier;
            const isPastTier = tiers[currentTierIndex][1] > points;
            const tierProgress = isCurrentTier 
              ? ((user.points - points) / (nextTier ? nextTier[1] - points : 1)) * 100
              : isPastTier ? 100 : 0;

            return (
              <div key={tier} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium capitalize ${getTierColor(tier)}`}>
                    {tier}
                    {isCurrentTier && <span className="ml-2 text-sm text-gray-500">(Current)</span>}
                  </span>
                  <span className="text-sm text-gray-600">{points.toLocaleString()} points</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${getTierColor(tier)} bg-current`}
                    style={{ width: `${Math.min(tierProgress, 100)}%`, opacity: 0.6 }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}