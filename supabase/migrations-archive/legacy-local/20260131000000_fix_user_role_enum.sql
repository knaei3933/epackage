-- Fix user_role enum to use lowercase values for consistency
-- This matches the RBAC helpers which use lowercase roles

-- First, alter the enum type to use lowercase values
ALTER TYPE user_role RENAME TO user_role_old;

CREATE TYPE user_role AS ENUM ('admin', 'operator', 'sales', 'accounting', 'member', 'guest');

-- Update the profiles table to use the new enum type
ALTER TABLE profiles
  ALTER COLUMN role TYPE user_role USING role::text::user_role;

-- Drop the old enum type
DROP TYPE user_role_old;

-- Verify the change
SELECT role FROM profiles LIMIT 5;
