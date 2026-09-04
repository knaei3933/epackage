-- =====================================================
-- Fix order_comments for token-based uploads
-- Run this in Supabase SQL Editor
-- =====================================================

-- Make author_id nullable for token-based comments
ALTER TABLE order_comments
  ALTER COLUMN author_id DROP NOT NULL;

-- Update author_role CHECK constraint to include 'korea_designer'
ALTER TABLE order_comments
  DROP CONSTRAINT IF EXISTS order_comments_author_role_check;

ALTER TABLE order_comments
  ADD CONSTRAINT order_comments_author_role_check
  CHECK (author_role IN ('customer', 'admin', 'production', 'korea_designer', 'designer'));

-- Add translation support fields if not exists
ALTER TABLE order_comments
  ADD COLUMN IF NOT EXISTS original_language TEXT
    CHECK (original_language IN ('ja', 'ko', 'en')),
  ADD COLUMN IF NOT EXISTS content_translated TEXT,
  ADD COLUMN IF NOT EXISTS translation_status TEXT DEFAULT 'not_needed'
    CHECK (translation_status IN ('pending', 'translated', 'failed', 'not_needed')),
  ADD COLUMN IF NOT EXISTS translated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS translation_error TEXT;

-- Add author_name_display for NULL author_id
ALTER TABLE order_comments
  ADD COLUMN IF NOT EXISTS author_name_display TEXT;

-- Add visibility column if not exists
ALTER TABLE order_comments
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'all'
    CHECK (visibility IN ('all', 'admin_only', 'korean_only'));

-- Disable RLS temporarily for testing
ALTER TABLE order_comments DISABLE ROW LEVEL SECURITY;
