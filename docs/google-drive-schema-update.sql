-- =====================================================
-- Google Drive Integration - Schema Updates
-- =====================================================
-- Add new columns to files table for Google Drive integration

-- Add product_name column (required for file naming)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS product_name TEXT;

-- Add drive_folder_id column (Google Drive folder reference)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

-- Add source_file_id column (for correction files linking to original)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS source_file_id UUID REFERENCES files(id) ON DELETE SET NULL;

-- Add is_correction column (mark correction files)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS is_correction BOOLEAN DEFAULT false;

-- Create index for source_file_id lookup
CREATE INDEX IF NOT EXISTS idx_files_source_file_id
ON files(source_file_id) WHERE source_file_id IS NOT NULL;

-- Create index for product_name lookup
CREATE INDEX IF NOT EXISTS idx_files_product_name
ON files(product_name) WHERE product_name IS NOT NULL;

-- =====================================================
-- Notes:
-- =====================================================
-- File naming convention:
-- - Data receipt (customer upload): 製品名_入稿データ_会社名_日付
-- - Correction (admin upload): 製品名_校正データ_会社名_日付
--
-- Folder structure:
-- - Upload folder: 会社名_日付_注文番号/
-- - Correction files uploaded to same folder as source file
--
-- Environment variables needed:
-- - NEXT_PUBLIC_GOOGLE_CLIENT_ID
-- - GOOGLE_CLIENT_SECRET
-- - NEXT_PUBLIC_GOOGLE_REDIRECT_URI
-- - GOOGLE_DRIVE_UPLOAD_FOLDER_ID
-- - GOOGLE_DRIVE_CORRECTION_FOLDER_ID
