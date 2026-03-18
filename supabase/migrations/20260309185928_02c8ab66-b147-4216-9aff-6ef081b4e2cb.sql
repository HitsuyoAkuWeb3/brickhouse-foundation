
-- Add SELECT policy for audit_results: authenticated users can read their own results via lead email match
CREATE POLICY "Authenticated users can read own audit results"
  ON public.audit_results FOR SELECT
  TO authenticated
  USING (
    lead_id IN (
      SELECT id FROM public.leads
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
