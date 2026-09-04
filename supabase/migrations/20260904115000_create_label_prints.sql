-- Migration: ラベル印刷ジョブ追跡テーブル (sample-label-printer-automation)
-- PRD: .omx/plans/prd-sample-label-printer-automation.md D3
-- Agent (office PC, service_role) creates/claims/updates print jobs.
-- Admin reprint requests go through service-role API with RBAC enforcement.

CREATE TABLE IF NOT EXISTS label_prints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL
    REFERENCES sample_request_destinations(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('batch', 'reprint')),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'printing', 'printed', 'failed')),
  requested_by uuid REFERENCES auth.users(id),
  attempts int NOT NULL DEFAULT 0,
  started_at timestamptz,
  printed_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_label_prints_status_created
  ON label_prints(status, created_at);
CREATE INDEX IF NOT EXISTS idx_label_prints_destination_id
  ON label_prints(destination_id);

-- [Architect] 同一宛先の pending 重複防止（バッチ vs 再印字の競合遮断）
CREATE UNIQUE INDEX IF NOT EXISTS uq_label_prints_pending_destination
  ON label_prints(destination_id) WHERE status = 'pending';

ALTER TABLE label_prints ENABLE ROW LEVEL SECURITY;

-- service_role フルアクセス（エージェント/管理API用）
DROP POLICY IF EXISTS "Service role full access label_prints"
  ON label_prints;
CREATE POLICY "Service role full access label_prints"
  ON label_prints
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ユーザーは自分の sample_request 経由でのみ SELECT 可能
DROP POLICY IF EXISTS "Users can view own label prints"
  ON label_prints;
CREATE POLICY "Users can view own label prints"
  ON label_prints
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM sample_request_destinations d
      JOIN sample_requests sr ON sr.id = d.sample_request_id
      WHERE d.id = label_prints.destination_id
        AND sr.user_id = auth.uid()
    )
  );
