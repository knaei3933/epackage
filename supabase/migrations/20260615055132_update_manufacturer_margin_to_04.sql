-- S1.2: 製造者マージン 0.3 → 0.4 (ガイド 06:115 準拠)
-- ガイド docs/reports/calcultae/06-마진_및_최종가격.md:115「製造者マージン 40%」
-- 修正前 0.3 は法的/ビジネスリスク（Pre-mortem P1）。PRICING_CONSTANTS.MANUFACTURER_MARGIN=0.4 と一致。
-- value カラムは jsonb のため to_jsonb でキャスト。
UPDATE system_settings
SET value = to_jsonb(0.4),
    value_type = 'number',
    updated_at = now()
WHERE category = 'pricing' AND key = 'manufacturer_margin';;
