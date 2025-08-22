// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'emerald' | 'admin';
  purchases: Purchase[];
  activities: Activity[];
  dailyTasks: DailyTasks;
}

export interface DailyTasks {
  lastUpdated: string;
  tasks: {
    purchase: boolean;
    gameAttempted: boolean;
    newsRead: boolean;
  };
}

// Product and Purchase types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  imageUrl: string;
  category: string;
  pointsRequired?: number;
  stock: number;
}

export interface Purchase {
  id: string;
  productId: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed';
  quantity: number;
  total: number;
  paymentMethod: 'card' | 'points';
  shippingAddress: ShippingAddress;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Activity {
  id: string;
  type: 'purchase' | 'game_played' | 'points_earned' | 'points_spent' | 'tier_upgrade' | 'task_completed' | 'reading';
  description: string;
  date: string;
  points?: number;
  gameType?: string;
}

export interface GameScore {
  userId: string;
  userName: string;
  score: number;
  date: string;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  eventType: 'registration' | 'game_played' | 'purchase' | 'points_earned';
  userId: string;
  metadata: Record<string, any>;
  createdAt: string;
}

// News and Facts types
export interface NewsItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  date: string;
  source: string;
}

export interface AnimeFact {
  id: string;
  animeId: number;
  title: string;
  imageUrl: string;
  shortFact: string;
  fullContent: {
    title: string;
    imageUrl: string;
    facts: Array<{
      heading: string;
      content: string;
    }>;
  };
}

// Constants
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 1000,
  gold: 2500,
  platinum: 5000,
  diamond: 10000,
  emerald: 25000,
  admin: 0
} as const;

export const DAILY_TASK_REWARDS = {
  purchase: 100,
  gameAttempted: 50,
  newsRead: 50
} as const;

// Affiliate types
export interface Affiliate {
  id: string;
  userId: string;
  referralCode: string;
  commissionRate: number;
  totalEarnings: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
}

export interface AffiliateConversion {
  id: string;
  affiliateId: string;
  userId?: string;
  conversionType: 'signup' | 'purchase';
  orderValue?: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: string;
}

export interface AffiliateStats {
  totalClicks: number;
  totalSignups: number;
  totalPurchases: number;
  totalEarnings: number;
  pendingEarnings: number;
  conversionRate: number;
}