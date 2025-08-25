import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  createAffiliate, 
  getAffiliateByUserId, 
  getAffiliateStats, 
  getAffiliateConversions 
} from '../lib/affiliate';
import { 
  Users, 
  MousePointer, 
  DollarSign, 
  TrendingUp, 
  Copy, 
  Check,
  Calendar,
  Eye,
  ShoppingCart,
  UserPlus
} from 'lucide-react';
import type { Affiliate, AffiliateStats, AffiliateConversion } from '../types';

export function AffiliateTracker() {
  const { user, loading } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const affiliateData = await getAffiliateByUserId(user.id);
      
      if (affiliateData) {
        setAffiliate(affiliateData);
        const [statsData, conversionsData] = await Promise.all([
          getAffiliateStats(affiliateData.id),
          getAffiliateConversions(affiliateData.id)
        ]);
        setStats(statsData);
        setConversions(conversionsData);
      }
    } catch (error) {
      console.error('Error loading affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAffiliate = async () => {
    if (!user) return;

    try {
      setCreating(true);
      const newAffiliate = await createAffiliate(user.id);
      setAffiliate(newAffiliate);
      await loadAffiliateData();
    } catch (error) {
      console.error('Error creating affiliate:', error);
      alert('Failed to create affiliate account. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyReferralLink = () => {
    if (!affiliate) return;
    
    const referralLink = `${window.location.origin}/ref/${affiliate.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'paid': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Affiliate Dashboard</h1>
          <p className="text-gray-600">Please log in to access your affiliate dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading affiliate dashboard...</p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Become an Affiliate</h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our affiliate program and earn commissions by referring new users to our platform. 
            Get paid for every signup and purchase made through your unique referral link.
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto mb-8">
            <h3 className="text-xl font-semibold mb-4">Commission Structure</h3>
            <div className="space-y-3 text-left">
              <div className="flex justify-between">
                <span>New Signups:</span>
                <span className="font-semibold text-green-600">$5.00</span>
              </div>
              <div className="flex justify-between">
                <span>Purchase Commission:</span>
                <span className="font-semibold text-green-600">10%</span>
              </div>
              <div className="flex justify-between">
                <span>Cookie Duration:</span>
                <span className="font-semibold">30 days</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCreateAffiliate}
            disabled={creating}
            className="btn-primary disabled:opacity-50"
          >
            {creating ? 'Creating Account...' : 'Create Affiliate Account'}
          </button>
        </div>
      </div>
    );
  }

  const referralLink = `${window.location.origin}/ref/${affiliate.referralCode}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Dashboard</h1>
        <p className="text-gray-600">Track your referrals and earnings</p>
      </div>

      {/* Referral Link Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Referral Link</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1 p-3 bg-gray-50 rounded-md font-mono text-sm">
            {referralLink}
          </div>
          <button
            onClick={copyReferralLink}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Share this link to earn commissions on signups and purchases
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <MousePointer className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalClicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Signups</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalSignups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <ShoppingCart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Purchases</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalPurchases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Conversion Rate</h3>
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-indigo-600">
              {stats.conversionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {stats.totalSignups + stats.totalPurchases} conversions from {stats.totalClicks} clicks
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Pending Earnings</h3>
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              ${stats.pendingEarnings.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Awaiting approval
            </p>
          </div>
        </div>
      )}

      {/* Recent Conversions */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Conversions</h2>
        </div>
        <div className="overflow-x-auto">
          {conversions.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No conversions yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Share your referral link to start earning commissions
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {conversions.map((conversion) => (
                  <tr key={conversion.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {conversion.conversionType === 'signup' ? (
                          <UserPlus className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-blue-500 mr-2" />
                        )}
                        <span className="capitalize">{conversion.conversionType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(conversion.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {conversion.orderValue ? `$${conversion.orderValue.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${conversion.commissionAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(conversion.status)}`}>
                        {conversion.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}