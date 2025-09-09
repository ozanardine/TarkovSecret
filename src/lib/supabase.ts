import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Database helper functions
export const db = {
  // Users
  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        subscription:user_subscriptions(*),
        profile:user_profiles(*),
        preferences:user_preferences(*),
        stats:user_stats(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createUser(userData: {
    id: string;
    email: string;
    name: string;
    image?: string;
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<Database['public']['Tables']['users']['Update']>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User Subscriptions
  async getUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createSubscription(subscriptionData: Database['public']['Tables']['user_subscriptions']['Insert']) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSubscription(id: string, updates: Database['public']['Tables']['user_subscriptions']['Update']) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User Profiles
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUserProfile(profileData: Database['public']['Tables']['user_profiles']['Insert']) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: Database['public']['Tables']['user_profiles']['Update']) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User Preferences
  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUserPreferences(preferencesData: Database['public']['Tables']['user_preferences']['Insert']) {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert(preferencesData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserPreferences(userId: string, updates: Database['public']['Tables']['user_preferences']['Update']) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Watchlists
  async getUserWatchlists(userId: string) {
    const { data, error } = await supabase
      .from('watchlists')
      .select(`
        *,
        items:watchlist_items(
          *,
          item_data
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createWatchlist(watchlistData: Database['public']['Tables']['watchlists']['Insert']) {
    const { data, error } = await supabase
      .from('watchlists')
      .insert(watchlistData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async addToWatchlist(watchlistId: string, itemData: Database['public']['Tables']['watchlist_items']['Insert']) {
    const { data, error } = await supabase
      .from('watchlist_items')
      .insert({ ...itemData, watchlist_id: watchlistId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async removeFromWatchlist(watchlistId: string, itemId: string) {
    const { error } = await supabase
      .from('watchlist_items')
      .delete()
      .eq('watchlist_id', watchlistId)
      .eq('item_id', itemId);
    
    if (error) throw error;
  },

  // Price Alerts
  async getUserPriceAlerts(userId: string) {
    const { data, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createPriceAlert(alertData: Database['public']['Tables']['price_alerts']['Insert']) {
    const { data, error } = await supabase
      .from('price_alerts')
      .insert(alertData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePriceAlert(id: string, updates: Database['public']['Tables']['price_alerts']['Update']) {
    const { data, error } = await supabase
      .from('price_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // User Activity
  async logUserActivity(activityData: Database['public']['Tables']['user_activities']['Insert']) {
    const { data, error } = await supabase
      .from('user_activities')
      .insert(activityData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserActivity(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Coupons
  async getCoupons(userId?: string, includeExpired = false) {
    let query = supabase
      .from('coupons')
      .select(`
        *,
        coupon_usage(
          id,
          used_at,
          subscription_id
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    }

    if (!includeExpired) {
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },

  async getCouponByCode(code: string) {
    const { data, error } = await supabase
      .from('coupons')
      .select(`
        *,
        coupon_usage(
          id,
          user_id,
          used_at
        )
      `)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createCouponUsage(usageData: Database['public']['Tables']['coupon_usage']['Insert']) {
    const { data, error } = await supabase
      .from('coupon_usage')
      .insert(usageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCoupon(id: string, updates: Database['public']['Tables']['coupons']['Update']) {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to price changes for specific items
  subscribeToPriceChanges(itemIds: string[], callback: (payload: any) => void) {
    return supabase
      .channel('price-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'item_prices',
          filter: `item_id=in.(${itemIds.join(',')})`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to user notifications
  subscribeToUserNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to watchlist changes
  subscribeToWatchlistChanges(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`watchlist-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'watchlist_items',
          filter: `watchlist_id=in.(select id from watchlists where user_id=eq.${userId})`
        },
        callback
      )
      .subscribe();
  },
};

export default supabase;