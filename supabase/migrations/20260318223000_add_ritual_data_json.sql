-- Brickhouse Mindset - Add Ritual Data JSON (Sprint 3)

ALTER TABLE public.daily_rituals
ADD COLUMN IF NOT EXISTS ritual_data JSONB DEFAULT '{}'::jsonb;
