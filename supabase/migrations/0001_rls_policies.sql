-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bricks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduler_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goddess_prescriptions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read and update their own profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Bricks: Anyone authenticated can read bricks
CREATE POLICY "Anyone authenticated can read bricks" 
ON public.bricks FOR SELECT 
TO authenticated 
USING (true);

-- Lessons: Anyone authenticated can read lessons
CREATE POLICY "Anyone authenticated can read lessons" 
ON public.lessons FOR SELECT 
TO authenticated 
USING (true);

-- Affirmations: Anyone authenticated can read affirmations
CREATE POLICY "Anyone authenticated can read affirmations" 
ON public.affirmations FOR SELECT 
TO authenticated 
USING (true);

-- Daily Rituals: Users own their rituals
CREATE POLICY "Users own their rituals"
ON public.daily_rituals FOR ALL
USING (auth.uid() = profile_id);

-- Scheduler Tasks: Users own their tasks
CREATE POLICY "Users own their scheduler tasks"
ON public.scheduler_tasks FOR ALL
USING (auth.uid() = profile_id);

-- Goddess Prescriptions: Users own their prescriptions
CREATE POLICY "Users own their prescriptions"
ON public.goddess_prescriptions FOR ALL
USING (auth.uid() = profile_id);
