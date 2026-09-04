
-- Part 1: order_items.sku_name を buildSkuName() と同一形式で再計算（sku_name IS NULL 行のみ）
UPDATE order_items
SET sku_name =
  'SKU' ||
  COALESCE(NULLIF(SUBSTRING(product_name FROM 'SKU\s*(\d+)'), ''), '1') || '_' ||
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
  TO_CHAR(quantity, 'FM999,999,999') || '枚' ||
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

-- Part 2: files.sku_name snapshot へ伝播（NULL 行のみ）
UPDATE files f
SET sku_name = oi.sku_name
FROM order_items oi
WHERE f.order_item_id = oi.id
  AND oi.sku_name IS NOT NULL
  AND f.sku_name IS NULL;

-- Part 3: design_revisions.sku_name snapshot へ伝播（NULL 行のみ）
UPDATE design_revisions dr
SET sku_name = oi.sku_name
FROM order_items oi
WHERE dr.order_item_id = oi.id
  AND oi.sku_name IS NOT NULL
  AND dr.sku_name IS NULL;
;
