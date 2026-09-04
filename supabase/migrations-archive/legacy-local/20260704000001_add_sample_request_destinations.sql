-- ============================================================
-- Migration: C-23 サンプル請求配送先データ DB保存テーブル
-- Phase 3 — メンテ窓で適用（src/app/api/samples/route.ts 修正と同時デプロイ必須）
-- ============================================================
-- 【背景】samples/route.ts は配送先データ（氏名/住所/電話）をメール本文のみで
--         扱い DB 未保存だった（原本 C-23・監査不能）。
-- 【方針】正規化テーブル sample_request_destinations を新設し、
--         sample_requests (1) — (多) sample_request_destinations で保存。
-- 【RLS】 sample_items と同パターン:
--         - service_role: フルアクセス（route は service client で INSERT）
--         - authenticated: 自分の sample_request 経由で SELECT のみ
--         ※ ユーザー INSERT ポリシー不要（service_role が INSERT するため）
-- ============================================================

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
  );
