
-- Lesson progress tracking
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brick_id integer NOT NULL,
  lesson_id text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own progress" ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Daily rituals tracking
CREATE TABLE public.daily_rituals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_date date NOT NULL DEFAULT CURRENT_DATE,
  morning_affirmation boolean NOT NULL DEFAULT false,
  midday_checkin boolean NOT NULL DEFAULT false,
  evening_reflection boolean NOT NULL DEFAULT false,
  joy_moment text,
  gratitude_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, ritual_date)
);

ALTER TABLE public.daily_rituals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own rituals" ON public.daily_rituals
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own rituals" ON public.daily_rituals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rituals" ON public.daily_rituals
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
