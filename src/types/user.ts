import { User as NextAuthUser } from 'next-auth';

// User Types
export interface User extends NextAuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  created_at?: Date;
  updated_at?: Date;
  subscription?: UserSubscription;
  profile?: UserProfile;
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  type: 'FREE' | 'PLUS';
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'UNPAID';
  start_date: Date;
  end_date?: Date;
  auto_renew: boolean;
  payment_method?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  current_period_start?: Date;
  current_period_end?: Date;
  trial_start?: Date;
  trial_end?: Date;
  cancel_at_period_end: boolean;
  canceled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName?: string;
  bio?: string;
  level?: number;
  experience?: number;
  favoriteMap?: string;
  mainWeapon?: string;
  playStyle?: 'AGGRESSIVE' | 'PASSIVE' | 'BALANCED' | 'SUPPORT';
  region?: string;
  timezone?: string;
  discordUsername?: string;
  twitchUsername?: string;
  youtubeChannel?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'DARK' | 'LIGHT' | 'AUTO';
  language: 'PT' | 'EN' | 'RU' | 'ES' | 'FR' | 'DE';
  currency: 'RUB' | 'USD' | 'EUR';
  notifications: {
    email: boolean;
    push: boolean;
    discord: boolean;
    priceAlerts: boolean;
    questUpdates: boolean;
    marketUpdates: boolean;
    newsUpdates: boolean;
  };
  privacy: {
    showProfile: boolean;
    showStats: boolean;
    showInventory: boolean;
    showProgress: boolean;
  };
  display: {
    itemsPerPage: number;
    showImages: boolean;
    compactMode: boolean;
    showTooltips: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  id: string;
  userId: string;
  totalLogins: number;
  lastLogin: Date;
  totalSearches: number;
  favoriteItems: string[];
  watchedItems: string[];
  completedQuests: string[];
  hideoutProgress: {
    stationId: string;
    level: number;
    completed: boolean;
  }[];
  achievements: UserAchievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  unlockedAt: Date;
  progress?: number;
  maxProgress?: number;
}

// Watchlist Types
export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: WatchlistItem[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistItem {
  id: string;
  watchlistId: string;
  itemId: string;
  targetPrice?: number;
  priceDirection: 'ABOVE' | 'BELOW';
  notifyOnChange: boolean;
  addedAt: Date;
  notes?: string;
}

// Price Alert Types
export interface PriceAlert {
  id: string;
  userId: string;
  itemId: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW' | 'EQUAL';
  isActive: boolean;
  triggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Activity Types
export interface UserActivity {
  id: string;
  userId: string;
  type: 'SEARCH' | 'VIEW_ITEM' | 'ADD_WATCHLIST' | 'PRICE_ALERT' | 'QUEST_COMPLETE' | 'ACHIEVEMENT_UNLOCK';
  data: Record<string, any>;
  timestamp: Date;
}

// Session Types
export interface UserSession {
  user: User;
  expires: string;
  accessToken?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  acceptTerms: boolean;
}

export interface ProfileUpdateForm {
  displayName?: string;
  bio?: string;
  favoriteMap?: string;
  mainWeapon?: string;
  playStyle?: 'AGGRESSIVE' | 'PASSIVE' | 'BALANCED' | 'SUPPORT';
  region?: string;
  timezone?: string;
  discordUsername?: string;
  twitchUsername?: string;
  youtubeChannel?: string;
  isPublic: boolean;
}

export interface PreferencesUpdateForm {
  theme: 'DARK' | 'LIGHT' | 'AUTO';
  language: 'PT' | 'EN' | 'RU' | 'ES' | 'FR' | 'DE';
  currency: 'RUB' | 'USD' | 'EUR';
  notifications: {
    email: boolean;
    push: boolean;
    discord: boolean;
    priceAlerts: boolean;
    questUpdates: boolean;
    marketUpdates: boolean;
    newsUpdates: boolean;
  };
  privacy: {
    showProfile: boolean;
    showStats: boolean;
    showInventory: boolean;
    showProgress: boolean;
  };
  display: {
    itemsPerPage: number;
    showImages: boolean;
    compactMode: boolean;
    showTooltips: boolean;
  };
}