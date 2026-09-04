-- =====================================================
-- 注文チャット添付バケット（inquiry-order-attachments）
-- Order inquiry link — Phase 1 Step 2
-- =====================================================

-- 1. inquiry-order-attachments バケット作成（private・100MB・デザインデータ可）
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

-- 2. storage.objects RLS ポリシー（bucket_id 限定 + path-based 認可）
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

-- 管理者: 当該バケットの添付を INSERT（path 制限なし・M5 異path INSERT を兼務）
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
  );;
