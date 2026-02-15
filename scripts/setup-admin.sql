-- =====================================================
-- Admin User Setup SQL Script
-- =====================================================
-- Run this in Supabase Dashboard > SQL Editor
-- This will create/update a user to have ADMIN role and ACTIVE status
-- =====================================================

-- Step 1: First, sign up a user through the website at /auth/register
-- Use email: admin@epackage-lab.com
-- Use password: Admin1234

-- Step 2: After signing up, run this SQL to make them an admin

-- Update the user's profile to ADMIN role and ACTIVE status
UPDATE profiles
SET
  role = 'ADMIN',
  status = 'ACTIVE',
  updated_at = NOW()
WHERE email = 'admin@epackage-lab.com';

-- Verify the update
SELECT
  id,
  email,
  role,
  status,
  created_at,
  updated_at
FROM profiles
WHERE email = 'admin@epackage-lab.com';

-- Expected result:
-- role: 'ADMIN'
-- status: 'ACTIVE'
