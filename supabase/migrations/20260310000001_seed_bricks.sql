-- Alter the bricks table to add missing columns from the blueprint
ALTER TABLE public.bricks
ADD COLUMN IF NOT EXISTS lesson_count INTEGER DEFAULT 0;

-- Seed the 12 Core Bricks from the Master Blueprint
-- We omit 'id' so that the DEFAULT gen_random_uuid() works, 
-- and we use 'title' instead of 'name' and 'order_index' instead of 'brick_number' based on the 0000_initial_schema.sql
INSERT INTO public.bricks (order_index, title, slug, lesson_count)
VALUES
  (1, 'Self-Love & Identity', 'self-love-identity', 19),
  (2, 'Mindset & Manifestation', 'mindset-manifestation', 22),
  (3, 'Goal Achievement', 'goal-achievement', 12),
  (4, 'Accountability', 'accountability', 12),
  (5, 'Healing & Emotional Wellness', 'healing-emotional-wellness', 14),
  (6, 'Body & Health', 'body-health', 11),
  (7, 'Relationships (General)', 'relationships-general', 15),
  (8, 'Dating & Partner Selection', 'dating-partner-selection', 18),
  (9, 'Narcissism & Red Flags', 'narcissism-red-flags', 12),
  (10, 'Marriage & Partnership', 'marriage-partnership', 10),
  (11, 'Life Wisdom & Peace', 'life-wisdom-peace', 12),
  (12, 'Spiritual Alignment', 'spiritual-alignment', 7)
ON CONFLICT (slug) DO UPDATE SET
  order_index = EXCLUDED.order_index,
  title = EXCLUDED.title,
  lesson_count = EXCLUDED.lesson_count;
