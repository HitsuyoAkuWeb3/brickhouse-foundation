-- Brickhouse Mindset - Life Architecture Scheduler Backend (0005)

-- Extend scheduler_tasks table to support both recurring Reminders and Goal-to-Roadmap functionality
ALTER TABLE public.scheduler_tasks
ADD COLUMN IF NOT EXISTS category TEXT, -- 'build_it', 'feed_it', 'live_it', 'ritual', 'bricks', etc.
ADD COLUMN IF NOT EXISTS reminder_type TEXT, -- 'daily', 'weekly', 'one_off'
ADD COLUMN IF NOT EXISTS time_of_day TIME,
ADD COLUMN IF NOT EXISTS days_of_week INTEGER[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS parent_goal_id UUID REFERENCES public.scheduler_tasks(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS timeframe TEXT,
ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 1,
ALTER COLUMN scheduled_for DROP NOT NULL; -- Make scheduled_for optional as reminders might just use time_of_day

-- Ensure RLS is enabled
ALTER TABLE public.scheduler_tasks ENABLE ROW LEVEL SECURITY;

-- Reset policy if exists to avoid errors, then create it
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage their own scheduler tasks" ON public.scheduler_tasks;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Users can manage their own scheduler tasks" ON public.scheduler_tasks
    FOR ALL USING (auth.uid() = profile_id);

-- Optional: update existing types if needed, although types.ts is often auto-generated
