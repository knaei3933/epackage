-- =====================================================
-- Epackage Lab Inquiries Table Enhancement
--お問い合わせテーブル拡張
-- =====================================================
-- This migration adds missing columns to the inquiries table
-- to support the full contact form functionality
-- =====================================================

-- =====================================================
-- Update inquiry_type Enum to include all types
-- =====================================================

CREATE TYPE inquiry_type_new AS ENUM (
  'product',    -- 商品に関するお問い合わせ
  'quotation',  -- 見積に関するお問い合わせ
  'sample',     -- サンプルに関するお問い合わせ
  'order',      -- 注文に関するお問い合わせ
  'billing',    -- 請求に関するお問い合わせ
  'other',      -- その他
  'general',    -- 一般的なお問い合わせ
  'technical',  -- 技術的なお問い合わせ
  'sales',      -- 営業に関するお問い合わせ
  'support'     -- サポートに関するお問い合わせ
);

-- Update the type
ALTER TABLE inquiries ALTER COLUMN type TYPE inquiry_type_new USING type::text::inquiry_type_new;
DROP TYPE inquiry_type;
ALTER TYPE inquiry_type_new RENAME TO inquiry_type;

-- =====================================================
-- Update inquiry_status Enum
-- =====================================================

CREATE TYPE inquiry_status_new AS ENUM (
  'open',        -- 未対応
  'pending',     -- 保留中
  'in_progress', -- 対応中
  'responded',   -- 返信済
  'resolved',    -- 完了
  'closed'       -- クローズ
);

-- Update the type
ALTER TABLE inquiries ALTER COLUMN status TYPE inquiry_status_new USING status::text::inquiry_status_new;
DROP TYPE inquiry_status;
ALTER TYPE inquiry_status_new RENAME TO inquiry_status;

-- =====================================================
-- Add Missing Columns to inquiries Table
-- =====================================================

-- Make user_id nullable (for external/guest inquiries)
ALTER TABLE inquiries ALTER COLUMN user_id DROP NOT NULL;

-- Add request_number (human-readable request identifier)
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS request_number TEXT;

-- Customer information columns
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS customer_name_kana TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Contact information
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS fax TEXT;

-- Address information
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS prefecture TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS street TEXT;

-- Urgency and preferred contact
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS urgency TEXT CHECK (urgency IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS preferred_contact TEXT;

-- Privacy consent
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN NOT NULL DEFAULT false;

-- Admin notes
ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- =====================================================
-- Create Indexes for Performance
-- =====================================================

-- Composite index for filtering active inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_type_status_created
  ON inquiries(type, status, created_at DESC);

-- Partial index for active inquiries only
CREATE INDEX IF NOT EXISTS idx_inquiries_active
  ON inquiries(type, created_at DESC)
  WHERE status IN ('open', 'pending', 'in_progress');

-- Full-text search index for Japanese text
CREATE INDEX IF NOT EXISTS idx_inquiries_search
  ON inquiries USING gin(to_tsvector('simple', subject || ' ' || message || ' ' || customer_name || ' ' || COALESCE(company_name, '')));

-- =====================================================
-- Update Constraints
-- =====================================================

-- Remove old constraints if they exist
ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_user_id_check;

-- Add new constraints
ALTER TABLE inquiries ALTER COLUMN customer_name SET NOT NULL;
ALTER TABLE inquiries ALTER COLUMN customer_name_kana SET NOT NULL;
ALTER TABLE inquiries ALTER COLUMN email SET NOT NULL;
ALTER TABLE inquiries ALTER COLUMN phone SET NOT NULL;
ALTER TABLE inquiries ALTER COLUMN privacy_consent SET NOT NULL;

-- =====================================================
-- Add Triggers for Auto-numbering
-- =====================================================

-- Function to generate inquiry number (INQ-YYYYMMDD-NNNN)
CREATE OR REPLACE FUNCTION generate_inquiry_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  seq_part TEXT;
  new_number TEXT;
  max_seq INTEGER;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');

  -- Get the highest sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(inquiry_number FROM 13 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM inquiries
  WHERE inquiry_number LIKE 'INQ-' || date_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  new_number := 'INQ-' || date_part || '-' || seq_part;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate inquiry number
DROP TRIGGER IF EXISTS generate_inquiry_number_trigger ON inquiries;
CREATE TRIGGER generate_inquiry_number_trigger
  BEFORE INSERT ON inquiries
  FOR EACH ROW
  WHEN (NEW.inquiry_number IS NULL OR NEW.inquiry_number = '')
  EXECUTE FUNCTION generate_inquiry_number();

-- =====================================================
-- Update Trigger for updated_at timestamp
-- =====================================================

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON inquiries;

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Users can view their own inquiries
CREATE POLICY "Users can view own inquiries"
  ON inquiries FOR SELECT
  USING (user_id = auth.uid());

-- Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Anyone can insert inquiries (for contact form)
CREATE POLICY "Anyone can insert inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Users can update their own inquiries
CREATE POLICY "Users can update own inquiries"
  ON inquiries FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can update all inquiries
CREATE POLICY "Admins can update all inquiries"
  ON inquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- Grant Permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON inquiries TO authenticated, anon;
GRANT INSERT ON inquiries TO authenticated, anon;
GRANT UPDATE ON inquiries TO authenticated;

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get inquiry statistics
CREATE OR REPLACE FUNCTION get_inquiry_statistics()
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'open', COUNT(*) FILTER (WHERE status = 'open'),
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'resolved', COUNT(*) FILTER (WHERE status = 'resolved'),
    'closed', COUNT(*) FILTER (WHERE status = 'closed'),
    'by_type', jsonb_object_agg(type, count_by_type)
  ) INTO stats
  FROM (
    SELECT type, COUNT(*) as count_by_type
    FROM inquiries
    GROUP BY type
  ) sub;

  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search inquiries
CREATE OR REPLACE FUNCTION search_inquiries(
  search_term TEXT DEFAULT NULL,
  inquiry_type_param inquiry_type DEFAULT NULL,
  status_param inquiry_status DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS SETOF inquiries AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM inquiries
  WHERE
    (search_term IS NULL OR
     to_tsvector('simple', subject || ' ' || message || ' ' || customer_name || ' ' || COALESCE(company_name, ''))
     @@ to_tsquery('simple', search_term))
    AND (inquiry_type_param IS NULL OR type = inquiry_type_param)
    AND (status_param IS NULL OR status = status_param)
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Verify the changes
SELECT
  'inquiries table updated successfully' as status,
  COUNT(*) as total_inquiries
FROM inquiries;
