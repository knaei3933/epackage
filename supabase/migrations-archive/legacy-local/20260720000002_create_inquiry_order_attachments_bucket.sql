-- =====================================================
-- 注文チャット添付バケット（inquiry-order-attachments）
-- Order inquiry link — Phase 1 Step 2
-- =====================================================
-- 新設:
--   1. inquiry-order-attachments Storage バケット（private・100MB・デザインデータ可）
--   2. storage.objects RLS ポリシー 5つ（既存 inquiry-attachments パターンを踏襲）
--
-- 設計（consensus 計画 B3・M5）:
--   - バケットは既存 inquiry-attachments と完全分離（Non-Goals 準拠・一般 inquiry は影響ゼロ）
--   - MIME 定義は correction-files を参考しつつ security-validator の対応型名に統一（M9）:
--       application/illustrator（x-adobe-illustrator ではない）
--   - file_size_limit = 100MB（デザインデータ対応・一般 inquiry の 10MB は維持）
--   - admin INSERT ポリシーは path 制限なし（会員path {user_id}/... も admin path {admin_id}/... も許可）
--     → M5 の「admin 異path INSERT」を兼務（1ポリシーで両方カバー）
--   - path 設計:
--       会員アップロード: {user_id}/{inquiry_id}/{message_id}/{filename}
--       管理者アップロード: {admin_id}/{inquiry_id}/{message_id}/{filename}
--     storage.foldername(name)[1] で会員 path の user_id を検証
-- =====================================================

-- =====================================================
-- 1. inquiry-order-attachments バケット作成（private・100MB）
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-order-attachments',
  'inquiry-order-attachments',
  false,  -- private: signed URL のみアクセス可能
  104857600,  -- 100MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/postscript',
    'image/vnd.adobe.photoshop',
    'application/illustrator'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/postscript',
    'image/vnd.adobe.photoshop',
    'application/illustrator'
  ];

-- =====================================================
-- 2. storage.objects RLS ポリシー（bucket_id 限定 + path-based 認可）
-- =====================================================
-- 既存 inquiry-attachments（migrations/20260719000001_create_inquiry_messages.sql:170-225）と
-- 同パターン。bucket_id のみ 'inquiry-order-attachments' に変更。

-- 会員: 自分の user_id プレフィックスの添付を INSERT
CREATE POLICY "Members can upload own order inquiry attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inquiry-order-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 会員: 自分の user_id プレフィックスの添付を SELECT
CREATE POLICY "Members can view own order inquiry attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'inquiry-order-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 管理者: 当該バケットの添付を全件 SELECT
CREATE POLICY "Admins can view all order inquiry attachments"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'inquiry-order-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- 管理者: 当該バケットの添付を INSERT
-- （管理者からの添付回答用・path 制限なしで会員path も admin path も許可・M5 異path INSERT を兼務）
CREATE POLICY "Admins can upload order inquiry attachments"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'inquiry-order-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- 管理者: 当該バケットの添付を DELETE（不適切ファイル削除用）
CREATE POLICY "Admins can delete order inquiry attachments"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'inquiry-order-attachments'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'ADMIN'
    )
  );

-- =====================================================
-- 検証用
-- =====================================================

SELECT 'inquiry-order-attachments bucket created' AS status;
SELECT id, name, public, file_size_limit, allowed_mime_types
  FROM storage.buckets WHERE id = 'inquiry-order-attachments';
SELECT policyname, cmd FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects'
  AND policyname LIKE '%order inquiry%';
