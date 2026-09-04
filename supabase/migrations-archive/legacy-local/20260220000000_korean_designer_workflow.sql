-- =====================================================
-- Korean Designer Correction Workflow Migration
-- Created: 2026-02-20
-- Description: Extends the system to support Korean designer workflow
-- with bilingual comments, task assignments, and translation caching
-- =====================================================

-- =====================================================
-- 1. PROFILES TABLE EXTENSIONS
-- =====================================================

-- Add designer-specific fields to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS designer_name_ko TEXT,           -- Korean name
  ADD COLUMN IF NOT EXISTS designer_name_en TEXT,           -- English name
  ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'ja'
    CHECK (preferred_language IN ('ja', 'ko', 'en')),
  ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{}';

-- Update role constraint to include KOREA_DESIGNER
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('ADMIN', 'MEMBER', 'KOREA_DESIGNER'));

-- Update status constraint to include additional states for designers
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_status_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED', 'INVITED'));

-- =====================================================
-- 2. DESIGN_REVISIONS TABLE EXTENSIONS
-- =====================================================

-- Extend design_revisions for bilingual support
ALTER TABLE design_revisions
  ADD COLUMN IF NOT EXISTS comment_ko TEXT,           -- Korean designer's original comment
  ADD COLUMN IF NOT EXISTS comment_ja TEXT,           -- Japanese translation
  ADD COLUMN IF NOT EXISTS translation_status TEXT DEFAULT 'pending'
    CHECK (translation_status IN ('pending', 'translated', 'failed', 'manual')),
  ADD COLUMN IF NOT EXISTS uploaded_by_type TEXT DEFAULT 'admin'
    CHECK (uploaded_by_type IN ('admin', 'korea_designer', 'member')),
  ADD COLUMN IF NOT EXISTS uploaded_by_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS translation_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS translation_completed_at TIMESTAMPTZ;

-- Index for designer-specific queries
CREATE INDEX IF NOT EXISTS idx_design_revisions_uploaded_by
  ON design_revisions(uploaded_by_type, uploaded_by_id);

-- Backfill existing design_revisions with uploaded_by_type='admin', translation_status='manual'
-- for records that have partner_comment but no uploaded_by_type set
UPDATE design_revisions
SET
  uploaded_by_type = 'admin',
  translation_status = 'manual'
WHERE partner_comment IS NOT NULL
  AND uploaded_by_type IS NULL;

-- =====================================================
-- 3. TRANSLATION_CACHE TABLE (NEW)
-- =====================================================

CREATE TABLE IF NOT EXISTS translation_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_text TEXT NOT NULL,
  source_language TEXT NOT NULL CHECK (source_language IN ('ko', 'ja', 'en')),
  target_language TEXT NOT NULL CHECK (target_language IN ('ko', 'ja', 'en')),
  translated_text TEXT NOT NULL,
  translation_provider TEXT DEFAULT 'google' CHECK (translation_provider IN ('google', 'manual')),
  quality_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPT DEFAULT (NOW() + INTERVAL '30 days'),
  UNIQUE(source_text, source_language, target_language)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_translation_cache_lookup
  ON translation_cache(source_text, source_language, target_language);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_translation_cache_expires_at
  ON translation_cache(expires_at);

-- Enable RLS
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and korea_designers can access translation cache
CREATE POLICY "Admins and designers can manage translation cache"
  ON translation_cache FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'KOREA_DESIGNER')
    )
  );

-- =====================================================
-- 4. DESIGNER_TASK_ASSIGNMENTS TABLE (NEW)
-- =====================================================

CREATE TABLE IF NOT EXISTS designer_task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(designer_id, order_id)
);

-- Indexes for task assignment queries
CREATE INDEX IF NOT EXISTS idx_designer_task_assignments_designer_id
  ON designer_task_assignments(designer_id);
CREATE INDEX IF NOT EXISTS idx_designer_task_assignments_order_id
  ON designer_task_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_designer_task_assignments_status
  ON designer_task_assignments(status);

-- Enable RLS
ALTER TABLE designer_task_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Designers see only their assigned tasks
CREATE POLICY "Designers view own assignments"
  ON designer_task_assignments FOR SELECT
  USING (designer_id = auth.uid());

-- Policy: Admins can manage all assignments
CREATE POLICY "Admins manage all assignments"
  ON designer_task_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Designers can update their assignment status
CREATE POLICY "Designers update own assignment status"
  ON designer_task_assignments FOR UPDATE
  USING (designer_id = auth.uid())
  WITH CHECK (designer_id = auth.uid());

-- =====================================================
-- 5. RLS POLICIES FOR DESIGNER ACCESS TO DESIGN_REVISIONS
-- =====================================================

-- Policy: Designers can view revisions for assigned orders
CREATE POLICY "Designers can view revisions for assigned orders"
  ON design_revisions FOR SELECT
  USING (
    uploaded_by_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM designer_task_assignments
      WHERE designer_id = auth.uid()
        AND order_id = design_revisions.order_id
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Policy: Designers can insert corrections
CREATE POLICY "Designers can insert corrections"
  ON design_revisions FOR INSERT
  WITH CHECK (
    uploaded_by_id = auth.uid()
    AND uploaded_by_type = 'korea_designer'
    AND EXISTS (
      SELECT 1 FROM designer_task_assignments
      WHERE designer_id = auth.uid()
        AND order_id = design_revisions.order_id
        AND status IN ('pending', 'in_progress')
    )
  );

-- Policy: Designers can update their own corrections
CREATE POLICY "Designers can update own corrections"
  ON design_revisions FOR UPDATE
  USING (
    uploaded_by_id = auth.uid()
    AND uploaded_by_type = 'korea_designer'
  )
  WITH CHECK (
    uploaded_by_id = auth.uid()
    AND uploaded_by_type = 'korea_designer'
  );

-- =====================================================
-- 6. ADDITIONAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for finding revisions by translation status
CREATE INDEX IF NOT EXISTS idx_design_revisions_translation_status
  ON design_revisions(translation_status)
  WHERE translation_status IN ('pending', 'failed');

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions on new tables to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON translation_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON designer_task_assignments TO authenticated;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE translation_cache IS 'Cache for translation results to avoid duplicate API calls';
COMMENT ON TABLE designer_task_assignments IS 'Assigns Korean designers to specific orders for correction work';

COMMENT ON COLUMN profiles.designer_name_ko IS 'Korean name of the designer';
COMMENT ON COLUMN profiles.designer_name_en IS 'English name of the designer';
COMMENT ON COLUMN profiles.preferred_language IS 'Preferred language for UI and notifications (ja, ko, en)';
COMMENT ON COLUMN profiles.notification_settings IS 'JSONB object containing notification preferences';

COMMENT ON COLUMN design_revisions.comment_ko IS 'Original Korean comment from the designer';
COMMENT ON COLUMN design_revisions.comment_ja IS 'Japanese translation of the Korean comment';
COMMENT ON COLUMN design_revisions.translation_status IS 'Status of translation: pending, translated, failed, or manual';
COMMENT ON COLUMN design_revisions.uploaded_by_type IS 'Type of user who uploaded: admin, korea_designer, or member';
COMMENT ON COLUMN design_revisions.uploaded_by_id IS 'ID of the user who uploaded the revision';
