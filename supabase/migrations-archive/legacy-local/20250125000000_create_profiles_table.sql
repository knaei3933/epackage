-- =====================================================
-- Epackage Lab Authentication Profiles Table
-- Supabase Auth Integration
-- =====================================================

-- Business Type Enum
CREATE TYPE business_type AS ENUM ('INDIVIDUAL', 'CORPORATION');

-- Product Category Enum
CREATE TYPE product_category AS ENUM (
  'COSMETICS',
  'CLOTHING',
  'ELECTRONICS',
  'KITCHEN',
  'FURNITURE',
  'OTHER'
);

-- User Role Enum
CREATE TYPE user_role AS ENUM ('ADMIN', 'MEMBER');

-- User Status Enum
CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED');

-- =====================================================
-- Profiles Table (extends Supabase auth.users)
-- =====================================================

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,

  -- Japanese Name (Kanji & Kana, separate fields)
  kanji_last_name TEXT NOT NULL,
  kanji_first_name TEXT NOT NULL,
  kana_last_name TEXT NOT NULL,
  kana_first_name TEXT NOT NULL,

  -- Phone Numbers
  corporate_phone TEXT,
  personal_phone TEXT,

  -- Business Type
  business_type business_type NOT NULL DEFAULT 'INDIVIDUAL',

  -- Company Information
  company_name TEXT,
  legal_entity_number TEXT,
  position TEXT,
  department TEXT,
  company_url TEXT,

  -- Product Category
  product_category product_category NOT NULL,

  -- Acquisition Channel
  acquisition_channel TEXT,

  -- Address Information (Japan format)
  postal_code TEXT,
  prefecture TEXT,
  city TEXT,
  street TEXT,

  -- User Role & Status
  role user_role NOT NULL DEFAULT 'MEMBER',
  status user_status NOT NULL DEFAULT 'PENDING',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_login_at TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT email_not_empty CHECK (length(trim(email)) > 0),
  CONSTRAINT kana_last_name_hiragana CHECK (kana_last_name ~ '^[\u3040-\u309F\s]+$'),
  CONSTRAINT kana_first_name_hiragana CHECK (kana_first_name ~ '^[\u3040-\u309F\s]+$'),
  CONSTRAINT kanji_last_name_kanji CHECK (kanji_last_name ~ '^[\u4E00-\u9FFF\s]+$'),
  CONSTRAINT kanji_first_name_kanji CHECK (kanji_first_name ~ '^[\u4E00-\u9FFF\s]+$'),
  CONSTRAINT legal_entity_number_format CHECK (
    legal_entity_number IS NULL OR legal_entity_number ~ '^\d{13}$'
  ),
  CONSTRAINT corporate_phone_format CHECK (
    corporate_phone IS NULL OR corporate_phone ~ '^\d{2,4}-?\d{2,4}-?\d{3,4}$'
  ),
  CONSTRAINT personal_phone_format CHECK (
    personal_phone IS NULL OR personal_phone ~ '^\d{2,4}-?\d{2,4}-?\d{3,4}$'
  ),
  CONSTRAINT postal_code_format CHECK (
    postal_code IS NULL OR postal_code ~ '^\d{3}-?\d{4}$'
  )
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_business_type ON profiles(business_type);
CREATE INDEX idx_profiles_company_name ON profiles(company_name);
CREATE INDEX idx_profiles_last_login_at ON profiles(last_login_at DESC);

-- =====================================================
-- Trigger: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Trigger: Create profile on user signup
-- =====================================================

-- This trigger automatically creates a profile entry when a new user signs up
-- Note: The register API will insert complete profile data, this is a fallback

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, kanji_last_name, kanji_first_name, kana_last_name, kana_first_name, business_type, product_category, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    '未登録',
    '未登録',
    'みとうろく',
    'みとうろく',
    'INDIVIDUAL',
    'OTHER',
    'MEMBER',
    'PENDING'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public can read profiles by email (for checking duplicates)
CREATE POLICY "Public profiles by email are viewable by everyone"
  ON profiles FOR SELECT
  USING (email = auth.uid()::text OR status = 'ACTIVE');

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (some fields only)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Restrict updates to non-sensitive fields
    jsonb_object_keys(NEW) <@ ARRAY[
      'corporate_phone', 'personal_phone', 'company_name',
      'position', 'department', 'company_url', 'acquisition_channel',
      'postal_code', 'prefecture', 'city', 'street'
    ]::text[]
  );

-- Only admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can update profile status and role
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Service role can do everything (for API calls)
CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get user profile with status check
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS profiles AS $$
DECLARE
  user_profile profiles;
BEGIN
  SELECT * INTO user_profile
  FROM profiles
  WHERE id = user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', user_id;
  END IF;

  RETURN user_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is active
CREATE OR REPLACE FUNCTION is_user_active(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last login
CREATE OR REPLACE FUNCTION update_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET last_login_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions to authenticated users
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON profiles TO authenticated, anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;
GRANT ALL ON SEQUENCES IN SCHEMA public TO authenticated, anon;
