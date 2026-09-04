-- designer_upload_tokens RLS 有効化（最小適用・冪等）
-- 全アクセス経路が service_role（RLS 回避）のため機能影響ゼロ。
-- PostgreSQL の CREATE POLICY には IF NOT EXISTS がないため DROP IF EXISTS + CREATE で冪等化。

-- 1. RLS 有効化（既に有効なら no-op）
ALTER TABLE designer_upload_tokens ENABLE ROW LEVEL SECURITY;

-- 2. ポリシー再作成（既存があれば削除してから作成）
DROP POLICY IF EXISTS "Only admins can view upload tokens" ON designer_upload_tokens;
CREATE POLICY "Only admins can view upload tokens"
  ON designer_upload_tokens FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Only admins can create upload tokens" ON designer_upload_tokens;
CREATE POLICY "Only admins can create upload tokens"
  ON designer_upload_tokens FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Only admins can update upload tokens" ON designer_upload_tokens;
CREATE POLICY "Only admins can update upload tokens"
  ON designer_upload_tokens FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

DROP POLICY IF EXISTS "Only admins can delete upload tokens" ON designer_upload_tokens;
CREATE POLICY "Only admins can delete upload tokens"
  ON designer_upload_tokens FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));;
