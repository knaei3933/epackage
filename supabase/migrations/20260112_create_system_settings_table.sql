-- ============================================
-- System Settings Table
-- ============================================
-- Purpose: Store system-wide configuration values for pricing, costs, and settings
-- Features: Category-based organization, JSONB values for flexibility, audit trail

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  value_type TEXT NOT NULL DEFAULT 'number',
  description TEXT,
  unit TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Add indexes for common queries
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_is_active ON system_settings(is_active);
CREATE INDEX idx_system_settings_category_key ON system_settings(category, key);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can manage settings
CREATE POLICY "Admins can view all settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete settings"
  ON system_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant access to service role for API operations
GRANT ALL ON system_settings TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
