-- Blueprint §5.2 #16: Lesson Drip Logic
-- Adds next_unlock_date to user_lesson_progress table
-- Rule: next_unlock_date = completed_at + 7 days

ALTER TABLE public.user_lesson_progress 
ADD COLUMN IF NOT EXISTS next_unlock_date TIMESTAMP WITH TIME ZONE;

-- Backfill any existing completed rows
UPDATE public.user_lesson_progress 
SET next_unlock_date = completed_at + INTERVAL '7 days' 
WHERE status = 'completed' AND completed_at IS NOT NULL AND next_unlock_date IS NULL;
