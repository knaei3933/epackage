-- Notification Settings Table Migration
-- 通知設定テーブル
-- デザイナーメールアドレスなど、各種通知設定を管理

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE notification_settings IS '通知設定を管理するテーブル';
COMMENT ON COLUMN notification_settings.key IS '設定キー（例: korea_designer_emails）';
COMMENT ON COLUMN notification_settings.value IS '設定値（JSONB形式）';
COMMENT ON COLUMN notification_settings.description IS '設定の説明';

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_settings_updated_at();

-- Insert default Korea designer emails
INSERT INTO notification_settings (key, value, description) VALUES
('korea_designer_emails', '[]'::jsonb, '韓国デザイナーのメールアドレスリスト')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can read/write notification settings
CREATE POLICY "Admins can view all notification settings"
  ON notification_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert notification settings"
  ON notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update notification settings"
  ON notification_settings FOR UPDATE
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

-- Service role can bypass RLS for email sending
CREATE POLICY "Service role can read notification settings"
  ON notification_settings FOR SELECT
  TO service_role
  USING (true);
