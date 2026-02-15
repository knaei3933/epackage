-- =====================================================
-- Premium Content Downloads Table
-- =====================================================
-- Purpose: Track premium content downloads and capture lead information
-- Created: 2025-01-05
-- =====================================================

-- Create premium_downloads table
CREATE TABLE IF NOT EXISTS premium_downloads (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content information
  content_id TEXT NOT NULL,
  content_title TEXT,

  -- Lead information
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,

  -- Professional information
  industry TEXT NOT NULL,
  role TEXT NOT NULL,

  -- Consent tracking
  consent BOOLEAN NOT NULL,
  newsletter BOOLEAN DEFAULT FALSE,

  -- Tracking
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,

  -- Lead scoring
  lead_score INTEGER DEFAULT 5,
  contacted BOOLEAN DEFAULT FALSE,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_premium_downloads_content_id ON premium_downloads(content_id);
CREATE INDEX IF NOT EXISTS idx_premium_downloads_email ON premium_downloads(email);
CREATE INDEX IF NOT EXISTS idx_premium_downloads_industry ON premium_downloads(industry);
CREATE INDEX IF NOT EXISTS idx_premium_downloads_role ON premium_downloads(role);
CREATE INDEX IF NOT EXISTS idx_premium_downloads_downloaded_at ON premium_downloads(downloaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_downloads_lead_score ON premium_downloads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_premium_downloads_contacted ON premium_downloads(contacted) WHERE contacted = FALSE;

-- Add comments for documentation
COMMENT ON TABLE premium_downloads IS 'Tracks premium content downloads and lead generation';
COMMENT ON COLUMN premium_downloads.content_id IS 'ID of the premium content downloaded';
COMMENT ON COLUMN premium_downloads.content_title IS 'Title of the content (denormalized for easy viewing)';
COMMENT ON COLUMN premium_downloads.lead_score IS 'Lead quality score (1-10), higher = more likely to convert';
COMMENT ON COLUMN premium_downloads.contacted IS 'Whether sales team has followed up with this lead';

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_premium_downloads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER premium_downloads_updated_at
  BEFORE UPDATE ON premium_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_premium_downloads_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE premium_downloads ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow admins to view all downloads
CREATE POLICY "Allow admins to view all downloads"
  ON premium_downloads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow service role to insert downloads (for API)
CREATE POLICY "Allow service role to insert downloads"
  ON premium_downloads
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow admins to update downloads (for marking as contacted)
CREATE POLICY "Allow admins to update downloads"
  ON premium_downloads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (true);

-- Create a view for download statistics
CREATE OR REPLACE VIEW premium_download_stats AS
SELECT
  content_id,
  content_title,
  COUNT(*) as total_downloads,
  COUNT(DISTINCT email) as unique_downloads,
  AVG(lead_score) as avg_lead_score,
  COUNT(*) FILTER (WHERE newsletter = TRUE) as newsletter_signups,
  COUNT(*) FILTER (WHERE contacted = FALSE) as pending_followups,
  MAX(downloaded_at) as last_download_at
FROM premium_downloads
GROUP BY content_id, content_title
ORDER BY total_downloads DESC;

COMMENT ON VIEW premium_download_stats IS 'Aggregated statistics for premium content downloads';

-- Create a function to calculate lead score automatically
CREATE OR REPLACE FUNCTION calculate_lead_score()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 5; -- Base score
BEGIN
  -- Higher score for providing phone number
  IF NEW.phone IS NOT NULL THEN
    score := score + 1;
  END IF;

  -- Higher score for providing company name
  IF NEW.company IS NOT NULL THEN
    score := score + 1;
  END IF;

  -- Higher score for newsletter opt-in
  IF NEW.newsletter = TRUE THEN
    score := score + 1;
  END IF;

  -- Industry scoring (higher for target industries)
  IF NEW.industry IN ('food', 'cosmetics', 'medical') THEN
    score := score + 1;
  END IF;

  -- Role scoring (higher for decision makers)
  IF NEW.role IN ('president', 'manager') THEN
    score := score + 1;
  END IF;

  -- Cap score at 10
  IF score > 10 THEN
    score := 10;
  END IF;

  NEW.lead_score = score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate lead score on insert
CREATE TRIGGER calculate_premium_lead_score
  BEFORE INSERT ON premium_downloads
  FOR EACH ROW
  EXECUTE FUNCTION calculate_lead_score();

-- Create a helper function to get high-priority leads (score >= 8)
CREATE OR REPLACE FUNCTION get_high_priority_leads(min_score INTEGER DEFAULT 8)
RETURNS TABLE (
  id UUID,
  content_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  industry TEXT,
  role TEXT,
  lead_score INTEGER,
  downloaded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pd.id,
    pd.content_id,
    pd.name,
    pd.email,
    pd.phone,
    pd.company,
    pd.industry,
    pd.role,
    pd.lead_score,
    pd.downloaded_at
  FROM premium_downloads pd
  WHERE pd.lead_score >= min_score
    AND pd.contacted = FALSE
    AND pd.downloaded_at > NOW() - INTERVAL '30 days'
  ORDER BY pd.lead_score DESC, pd.downloaded_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_high_priority_leads IS 'Returns high-quality leads that should be followed up soon';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON premium_downloads TO service_role;
GRANT SELECT ON premium_downloads TO authenticated;
GRANT UPDATE ON premium_downloads TO authenticated;
GRANT SELECT ON premium_download_stats TO authenticated;
