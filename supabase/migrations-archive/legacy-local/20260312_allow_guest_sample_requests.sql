-- Allow guest sample requests (user_id can be null)
-- This allows non-authenticated users to submit sample requests

-- Drop and recreate the foreign key constraint to allow NULL values
ALTER TABLE sample_requests DROP CONSTRAINT IF EXISTS sample_requests_user_id_fkey;

-- Make user_id nullable
ALTER TABLE sample_requests ALTER COLUMN user_id DROP NOT NULL;

-- Recreate foreign key constraint (will allow NULL values)
ALTER TABLE sample_requests
  ADD CONSTRAINT sample_requests_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;
