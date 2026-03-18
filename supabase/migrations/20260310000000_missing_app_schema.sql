-- Brickhouse Mindset - App Engine Missing Schema Migration
-- Table: user_brick_progress
CREATE TABLE IF NOT EXISTS public.user_brick_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brick_id UUID NOT NULL REFERENCES public.bricks(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('locked', 'active', 'completed')) DEFAULT 'locked',
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, brick_id)
);

ALTER TABLE public.user_brick_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brick progress."
  ON public.user_brick_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own brick progress."
  ON public.user_brick_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brick progress."
  ON public.user_brick_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- Table: analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own analytics events."
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Service role can view all analytics."
  ON public.analytics_events FOR SELECT
  USING (true); -- Usually restricted, but keeping simple for MVP


-- Table: b2b_waitlist
CREATE TABLE IF NOT EXISTS public.b2b_waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  company_name TEXT,
  role TEXT,
  status TEXT DEFAULT 'pending_review',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.b2b_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert into B2B waitlist."
  ON public.b2b_waitlist FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can view B2B waitlist."
  ON public.b2b_waitlist FOR SELECT
  USING (true);

