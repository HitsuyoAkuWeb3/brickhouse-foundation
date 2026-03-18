
-- Storage bucket for passion pick images
INSERT INTO storage.buckets (id, name, public) VALUES ('passion-picks', 'passion-picks', true);

-- RLS for storage
CREATE POLICY "Users can upload own passion picks" ON storage.objects AS PERMISSIVE
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'passion-picks' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own passion picks" ON storage.objects AS PERMISSIVE
  FOR SELECT TO authenticated
  USING (bucket_id = 'passion-picks' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public can read passion picks" ON storage.objects AS PERMISSIVE
  FOR SELECT TO anon
  USING (bucket_id = 'passion-picks');

CREATE POLICY "Users can update own passion picks" ON storage.objects AS PERMISSIVE
  FOR UPDATE TO authenticated
  USING (bucket_id = 'passion-picks' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own passion picks" ON storage.objects AS PERMISSIVE
  FOR DELETE TO authenticated
  USING (bucket_id = 'passion-picks' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Passion picks table
CREATE TABLE public.passion_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text,
  song_url text,
  song_title text,
  goal_text text,
  affirmation text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.passion_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own passion pick" ON public.passion_picks AS PERMISSIVE
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own passion pick" ON public.passion_picks AS PERMISSIVE
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own passion pick" ON public.passion_picks AS PERMISSIVE
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own passion pick" ON public.passion_picks AS PERMISSIVE
  FOR DELETE TO authenticated USING (user_id = auth.uid());
