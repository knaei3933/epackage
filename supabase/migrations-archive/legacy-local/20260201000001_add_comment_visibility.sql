-- Add visibility column to order_comments table
-- This allows filtering comments based on user roles

-- Add visibility column with default value
ALTER TABLE order_comments
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'all'
CHECK (visibility IN ('all', 'admin_only', 'korean_only'));

-- Update comment_type CHECK constraint to include new types
ALTER TABLE order_comments
DROP CONSTRAINT IF EXISTS order_comments_comment_type_check;

ALTER TABLE order_comments
ADD CONSTRAINT order_comments_comment_type_check
CHECK (comment_type IN ('general', 'design', 'production', 'shipping', 'correction', 'internal'));

-- Update author_role CHECK constraint to include new roles
ALTER TABLE order_comments
DROP CONSTRAINT IF EXISTS order_comments_author_role_check;

ALTER TABLE order_comments
ADD CONSTRAINT order_comments_author_role_check
CHECK (author_role IN ('customer', 'admin', 'korean_member', 'production'));

-- Create index on visibility for faster filtering
CREATE INDEX IF NOT EXISTS idx_order_comments_visibility
ON order_comments(visibility);

-- Create composite index for role-based filtering
CREATE INDEX IF NOT EXISTS idx_order_comments_role_visibility
ON order_comments(author_role, visibility);

-- Verify the changes
\d order_comments
