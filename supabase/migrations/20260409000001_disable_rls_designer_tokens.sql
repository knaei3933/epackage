-- Disable RLS for designer_upload_tokens table
-- This table is admin-only and access is controlled at the application layer via verifyAdminAuth()
-- RLS was blocking service role client operations because auth.uid() is null for service role

-- Disable RLS completely (admin-only table, app-level auth is sufficient)
ALTER TABLE designer_upload_tokens DISABLE ROW LEVEL SECURITY;

-- Drop old RLS policies (no longer needed)
DROP POLICY IF EXISTS "Only admins can view upload tokens" ON designer_upload_tokens;
DROP POLICY IF EXISTS "Only admins can create upload tokens" ON designer_upload_tokens;
DROP POLICY IF EXISTS "Only admins can update upload tokens" ON designer_upload_tokens;
DROP POLICY IF EXISTS "Only admins can delete upload tokens" ON designer_upload_tokens;

COMMENT ON TABLE designer_upload_tokens IS 'Secure tokens for external designer file uploads. RLS disabled - access controlled at application layer via admin authentication.';
