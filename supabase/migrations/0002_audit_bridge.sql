-- Migration for the Edge Function Bridge (Lead Handoff)

CREATE TABLE IF NOT EXISTS public.lead_transfers (
    transfer_token UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_scores JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE public.lead_transfers ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY "Service Role Full Access" ON public.lead_transfers
FOR ALL
USING (auth.role() = 'service_role');

-- Authenticated or Anon can read by token
CREATE POLICY "Public read by token" ON public.lead_transfers
FOR SELECT
USING (true);

-- Grant privileges
GRANT ALL ON TABLE public.lead_transfers TO service_role;
GRANT SELECT ON TABLE public.lead_transfers TO anon, authenticated;
