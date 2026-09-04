-- ============================================
-- Add Customer-Specific Markup Rate to Profiles
-- ============================================
-- Purpose: Allow different markup rates per customer
-- Default: 0.5 (50%)

-- Add markup_rate column if not exists
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS markup_rate NUMERIC DEFAULT 0.5;

-- Add markup_rate_note column for internal notes
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS markup_rate_note TEXT;

-- Add constraint to ensure markup_rate is between 0 and 2 (0% to 200%)
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_markup_rate_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_markup_rate_check
CHECK (markup_rate >= 0 AND markup_rate <= 2);

-- Add index for customer markup lookups
CREATE INDEX IF NOT EXISTS idx_profiles_markup_rate ON profiles(markup_rate);

-- Add comment for documentation
COMMENT ON COLUMN profiles.markup_rate IS 'Customer-specific markup rate (0.5 = 50%). Default is 0.5';
COMMENT ON COLUMN profiles.markup_rate_note IS 'Internal notes about why this markup rate was set';
