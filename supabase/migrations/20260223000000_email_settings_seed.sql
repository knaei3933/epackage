-- =====================================================
-- Email Settings Seed Migration
--
-- 包括的メール設定システムの初期データ
-- - SMTP設定
-- - メール機能トグル
-- - 会社情報
-- - 銀行口座情報
-- - 通知受信者設定
-- =====================================================

-- Insert SMTP configuration
INSERT INTO notification_settings (key, value, description, created_at, updated_at)
VALUES (
  'smtp_config',
  '{
    "host": "sv12515.xserver.jp",
    "port": 587,
    "user": "info@package-lab.com",
    "from_email": "noreply@package-lab.com",
    "reply_to": "support@package-lab.com",
    "admin_email": "admin@package-lab.com"
  }'::jsonb,
  'SMTP設定（メールサーバー接続情報）',
  NOW(),
  NOW()
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert email toggles
INSERT INTO notification_settings (key, value, description, created_at, updated_at)
VALUES (
  'email_toggles',
  '{
    "order_confirmation": true,
    "shipping_notification": true,
    "quote_approval": true,
    "production_status": true,
    "admin_notifications": true,
    "designer_notifications": true,
    "data_upload_reminders": true,
    "approval_reminders": true
  }'::jsonb,
  'メール機能トグル設定',
  NOW(),
  NOW()
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert company info
INSERT INTO notification_settings (key, value, description, created_at, updated_at)
VALUES (
  'email_company_info',
  '{
    "company_name_ja": "イーパックラボ",
    "company_name_en": "EPackage Lab",
    "support_email": "support@epackage-lab.com",
    "support_phone": "XX-XXXX-XXXX",
    "postal_code": "000-0000",
    "address": "東京都〇〇区〇〇1-2-3"
  }'::jsonb,
  '会社情報（メール署名用）',
  NOW(),
  NOW()
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert bank account info
INSERT INTO notification_settings (key, value, description, created_at, updated_at)
VALUES (
  'bank_account_info',
  '{
    "bank_name": "PayPay銀行",
    "branch_name": "ビジネス営業部支店(005)",
    "account_type": "普通",
    "account_number": "5630235",
    "account_holder": "カネイボウエキ（カ"
  }'::jsonb,
  '銀行口座情報（請求書用）',
  NOW(),
  NOW()
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert admin notification emails
INSERT INTO notification_settings (key, value, description, created_at, updated_at)
VALUES (
  'admin_notification_emails',
  '["admin@package-lab.com"]'::jsonb,
  '管理者通知メールアドレス',
  NOW(),
  NOW()
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert sales team notification emails
INSERT INTO notification_settings (key, value, description, created_at, updated_at)
VALUES (
  'sales_notification_emails',
  '["sales@package-lab.com"]'::jsonb,
  '営業チーム通知メールアドレス',
  NOW(),
  NOW()
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert production team notification emails
INSERT INTO notification_settings (key, value, description, created_at, updated_at)
VALUES (
  'production_notification_emails',
  '["production@package-lab.com"]'::jsonb,
  '生産チーム通知メールアドレス',
  NOW(),
  NOW()
) ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- Verification
-- =====================================================

-- Log the migration completion
DO $$
BEGIN
  RAISE NOTICE 'Email settings seed migration completed successfully';
  RAISE NOTICE 'Inserted/Updated 7 email configuration entries';
END $$;
