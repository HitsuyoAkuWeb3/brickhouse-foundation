
-- Drop the overly permissive SELECT policy on leads
DROP POLICY "Allow reading own lead by email" ON public.leads;

-- Create a restrictive policy: only allow selecting own lead by matching the inserter's email
-- Since leads are public (no auth required to insert), we restrict SELECT to authenticated users reading their own data
CREATE POLICY "Authenticated users can read own leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
