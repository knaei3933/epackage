-- =====================================================
-- Epackage Lab Companies Table
--企業情報管理 (Company Information Management)
-- =====================================================

-- Legal Entity Type Enum (法人種類)
CREATE TYPE legal_entity_type AS ENUM (
  'KK',    -- 株式会社 (Kabushiki Kaisha - Stock Corporation)
  'GK',    -- 合同会社 (Godo Kaisha - Limited Liability Company)
  'GKDK',  -- 合名会社 (Gomei Kaisha - General Partnership Company)
  'TK',    -- 合資会社 (Goshi Kaisha - Limited Partnership)
  'KKK',   -- 相互会社 (Sogo Kaisha - Mutual Company)
  'Other'  -- その他 (Other)
);

-- Company Status Enum
CREATE TYPE company_status AS ENUM (
  'ACTIVE',      -- 有効 (Active)
  'SUSPENDED',   -- 停止中 (Suspended)
  'INACTIVE'     -- 無効 (Inactive)
);

-- =====================================================
-- Companies Table
-- =====================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 法人番号 (Corporate Number - 13 digits issued by Japanese government)
  corporate_number TEXT NOT NULL UNIQUE,

  -- 登記上の正式名称 (Registered Legal Name)
  name TEXT NOT NULL,

  -- カタカナ表記 (Katakana Representation)
  name_kana TEXT NOT NULL,

  -- 法人種類 (Legal Entity Type)
  legal_entity_type legal_entity_type NOT NULL,

  -- 業種 (Industry)
  industry TEXT NOT NULL,

  -- 支払条件 (Payment Terms - e.g., "月末払い", "60日サイト")
  payment_terms TEXT,

  -- ステータス (Status)
  status company_status NOT NULL DEFAULT 'ACTIVE',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT corporate_number_format CHECK (
    corporate_number ~ '^\d{13}$'
  ),
  CONSTRAINT name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT name_kana_katakana CHECK (name_kana ~ '^[\u30A0-\u30FF\s]+$')
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_companies_corporate_number ON companies(corporate_number);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_industry ON companies(industry);

-- =====================================================
-- Trigger: Update updated_at timestamp
-- =====================================================

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Public can view active companies (limited info)
CREATE POLICY "Public can view active companies"
  ON companies FOR SELECT
  USING (status = 'ACTIVE');

-- Authenticated users can view active companies
CREATE POLICY "Authenticated users can view active companies"
  ON companies FOR SELECT
  USING (auth.uid() IS NOT NULL AND status = 'ACTIVE');

-- Only admins can insert companies
CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can update companies
CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can delete companies
CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Service role can do everything
CREATE POLICY "Service role can manage companies"
  ON companies FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to find company by corporate number
CREATE OR REPLACE FUNCTION find_company_by_corporate_number(num TEXT)
RETURNS companies AS $$
DECLARE
  company_record companies;
BEGIN
  SELECT * INTO company_record
  FROM companies
  WHERE corporate_number = num;

  RETURN company_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate corporate number checksum (Japanese法人番号 validation)
CREATE OR REPLACE FUNCTION validate_corporate_number(num TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Basic format check (13 digits)
  IF num ~ '^\d{13}$' THEN
    -- Japanese法人番号 uses a checksum algorithm
    -- For now, just check format - implement full validation if needed
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON companies TO authenticated, anon;
GRANT ALL ON companies TO authenticated;
