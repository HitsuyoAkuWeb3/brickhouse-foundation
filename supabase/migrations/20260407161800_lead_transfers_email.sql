-- Add email and name to lead_transfers table for strict database tracking 
ALTER TABLE public.lead_transfers 
ADD COLUMN email TEXT,
ADD COLUMN name TEXT;

-- Create an index to quickly look up by email during onboarding
CREATE INDEX IF NOT EXISTS idx_lead_transfers_email ON public.lead_transfers(email);
