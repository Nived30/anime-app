import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { fetchProducts } from '../../lib/products';
import { subscribeToAnalytics, subscribeToUserPoints } from '../../lib/analytics';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Search,
  Bell
} from 'lucide-react';
import type { Product, AnalyticsEvent } from '../../types';

interface DashboardAnalytics {
  totalUsers: number;
  totalPurchases: number;
  totalRevenue: number;
  recentEvents: AnalyticsEvent[];
}

interface UserData {
  id: string;
  email: string;
  name: string;
  points: number;
  created_at: string;
  last_sign_in_at: string;
  activities: AnalyticsEvent[];
}

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0,
    recentEvents: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });
  const [liveActivities, setLiveActivities] = useState<{
    userId: string;
    event: string;
    timestamp: string;
    details: string;
  }[]>([]);

  const updateLiveActivity = useCallback((event: any) => {
    const user = users.find(u => u.id === event.user_id);
    if (!user) return;

    const newActivity = {
      userId: event.user_id,
      event: event.event_type,
      timestamp: new Date().toISOString(),
      details: getEventDetails(event, user.name)
    };

    setLiveActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
  }, [users]);

  function getEventDetails(event: any, userName: string) {
    switch (event.event_type) {
      case 'points_update':
        const pointsChange = event.metadata.points_change;
        return `${userName} ${pointsChange > 0 ? 'earned' : 'spent'} ${Math.abs(pointsChange)} points`;
      case 'purchase':
        return `${userName} made a purchase`;
      case 'game_played':
        return `${userName} played ${event.metadata.game_type}`;
      default:
        return `${userName} performed ${event.event_type}`;
    }
  }

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isAdmin = session?.user?.app_metadata?.role === 'admin';
        
        if (!isAdmin) {
          console.error('Access denied: User is not an admin');
          navigate('/');
          return;
        }

        loadDashboardData();

        // Subscribe to real-time updates with hourly throttling
        const analyticsSubscription = subscribeToAnalytics((payload) => {
          const { new: newEvent } = payload;
          if (newEvent) {
            const now = new Date().getTime();
            const lastUpdate = localStorage.getItem('lastAnalyticsUpdate');
            const hourInMs = 3600000;

            if (!lastUpdate || now - parseInt(lastUpdate) >= hourInMs) {
              updateLiveActivity(newEvent);
              loadDashboardData();
              localStorage.setItem('lastAnalyticsUpdate', now.toString());
            }
          }
        });

        const pointsSubscription = subscribeToUserPoints(() => {
          const now = new Date().getTime();
          const lastUpdate = localStorage.getItem('lastPointsUpdate');
          const hourInMs = 3600000;

          if (!lastUpdate || now - parseInt(lastUpdate) >= hourInMs) {
            loadDashboardData();
            localStorage.setItem('lastPointsUpdate', now.toString());
          }
        });

        return () => {
          analyticsSubscription.unsubscribe();
          pointsSubscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error checking admin access:', error);
        navigate('/');
      }
    }

    checkAdminAccess();
  }, [navigate, updateLiveActivity]);

  async function loadDashboardData() {
    try {
      setIsLoading(true);
      
      // Fetch products
      const productsData = await fetchProducts();
      setProducts(productsData);

      // Fetch all users from the user_profiles view
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*');

      if (userError) throw userError;

      // Fetch user points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('user_id, points');

      if (pointsError) throw pointsError;

      // Fetch user analytics
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (analyticsError) throw analyticsError;

      // Process user data
      const processedUsers = userData.map(user => {
        const userPoints = pointsData
          ?.filter(p => p.user_id === user.id)
          .reduce((sum, p) => sum + p.points, 0) || 0;

        const userAnalytics = analyticsData
          ?.filter(a => a.user_id === user.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
          id: user.id,
          email: user.email,
          name: user.email.split('@')[0],
          points: userPoints,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          activities: userAnalytics || []
        };
      });

      setUsers(processedUsers);

      // Update analytics
      const purchases = analyticsData?.filter(event => event.event_type === 'purchase') || [];
      const totalRevenue = purchases.reduce((sum, purchase) => 
        sum + (purchase.metadata.total || 0), 0
      );

      setAnalytics({
        totalUsers: userData.length,
        totalPurchases: purchases.length,
        totalRevenue,
        recentEvents: analyticsData || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSort = (key: keyof UserData) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });

  const filteredUsers = sortedUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalPurchases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${analytics.totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Events</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics.recentEvents.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Live Activity Feed</h2>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {liveActivities.length === 0 ? (
              <p className="text-gray-500 text-center">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {liveActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <Activity className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.details}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center">
                      User
                      {sortConfig.key === 'email' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('points')}
                  >
                    <div className="flex items-center">
                      Points
                      {sortConfig.key === 'points' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Joined
                      {sortConfig.key === 'created_at' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('last_sign_in_at')}
                  >
                    <div className="flex items-center">
                      Last Active
                      {sortConfig.key === 'last_sign_in_at' && (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recent Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.points}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.activities[0] 
                          ? `${user.activities[0].event_type} - ${new Date(user.activities[0].created_at).toLocaleDateString()}`
                          : 'No recent activity'
                        }
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
              <button className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.imageUrl}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price}</div>
                      {product.pointsRequired && (
                        <div className="text-sm text-gray-500">
                          or {product.pointsRequired} points
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}