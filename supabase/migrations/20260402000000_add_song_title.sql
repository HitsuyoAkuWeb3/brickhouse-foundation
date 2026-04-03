-- Add song_title to passion_picks
ALTER TABLE public.passion_picks ADD COLUMN IF NOT EXISTS song_title TEXT;
