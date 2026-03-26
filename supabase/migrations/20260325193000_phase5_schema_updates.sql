-- Phase 5.1 & 5.2 Schema Updates
-- Date: 2026-03-25

-- ============================================================
-- 1. SUBSCRIPTION_TIER ENUM MIGRATION
-- ============================================================

-- Safely add missing values to the existing user_subscription_tier ENUM.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_subscription_tier' AND e.enumlabel = 'foundation') THEN
    ALTER TYPE public.user_subscription_tier ADD VALUE 'foundation';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_subscription_tier' AND e.enumlabel = 'brickhouse') THEN
    ALTER TYPE public.user_subscription_tier ADD VALUE 'brickhouse';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_subscription_tier' AND e.enumlabel = 'goddess') THEN
    ALTER TYPE public.user_subscription_tier ADD VALUE 'goddess';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_subscription_tier' AND e.enumlabel = 'coaching') THEN
    ALTER TYPE public.user_subscription_tier ADD VALUE 'coaching';
  END IF;
END $$;

-- Verify the column is present and using the correct type
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'subscription_tier') THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_tier public.user_subscription_tier DEFAULT 'free';
  END IF;
END $$;

-- ============================================================
-- 2. GOAL_TEMPLATES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.goal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_category TEXT NOT NULL CHECK (goal_category IN ('attract_love', 'body_transformation', 'publish_book', 'build_business', 'rebuild_finances', 'heal_rebuild')),
    truth_statement TEXT,
    phase TEXT CHECK (phase IN ('tomorrow', 'this_week', 'this_month', '3_months', '6_months')),
    step_title TEXT NOT NULL,
    step_description TEXT,
    linked_brick_id INT, -- To visually link back to 'bricks.id' (not strongly foreign keyed here to allow generic scaffolding if needed)
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Public read, service-role write
ALTER TABLE public.goal_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Anyone can read goal templates" ON public.goal_templates;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Anyone can read goal templates"
  ON public.goal_templates FOR SELECT
  USING (true);

-- Insert initial templates for 'attract_love'
INSERT INTO public.goal_templates (goal_category, truth_statement, phase, step_title, step_description, sort_order)
VALUES
('attract_love', 'I am worthy of adoration and radical devotion. The Crumbs era is over.', 'tomorrow', 'Write my non-negotiables list', 'Sit alone with no distractions and define the 3 things you will never accept again.', 1),
('attract_love', 'I am worthy of adoration and radical devotion. The Crumbs era is over.', 'this_week', 'Delete one connection that violates my worth', 'Find one text thread or contact that represents crumbs. Delete it.', 2)
ON CONFLICT DO NOTHING;

-- Insert initial templates for 'body_transformation'
INSERT INTO public.goal_templates (goal_category, truth_statement, phase, step_title, step_description, sort_order)
VALUES
('body_transformation', 'My body is my first home. I build it to honoring myself, not to punish myself.', 'tomorrow', 'Schedule 3 Joy Movements', 'Pick 3 blocks this week strictly for moving in a way that feels like joy (dance break, walk in sun).', 1),
('body_transformation', 'My body is my first home. I build it to honoring myself, not to punish myself.', 'this_week', 'Cook one Sovereign Meal', 'Commit to cooking one hyper-nourishing, beautiful meal strictly for yourself.', 2)
ON CONFLICT DO NOTHING;
