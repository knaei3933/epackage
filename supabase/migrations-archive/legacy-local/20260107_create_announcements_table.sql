-- =====================================================
-- Create Announcements Table
-- =====================================================
-- Migration: 20260107_create_announcements_table
-- Purpose: Create announcements table for homepage dynamic content
--
-- Note: This table should already exist according to database-schema-v2.md
-- This migration is for backup/reference purposes only
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('maintenance', 'update', 'notice', 'promotion')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for published announcements
CREATE INDEX IF NOT EXISTS idx_announcements_published
  ON announcements(is_published, published_at DESC)
  WHERE is_published = true;

-- Create trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- Add RLS (Row Level Security)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access to published announcements
CREATE POLICY "Public can view published announcements"
  ON announcements
  FOR SELECT
  USING (is_published = true);

-- RLS Policies: Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can insert announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this after migration to verify:
--
-- SELECT
--   table_name,
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_name = 'announcements'
-- ORDER BY ordinal_position;
--
-- =====================================================
