
CREATE TABLE public.audit_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  scores JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit audit results"
  ON public.audit_results
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
