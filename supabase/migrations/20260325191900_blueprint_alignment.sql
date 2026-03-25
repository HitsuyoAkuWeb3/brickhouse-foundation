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
-- 3. SCHEDULER_TASKS — Add missing blueprint columns
-- ============================================================

ALTER TABLE public.scheduler_tasks
ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS due_time TIME,
ADD COLUMN IF NOT EXISTS snooze_interval TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS last_reminded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS brick_id UUID,
ADD COLUMN IF NOT EXISTS affirmation_id UUID,
ADD COLUMN IF NOT EXISTS goal_template TEXT,
ADD COLUMN IF NOT EXISTS reminder_count INT DEFAULT 0;

-- Add CHECK constraint for task_type (non-destructive)
-- Values: goal, affirmation, joy_moment, brick_task, custom
-- Using TEXT + app-level validation to avoid ENUM migration headaches

-- Add CHECK constraint for snooze_interval
-- Values: none, every_minute, every_hour
-- Using TEXT + app-level validation

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
