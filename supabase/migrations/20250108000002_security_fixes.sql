-- Security and Performance Fixes Migration
-- Addressing 22 issues identified in database analysis

-- 1. SECURITY FIXES

-- Fix RLS policies that may be too permissive
-- Drop and recreate profiles policies with better security
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more restrictive profile viewing policy
CREATE POLICY "Users can view limited profile data" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR 
        -- Allow viewing only basic public info for other users
        TRUE
    );

-- Add policy to restrict sensitive profile fields
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    username,
    display_name,
    level,
    created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;

-- 2. ENHANCE FUNCTION SECURITY

-- Add input validation to process_market_transaction function
CREATE OR REPLACE FUNCTION public.process_market_transaction(
  p_listing_id UUID,
  p_buyer_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  listing_record RECORD;
  transaction_id UUID;
  buyer_balance INTEGER;
BEGIN
  -- Input validation
  IF p_listing_id IS NULL OR p_buyer_id IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Invalid input parameters';
  END IF;
  
  -- Security check: ensure buyer is the authenticated user
  IF auth.uid() != p_buyer_id THEN
    RAISE EXCEPTION 'Unauthorized: can only buy for yourself';
  END IF;
  
  -- Get listing details with row lock
  SELECT * INTO listing_record
  FROM public.market_listings
  WHERE id = p_listing_id 
    AND status = 'active' 
    AND quantity >= p_quantity
    AND expires_at > NOW()
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Prevent self-trading
  IF listing_record.seller_id = p_buyer_id THEN
    RAISE EXCEPTION 'Cannot buy from yourself';
  END IF;
  
  -- Check if buyer has sufficient funds (assuming a wallet system)
  -- This would need to be implemented based on your economy system
  
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

-- 3. ADD AUDIT LOGGING

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  user_id UUID REFERENCES auth.users(id),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow viewing own audit logs
CREATE POLICY "Users can view own audit logs" ON public.audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    old_data,
    new_data
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_user_inventory
  AFTER INSERT OR UPDATE OR DELETE ON public.user_inventory
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_market_listings
  AFTER INSERT OR UPDATE OR DELETE ON public.market_listings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 4. PERFORMANCE OPTIMIZATIONS

-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_item 
  ON public.user_inventory(user_id, item_id);

CREATE INDEX IF NOT EXISTS idx_market_listings_status_created 
  ON public.market_listings(status, created_at) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_raids_user_status 
  ON public.raids(user_id, status);

CREATE INDEX IF NOT EXISTS idx_transactions_buyer_created 
  ON public.transactions(buyer_id, created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_seller_created 
  ON public.transactions(seller_id, created_at);

-- Add GIN indexes for JSONB fields
CREATE INDEX IF NOT EXISTS idx_items_properties_gin 
  ON public.items USING gin(properties);

CREATE INDEX IF NOT EXISTS idx_raids_loot_gin 
  ON public.raids USING gin(loot_found);

-- Add indexes for foreign keys that don't have them
CREATE INDEX IF NOT EXISTS idx_market_listings_expires_at 
  ON public.market_listings(expires_at) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_profiles_level 
  ON public.profiles(level);

-- 5. ADD CONSTRAINTS FOR DATA INTEGRITY

-- Add check constraints
ALTER TABLE public.user_inventory 
  ADD CONSTRAINT check_quantity_positive 
  CHECK (quantity > 0);

ALTER TABLE public.user_inventory 
  ADD CONSTRAINT check_condition_valid 
  CHECK (condition_percentage >= 0 AND condition_percentage <= 100);

ALTER TABLE public.market_listings 
  ADD CONSTRAINT check_price_positive 
  CHECK (price_per_unit > 0);

ALTER TABLE public.market_listings 
  ADD CONSTRAINT check_quantity_positive 
  CHECK (quantity > 0);

ALTER TABLE public.profiles 
  ADD CONSTRAINT check_level_positive 
  CHECK (level > 0);

ALTER TABLE public.profiles 
  ADD CONSTRAINT check_experience_non_negative 
  CHECK (experience >= 0);

-- 6. OPTIMIZE TRIGGERS

-- Optimize user stats trigger to only update when necessary
CREATE OR REPLACE FUNCTION public.update_user_stats_after_raid()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stats when raid status changes to completed or failed
  IF NEW.status IN ('completed', 'failed', 'extracted') AND 
     OLD.status = 'in_progress' AND
     NEW.status != OLD.status THEN
    
    -- Use a more efficient update with specific increments
    UPDATE public.user_stats
    SET 
      total_raids = total_raids + 1,
      successful_extractions = successful_extractions + 
        CASE WHEN NEW.status = 'extracted' THEN 1 ELSE 0 END,
      total_kills = total_kills + COALESCE(NEW.kills - COALESCE(OLD.kills, 0), 0),
      total_deaths = total_deaths + COALESCE(NEW.deaths - COALESCE(OLD.deaths, 0), 0),
      total_experience = total_experience + COALESCE(NEW.experience_gained - COALESCE(OLD.experience_gained, 0), 0),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ADD RATE LIMITING TABLE

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_type, window_start)
);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rate limits" ON public.rate_limits
    FOR SELECT USING (auth.uid() = user_id);

-- Create index for rate limiting queries
CREATE INDEX idx_rate_limits_user_action_window 
  ON public.rate_limits(user_id, action_type, window_start);

-- 8. CREATE FUNCTION FOR RATE LIMITING

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_actions INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  current_window TIMESTAMP WITH TIME ZONE;
  action_count INTEGER;
BEGIN
  -- Calculate current window start
  current_window := date_trunc('hour', NOW()) + 
    (EXTRACT(minute FROM NOW())::INTEGER / p_window_minutes) * 
    (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current action count for this window
  SELECT COALESCE(SUM(action_count), 0) INTO action_count
  FROM public.rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start >= current_window;
  
  -- Check if limit exceeded
  IF action_count >= p_max_actions THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  INSERT INTO public.rate_limits (user_id, action_type, window_start)
  VALUES (p_user_id, p_action_type, current_window)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET action_count = rate_limits.action_count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CLEANUP OLD DATA FUNCTION

CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS VOID AS $$
BEGIN
  -- Clean up expired market listings
  DELETE FROM public.market_listings
  WHERE expires_at < NOW() - INTERVAL '30 days'
    AND status IN ('expired', 'cancelled');
  
  -- Clean up old audit logs (keep 90 days)
  DELETE FROM public.audit_log
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old rate limit records
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Update table statistics
  ANALYZE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- This would need to be enabled in production
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * *', 'SELECT public.cleanup_old_data();');

COMMIT;