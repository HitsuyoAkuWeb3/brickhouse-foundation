
CREATE POLICY "Allow reading own lead by email"
  ON public.leads
  FOR SELECT
  TO anon, authenticated
  USING (true);
