# Supabase Storage Configuration for File Validation System

This guide covers setting up Supabase Storage for the AI file validation system in the Epackage Lab B2B packaging system.

## Overview

The file validation system requires:
- **Design files storage**: For original AI/PDF/PSD files
- **Thumbnails storage**: For generated preview thumbnails
- **Previews storage**: For larger preview images
- **RLS policies**: For secure access control
- **Database tables**: For file metadata and validation results

## Prerequisites

1. Supabase project created
2. Environment variables configured:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## SQL Setup Script

Run the following SQL in your Supabase SQL Editor to set up the storage buckets and policies.

### 1. Create Storage Buckets

```sql
-- Enable storage extension
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create designs bucket for original files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'designs',
  'designs',
  false, -- Not public, requires authentication
  104857600, -- 100MB limit
  ARRAY[
    'application/pdf',
    'application/postscript',
    'image/vnd.adobe.photoshop',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create previews bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'previews',
  'previews',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
```

### 2. Row Level Security (RLS) Policies

```sql
-- =====================================================
-- DESIGNS BUCKET POLICIES
-- =====================================================

-- Users can upload their own design files
CREATE POLICY "Users can upload design files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own design files
CREATE POLICY "Users can view own design files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all design files
CREATE POLICY "Admins can view all design files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'designs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- Users can delete their own design files
CREATE POLICY "Users can delete own design files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can delete any design files
CREATE POLICY "Admins can delete any design files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'designs'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- Users can update their own design files
CREATE POLICY "Users can update own design files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'designs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- THUMBNAILS BUCKET POLICIES
-- =====================================================

-- Authenticated users can view thumbnails
CREATE POLICY "Authenticated users can view thumbnails"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'thumbnails');

-- Users can upload thumbnails for their files
CREATE POLICY "Users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can delete any thumbnails
CREATE POLICY "Admins can delete thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- =====================================================
-- PREVIEWS BUCKET POLICIES
-- =====================================================

-- Authenticated users can view previews
CREATE POLICY "Authenticated users can view previews"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'previews');

-- Users can upload previews for their files
CREATE POLICY "Users can upload previews"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can delete any previews
CREATE POLICY "Admins can delete previews"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'previews'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);
```

### 3. Database Tables (if not exists)

The files table should already exist in your database schema. If not, create it:

```sql
-- Files table for tracking uploaded files
CREATE TABLE IF NOT EXISTS public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  production_log_id UUID REFERENCES production_logs(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('AI', 'PDF', 'PSD', 'PNG', 'JPG', 'EXCEL', 'OTHER')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_latest BOOLEAN NOT NULL DEFAULT true,
  validation_status TEXT NOT NULL CHECK (validation_status IN ('PENDING', 'VALID', 'INVALID')) DEFAULT 'PENDING',
  validation_errors JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_files_order_id ON public.files(order_id);
CREATE INDEX IF NOT EXISTS idx_files_quotation_id ON public.files(quotation_id);
CREATE INDEX IF NOT EXISTS idx_files_work_order_id ON public.files(work_order_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON public.files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_validation_status ON public.files(validation_status);
CREATE INDEX IF NOT EXISTS idx_files_is_latest ON public.files(is_latest);

-- Enable RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files table
CREATE POLICY "Users can view own files"
ON public.files FOR SELECT
TO authenticated
USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can view all files"
ON public.files FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

CREATE POLICY "Users can insert own files"
ON public.files FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can insert files"
ON public.files FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

CREATE POLICY "Users can update own files"
ON public.files FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Admins can update all files"
ON public.files FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON public.files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

## File Organization

Files are organized in the following structure:

```
designs/
├── {user_id}/
│   ├── {file_id}/
│   │   ├── original_file.ai
│   │   ├── original_file.pdf
│   │   └── original_file.psd

thumbnails/
├── {user_id}/
│   ├── {file_id}.jpg
│   └── {file_id}.jpg

previews/
├── {user_id}/
│   ├── {file_id}.jpg
│   └── {file_id}.jpg
```

## Storage Functions

The following helper functions are available in the codebase:

### `uploadToStorage(buffer, fileName, bucket, path)`
Uploads a file buffer to Supabase storage.

### `uploadThumbnail(buffer, fileId, bucket)`
Uploads a thumbnail image for a file.

### `uploadPreview(buffer, fileId, bucket)`
Uploads a preview image for a file.

## Testing the Setup

### 1. Test Bucket Creation

```sql
-- List all buckets
SELECT * FROM storage.buckets;
```

### 2. Test RLS Policies

```sql
-- Check policies for designs bucket
SELECT * FROM pg_policies
WHERE tablename = 'objects';
```

### 3. Test File Upload

Use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/files/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/design.ai" \
  -F "validateOnly=false"
```

## Security Considerations

1. **Authentication**: All file operations require authentication
2. **Authorization**: Users can only access their own files (except admins)
3. **File Size**: Maximum file size is 100MB for designs
4. **File Types**: Only specific MIME types are allowed
5. **Path Validation**: File paths are validated to prevent directory traversal

## Monitoring and Maintenance

### Check Storage Usage

```sql
-- Get total storage used per bucket
SELECT
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_bytes
FROM storage.objects
GROUP BY bucket_id;
```

### Clean Up Old Files

```sql
-- Delete files older than 90 days (example)
DELETE FROM storage.objects
WHERE created_at < NOW() - INTERVAL '90 days'
  AND bucket_id = 'thumbnails';
```

## Troubleshooting

### Issue: "Permission denied" when uploading

**Solution**: Check RLS policies are correctly applied:

```sql
SELECT * FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%designs%';
```

### Issue: Files not being uploaded

**Solution**: Verify:
1. JWT token is valid
2. User has proper role in profiles table
3. Bucket exists
4. File size is within limits
5. MIME type is allowed

### Issue: Thumbnails not generating

**Solution**: Check:
1. Sharp library is installed
2. Buffer is correctly formatted
3. Storage policies for thumbnails bucket

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage API](https://supabase.com/docs/reference/javascript/storage-upload)
