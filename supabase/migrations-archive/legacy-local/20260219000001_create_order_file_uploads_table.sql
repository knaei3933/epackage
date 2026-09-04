-- ============================================================
-- Order File Uploads Table
-- 注文ファイルアップロード記録テーブル
-- Migration: 20260219000001_create_order_file_uploads_table
-- ============================================================

-- 注文ファイルアップロード記録テーブル
CREATE TABLE IF NOT EXISTS order_file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 外部キー
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,

  -- ファイル情報
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'upload' (入稿データ) or 'correction' (校正データ)

  -- Google Drive情報
  drive_file_id TEXT NOT NULL,
  drive_view_link TEXT,
  drive_content_link TEXT,

  -- タイムスタンプ
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_order_file_uploads_order_id ON order_file_uploads(order_id);
CREATE INDEX IF NOT EXISTS idx_order_file_uploads_file_type ON order_file_uploads(file_type);
CREATE INDEX IF NOT EXISTS idx_order_file_uploads_uploaded_at ON order_file_uploads(uploaded_at DESC);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE order_file_uploads ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の注文のファイル記録を閲覧可能
CREATE POLICY "Users can view own order file uploads"
  ON order_file_uploads FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- 管理者はすべてのファイル記録を閲覧可能
CREATE POLICY "Admins can view all file uploads"
  ON order_file_uploads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- システムと管理者のみ挿入可能
CREATE POLICY "System and admins can insert file uploads"
  ON order_file_uploads FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================
-- Google Tokens Table
-- ============================================================

CREATE TABLE IF NOT EXISTS user_google_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ユーザーID
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Google OAuthトークン
  refresh_token TEXT NOT NULL,

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_google_tokens_user_id ON user_google_tokens(user_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のトークンのみ閲覧可能
CREATE POLICY "Users can view own google tokens"
  ON user_google_tokens FOR SELECT
  USING (user_id = auth.uid());

-- 管理者はすべてのトークンを閲覧可能
CREATE POLICY "Admins can view all google tokens"
  ON user_google_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_user_google_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_google_tokens_updated_at
  BEFORE UPDATE ON user_google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_user_google_tokens_updated_at();

-- ============================================================
-- Grant permissions
-- ============================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON order_file_uploads TO authenticated, anon;
GRANT SELECT ON user_google_tokens TO authenticated, anon;
