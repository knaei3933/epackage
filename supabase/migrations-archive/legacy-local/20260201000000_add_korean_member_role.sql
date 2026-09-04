-- Add Korean member and production roles to user_role enum
-- This migration adds support for Korean members and production staff

-- Note: PostgreSQL doesn't support ALTER TYPE ... ADD VALUE IF NOT EXISTS
-- We need to check if the value exists first

-- Check current enum values
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;

-- Add korean_member role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'korean_member' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'korean_member';
    END IF;
END $$;

-- Add production role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'production' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'production';
    END IF;
END $$;

-- Verify the changes
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype ORDER BY enumsortorder;

-- Example: Create a Korean member user
-- INSERT INTO profiles (id, email, full_name, role)
-- VALUES ('uuid-here', 'korean@example.com', 'Korean Member', 'korean_member');
