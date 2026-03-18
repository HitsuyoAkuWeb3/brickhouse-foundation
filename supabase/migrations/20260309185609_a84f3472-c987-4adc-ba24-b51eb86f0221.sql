
-- 1. Drop the risky anon SELECT policy on leads
DROP POLICY "Anon can read recently created leads" ON public.leads;

-- 2. Drop the function no longer needed
DROP FUNCTION IF EXISTS public.is_recent_lead(timestamptz);

-- 3. Fix ALL policies to be PERMISSIVE (the default) instead of RESTRICTIVE
-- Leads table
DROP POLICY "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY "Authenticated users can read own leads" ON public.leads;
CREATE POLICY "Authenticated users can read own leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Audit results table
DROP POLICY "Anyone can submit audit results" ON public.audit_results;
CREATE POLICY "Anyone can submit audit results"
  ON public.audit_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Profiles table
DROP POLICY "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
