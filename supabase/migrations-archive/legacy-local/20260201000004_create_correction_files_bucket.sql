-- =====================================================
-- Migration: Create correction-files storage bucket
-- Description: Storage bucket for design correction files
-- Created: 2025-02-01
-- =====================================================

-- Create storage bucket for correction files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'correction-files',
  'correction-files',
  true, -- Public bucket for preview images
  104857600, -- 100MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/postscript',
    'image/vnd.adobe.photoshop', 'application/x-adobe-illustrator'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/postscript',
    'image/vnd.adobe.photoshop', 'application/x-adobe-illustrator'
  ];

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Public access for viewing (for preview images)
CREATE POLICY "Public preview images can be viewed"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'correction-files');

-- Policy: Admins can upload correction files
CREATE POLICY "Admins can upload correction files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'correction-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete correction files
CREATE POLICY "Admins can delete correction files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'correction-files'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Users can view their own order's correction files
CREATE POLICY "Users can view own order corrections"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'correction-files'
    AND EXISTS (
      SELECT 1 FROM design_revisions
      WHERE design_revisions.order_id IN (
        SELECT id FROM orders WHERE user_id = auth.uid()
      )
    )
  );

-- Verify bucket creation
SELECT id, name, public FROM storage.buckets WHERE id = 'correction-files';
