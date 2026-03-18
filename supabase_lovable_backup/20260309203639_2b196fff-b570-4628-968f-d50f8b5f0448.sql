
CREATE TABLE public.goddess_prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  zodiac_sign text NOT NULL,
  crystals jsonb NOT NULL DEFAULT '[]'::jsonb,
  colors jsonb NOT NULL DEFAULT '[]'::jsonb,
  spiritual_tools jsonb NOT NULL DEFAULT '[]'::jsonb,
  mantra text,
  element text,
  ruling_planet text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.goddess_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prescriptions" ON public.goddess_prescriptions
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own prescriptions" ON public.goddess_prescriptions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own prescriptions" ON public.goddess_prescriptions
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own prescriptions" ON public.goddess_prescriptions
  FOR DELETE TO authenticated USING (user_id = auth.uid());
