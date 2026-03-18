
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'daily',
  category TEXT NOT NULL DEFAULT 'ritual',
  time_of_day TIME NOT NULL DEFAULT '09:00:00',
  days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reminders" ON public.reminders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own reminders" ON public.reminders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reminders" ON public.reminders FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own reminders" ON public.reminders FOR DELETE TO authenticated USING (user_id = auth.uid());
