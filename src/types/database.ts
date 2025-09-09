export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          type: 'FREE' | 'PLUS'
          status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'UNPAID'
          start_date: string
          end_date: string | null
          auto_renew: boolean
          payment_method: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'FREE' | 'PLUS'
          status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'UNPAID'
          start_date?: string
          end_date?: string | null
          auto_renew?: boolean
          payment_method?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'FREE' | 'PLUS'
          status?: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PAST_DUE' | 'UNPAID'
          start_date?: string
          end_date?: string | null
          auto_renew?: boolean
          payment_method?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          bio: string | null
          level: number | null
          experience: number | null
          favorite_map: string | null
          main_weapon: string | null
          play_style: 'AGGRESSIVE' | 'PASSIVE' | 'BALANCED' | 'SUPPORT' | null
          region: string | null
          timezone: string | null
          discord_username: string | null
          twitch_username: string | null
          youtube_channel: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          bio?: string | null
          level?: number | null
          experience?: number | null
          favorite_map?: string | null
          main_weapon?: string | null
          play_style?: 'AGGRESSIVE' | 'PASSIVE' | 'BALANCED' | 'SUPPORT' | null
          region?: string | null
          timezone?: string | null
          discord_username?: string | null
          twitch_username?: string | null
          youtube_channel?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          bio?: string | null
          level?: number | null
          experience?: number | null
          favorite_map?: string | null
          main_weapon?: string | null
          play_style?: 'AGGRESSIVE' | 'PASSIVE' | 'BALANCED' | 'SUPPORT' | null
          region?: string | null
          timezone?: string | null
          discord_username?: string | null
          twitch_username?: string | null
          youtube_channel?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: 'DARK' | 'LIGHT' | 'AUTO'
          language: 'PT' | 'EN' | 'RU' | 'ES' | 'FR' | 'DE'
          currency: 'RUB' | 'USD' | 'EUR'
          notifications: Json
          privacy: Json
          display: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: 'DARK' | 'LIGHT' | 'AUTO'
          language?: 'PT' | 'EN' | 'RU' | 'ES' | 'FR' | 'DE'
          currency?: 'RUB' | 'USD' | 'EUR'
          notifications?: Json
          privacy?: Json
          display?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: 'DARK' | 'LIGHT' | 'AUTO'
          language?: 'PT' | 'EN' | 'RU' | 'ES' | 'FR' | 'DE'
          currency?: 'RUB' | 'USD' | 'EUR'
          notifications?: Json
          privacy?: Json
          display?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_logins: number
          last_login: string
          total_searches: number
          favorite_items: string[]
          watched_items: string[]
          completed_quests: string[]
          hideout_progress: Json
          achievements: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_logins?: number
          last_login?: string
          total_searches?: number
          favorite_items?: string[]
          watched_items?: string[]
          completed_quests?: string[]
          hideout_progress?: Json
          achievements?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_logins?: number
          last_login?: string
          total_searches?: number
          favorite_items?: string[]
          watched_items?: string[]
          completed_quests?: string[]
          hideout_progress?: Json
          achievements?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      watchlists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlists_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      watchlist_items: {
        Row: {
          id: string
          watchlist_id: string
          item_id: string
          target_price: number | null
          price_direction: 'ABOVE' | 'BELOW' | null
          notify_on_change: boolean
          added_at: string
          notes: string | null
          item_data: Json | null
        }
        Insert: {
          id?: string
          watchlist_id: string
          item_id: string
          target_price?: number | null
          price_direction?: 'ABOVE' | 'BELOW' | null
          notify_on_change?: boolean
          added_at?: string
          notes?: string | null
          item_data?: Json | null
        }
        Update: {
          id?: string
          watchlist_id?: string
          item_id?: string
          target_price?: number | null
          price_direction?: 'ABOVE' | 'BELOW' | null
          notify_on_change?: boolean
          added_at?: string
          notes?: string | null
          item_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          }
        ]
      }
      price_alerts: {
        Row: {
          id: string
          user_id: string
          item_id: string
          target_price: number
          condition: 'ABOVE' | 'BELOW' | 'EQUAL'
          is_active: boolean
          triggered: boolean
          triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          target_price: number
          condition: 'ABOVE' | 'BELOW' | 'EQUAL'
          is_active?: boolean
          triggered?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          target_price?: number
          condition?: 'ABOVE' | 'BELOW' | 'EQUAL'
          is_active?: boolean
          triggered?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          type: 'SEARCH' | 'VIEW_ITEM' | 'ADD_WATCHLIST' | 'PRICE_ALERT' | 'QUEST_COMPLETE' | 'ACHIEVEMENT_UNLOCK'
          data: Json
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'SEARCH' | 'VIEW_ITEM' | 'ADD_WATCHLIST' | 'PRICE_ALERT' | 'QUEST_COMPLETE' | 'ACHIEVEMENT_UNLOCK'
          data: Json
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'SEARCH' | 'VIEW_ITEM' | 'ADD_WATCHLIST' | 'PRICE_ALERT' | 'QUEST_COMPLETE' | 'ACHIEVEMENT_UNLOCK'
          data?: Json
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      item_prices: {
        Row: {
          id: string
          item_id: string
          price: number
          source: 'flea' | 'trader'
          currency: 'RUB' | 'USD' | 'EUR'
          timestamp: string
          volume: number | null
        }
        Insert: {
          id?: string
          item_id: string
          price: number
          source: 'flea' | 'trader'
          currency: 'RUB' | 'USD' | 'EUR'
          timestamp?: string
          volume?: number | null
        }
        Update: {
          id?: string
          item_id?: string
          price?: number
          source?: 'flea' | 'trader'
          currency?: 'RUB' | 'USD' | 'EUR'
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          id: string
          user_id: string
          type: 'PRICE_ALERT' | 'QUEST_UPDATE' | 'MARKET_UPDATE' | 'NEWS_UPDATE' | 'SYSTEM'
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'PRICE_ALERT' | 'QUEST_UPDATE' | 'MARKET_UPDATE' | 'NEWS_UPDATE' | 'SYSTEM'
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'PRICE_ALERT' | 'QUEST_UPDATE' | 'MARKET_UPDATE' | 'NEWS_UPDATE' | 'SYSTEM'
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stripe_products: {
        Row: {
          id: string
          stripe_product_id: string
          name: string
          description: string | null
          active: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stripe_product_id: string
          name: string
          description?: string | null
          active?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stripe_product_id?: string
          name?: string
          description?: string | null
          active?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      stripe_prices: {
        Row: {
          id: string
          stripe_price_id: string
          product_id: string
          unit_amount: number
          currency: string
          recurring_interval: string | null
          recurring_interval_count: number | null
          active: boolean
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stripe_price_id: string
          product_id: string
          unit_amount: number
          currency: string
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          active?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stripe_price_id?: string
          product_id?: string
          unit_amount?: number
          currency?: string
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          active?: boolean
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_prices_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "stripe_products"
            referencedColumns: ["id"]
          }
        ]
      }
      coupons: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          user_id: string | null
          is_active: boolean
          max_uses: number | null
          max_uses_per_user: number | null
          expires_at: string | null
          stripe_coupon_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          user_id?: string | null
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_user?: number | null
          expires_at?: string | null
          stripe_coupon_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          user_id?: string | null
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_user?: number | null
          expires_at?: string | null
          stripe_coupon_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      coupon_usage: {
        Row: {
          id: string
          coupon_id: string
          user_id: string
          subscription_id: string | null
          used_at: string
        }
        Insert: {
          id?: string
          coupon_id: string
          user_id: string
          subscription_id?: string | null
          used_at?: string
        }
        Update: {
          id?: string
          coupon_id?: string
          user_id?: string
          subscription_id?: string | null
          used_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}