-- Initial designer emails seed data
-- Insert default empty array for korea_designer_emails

INSERT INTO notification_settings (key, value, description, created_at, updated_at)
VALUES (
  'korea_designer_emails',
  '[]'::jsonb,
  '韓国デザイナーのメールアドレスリスト',
  NOW(),
  NOW()
)
ON CONFLICT (key) DO NOTHING;
