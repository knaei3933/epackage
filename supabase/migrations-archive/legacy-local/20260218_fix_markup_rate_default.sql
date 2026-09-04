-- ============================================
-- Fix Customer Markup Rate Default Value and Constraint
-- ============================================
-- Purpose:
-- 1. Change default markup_rate from 0.5 to 0.0 (no discount)
-- 2. Allow negative values for discounts (-0.5 to 0.0, i.e., -50% to 0%)
-- 3. Update existing NULL values to 0.0

-- Step 1: Drop old constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_markup_rate_check;

-- Step 2: Update existing NULL values to 0.0
UPDATE profiles
SET markup_rate = 0.0
WHERE markup_rate IS NULL;

-- Step 3: Set column default to 0.0
ALTER TABLE profiles
ALTER COLUMN markup_rate SET DEFAULT 0.0;

-- Step 4: Add new constraint for discounts (-0.5 to 0.0, i.e., -50% to 0%)
ALTER TABLE profiles
ADD CONSTRAINT profiles_markup_rate_check
CHECK (markup_rate >= -0.5 AND markup_rate <= 0);

-- Step 5: Update comment
COMMENT ON COLUMN profiles.markup_rate IS 'Customer-specific markup rate for discounts (-0.1 = 10% discount, 0.0 = no discount). Default is 0.0 (no discount).';

-- Verification query (run this to confirm):
-- SELECT email, markup_rate, markup_rate_note
-- FROM profiles
-- WHERE markup_rate IS NOT NULL
-- ORDER BY markup_rate DESC;
