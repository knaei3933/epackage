-- =====================================================================
-- Phase 4b: printing_type カラム追加（グラビア見積もり永続化）
-- 仕様: .omc/plans/gravure-integration-consensus.md Phase 4b / AC-22
-- 契約: src/lib/types/gravure-cost-breakdown.ts (GravureCostBreakdown)
-- ドキュメント: .omc/handoffs/gravure-cost-breakdown-contract.md (FROZEN)
--
-- リモート（project_id: ijlgpzjdfipzmjvawofp）と同期。
-- マイグレーション名（リモート）: add_printing_type_to_quotations
--
-- 後方互換性:
--   DEFAULT 'digital' で既存行は安全に更新される。
--   グラビア見積もり保存時のみ 'gravure' を設定。
--   CHECK 制約で 'digital' / 'gravure' のみ許可。
--
-- 識別ロジック（読込パス）:
--   - printing_type='gravure' → グラビア見積もり
--   - 旧データ互換: printing_type='digital' かつ cost_breakdown.gravureFilmValueKRW
--     存在 → グラビア（フォールバック・型ガード isGravureCostBreakdown で判定）
-- =====================================================================

-- quotations ヘッダテーブル
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS printing_type TEXT NOT NULL DEFAULT 'digital'
  CHECK (printing_type IN ('digital', 'gravure'));

-- sku_quotes 明細テーブル
ALTER TABLE public.sku_quotes
  ADD COLUMN IF NOT EXISTS printing_type TEXT NOT NULL DEFAULT 'digital'
  CHECK (printing_type IN ('digital', 'gravure'));

-- コメント（メタデータ）
COMMENT ON COLUMN public.quotations.printing_type IS '印刷方式: digital(既定) / gravure。Phase 4b。cost_breakdown JSONB と組み合わせてグラビア見積もりを識別';
COMMENT ON COLUMN public.sku_quotes.printing_type IS '印刷方式: digital(既定) / gravure。Phase 4b';

-- 既存データの安全確認（DEFAULT 'digital' により全行が 'digital' に設定済み）
-- このマイグレーションはべき等（IF NOT EXISTS）。
