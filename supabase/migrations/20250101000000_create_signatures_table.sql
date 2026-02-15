-- =====================================================
-- Electronic Signatures Table Migration
-- =====================================================
-- Supports DocuSign, HelloSign, and Local signatures
-- Japanese business compliance with hanko support
-- =====================================================

-- Main signatures table
CREATE TABLE IF NOT EXISTS signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document reference
  document_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,

  -- Provider information
  provider TEXT NOT NULL CHECK (provider IN ('docusign', 'hellosign', 'local')),
  envelope_id TEXT UNIQUE,

  -- Signature details
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'viewed', 'signed', 'delivered', 'cancelled', 'expired', 'declined'
  )),
  signature_type TEXT CHECK (signature_type IN ('handwritten', 'hanko', 'mixed')),

  -- Signers array
  signers JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Signature data (for local signatures)
  signature_data JSONB,

  -- Message details
  subject TEXT,
  message TEXT,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Cancellation details
  cancel_reason TEXT,

  -- Audit trail
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Signature events log for audit trail
CREATE TABLE IF NOT EXISTS signature_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  envelope_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hanko images storage table (for Japanese seals)
CREATE TABLE IF NOT EXISTS hanko_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  hanko_name TEXT NOT NULL, -- e.g., "代表者印", "角印"
  image_url TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_default BOOLEAN DEFAULT FALSE,

  -- Validation data
  validation_data JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_signatures_document_id ON signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_signatures_order_id ON signatures(order_id);
CREATE INDEX IF NOT EXISTS idx_signatures_contract_id ON signatures(contract_id);
CREATE INDEX IF NOT EXISTS idx_signatures_envelope_id ON signatures(envelope_id);
CREATE INDEX IF NOT EXISTS idx_signatures_status ON signatures(status);
CREATE INDEX IF NOT EXISTS idx_signatures_provider ON signatures(provider);
CREATE INDEX IF NOT EXISTS idx_signatures_created_by ON signatures(created_by);
CREATE INDEX IF NOT EXISTS idx_signatures_created_at ON signatures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signatures_signed_at ON signatures(signed_at DESC);

CREATE INDEX IF NOT EXISTS idx_signature_events_envelope_id ON signature_events(envelope_id);
CREATE INDEX IF NOT EXISTS idx_signature_events_provider ON signature_events(provider);
CREATE INDEX IF NOT EXISTS idx_signature_events_created_at ON signature_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hanko_images_user_id ON hanko_images(user_id);
CREATE INDEX IF NOT EXISTS idx_hanko_images_is_default ON hanko_images(is_default);

-- Row Level Security (RLS) policies
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE signature_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hanko_images ENABLE ROW LEVEL SECURITY;

-- Signatures table policies
-- Users can view signatures for their own orders/contracts
CREATE POLICY "Users can view signatures for their orders"
  ON signatures FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
    OR contract_id IN (
      SELECT id FROM contracts WHERE customer_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

-- Admins can view all signatures
CREATE POLICY "Admins can view all signatures"
  ON signatures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can insert signatures
CREATE POLICY "Admins can insert signatures"
  ON signatures FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Admins can update signatures
CREATE POLICY "Admins can update signatures"
  ON signatures FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Signature events policies (read-only for admins)
CREATE POLICY "Admins can view all signature events"
  ON signature_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Hanko images policies
-- Users can view their own hanko images
CREATE POLICY "Users can view own hanko images"
  ON hanko_images FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own hanko images
CREATE POLICY "Users can insert own hanko images"
  ON hanko_images FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own hanko images
CREATE POLICY "Users can update own hanko images"
  ON hanko_images FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own hanko images
CREATE POLICY "Users can delete own hanko images"
  ON hanko_images FOR DELETE
  USING (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_signatures_updated_at
  BEFORE UPDATE ON signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_signatures_updated_at();

CREATE TRIGGER trigger_hanko_images_updated_at
  BEFORE UPDATE ON hanko_images
  FOR EACH ROW
  EXECUTE FUNCTION update_signatures_updated_at();

-- Add helpful comments
COMMENT ON TABLE signatures IS 'Electronic signature records for contracts and orders';
COMMENT ON TABLE signature_events IS 'Audit trail for signature events';
COMMENT ON TABLE hanko_images IS 'Japanese seal (hanko) images for signatures';

COMMENT ON COLUMN signatures.signature_type IS 'Type of signature: handwritten, hanko (Japanese seal), or mixed';
COMMENT ON COLUMN signatures.envelope_id IS 'External provider envelope ID (DocuSign/HelloSign)';
COMMENT ON COLUMN signatures.signers IS 'Array of signer information with order and status';
COMMENT ON COLUMN hanko_images.hanko_name IS 'Name of the hanko: 代表者印, 角印, etc.';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON signatures TO authenticated;
GRANT ALL ON signature_events TO authenticated;
GRANT ALL ON hanko_images TO authenticated;

-- Create view for signature status summary
CREATE OR REPLACE VIEW signature_status_summary AS
SELECT
  provider,
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN signed_at IS NOT NULL THEN 1 END) as signed_count,
  COUNT(CASE WHEN expires_at < NOW() AND status = 'pending' THEN 1 END) as expired_count
FROM signatures
GROUP BY provider, status;

COMMENT ON VIEW signature_status_summary IS 'Summary statistics for signature statuses by provider';
