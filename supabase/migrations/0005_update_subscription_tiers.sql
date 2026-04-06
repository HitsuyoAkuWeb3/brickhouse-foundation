-- Add new values to user_subscription_tier enum
DO $$ 
BEGIN
  -- We can't remove values from ENUM easily, but we can add the new ones
  -- 'free' already exists.
  ALTER TYPE public.user_subscription_tier ADD VALUE IF NOT EXISTS 'foundation';
  ALTER TYPE public.user_subscription_tier ADD VALUE IF NOT EXISTS 'brickhouse';
  ALTER TYPE public.user_subscription_tier ADD VALUE IF NOT EXISTS 'goddess';
  ALTER TYPE public.user_subscription_tier ADD VALUE IF NOT EXISTS 'coaching';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
