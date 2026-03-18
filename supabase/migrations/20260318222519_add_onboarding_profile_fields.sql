-- Migration to add Onboarding fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS sun_sign TEXT,
  ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reminder_preferences JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS passion_pick_media TEXT;
