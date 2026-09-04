-- Update RLS policies for order_comments to support role-based visibility
-- Korean members should only see admin/korean_member/production comments
-- Customers should only see customer/admin comments (non-internal)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view comments for their orders" ON order_comments;
DROP POLICY IF EXISTS "Users can insert comments for their orders" ON order_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON order_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON order_comments;

-- Enable RLS
ALTER TABLE order_comments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT Policies - Role-based visibility
-- ============================================================================

-- Admin: Can see ALL comments
CREATE POLICY "Admins can view all comments"
ON order_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Korean Member: Can only see admin/korean_member/production comments
CREATE POLICY "Korean members can view relevant comments"
ON order_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'korean_member'
  )
  AND author_role IN ('admin', 'korean_member', 'production')
);

-- Production: Can only see admin/korean_member/production comments
CREATE POLICY "Production can view relevant comments"
ON order_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'production'
  )
  AND author_role IN ('admin', 'korean_member', 'production')
);

-- Customer: Can only see non-internal comments (customer + admin)
CREATE POLICY "Customers can view non-internal comments"
ON order_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'member'
  )
  AND is_internal = false
  AND author_role IN ('customer', 'admin')
);

-- ============================================================================
-- INSERT Policies - Role-based comment creation
-- ============================================================================

-- Admin: Can insert any comment
CREATE POLICY "Admins can insert comments"
ON order_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Korean Member: Can insert comments with korean_member role
CREATE POLICY "Korean members can insert comments"
ON order_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'korean_member'
  )
  AND author_role = 'korean_member'
  AND is_internal = true
);

-- Production: Can insert comments with production role
CREATE POLICY "Production can insert comments"
ON order_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'production'
  )
  AND author_role = 'production'
  AND is_internal = true
);

-- Customer: Can insert non-internal comments
CREATE POLICY "Customers can insert comments"
ON order_comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'member'
  )
  AND author_role = 'customer'
  AND is_internal = false
  AND author_id = auth.uid()
);

-- ============================================================================
-- UPDATE Policies - Own comments or admin
-- ============================================================================

-- Admin: Can update any comment
CREATE POLICY "Admins can update any comment"
ON order_comments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users: Can update their own comments within 24 hours
CREATE POLICY "Users can update own recent comments"
ON order_comments FOR UPDATE
USING (
  author_id = auth.uid()
  AND created_at > NOW() - INTERVAL '24 hours'
)
WITH CHECK (
  author_id = auth.uid()
);

-- ============================================================================
-- DELETE Policies - Own comments or admin
-- ============================================================================

-- Admin: Can delete any comment
CREATE POLICY "Admins can delete any comment"
ON order_comments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Users: Can delete their own comments within 24 hours
CREATE POLICY "Users can delete own recent comments"
ON order_comments FOR DELETE
USING (
  author_id = auth.uid()
  AND created_at > NOW() - INTERVAL '24 hours'
);

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'order_comments'
ORDER BY policyname;
