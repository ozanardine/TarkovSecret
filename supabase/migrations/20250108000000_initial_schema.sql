-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create items table
CREATE TABLE public.items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  base_price INTEGER DEFAULT 0,
  weight DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_inventory table
CREATE TABLE public.user_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  condition_percentage DECIMAL(5,2) DEFAULT 100.00,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Create raids table
CREATE TABLE public.raids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  map_name TEXT NOT NULL,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, failed, extracted
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  experience_gained INTEGER DEFAULT 0,
  loot_found JSONB DEFAULT '[]',
  survival_time INTEGER DEFAULT 0, -- in seconds
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0
);

-- Create market_listings table
CREATE TABLE public.market_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_per_unit INTEGER NOT NULL,
  total_price INTEGER GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  condition_percentage DECIMAL(5,2) DEFAULT 100.00,
  status TEXT DEFAULT 'active', -- active, sold, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.market_listings(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_per_unit INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  transaction_type TEXT DEFAULT 'market_purchase', -- market_purchase, direct_trade
  status TEXT DEFAULT 'completed', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_stats table
CREATE TABLE public.user_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_raids INTEGER DEFAULT 0,
  successful_extractions INTEGER DEFAULT 0,
  total_kills INTEGER DEFAULT 0,
  total_deaths INTEGER DEFAULT 0,
  total_experience INTEGER DEFAULT 0,
  total_money_earned INTEGER DEFAULT 0,
  total_money_spent INTEGER DEFAULT 0,
  favorite_map TEXT,
  survival_rate DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN total_raids > 0 THEN (successful_extractions::DECIMAL / total_raids * 100)
      ELSE 0
    END
  ) STORED,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_items_category ON public.items(category);
CREATE INDEX idx_items_rarity ON public.items(rarity);
CREATE INDEX idx_user_inventory_user_id ON public.user_inventory(user_id);
CREATE INDEX idx_user_inventory_item_id ON public.user_inventory(item_id);
CREATE INDEX idx_raids_user_id ON public.raids(user_id);
CREATE INDEX idx_raids_status ON public.raids(status);
CREATE INDEX idx_market_listings_seller_id ON public.market_listings(seller_id);
CREATE INDEX idx_market_listings_item_id ON public.market_listings(item_id);
CREATE INDEX idx_market_listings_status ON public.market_listings(status);
CREATE INDEX idx_transactions_buyer_id ON public.transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON public.transactions(seller_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample items
INSERT INTO public.items (name, description, category, rarity, base_price, weight, properties) VALUES
('AK-74M', 'Reliable assault rifle', 'weapon', 'common', 45000, 3.5, '{"damage": 40, "accuracy": 75, "range": 500}'),
('M4A1', 'High-precision assault rifle', 'weapon', 'rare', 65000, 3.2, '{"damage": 42, "accuracy": 85, "range": 550}'),
('Bandage', 'Basic medical supply', 'medical', 'common', 500, 0.1, '{"healing": 15}'),
('Morphine', 'Pain relief medication', 'medical', 'uncommon', 2500, 0.2, '{"healing": 50, "pain_relief": true}'),
('Backpack', 'Storage container', 'gear', 'common', 8000, 1.0, '{"storage_slots": 20}'),
('Tactical Vest', 'Body protection', 'armor', 'uncommon', 25000, 2.5, '{"protection": 30, "durability": 100}');