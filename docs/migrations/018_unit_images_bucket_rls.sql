-- Migration 018: RLS policies for unit-images storage bucket
-- Pattern matches existing buckets (maintenance-images, property-images, etc.)
-- Owner can only see/upload/delete their own files (via owner_id folder)

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Owners can view/download their own unit images
CREATE POLICY "unit_images_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'unit-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Authenticated users can upload to their own unit images folder
CREATE POLICY "unit_images_insert" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'unit-images' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    auth.role() = 'authenticated'
  );

-- Policy: Owners can update their own unit images (e.g., replace/re-upload)
CREATE POLICY "unit_images_update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'unit-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'unit-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policy: Owners can delete their own unit images
CREATE POLICY "unit_images_delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'unit-images' AND (storage.foldername(name))[1] = auth.uid()::text);
