
-- Affirmations seeded per brick (admin-managed content)
CREATE TABLE public.brick_affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brick_id integer NOT NULL,
  affirmation text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brick_affirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read affirmations" ON public.brick_affirmations AS PERMISSIVE
  FOR SELECT TO anon, authenticated USING (true);

-- User custom I AM affirmations
CREATE TABLE public.user_affirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affirmation text NOT NULL,
  brick_id integer,
  is_favorite boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_affirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own affirmations" ON public.user_affirmations AS PERMISSIVE
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own affirmations" ON public.user_affirmations AS PERMISSIVE
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own affirmations" ON public.user_affirmations AS PERMISSIVE
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own affirmations" ON public.user_affirmations AS PERMISSIVE
  FOR DELETE TO authenticated USING (user_id = auth.uid());
