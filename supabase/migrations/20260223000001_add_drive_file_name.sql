-- Add drive_file_name column to store the actual Google Drive filename
ALTER TABLE order_file_uploads ADD COLUMN IF NOT EXISTS drive_file_name TEXT;

-- Add comment
COMMENT ON COLUMN order_file_uploads.drive_file_name IS 'Actual filename stored in Google Drive';
