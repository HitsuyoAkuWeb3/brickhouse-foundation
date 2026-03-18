
-- Allow anon to read back their own insert (needed for .insert().select())
-- This uses a SECURITY DEFINER function to check if the lead was created in the last 10 seconds
-- to prevent broad anonymous reads
CREATE OR REPLACE FUNCTION public.is_recent_lead(lead_created_at timestamptz)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lead_created_at >= (now() - interval '10 seconds')
$$;

CREATE POLICY "Anon can read recently created leads"
  ON public.leads FOR SELECT
  TO anon
  USING (public.is_recent_lead(created_at));
