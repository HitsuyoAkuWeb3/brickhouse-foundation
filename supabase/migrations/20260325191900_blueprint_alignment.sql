-- Brickhouse Mindset — Blueprint Alignment Migration
-- Items 8 + 9 from §5.1 + scheduler_tasks gap fill
-- Date: 2026-03-25

-- ============================================================
-- 1. ANALYTICS_EVENTS — Add missing session_id + indexes
-- ============================================================

ALTER TABLE public.analytics_events
ADD COLUMN IF NOT EXISTS session_id TEXT;

CREATE INDEX IF NOT EXISTS idx_events_user_type
  ON public.analytics_events(user_id, event_type);

CREATE INDEX IF NOT EXISTS idx_events_created
  ON public.analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_events_brick
  ON public.analytics_events(brick_id);

-- ============================================================
-- 2. PRESCRIPTION_LIBRARY — New table (144 rows: 12 bricks × 12 signs)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.prescription_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brick_number INT NOT NULL CHECK (brick_number BETWEEN 1 AND 12),
    zodiac_sign TEXT NOT NULL,
    prescription_text TEXT NOT NULL,
    power_color TEXT,
    crystal TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(brick_number, zodiac_sign)
);

-- RLS: Public read, service-role write
ALTER TABLE public.prescription_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read prescriptions"
  ON public.prescription_library FOR SELECT
  USING (true);

-- ============================================================
-- 3. SCHEDULER_TASKS — Full table creation (all blueprint columns)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.scheduler_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT,                          -- 'build_it', 'feed_it', 'live_it'
    task_type TEXT DEFAULT 'custom',        -- 'goal', 'affirmation', 'joy_moment', 'brick_task', 'custom'
    title TEXT NOT NULL,
    description TEXT,
    notes TEXT,
    due_date DATE,
    due_time TIME,
    scheduled_for TIMESTAMP WITH TIME ZONE, -- legacy compat
    phase TEXT,                             -- 'tomorrow', 'this_week', 'this_month', '3_months', '6_months', '9_months'
    is_completed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    reminder_count INT DEFAULT 0,
    snooze_interval TEXT DEFAULT 'none',    -- 'none', 'every_minute', 'every_hour'
    last_reminded_at TIMESTAMP WITH TIME ZONE,
    escalation_level INTEGER DEFAULT 1,
    parent_goal_id UUID REFERENCES public.scheduler_tasks(id) ON DELETE CASCADE,
    brick_id UUID,
    affirmation_id UUID,
    goal_template TEXT,
    reminder_type TEXT,                     -- 'daily', 'weekly', 'one_off'
    time_of_day TIME,
    days_of_week INTEGER[],
    timeframe TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.scheduler_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can manage their own scheduler tasks" ON public.scheduler_tasks;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Users can manage their own scheduler tasks" ON public.scheduler_tasks
    FOR ALL USING (auth.uid() = profile_id);

-- ============================================================
-- 4. SEED PRESCRIPTION_LIBRARY with placeholder rows
--    Content to be filled by Che' — placeholders enable UI wiring now
-- ============================================================

INSERT INTO public.prescription_library (brick_number, zodiac_sign, prescription_text, power_color, crystal)
SELECT
  b.n AS brick_number,
  s.sign AS zodiac_sign,
  'Prescription for Brick ' || b.n || ' × ' || s.sign || ' — awaiting Ché''s content.' AS prescription_text,
  NULL AS power_color,
  NULL AS crystal
FROM
  generate_series(1, 12) AS b(n),
  (VALUES
    ('Aries'), ('Taurus'), ('Gemini'), ('Cancer'),
    ('Leo'), ('Virgo'), ('Libra'), ('Scorpio'),
    ('Sagittarius'), ('Capricorn'), ('Aquarius'), ('Pisces')
  ) AS s(sign)
ON CONFLICT (brick_number, zodiac_sign) DO NOTHING;
