-- Setup Storage Policies untuk bucket 'documents'
-- Run this in Supabase SQL Editor

-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;

-- Create new policies
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents');

CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents');
