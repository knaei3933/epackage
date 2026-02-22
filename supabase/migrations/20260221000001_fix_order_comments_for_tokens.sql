-- =====================================================
-- Order Comments Token Support Migration
-- Created: 2026-02-21
-- Description: Extends order_comments table to support token-based designer uploads
-- with NULL author_id and bilingual translation support
-- =====================================================

-- =====================================================
-- 1. MODIFY ORDER_COMMENTS TABLE STRUCTURE
-- =====================================================

-- Step 1: Make author_id nullable to support token-based comments
-- First drop any policies that depend on author_id NOT NULL constraint
DROP POLICY IF EXISTS "Users can insert comments on own orders" ON order_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON order_comments;
DROP POLICY IF EXISTS "Users can soft delete own comments" ON order_comments;

-- Drop the NOT NULL constraint from author_id
ALTER TABLE order_comments
  ALTER COLUMN author_id DROP NOT NULL;

-- Step 2: Update author_role CHECK constraint to include 'korean_designer'
ALTER TABLE order_comments
  DROP CONSTRAINT IF EXISTS order_comments_author_role_check;

ALTER TABLE order_comments
  ADD CONSTRAINT order_comments_author_role_check
  CHECK (author_role IN ('customer', 'admin', 'production', 'korean_designer', 'designer'));

-- Step 3: Add translation support fields
ALTER TABLE order_comments
  ADD COLUMN IF NOT EXISTS original_language TEXT
    CHECK (original_language IN ('ja', 'ko', 'en')),
  ADD COLUMN IF NOT EXISTS content_translated TEXT,
  ADD COLUMN IF NOT EXISTS translation_status TEXT DEFAULT 'not_needed'
    CHECK (translation_status IN ('pending', 'translated', 'failed', 'not_needed')),
  ADD COLUMN IF NOT EXISTS translated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS translation_error TEXT;

-- Step 4: Add author_name_display for NULL author_id (token-based designers)
ALTER TABLE order_comments
  ADD COLUMN IF NOT EXISTS author_name_display TEXT;

-- Step 5: Add visibility column if not exists (for Korean designer filtering)
ALTER TABLE order_comments
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'all'
    CHECK (visibility IN ('all', 'admin_only', 'korean_only'));

-- =====================================================
-- 2. CREATE INDEXES FOR NEW FIELDS
-- =====================================================

-- Index for translation status queries
CREATE INDEX IF NOT EXISTS idx_order_comments_translation_status
  ON order_comments(translation_status)
  WHERE translation_status IN ('pending', 'failed');

-- Index for original language filtering
CREATE INDEX IF NOT EXISTS idx_order_comments_original_language
  ON order_comments(original_language);

-- Index for visibility filtering
CREATE INDEX IF NOT EXISTS idx_order_comments_visibility
  ON order_comments(visibility);

-- Index for token-based comments (NULL author_id)
CREATE INDEX IF NOT EXISTS idx_order_comments_token_based
  ON order_comments(order_id, created_at DESC)
  WHERE author_id IS NULL AND deleted_at IS NULL;

-- =====================================================
-- 3. TRIGGER: AUTO-POPULATE AUTHOR_NAME_DISPLAY
-- =====================================================

-- Function to auto-fill author_name_display from profiles
CREATE OR REPLACE FUNCTION populate_author_name_display()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-fill author_name_display from profiles when author_id is set
  IF NEW.author_id IS NOT NULL AND (NEW.author_name_display IS NULL OR NEW.author_name_display = '') THEN
    SELECT
      COALESCE(profiles.designer_name_en, profiles.name, 'Unknown')
    INTO NEW.author_name_display
    FROM profiles
    WHERE profiles.id = NEW.author_id;
  END IF;

  -- Set original_language based on author_role if not set
  IF NEW.original_language IS NULL THEN
    CASE NEW.author_role
      WHEN 'korean_designer' THEN NEW.original_language := 'ko';
      WHEN 'customer' THEN NEW.original_language := 'ja'; -- Default to Japanese for customers
      ELSE NEW.original_language := 'ja'; -- Default to Japanese
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for INSERT
DROP TRIGGER IF EXISTS trigger_populate_author_name_display_insert
  ON order_comments;

CREATE TRIGGER trigger_populate_author_name_display_insert
  BEFORE INSERT ON order_comments
  FOR EACH ROW
  EXECUTE FUNCTION populate_author_name_display();

-- Apply trigger for UPDATE (in case author_id changes)
DROP TRIGGER IF EXISTS trigger_populate_author_name_display_update
  ON order_comments;

CREATE TRIGGER trigger_populate_author_name_display_update
  BEFORE UPDATE ON order_comments
  FOR EACH ROW
  WHEN (OLD.author_id IS DISTINCT FROM NEW.author_id)
  EXECUTE FUNCTION populate_author_name_display();

-- =====================================================
-- 4. FUNCTION: CREATE COMMENT FROM TOKEN
-- =====================================================

-- Function to create a comment from a token (with NULL author_id)
CREATE OR REPLACE FUNCTION create_comment_from_token(
  p_order_id UUID,
  p_content TEXT,
  p_token_id UUID,
  p_designer_name TEXT,
  p_author_role TEXT DEFAULT 'designer',
  p_comment_type TEXT DEFAULT 'general',
  p_original_language TEXT DEFAULT 'en',
  p_attachments JSONB DEFAULT '[]'::jsonb,
  p_is_internal BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  v_comment_id UUID;
  v_token_record RECORD;
BEGIN
  -- Get token information for logging
  SELECT * INTO v_token_record
  FROM designer_upload_tokens
  WHERE id = p_token_id AND status = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  -- Create the comment with NULL author_id
  INSERT INTO order_comments (
    order_id,
    content,
    author_id,
    author_name_display,
    author_role,
    comment_type,
    original_language,
    translation_status,
    attachments,
    is_internal,
    metadata
  ) VALUES (
    p_order_id,
    p_content,
    NULL,  -- NULL author_id for token-based comments
    p_designer_name,
    p_author_role,
    p_comment_type,
    p_original_language,
    'pending',  -- Mark translation as pending
    p_attachments,
    p_is_internal,
    jsonb_build_object(
      'token_id', p_token_id,
      'token_prefix', v_token_record.token_prefix,
      'designer_email', v_token_record.designer_email
    )
  ) RETURNING id INTO v_comment_id;

  -- Update token upload count
  UPDATE designer_upload_tokens
  SET upload_count = upload_count + 1
  WHERE id = p_token_id;

  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNCTION: GET COMMENTS FOR TOKEN ACCESS
-- =====================================================

-- Function to retrieve comments for token-based access
CREATE OR REPLACE FUNCTION get_order_comments_for_token(
  p_token_hash TEXT,
  p_include_internal BOOLEAN DEFAULT false
) RETURNS TABLE (
  id UUID,
  content TEXT,
  author_id UUID,
  author_name_display TEXT,
  author_role TEXT,
  comment_type TEXT,
  original_language TEXT,
  content_translated TEXT,
  translation_status TEXT,
  attachments JSONB,
  created_at TIMESTAMPTZ,
  is_internal BOOLEAN
) AS $$
DECLARE
  v_order_id UUID;
BEGIN
  -- Get order_id from token
  SELECT order_id INTO v_order_id
  FROM designer_upload_tokens
  WHERE token_hash = p_token_hash
    AND status = 'active'
    AND expires_at > NOW();

  IF v_order_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;

  -- Return comments based on visibility rules
  RETURN QUERY
  SELECT
    oc.id,
    oc.content,
    oc.author_id,
    oc.author_name_display,
    oc.author_role,
    oc.comment_type,
    oc.original_language,
    oc.content_translated,
    oc.translation_status,
    oc.attachments,
    oc.created_at,
    oc.is_internal
  FROM order_comments oc
  WHERE oc.order_id = v_order_id
    AND oc.deleted_at IS NULL
    AND (
      p_include_internal = true
      OR oc.is_internal = false
    )
    AND (
      oc.visibility = 'all'
      OR oc.visibility = 'korean_only'
      OR (oc.visibility = 'admin_only' AND p_include_internal = true)
    )
  ORDER BY oc.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. UPDATE RLS POLICIES FOR TOKEN SUPPORT
-- =====================================================

-- Re-create policy for inserting comments (now supports NULL author_id)
CREATE POLICY IF NOT EXISTS "Users can insert comments on own orders"
  ON order_comments FOR INSERT
  WITH CHECK (
    deleted_at IS NULL
    AND (
      -- Authenticated users can insert with their own author_id
      (author_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM orders
          WHERE orders.id = order_comments.order_id
            AND orders.user_id = auth.uid()
        ))
      -- Or allow NULL author_id for token-based comments (enforced at application level)
      OR author_id IS NULL
    )
  );

-- Re-create policy for updating own comments
CREATE POLICY IF NOT EXISTS "Users can update own comments"
  ON order_comments FOR UPDATE
  USING (
    author_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Re-create policy for soft delete
CREATE POLICY IF NOT EXISTS "Users can soft delete own comments"
  ON order_comments FOR UPDATE
  USING (
    author_id = auth.uid()
    AND deleted_at IS NULL
  );

-- Policy for Korean designers to view their order comments
CREATE POLICY IF NOT EXISTS "Korean designers can view assigned order comments"
  ON order_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM designer_task_assignments
      WHERE designer_id = auth.uid()
        AND order_id = order_comments.order_id
    )
    AND deleted_at IS NULL
  );

-- =====================================================
-- 7. TRANSLATION MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to mark comment for translation
CREATE OR REPLACE FUNCTION request_comment_translation(
  p_comment_id UUID,
  p_target_language TEXT DEFAULT 'ja'
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update translation status to pending
  UPDATE order_comments
  SET
    translation_status = 'pending',
    original_language = COALESCE(original_language, 'en')  -- Default to English if not set
  WHERE id = p_comment_id
    AND translation_status = 'not_needed';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to store translated content
CREATE OR REPLACE FUNCTION store_comment_translation(
  p_comment_id UUID,
  p_translated_content TEXT,
  p_translation_error TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  IF p_translation_error IS NOT NULL THEN
    -- Mark translation as failed
    UPDATE order_comments
    SET
      translation_status = 'failed',
      translation_error = p_translation_error
    WHERE id = p_comment_id;
  ELSE
    -- Store translation and mark as complete
    UPDATE order_comments
    SET
      content_translated = p_translated_content,
      translation_status = 'translated',
      translated_at = NOW()
    WHERE id = p_comment_id;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. BACKFILL EXISTING COMMENTS
-- =====================================================

-- Backfill author_name_display for existing comments with author_id
UPDATE order_comments
SET author_name_display = COALESCE(
  (SELECT designer_name_en FROM profiles WHERE profiles.id = order_comments.author_id),
  (SELECT name FROM profiles WHERE profiles.id = order_comments.author_id),
  'Unknown'
)
WHERE author_id IS NOT NULL
  AND (author_name_display IS NULL OR author_name_display = '');

-- Backfill original_language for existing comments based on author_role
UPDATE order_comments
SET original_language = CASE
  WHEN author_role = 'korean_designer' THEN 'ko'
  WHEN author_role = 'customer' THEN 'ja'
  ELSE 'ja'
END
WHERE original_language IS NULL;

-- Set translation_status to 'not_needed' for existing comments
UPDATE order_comments
SET translation_status = 'not_needed'
WHERE translation_status IS NULL;

-- =====================================================
-- 9. GRANT PERMISSIONS ON NEW FUNCTIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_comment_from_token(
  UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, BOOLEAN
) TO authenticated;

GRANT EXECUTE ON FUNCTION get_order_comments_for_token(TEXT, BOOLEAN) TO authenticated;

GRANT EXECUTE ON FUNCTION request_comment_translation(UUID, TEXT) TO authenticated;

GRANT EXECUTE ON FUNCTION store_comment_translation(UUID, TEXT, TEXT) TO authenticated;

-- =====================================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN order_comments.author_id IS 'Author profile ID (nullable for token-based designer uploads)';
COMMENT ON COLUMN order_comments.author_role IS 'Role of author: customer, admin, production, korean_designer, or designer (for token-based)';
COMMENT ON COLUMN order_comments.author_name_display IS 'Display name (auto-populated from profiles, or manually set for token-based authors)';
COMMENT ON COLUMN order_comments.original_language IS 'Original comment language: ja, ko, or en';
COMMENT ON COLUMN order_comments.content_translated IS 'Translated version of the content';
COMMENT ON COLUMN order_comments.translation_status IS 'Translation status: pending, translated, failed, or not_needed';
COMMENT ON COLUMN order_comments.translated_at IS 'Timestamp when translation was completed';
COMMENT ON COLUMN order_comments.translation_error IS 'Error message if translation failed';
COMMENT ON COLUMN order_comments.visibility IS 'Comment visibility: all, admin_only, or korean_only';

COMMENT ON FUNCTION create_comment_from_token(
  UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, BOOLEAN
) IS 'Creates a comment from a token upload with NULL author_id. Tracks upload count on token.';

COMMENT ON FUNCTION get_order_comments_for_token(TEXT, BOOLEAN) IS 'Retrieves comments for a token holder. Respects visibility rules.';

COMMENT ON FUNCTION request_comment_translation(UUID, TEXT) IS 'Marks a comment for translation to target language.';

COMMENT ON FUNCTION store_comment_translation(UUID, TEXT, TEXT) IS 'Stores translated content or marks translation as failed.';
