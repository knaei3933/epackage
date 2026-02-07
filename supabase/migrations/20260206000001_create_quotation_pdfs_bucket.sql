-- Migration: Create quotation-pdfs storage bucket
-- Description: Storage bucket for quotation PDF files
-- This ensures PDFs can be re-downloaded in the exact same format

-- Create storage bucket for quotation PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quotation-pdfs',
  'quotation-pdfs',
  true, -- Public bucket for direct downloads
  10485760, -- 10MB limit per file
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view their own quotation PDFs
CREATE POLICY "Users can view own quotation PDFs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'quotation-pdfs' AND
    (
      -- User is the quotation owner (extracted from folder path)
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Admin can view all
      (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
    )
  );

-- Policy: Users can upload quotation PDFs
CREATE POLICY "Users can upload quotation PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'quotation-pdfs' AND
    (
      -- User can upload to their own folder
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      -- Service role can upload anywhere
      (SELECT role FROM auth.users WHERE id = auth.uid()) = 'service_role'
    )
  );

-- Policy: Users can delete their own quotation PDFs
CREATE POLICY "Users can delete own quotation PDFs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'quotation-pdfs' AND
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR
      (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
    )
  );

-- Public access for signed URLs
CREATE POLICY "Public access to quotation PDFs via signed URL"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'quotation-pdfs');

-- Verify bucket creation
SELECT id, name, public FROM storage.buckets WHERE id = 'quotation-pdfs';
