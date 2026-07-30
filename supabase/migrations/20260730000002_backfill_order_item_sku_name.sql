-- =====================================================
-- Migration: Backfill order_items.sku_name (既存データ)
-- Description: Phase 4 SKU migration で追加した sku_name 列が、order_items.sku_name を
--   保存する処理不在のため全行 null になっていた問題の backfill。
--   src/lib/sku-name.ts buildSkuName() と同一ロジックで再計算し、
--   order_items → files/design_revisions へ伝播する。
-- Created: 2026-07-30
-- 冪等性: WHERE sku_name IS NULL で未設定行のみ対象（新規アプリ設定値は上書きしない）。
-- =====================================================

-- =====================================================
-- Part 1: order_items.sku_name を再計算（buildSkuName と同一形式）
--   形式: SKU{番号}_{製品名}_{数量toLocaleString}枚{_{width×height[×depth>0][×側面sideWidth]}}
--   ※ 数量の toLocaleString() は Node 既定でカンマ区切り（4500→"4,500"）= to_char 'FM999,999,999'
-- =====================================================
UPDATE order_items
SET sku_name =
  'SKU' ||
  -- SKU番号: product_name の "SKU N" から抽出（無ければ 1）
  COALESCE(NULLIF(SUBSTRING(product_name FROM 'SKU\s*(\d+)'), ''), '1') || '_' ||
  -- 製品名: bagTypeId → 日本語袋タイプ。無ければ product_name 先頭語（'製品' フォールバック）
  COALESCE(
    CASE specifications->>'bagTypeId'
      WHEN 'flat_3_side'   THEN '三方シール平袋'
      WHEN 'three_side_seal' THEN '三方シール平袋'
      WHEN 'stand_up'      THEN 'スタンドパウチ'
      WHEN 'standup_pouch' THEN 'スタンドパウチ'
      WHEN 'gusset_pouch'  THEN 'ガゼットパウチ'
      WHEN 'zipper_pouch'  THEN 'ジッパーパウチ'
      WHEN 'spout_pouch'   THEN 'スパウトパウチ'
      WHEN 'roll_film'     THEN 'ロールフィルム'
      WHEN 'lap_seal'      THEN '合掌袋'
      ELSE NULL
    END,
    NULLIF(BTRIM(SPLIT_PART(COALESCE(NULLIF(product_name, ''), '製品'), ' - ', 1)), '')
  ) || '_' ||
  -- 数量: カンマ区切り + '枚'
  TO_CHAR(quantity, 'FM999,999,999') || '枚' ||
  -- サイズ: width×height（depth>0 なら追加・sideWidth があれば「×側面N」追加）
  CASE
    WHEN specifications->>'width'  IS NOT NULL AND specifications->>'width'  <> ''
     AND specifications->>'height' IS NOT NULL AND specifications->>'height' <> ''
    THEN '_' ||
         (specifications->>'width') || '×' || (specifications->>'height') ||
         CASE
           WHEN (specifications->>'depth') ~ '^\d+(\.\d+)?$' AND (specifications->>'depth')::numeric > 0
           THEN '×' || (specifications->>'depth')
           ELSE ''
         END ||
         CASE
           WHEN specifications->>'sideWidth' IS NOT NULL AND specifications->>'sideWidth' <> ''
           THEN '×側面' || (specifications->>'sideWidth')
           ELSE ''
         END
    ELSE ''
  END
WHERE sku_name IS NULL;

-- =====================================================
-- Part 2: files.sku_name snapshot へ伝播（trigger は新規挿入/更新時のみ発火のため既存行は直接更新）
-- =====================================================
UPDATE files f
SET sku_name = oi.sku_name
FROM order_items oi
WHERE f.order_item_id = oi.id
  AND oi.sku_name IS NOT NULL
  AND f.sku_name IS NULL;

-- =====================================================
-- Part 3: design_revisions.sku_name snapshot へ伝播
-- =====================================================
UPDATE design_revisions dr
SET sku_name = oi.sku_name
FROM order_items oi
WHERE dr.order_item_id = oi.id
  AND oi.sku_name IS NOT NULL
  AND dr.sku_name IS NULL;
