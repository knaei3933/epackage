-- =====================================================
-- 会員お問い合わせスレッド機能（/member/inquiries 完成）
-- Member inquiry thread feature
-- =====================================================
-- 新設:
--   1. inquiry_messages テーブル（複数往復スレッド + 添付 JSONB）
--   2. inquiry-attachments Storage バケット（private・画像+PDF・10MB）
--   3. inquiry_messages RLS（会員は自分の問い合わせ経由、管理者は全件）
--   4. storage.objects RLS（bucket_id 限定 + path-based user_id 検証）
--   5. updated_at 更新 trigger（メール送信しない・メールは API 層）
--
-- 設計原則（コンセンサス確定）:
--   - アプリ層認可 = 第一防御線（全クエリ user_id = auth.uid() WHERE 強制）
--   - RLS = 第二防御線（万が一の service_role 以外の直アクセス対策）
--   - profiles.role は大文字 'ADMIN' 統一（実測値: ADMIN/MEMBER）
--   - legacy inquiries.response 列には新フローは一切書き込まない
--   - 第1メッセージ本文は inquiries.message（NOT NULL）に保存、
--     同時に inquiry_messages の第1レコードとしてスレッド開始
-- =====================================================

-- =====================================================
-- 1. inquiry_messages テーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS inquiry_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  -- 送信者種別: member = 会員, admin = 管理者
  sender_type TEXT NOT NULL CHECK (sender_type IN ('member', 'admin')),
  -- 送信者プロフィール ID。管理者が削除されてもメッセージは残す（SET NULL）
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  -- 添付ファイル配列。各要素の構造:
  --   { url: string, file_name: string, mime_type: string,
  --     file_size: integer, uploaded_at: ISO-8601, validation_status: 'valid'|'invalid' }
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. インデックス
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry_id
  ON inquiry_messages(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_sender_type
  ON inquiry_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_created_at
  ON inquiry_messages(created_at DESC);
-- スレッド取得の主インデックス（order_comments と同じ複合パターン）
CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry_created
  ON inquiry_messages(inquiry_id, created_at ASC);

-- =====================================================
-- 3. RLS 有効化 + ポリシー
-- =====================================================

ALTER TABLE inquiry_messages ENABLE ROW LEVEL SECURITY;

-- 会員: 自分の問い合わせのメッセージのみ SELECT
CREATE POLICY "Members can view own inquiry messages"
  ON inquiry_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = inquiry_messages.inquiry_id
        AND inquiries.user_id = auth.uid()
    )
  );

-- 管理者: 全件 SELECT
CREATE POLICY "Admins can view all inquiry messages"
  ON inquiry_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- 会員: 自分の問い合わせに追記 INSERT（sender_type='member' 強制）
CREATE POLICY "Members can insert own inquiry messages"
  ON inquiry_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'member'
    AND sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM inquiries
      WHERE inquiries.id = inquiry_messages.inquiry_id
        AND inquiries.user_id = auth.uid()
    )
  );

-- 管理者: 回答 INSERT（sender_type='admin' 強制）
CREATE POLICY "Admins can insert inquiry messages"
  ON inquiry_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'admin'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- ※ UPDATE ポリシーは意図的に作成しない（編集不可・追記のみ）

-- =====================================================
-- 4. updated_at 更新 trigger（メール送信しない）
-- =====================================================

-- メッセージ追加時に親 inquiries.updated_at を更新（一覧の並び替え用）
CREATE OR REPLACE FUNCTION touch_inquiry_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inquiries SET updated_at = NOW() WHERE id = NEW.inquiry_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS touch_inquiry_on_message_trigger ON inquiry_messages;
CREATE TRIGGER touch_inquiry_on_message_trigger
  AFTER INSERT ON inquiry_messages
  FOR EACH ROW
  EXECUTE FUNCTION touch_inquiry_on_message();

-- =====================================================
-- 5. inquiry-attachments Storage バケット（private）
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-attachments',
  'inquiry-attachments',
  false,  -- private: signed URL のみアクセス可能
  10485760,  -- 10MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

-- =====================================================
-- 6. storage.objects RLS（bucket_id 限定 + path-based 認可）
-- =====================================================
-- オブジェクトパス設計:
--   {user_id}/{inquiry_id}/{message_id}/{filename}
-- storage.foldername(name)[1] = user_id を検証
-- ※ service_role は RLS をバイパスするため、アプリ層でも
--    user_id 検証を第一防御線として実施すること

-- 会員: 自分の user_id プレフィックスの添付を INSERT
CREATE POLICY "Members can upload own inquiry attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inquiry-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 会員: 自分の user_id プレフィックスの添付を SELECT
CREATE POLICY "Members can view own inquiry attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'inquiry-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 管理者: 当該バケットの添付を全件 SELECT
CREATE POLICY "Admins can view all inquiry attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'inquiry-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- 管理者: 当該バケットの添付を INSERT（管理者からの添付回答用）
CREATE POLICY "Admins can upload inquiry attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inquiry-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- 管理者: 当該バケットの添付を DELETE（不適切ファイル削除用）
CREATE POLICY "Admins can delete inquiry attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'inquiry-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- =====================================================
-- 7. GRANT
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON inquiry_messages TO authenticated;

-- =====================================================
-- 検証用
-- =====================================================

SELECT 'inquiry_messages table created' AS status;
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'inquiry-attachments';
