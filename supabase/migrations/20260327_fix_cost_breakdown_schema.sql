-- =====================================================
-- Migration: Fix cost_breakdown schema for margin fields
-- Created: 2025-03-27
-- Purpose: Add manufacturingMargin and salesMargin to cost_breakdown
--          default values and update existing records
-- =====================================================

-- Part 1: quotation_items テーブルのデフォルト値更新
ALTER TABLE quotation_items
ALTER COLUMN cost_breakdown SET DEFAULT '{
  "materialCost": 0,
  "printingCost": 0,
  "laminationCost": 0,
  "slitterCost": 0,
  "surfaceTreatmentCost": 0,
  "pouchProcessingCost": 0,
  "manufacturingMargin": 0,
  "duty": 0,
  "delivery": 0,
  "salesMargin": 0,
  "totalCost": 0
}'::jsonb;

-- Part 2: 既存データの安全な更新（マージンフィールドの追加）
-- jsonb || 演算子を使用して、既存のフィールドを保持しつつ欠けたフィールドのみ追加
UPDATE quotation_items
SET cost_breakdown = cost_breakdown || jsonb_build_object(
  'manufacturingMargin',
    COALESCE(
      (cost_breakdown->>'manufacturingMargin')::int,
      CASE
        WHEN (cost_breakdown->>'materialCost')::int > 0 THEN
          ROUND((cost_breakdown->>'materialCost')::int / 0.4 * 0.4)
        WHEN (cost_breakdown->>'totalCost')::int > 0 THEN
          ROUND((cost_breakdown->>'totalCost')::int / 1.73 * 0.4)
        ELSE 0
      END
    ),
  'salesMargin',
    COALESCE(
      (cost_breakdown->>'salesMargin')::int,
      CASE
        WHEN (cost_breakdown->>'materialCost')::int > 0 THEN
          ROUND((cost_breakdown->>'materialCost')::int / 0.4 * 0.2)
        WHEN (cost_breakdown->>'totalCost')::int > 0 THEN
          ROUND((cost_breakdown->>'totalCost')::int / 1.73 * 0.2)
        ELSE 0
      END
    ),
  'duty',
    COALESCE(
      (cost_breakdown->>'duty')::int,
      CASE
        WHEN (cost_breakdown->>'materialCost')::int > 0 THEN
          ROUND((cost_breakdown->>'materialCost')::int / 0.4 * 0.05)
        WHEN (cost_breakdown->>'totalCost')::int > 0 THEN
          ROUND((cost_breakdown->>'totalCost')::int / 1.73 * 0.05)
        ELSE 0
      END
    ),
  'delivery',
    COALESCE(
      (cost_breakdown->>'delivery')::int,
      CASE
        WHEN (cost_breakdown->>'materialCost')::int > 0 THEN
          ROUND((cost_breakdown->>'materialCost')::int / 0.4 * 0.08)
        WHEN (cost_breakdown->>'totalCost')::int > 0 THEN
          ROUND((cost_breakdown->>'totalCost')::int / 1.73 * 0.08)
        ELSE 0
      END
    )
)
WHERE cost_breakdown IS NOT NULL
  AND (
    cost_breakdown->>'manufacturingMargin' IS NULL
    OR cost_breakdown->>'salesMargin' IS NULL
    OR cost_breakdown->>'duty' IS NULL
    OR cost_breakdown->>'delivery' IS NULL
  );
