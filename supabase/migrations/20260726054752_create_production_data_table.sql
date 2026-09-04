-- production_data テーブル新規作成
-- database.ts L1160-1190 の Row 型定義に準拠。
-- ai-extraction/upload・ai-parser/extract 等が .from('production_data') で参照していたが
-- 実DBに未存在（42P01）だったため新規作成。
--
-- 設計方針:
-- - check constraint なし（text 型）: validation_status が 'PENDING'/'valid'/'pending' で
--   コード内で揺れているため、値の揺れを許容する。将来コード安定後に enum 化または CHECK 追加。
-- - confidence_score は double precision（0-1 の抽出信頼度）
-- - FK: order_id→orders(CASCADE) / file_id→files(SET NULL) / validated_by,approved_by→profiles(SET NULL)

CREATE TABLE IF NOT EXISTS public.production_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    data_type text NOT NULL,
    title text NOT NULL,
    description text,
    version text NOT NULL DEFAULT '1.0',
    file_id uuid REFERENCES public.files(id) ON DELETE SET NULL,
    file_url text,
    validation_status text NOT NULL DEFAULT 'pending',
    validated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    validated_at timestamptz,
    validation_notes text,
    validation_errors jsonb,
    approved_for_production boolean NOT NULL DEFAULT false,
    approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at timestamptz,
    submitted_by_customer boolean NOT NULL DEFAULT false,
    customer_contact_info jsonb,
    received_at timestamptz NOT NULL DEFAULT now(),
    extracted_data jsonb,
    confidence_score double precision,
    extraction_metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 有効化（policy は次 migration で設定・files テーブルの既存 policy に準拠）
ALTER TABLE public.production_data ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.production_data IS 'データ入稿 + AI抽出データ（design file の仕様データ・extracted_data/confidence_score/extraction_metadata を保持）';

-- 検索用インデックス（order_id で絞り込むことが多い）
CREATE INDEX IF NOT EXISTS idx_production_data_order_id ON public.production_data(order_id);
CREATE INDEX IF NOT EXISTS idx_production_data_file_id ON public.production_data(file_id);;
