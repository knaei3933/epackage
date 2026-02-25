-- ============================================================
-- Add drive_file_name column and update RLS for token-based access
-- Migration: 20260225000000
-- ============================================================

-- Add drive_file_name column if not exists
ALTER TABLE order_file_uploads
  ADD COLUMN IF NOT EXISTS drive_file_name TEXT;

-- ============================================================
-- Update RLS policies for order_file_uploads
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own order file uploads" ON order_file_uploads;
DROP POLICY IF EXISTS "Admins can view all file uploads" ON order_file_uploads;
DROP POLICY IF EXISTS "System and admins can insert file uploads" ON order_file_uploads;

-- Create new policies with better support for service role access
CREATE POLICY "Service role can manage all file uploads"
  ON order_file_uploads FOR ALL
  USING (auth.uid() IS NULL);

CREATE POLICY "Users can view own order file uploads"
  ON order_file_uploads FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all file uploads"
  ON order_file_uploads FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================
-- Grant permissions
-- ============================================================

GRANT SELECT ON order_file_uploads TO anon;
GRANT SELECT, INSERT ON order_file_uploads TO authenticated;
