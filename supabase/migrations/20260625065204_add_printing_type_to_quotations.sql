-- Phase 4b: printing_type カラム追加（グラビア見積もり永続化）
-- 仕様: .omc/plans/gravure-integration-consensus.md Phase 4b / AC-22
-- 契約: src/lib/types/gravure-cost-breakdown.ts (GravureCostBreakdown)
--
-- 後方互換性: DEFAULT 'digital' で既存440行（quotations）は安全に更新される。
-- グラビア見積もり保存時のみ 'gravure' を設定。

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
COMMENT ON COLUMN public.sku_quotes.printing_type IS '印刷方式: digital(既定) / gravure。Phase 4b';;
