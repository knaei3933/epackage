-- =====================================================
-- Epackage Lab Files Table
--ファイル管理 (File Management)
-- Supports versioning and validation for design files
-- =====================================================

-- File Type Enum
CREATE TYPE file_type AS ENUM (
  'AI',     -- Adobe Illustrator (primary design format)
  'PDF',    -- PDF Document
  'PSD',    -- Adobe Photoshop
  'PNG',    -- PNG Image
  'JPG',    -- JPEG Image
  'EXCEL',  -- Excel Spreadsheet
  'OTHER'   -- Other formats
);

-- File Validation Status Enum
CREATE TYPE file_validation_status AS ENUM (
  'PENDING',  -- 検証待ち (Pending validation)
  'VALID',    -- 有効 (Valid)
  'INVALID'   -- 無効 (Invalid - errors found)
);

-- =====================================================
-- Files Table
-- Stores design files with version control
-- =====================================================

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys (link to either order or quotation)
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,

  -- File Type
  file_type file_type NOT NULL,

  -- File Information
  original_filename TEXT NOT NULL,  -- Original filename when uploaded
  file_url TEXT NOT NULL,           -- Supabase Storage URL
  file_path TEXT NOT NULL,          -- Storage path (bucket/filename)
  file_size_bytes INTEGER,          -- File size in bytes

  -- Version Control
  version INTEGER NOT NULL DEFAULT 1,

  -- Validation Status (AI file validation)
  validation_status file_validation_status NOT NULL DEFAULT 'PENDING',

  -- Validation Results (stores AI parsing results)
  validation_results JSONB,  -- { errors: [], warnings: [], parsed_data: {} }

  -- Uploaded by (アップロード者)
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT exactly_one_reference CHECK (
    (order_id IS NOT NULL)::integer + (quotation_id IS NOT NULL)::integer = 1
  ),
  CONSTRAINT version_positive CHECK (version > 0),
  CONSTRAINT file_size_positive CHECK (file_size_bytes IS NULL OR file_size_bytes > 0)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_files_order_id ON files(order_id);
CREATE INDEX idx_files_quotation_id ON files(quotation_id);
CREATE INDEX idx_files_file_type ON files(file_type);
CREATE INDEX idx_files_validation_status ON files(validation_status);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at DESC);
CREATE INDEX idx_files_order_version ON files(order_id, version);

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users can view files for their own orders/quotations
CREATE POLICY "Users can view own files"
  ON files FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    ) OR
    quotation_id IN (
      SELECT id FROM quotations WHERE user_id = auth.uid()
    )
  );

-- Admins and operators can view all files
CREATE POLICY "Admins and operators can view all files"
  ON files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Authenticated users can upload files
CREATE POLICY "Authenticated users can upload files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins and operators can update validation status
CREATE POLICY "Admins and operators can update validation"
  ON files FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get latest version of a file for an order
CREATE OR REPLACE FUNCTION get_latest_file_version(order_uuid UUID)
RETURNS files AS $$
DECLARE
  latest_file files;
BEGIN
  SELECT * INTO latest_file
  FROM files
  WHERE order_id = order_uuid
  ORDER BY version DESC, uploaded_at DESC
  LIMIT 1;

  RETURN latest_file;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all files for an order (with versions)
CREATE OR REPLACE FUNCTION get_order_files(order_uuid UUID)
RETURNS SETOF files AS $$
BEGIN
  RETURN QUERY
  SELECT f.*
  FROM files f
  WHERE f.order_id = order_uuid
  ORDER BY f.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate AI file (placeholder for AI integration)
CREATE OR REPLACE FUNCTION validate_ai_file(file_uuid UUID)
RETURNS file_validation_status AS $$
DECLARE
  file_record files;
  validation_result file_validation_status;
BEGIN
  -- Get file record
  SELECT * INTO file_record FROM files WHERE id = file_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'File % not found', file_uuid;
  END IF;

  -- TODO: Integrate with AI file validation service
  -- For now, just mark as valid
  validation_result := 'VALID';

  -- Update validation status
  UPDATE files
  SET validation_status = validation_result,
      validated_at = NOW(),
      validation_results = '{"validated": true}'::jsonb
  WHERE id = file_uuid;

  RETURN validation_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON files TO authenticated;
GRANT INSERT ON files TO authenticated;
GRANT UPDATE ON files TO authenticated;
