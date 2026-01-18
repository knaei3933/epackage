-- =====================================================
-- Migration: Production Notes Table
-- Purpose: Create production_notes table for tracking production stage notes
-- Created: 2026-01-13
-- =====================================================

-- Production Notes Table
CREATE TABLE IF NOT EXISTS production_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,

  -- Stage information
  stage TEXT NOT NULL CHECK (
    stage IN (
      'DESIGN',
      'PROOFING',
      'PLATE_MAKING',
      'PRINTING',
      'LAMINATION',
      'SLITTING',
      'BAG_MAKING',
      'QC',
      'PACKAGING'
    )
  ),

  -- Note content
  note TEXT NOT NULL,

  -- Metadata
  created_by TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT note_not_empty CHECK (LENGTH(TRIM(note)) > 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_production_notes_work_order_id ON production_notes(work_order_id);
CREATE INDEX IF NOT EXISTS idx_production_notes_stage ON production_notes(stage);
CREATE INDEX IF NOT EXISTS idx_production_notes_created_at ON production_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_production_notes_work_order_stage ON production_notes(work_order_id, stage);

-- Row Level Security
ALTER TABLE production_notes ENABLE ROW LEVEL SECURITY;

-- Admin and operators can manage production notes
CREATE POLICY "Admins and operators can manage production notes"
  ON production_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ADMIN', 'OPERATOR')
    )
  );

-- Grant permissions
GRANT ALL ON production_notes TO authenticated;
GRANT SELECT ON production_notes TO anon;

COMMENT ON TABLE production_notes IS 'Production stage notes for work orders';
COMMENT ON COLUMN production_notes.work_order_id IS 'Reference to work order';
COMMENT ON COLUMN production_notes.stage IS 'Production stage (DESIGN, PROOFING, etc.)';
COMMENT ON COLUMN production_notes.note IS 'Note content for the stage';
COMMENT ON COLUMN production_notes.created_by IS 'User who created the note';
