-- Migration: C-23 サンプル請求配送先データ DB保存テーブル
CREATE TABLE IF NOT EXISTS sample_request_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sample_request_id uuid NOT NULL
    REFERENCES sample_requests(id) ON DELETE CASCADE,
  company_name text,
  contact_person text NOT NULL,
  phone text NOT NULL,
  postal_code text,
  address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sample_request_destinations_request_id
  ON sample_request_destinations(sample_request_id);

ALTER TABLE sample_request_destinations ENABLE ROW LEVEL SECURITY;

-- service_role フルアクセス（route INSERT 用）
DROP POLICY IF EXISTS "Service role full access sample_request_destinations"
  ON sample_request_destinations;
CREATE POLICY "Service role full access sample_request_destinations"
  ON sample_request_destinations
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ユーザーは自分の sample_request 経由で SELECT のみ
DROP POLICY IF EXISTS "Users can view own sample request destinations"
  ON sample_request_destinations;
CREATE POLICY "Users can view own sample request destinations"
  ON sample_request_destinations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sample_requests sr
      WHERE sr.id = sample_request_destinations.sample_request_id
        AND sr.user_id = auth.uid()
    )
  );;
