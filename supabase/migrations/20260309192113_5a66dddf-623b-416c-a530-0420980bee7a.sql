
-- =============================================
-- FIX: Convert all RESTRICTIVE policies to PERMISSIVE
-- Drop and recreate every RLS policy in the system
-- =============================================

-- LEADS TABLE
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can read own leads" ON public.leads;

CREATE POLICY "Anyone can submit a lead" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read own leads" ON public.leads
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid())::text);

-- AUDIT_RESULTS TABLE
DROP POLICY IF EXISTS "Anyone can submit audit results" ON public.audit_results;
DROP POLICY IF EXISTS "Authenticated users can read own audit results" ON public.audit_results;

CREATE POLICY "Anyone can submit audit results" ON public.audit_results
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read own audit results" ON public.audit_results
  FOR SELECT TO authenticated
  USING (lead_id IN (
    SELECT id FROM public.leads
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  ));

-- PROFILES TABLE
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- LESSON_PROGRESS TABLE
DROP POLICY IF EXISTS "Users can read own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON public.lesson_progress;

CREATE POLICY "Users can read own progress" ON public.lesson_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON public.lesson_progress
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own progress" ON public.lesson_progress
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- DAILY_RITUALS TABLE
DROP POLICY IF EXISTS "Users can read own rituals" ON public.daily_rituals;
DROP POLICY IF EXISTS "Users can insert own rituals" ON public.daily_rituals;
DROP POLICY IF EXISTS "Users can update own rituals" ON public.daily_rituals;

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
