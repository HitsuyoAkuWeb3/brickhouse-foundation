-- Drop the existing upload/update/delete policies for passion-picks
DROP POLICY IF EXISTS "Authenticated users can upload passion picks" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own passion picks" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own passion picks" ON storage.objects;

-- Create simplified policies that just check if the user is authenticated
CREATE POLICY "Authenticated users can upload passion picks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'passion-picks');

CREATE POLICY "Users can update their own passion picks"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'passion-picks');

CREATE POLICY "Users can delete their own passion picks"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'passion-picks');
