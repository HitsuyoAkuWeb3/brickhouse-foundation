-- Brickhouse Mindset - App Engine Schema Extension (0003)

-- 1. Create Custom ENUM Types
DO $$ BEGIN
    CREATE TYPE user_subscription_tier AS ENUM ('free', 'builder', 'sovereign');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transformation_track AS ENUM ('spiritual', 'business', 'wellness', 'relationships');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('audio_lesson', 'video_course', 'meditation', 'workbook');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Alter Profiles Table (Add missing blueprint columns)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS shopify_customer_id TEXT,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS transformation_choice transformation_track,
ADD COLUMN IF NOT EXISTS zodiac_sign TEXT;

-- 3. Passion Picks Table (Vision Board / Code Switch)
CREATE TABLE IF NOT EXISTS public.passion_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    image_url TEXT,
    song_url TEXT,
    affirmation_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Brick Progress
CREATE TABLE IF NOT EXISTS public.user_brick_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    brick_id UUID NOT NULL REFERENCES public.bricks(id) ON DELETE CASCADE,
    lessons_completed INTEGER DEFAULT 0,
    is_unlocked BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, brick_id)
);

-- 5. User Lesson Progress
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    brick_id UUID REFERENCES public.bricks(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. B2B Waitlist
CREATE TABLE IF NOT EXISTS public.b2b_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    company_name TEXT,
    role TEXT,
    status TEXT DEFAULT 'pending_review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Row Level Security Policies

ALTER TABLE public.passion_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_brick_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_waitlist ENABLE ROW LEVEL SECURITY;

-- Passion Picks Policies
CREATE POLICY "Users can manage their own passion picks" ON public.passion_picks
    FOR ALL USING (auth.uid() = user_id);

-- User Brick Progress Policies
CREATE POLICY "Users can manage their own brick progress" ON public.user_brick_progress
    FOR ALL USING (auth.uid() = user_id);

-- User Lesson Progress Policies
CREATE POLICY "Users can manage their own lesson progress" ON public.user_lesson_progress
    FOR ALL USING (auth.uid() = user_id);

-- Analytics Events
CREATE POLICY "Users can insert their own analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can view their own analytics" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id);

-- B2B Waitlist (Public Insert)
CREATE POLICY "Anyone can join B2B waitlist" ON public.b2b_waitlist
    FOR INSERT WITH CHECK (true);
