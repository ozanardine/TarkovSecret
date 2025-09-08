-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Items policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view items" ON public.items
    FOR SELECT USING (auth.role() = 'authenticated');

-- User inventory policies
CREATE POLICY "Users can view own inventory" ON public.user_inventory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory" ON public.user_inventory
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own inventory" ON public.user_inventory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own inventory" ON public.user_inventory
    FOR DELETE USING (auth.uid() = user_id);

-- Raids policies
CREATE POLICY "Users can view own raids" ON public.raids
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own raids" ON public.raids
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own raids" ON public.raids
    FOR UPDATE USING (auth.uid() = user_id);

-- Market listings policies
CREATE POLICY "Users can view all active market listings" ON public.market_listings
    FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Users can create own market listings" ON public.market_listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own market listings" ON public.market_listings
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own market listings" ON public.market_listings
    FOR DELETE USING (auth.uid() = seller_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert transactions as buyer" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- User stats policies
CREATE POLICY "Users can view all user stats" ON public.user_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can update own stats" ON public.user_stats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user stats after raid completion
CREATE OR REPLACE FUNCTION public.update_user_stats_after_raid()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stats when raid status changes to completed or failed
  IF NEW.status IN ('completed', 'failed', 'extracted') AND OLD.status = 'in_progress' THEN
    UPDATE public.user_stats
    SET 
      total_raids = total_raids + 1,
      successful_extractions = CASE 
        WHEN NEW.status = 'extracted' THEN successful_extractions + 1
        ELSE successful_extractions
      END,
      total_kills = total_kills + COALESCE(NEW.kills, 0),
      total_deaths = total_deaths + COALESCE(NEW.deaths, 0),
      total_experience = total_experience + COALESCE(NEW.experience_gained, 0),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating user stats
CREATE TRIGGER update_user_stats_on_raid_completion
  AFTER UPDATE ON public.raids
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_after_raid();

-- Create function to handle market transactions
CREATE OR REPLACE FUNCTION public.process_market_transaction(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  listing_record RECORD;
  transaction_id UUID;
BEGIN
  -- Get listing details
  SELECT * INTO listing_record
  FROM public.market_listings
  WHERE id = p_listing_id AND status = 'active' AND quantity >= p_quantity;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Create transaction record
  INSERT INTO public.transactions (
    buyer_id, seller_id, listing_id, item_id, quantity, price_per_unit, total_amount
  ) VALUES (
    p_buyer_id, listing_record.seller_id, p_listing_id, listing_record.item_id,
    p_quantity, listing_record.price_per_unit, p_quantity * listing_record.price_per_unit
  ) RETURNING id INTO transaction_id;
  
  -- Update listing quantity
  UPDATE public.market_listings
  SET 
    quantity = quantity - p_quantity,
    status = CASE WHEN quantity - p_quantity <= 0 THEN 'sold' ELSE 'active' END
  WHERE id = p_listing_id;
  
  -- Add item to buyer's inventory
  INSERT INTO public.user_inventory (user_id, item_id, quantity, condition_percentage)
  VALUES (p_buyer_id, listing_record.item_id, p_quantity, listing_record.condition_percentage)
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET quantity = user_inventory.quantity + p_quantity;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;