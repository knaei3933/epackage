-- =====================================================
-- Blog CMS Tables Migration
-- =====================================================
-- Migration: 20260218000001_create_blog_tables
-- Purpose: Create blog_posts, blog_images, and blog_categories tables
--          with indexes, constraints, and RLS policies
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- Table: blog_categories
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_categories (
  id TEXT PRIMARY KEY,
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Seed data for categories
INSERT INTO blog_categories (id, name_ja, name_en, sort_order) VALUES
  ('news', 'ニュース', 'News', 1),
  ('technical', '技術情報', 'Technical', 2),
  ('industry', '業界情報', 'Industry', 3),
  ('company', '会社情報', 'Company', 4)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Table: blog_posts
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core content
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,

  -- Categorization
  category TEXT NOT NULL REFERENCES blog_categories(id),
  tags TEXT[] DEFAULT '{}',

  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  og_image_path TEXT,
  canonical_url TEXT,

  -- Author & Status
  author_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metrics
  view_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,

  -- Constraints
  CONSTRAINT blog_posts_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT blog_posts_excerpt_length CHECK (excerpt IS NULL OR char_length(excerpt) <= 160),
  CONSTRAINT blog_posts_meta_title_length CHECK (meta_title IS NULL OR char_length(meta_title) <= 60),
  CONSTRAINT blog_posts_meta_description_length CHECK (meta_description IS NULL OR char_length(meta_description) <= 160)
);

-- =====================================================
-- Table: blog_images
-- =====================================================
CREATE TABLE IF NOT EXISTS blog_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- Indexes
-- =====================================================

-- Performance indexes for blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- Full-text search index (Japanese text search)
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts
  USING GIN(to_tsvector('japanese', COALESCE(title, '') || ' ' || COALESCE(content, '')));

-- Tag array index
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Partial index for published posts (common query)
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC)
  WHERE status = 'published';

-- Index for blog_images
CREATE INDEX IF NOT EXISTS idx_blog_images_post_id ON blog_images(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_images_created_at ON blog_images(created_at DESC);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Auto-update updated_at timestamp for blog_posts
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS on blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public: Can view published posts
CREATE POLICY "Public can view published posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

-- Authenticated: Can view all posts (for admin preview)
CREATE POLICY "Authenticated can view all posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin: Full CRUD access on blog_posts
CREATE POLICY "Admins can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Enable RLS on blog_images
ALTER TABLE blog_images ENABLE ROW LEVEL SECURITY;

-- Public: Can view all blog images
CREATE POLICY "Public can view blog images"
  ON blog_images
  FOR SELECT
  TO public
  USING (true);

-- Admin: Full CRUD access on blog_images
CREATE POLICY "Admins can insert blog images"
  ON blog_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update blog images"
  ON blog_images
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete blog images"
  ON blog_images
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Enable RLS on blog_categories (public read-only)
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

-- Public: Can view categories
CREATE POLICY "Public can view blog categories"
  ON blog_categories
  FOR SELECT
  TO public
  USING (true);

-- Admin: Can manage categories
CREATE POLICY "Admins can insert blog categories"
  ON blog_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update blog categories"
  ON blog_categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can delete blog categories"
  ON blog_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- =====================================================
-- Verification Queries
-- =====================================================
-- Run these after migration to verify:

-- Check tables exist
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name LIKE 'blog_%';

-- Check blog_posts columns
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'blog_posts'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, tablename, indexdef
-- FROM pg_indexes
-- WHERE tablename LIKE 'blog_%'
-- ORDER BY tablename, indexname;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename LIKE 'blog_%'
-- ORDER BY tablename, policyname;

-- Check categories seed data
-- SELECT * FROM blog_categories ORDER BY sort_order;

-- =====================================================
