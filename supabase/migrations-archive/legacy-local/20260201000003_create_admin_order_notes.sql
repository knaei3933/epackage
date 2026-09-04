-- Create admin_order_notes table for storing admin notes for orders
-- This table stores administrative notes and communication logs

CREATE TABLE IF NOT EXISTS admin_order_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  sent_to_korea_at TIMESTAMPTZ,
  korea_email_address TEXT DEFAULT 'info@kanei-trade.co.jp',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_order_notes_order_id ON admin_order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_order_notes_admin_id ON admin_order_notes(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_order_notes_created_at ON admin_order_notes(created_at DESC);

-- Enable RLS
ALTER TABLE admin_order_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can do everything
CREATE POLICY "Admins can manage order notes" ON admin_order_notes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Insert trigger for updated_at
CREATE OR REPLACE FUNCTION update_admin_order_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_order_notes_updated_at
  BEFORE UPDATE ON admin_order_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_order_notes_updated_at();

-- Verify
SELECT table_name FROM information_schema.tables
WHERE table_name = 'admin_order_notes' AND table_schema = 'public';
