import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Purchase, Activity, TIER_THRESHOLDS, DAILY_TASK_REWARDS, DailyTasks } from '../types';
import { supabase } from '../lib/supabase';
import { trackAffiliateConversion } from '../lib/affiliate';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserPoints: (pointChange: number, gameType?: string) => Promise<void>;
  addPurchase: (purchase: Purchase) => Promise<void>;
  updateDailyTask: (taskType: keyof DailyTasks['tasks']) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateTier = (points: number) => {
    const tiers = Object.entries(TIER_THRESHOLDS);
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (points >= tiers[i][1]) {
        return tiers[i][0] as User['tier'];
      }
    }
    return 'bronze' as User['tier'];
  };

  const getTotalPoints = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data?.reduce((sum, record) => sum + record.points, 0) ?? 0;
    } catch (error) {
      console.error('Error in getTotalPoints:', error);
      return 0;
    }
  };

  // Check if we're in demo mode
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Initialize session and auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        if (isDemoMode) {
          // Demo mode - check localStorage
          const demoUser = localStorage.getItem('demoUser');
          if (demoUser) {
            setUser(JSON.parse(demoUser));
          }
          setLoading(false);
          return;
        }
        
        // Real Supabase mode
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const totalPoints = await getTotalPoints(session.user.id);
          const tier = calculateTier(totalPoints);

          const userProfile: User = {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            points: totalPoints,
            tier,
            purchases: [],
            activities: [],
            dailyTasks: {
              lastUpdated: new Date().toDateString(),
              tasks: {
                purchase: false,
                gameAttempted: false,
                newsRead: false
              }
            }
          };
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    if (!isDemoMode) {
      // Set up auth state change listener for real Supabase
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const totalPoints = await getTotalPoints(session.user.id);
          const tier = calculateTier(totalPoints);

          const userProfile: User = {
            id: session.user.id,
            name: session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            points: totalPoints,
            tier,
            purchases: [],
            activities: [],
            dailyTasks: {
              lastUpdated: new Date().toDateString(),
              tasks: {
                purchase: false,
                gameAttempted: false,
                newsRead: false
              }
            }
          };
          setUser(userProfile);
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isDemoMode]);

  // Reset daily tasks at midnight
  useEffect(() => {
    if (user) {
      const today = new Date().toDateString();
      if (user.dailyTasks?.lastUpdated !== today) {
        setUser(prev => prev ? {
          ...prev,
          dailyTasks: {
            lastUpdated: today,
            tasks: {
              purchase: false,
              gameAttempted: false,
              newsRead: false
            }
          }
        } : null);
      }
    }
  }, [user?.dailyTasks?.lastUpdated]);

  const updateUserPoints = useCallback(async (pointChange: number, gameType: string = 'purchase') => {
    if (!user) return;

    try {
      if (isDemoMode) {
        // Demo mode - update local storage
        const newPoints = user.points + pointChange;
        const newTier = calculateTier(newPoints);
        
        const activity: Activity = {
          id: Math.random().toString(36).substr(2, 9),
          type: pointChange > 0 ? 'points_earned' : 'points_spent',
          description: pointChange > 0 
            ? `Earned ${pointChange} points${gameType !== 'purchase' ? ` from ${gameType}` : ''}`
            : `Spent ${Math.abs(pointChange)} points on purchase`,
          date: new Date().toISOString(),
          points: Math.abs(pointChange),
          gameType
        };
        
        const updatedUser = {
          ...user,
          points: newPoints,
          tier: newTier,
          activities: [activity, ...user.activities]
        };
        
        setUser(updatedUser);
        localStorage.setItem('demoUser', JSON.stringify(updatedUser));
        return;
      }
      
      // Real Supabase mode
      const mappedGameType = gameType === 'task_completed' ? 'task_completed' :
                           gameType === 'reading' ? 'reading' :
                           gameType === 'reaction' ? 'reaction' :
                           gameType;

      const { error: insertError } = await supabase.from('user_points').insert({
        user_id: user.id,
        points: pointChange,
        game_type: mappedGameType
      });

      if (insertError) {
        throw insertError;
      }

      const totalPoints = await getTotalPoints(user.id);
      const newTier = calculateTier(totalPoints);
      const oldTier = user.tier;
      
      const activity: Activity = {
        id: Math.random().toString(36).substr(2, 9),
        type: pointChange > 0 ? 'points_earned' : 'points_spent',
        description: pointChange > 0 
          ? `Earned ${pointChange} points${gameType !== 'purchase' ? ` from ${gameType}` : ''}`
          : `Spent ${Math.abs(pointChange)} points on purchase`,
        date: new Date().toISOString(),
        points: Math.abs(pointChange),
        gameType
      };

      if (newTier !== oldTier) {
        const tierUpgradeActivity: Activity = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'tier_upgrade',
          description: `Upgraded to ${newTier} tier`,
          date: new Date().toISOString()
        };
        setUser(prev => prev ? {
          ...prev,
          points: totalPoints,
          tier: newTier,
          activities: [tierUpgradeActivity, activity, ...prev.activities]
        } : null);
      } else {
        setUser(prev => prev ? {
          ...prev,
          points: totalPoints,
          tier: newTier,
          activities: [activity, ...prev.activities]
        } : null);
      }
    } catch (error) {
      console.error('Error updating points:', error);
      throw error;
    }
  }, [user, isDemoMode]);

  const updateDailyTask = useCallback(async (taskType: keyof DailyTasks['tasks']) => {
    if (!user) return;

    const today = new Date().toDateString();
    
    if (user.dailyTasks?.lastUpdated === today && user.dailyTasks.tasks[taskType]) {
      return;
    }

    if (
      (taskType === 'purchase' && !user.dailyTasks?.tasks.purchase) ||
      (taskType === 'gameAttempted' && !user.dailyTasks?.tasks.gameAttempted) ||
      (taskType === 'newsRead' && !user.dailyTasks?.tasks.newsRead)
    ) {
      const points = DAILY_TASK_REWARDS[taskType];
      
      try {
        await updateUserPoints(points, 'task_completed');
        
        setUser(prev => {
          if (!prev) return null;
          const updatedUser = {
            ...prev,
            dailyTasks: {
              lastUpdated: today,
              tasks: {
                ...prev.dailyTasks?.tasks,
                [taskType]: true
              }
            }
          };
          
          if (isDemoMode) {
            localStorage.setItem('demoUser', JSON.stringify(updatedUser));
          }
          
          return updatedUser;
        });
      } catch (error) {
        console.error('Error updating daily task:', error);
        throw error;
      }
    }
  }, [user, updateUserPoints, isDemoMode]);

  const addPurchase = useCallback(async (purchase: Purchase) => {
    if (!user) return;

    // Track affiliate conversion for purchase
    try {
      await trackAffiliateConversion(user.id, 'purchase', purchase.total);
    } catch (error) {
      console.error('Error tracking affiliate purchase:', error);
    }

    const activity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'purchase',
      description: `Purchased items for $${purchase.total}`,
      date: new Date().toISOString()
    };

    const updatedUser = {
      ...user,
      purchases: [purchase, ...user.purchases],
      activities: [activity, ...user.activities]
    };

    setUser(updatedUser);
    
    if (isDemoMode) {
      localStorage.setItem('demoUser', JSON.stringify(updatedUser));
    }
  }, [user, isDemoMode]);

  const register = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Demo mode - create mock user immediately
        const userProfile: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0],
          email: email,
          points: 100, // Welcome bonus
          tier: 'bronze',
          purchases: [],
          activities: [{
            id: Math.random().toString(36).substr(2, 9),
            type: 'points_earned',
            description: 'Welcome bonus points',
            date: new Date().toISOString(),
            points: 100
          }],
          dailyTasks: {
            lastUpdated: new Date().toDateString(),
            tasks: {
              purchase: false,
              gameAttempted: false,
              newsRead: false
            }
          }
        };
        
        setUser(userProfile);
        localStorage.setItem('demoUser', JSON.stringify(userProfile));
        
        // Track affiliate conversion for signup
        try {
          await trackAffiliateConversion(userProfile.id, 'signup');
        } catch (error) {
          console.error('Error tracking affiliate signup:', error);
        }
        
        return;
      }

      // Real Supabase mode
      const { data: { user: authUser }, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (!authUser) throw new Error('Registration failed: No user returned');

      const userProfile: User = {
        id: authUser.id,
        name: email.split('@')[0],
        email: authUser.email!,
        points: 0,
        tier: 'bronze',
        purchases: [],
        activities: [],
        dailyTasks: {
          lastUpdated: new Date().toDateString(),
          tasks: {
            purchase: false,
            gameAttempted: false,
            newsRead: false
          }
        }
      };

      setUser(userProfile);
      
      // Track affiliate conversion for signup
      try {
        await trackAffiliateConversion(authUser.id, 'signup');
      } catch (error) {
        console.error('Error tracking affiliate signup:', error);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Demo mode - create or load user immediately
        const existingUser = localStorage.getItem('demoUser');
        if (existingUser) {
          const userProfile = JSON.parse(existingUser);
          setUser(userProfile);
        } else {
          // Create new demo user
          const userProfile: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],
            email: email,
            points: 100,
            tier: 'bronze',
            purchases: [],
            activities: [{
              id: Math.random().toString(36).substr(2, 9),
              type: 'points_earned',
              description: 'Welcome bonus points',
              date: new Date().toISOString(),
              points: 100
            }],
            dailyTasks: {
              lastUpdated: new Date().toDateString(),
              tasks: {
                purchase: false,
                gameAttempted: false,
                newsRead: false
              }
            }
          };
          
          setUser(userProfile);
          localStorage.setItem('demoUser', JSON.stringify(userProfile));
        }
        return;
      }

      // Real Supabase mode
      const { data: { user: authUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (!authUser) throw new Error('Login failed: No user returned');

      const totalPoints = await getTotalPoints(authUser.id);
      const tier = calculateTier(totalPoints);

      const userProfile: User = {
        id: authUser.id,
        name: email.split('@')[0],
        email: authUser.email!,
        points: totalPoints,
        tier,
        purchases: [],
        activities: [],
        dailyTasks: {
          lastUpdated: new Date().toDateString(),
          tasks: {
            purchase: false,
            gameAttempted: false,
            newsRead: false
          }
        }
      };

      setUser(userProfile);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        localStorage.removeItem('demoUser');
        setUser(null);
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(error.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      updateUserPoints,
      addPurchase,
      updateDailyTask,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}