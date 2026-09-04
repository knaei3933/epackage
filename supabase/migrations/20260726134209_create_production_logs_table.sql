-- production_sub_status enum（9値・database.ts L859 と完全一致）
CREATE TYPE public.production_sub_status AS ENUM (
  'design_received',
  'work_order_created',
  'material_prepared',
  'printing',
  'lamination',
  'slitting',
  'pouch_making',
  'qc_passed',
  'packaged'
);

-- production_logs テーブル（database.ts L854-870 Row 型に準拠）
-- FK は order_id→orders と assigned_to→profiles のみ。
-- work_order_id は nullable uuid カラムのみ（FK なし・work_orders テーブルが実DB に不存在のため）
CREATE TABLE public.production_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  work_order_id uuid,
  sub_status public.production_sub_status NOT NULL,
  progress_percentage integer NOT NULL DEFAULT 0,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  photo_url text,
  notes text,
  measurements jsonb,
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT production_logs_progress_percentage_check CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

COMMENT ON TABLE public.production_logs IS 'Production progress logs - 生産進捗ログ（9ステージ）';
COMMENT ON COLUMN public.production_logs.order_id IS 'FK to orders';
COMMENT ON COLUMN public.production_logs.work_order_id IS 'FK to work_orders (not enforced - work_orders table does not exist yet in production)';
COMMENT ON COLUMN public.production_logs.sub_status IS '9-stage production sub-status (design_received..packaged)';
COMMENT ON COLUMN public.production_logs.progress_percentage IS '進捗率 0-100';
COMMENT ON COLUMN public.production_logs.assigned_to IS 'FK to profiles - 担当者 (user_id・nullable)';
COMMENT ON COLUMN public.production_logs.measurements IS '測定値・検査データ (jsonb・nullable)';

-- 検索性能向上のためのインデックス
CREATE INDEX idx_production_logs_order_id ON public.production_logs(order_id);
CREATE INDEX idx_production_logs_logged_at ON public.production_logs(logged_at DESC);;
