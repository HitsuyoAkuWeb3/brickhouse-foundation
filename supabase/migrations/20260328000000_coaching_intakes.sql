-- Create coaching_intakes table
CREATE TABLE IF NOT EXISTS public.coaching_intakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Section 1: About You
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  life_stage TEXT[],
  
  -- Section 2: Where You Are
  obstacle TEXT,
  out_of_alignment TEXT[],
  urgency INTEGER,
  
  -- Section 3: Where You Want To Go
  ideal_life TEXT,
  specific_results TEXT[],
  prior_coaching TEXT,
  
  -- Section 4: Investment Readiness
  interested_experience TEXT,
  investment_comfort TEXT,
  readiness TEXT,
  
  -- Section 5: One Last Thing
  discovery_source TEXT,
  additional_info TEXT,
  connect_preference TEXT
);

-- Enable RLS
ALTER TABLE public.coaching_intakes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own intake or anonymous users to insert
-- Assuming public form, anyone can insert
CREATE POLICY "Anyone can insert coaching intakes" 
  ON public.coaching_intakes FOR INSERT 
  TO public
  WITH CHECK (true);

-- Only authenticated admins/users can read (you'd adjust this to specific roles ideally, but for now authenticated)
CREATE POLICY "Authenticated users can read coaching intakes" 
  ON public.coaching_intakes FOR SELECT 
  TO authenticated 
  USING (true);
