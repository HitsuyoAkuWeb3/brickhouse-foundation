-- Create the passion-picks storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('passion-picks', 'passion-picks', true)
ON CONFLICT (id) DO NOTHING;



-- Policy: Allow public read access to passion-picks
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'passion-picks' );

-- Policy: Allow authenticated users to upload to passion-picks
CREATE POLICY "Authenticated users can upload passion picks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'passion-picks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to update their own passion picks
CREATE POLICY "Users can update their own passion picks"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'passion-picks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow users to delete their own passion picks
CREATE POLICY "Users can delete their own passion picks"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'passion-picks' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
