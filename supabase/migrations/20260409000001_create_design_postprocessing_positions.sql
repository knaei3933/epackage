-- =====================================================
-- Migration: Create design_postprocessing_positions table
-- Description: 後加工位置情報管理システム - 韓国人デザイナーが入力した後加工位置を保存
-- Created: 2026-04-09
-- =====================================================

-- Create design_postprocessing_positions table
CREATE TABLE IF NOT EXISTS design_postprocessing_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to design revision
  revision_id UUID NOT NULL REFERENCES design_revisions(id) ON DELETE CASCADE,

  -- SKU information
  sku_name TEXT NOT NULL,

  -- 後加工位置情報 (Post-processing position information)
  -- ノッチ位置 (Notch position)
  notch_top TEXT,              -- 上からのノッチ位置 (e.g., "上から20mm")
  notch_bottom TEXT,           -- 下からのノッチ位置 (e.g., "下から15mm")

  -- 吊り下げ加工 (Hang hole processing)
  hang_hole_diameter TEXT,     -- 吊り下げ穴径 (e.g., "6mm", "8mm")
  hang_hole_position TEXT,     -- 吊り下げ位置 (e.g., "上から15mm")

  -- チャック位置 (Zipper/Check position)
  zipper_position TEXT,        -- チャック位置 (e.g., "上から30mm")

  -- 印刷位置 (Print position)
  print_position TEXT,         -- 印刷位置情報

  -- その他後加工 (Other special processing)
  special_processing TEXT,     -- 特殊加工に関するメモ

  -- 入力者情報 (Inputter information)
  input_by_type TEXT CHECK (input_by_type IN ('ADMIN', 'KOREA_DESIGNER')) DEFAULT 'KOREA_DESIGNER',
  input_by_name TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_revision_sku UNIQUE(revision_id, sku_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_design_postprocessing_positions_revision_id ON design_postprocessing_positions(revision_id);
CREATE INDEX IF NOT EXISTS idx_design_postprocessing_positions_sku_name ON design_postprocessing_positions(sku_name);
CREATE INDEX IF NOT EXISTS idx_design_postprocessing_positions_created_at ON design_postprocessing_positions(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE design_postprocessing_positions IS '後加工位置情報 - 韓国人デザイナーが入力した各SKUの後加工位置を管理';
COMMENT ON COLUMN design_postprocessing_positions.revision_id IS '関連するデザインリビジョンID';
COMMENT ON COLUMN design_postprocessing_positions.sku_name IS 'SKU名（スナップショット）';
COMMENT ON COLUMN design_postprocessing_positions.notch_top IS 'ノッチ位置（上から）。例: "上から20mm"';
COMMENT ON COLUMN design_postprocessing_positions.notch_bottom IS 'ノッチ位置（下から）。例: "下から15mm"';
COMMENT ON COLUMN design_postprocessing_positions.hang_hole_diameter IS '吊り下げ穴径。例: "6mm", "8mm"';
COMMENT ON COLUMN design_postprocessing_positions.hang_hole_position IS '吊り下げ位置。例: "上から15mm"';
COMMENT ON COLUMN design_postprocessing_positions.zipper_position IS 'チャック位置。例: "上から30mm"';
COMMENT ON COLUMN design_postprocessing_positions.print_position IS '印刷位置情報';
COMMENT ON COLUMN design_postprocessing_positions.special_processing IS '特殊加工に関するメモ';
COMMENT ON COLUMN design_postprocessing_positions.input_by_type IS '入力者タイプ: adminまたはkorea_designer';
COMMENT ON COLUMN design_postprocessing_positions.input_by_name IS '入力者名';

-- Enable Row Level Security
ALTER TABLE design_postprocessing_positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all postprocessing positions"
  ON design_postprocessing_positions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Korean designers can insert/update postprocessing positions"
  ON design_postprocessing_positions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'KOREA_DESIGNER')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('ADMIN', 'KOREA_DESIGNER')
    )
  );

CREATE POLICY "Users can view postprocessing positions for own orders"
  ON design_postprocessing_positions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM design_revisions dr
      JOIN orders o ON o.id = dr.order_id
      WHERE dr.id = design_postprocessing_positions.revision_id
      AND o.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_design_postprocessing_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER design_postprocessing_positions_updated_at
  BEFORE UPDATE ON design_postprocessing_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_design_postprocessing_positions_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON design_postprocessing_positions TO authenticated;
