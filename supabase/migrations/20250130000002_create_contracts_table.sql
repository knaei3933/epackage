-- =====================================================
-- Epackage Lab Contracts Table
--契約書管理 (Contract Management)
-- =====================================================

-- Contract Status Enum
CREATE TYPE contract_status AS ENUM (
  'DRAFT',           -- ドラフト (Draft)
  'SENT',            -- 送付済み (Sent to customer)
  'CUSTOMER_SIGNED', -- 顧客署名済み (Signed by customer)
  'ADMIN_SIGNED',    -- 管理者署名済み (Signed by admin)
  'ACTIVE',          -- 有効 (Active - both parties signed)
  'CANCELLED'        -- キャンセル (Cancelled)
);

-- =====================================================
-- Contracts Table
-- =====================================================

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 契約書番号 (Contract Number - CTR-YYYY-NNNN format)
  contract_number TEXT NOT NULL UNIQUE,

  -- Foreign Keys
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL NOT NULL,

  -- 顧客名 (Customer Name for signature)
  customer_name TEXT NOT NULL,

  -- 契約金額 (Contract Amount in JPY)
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

  -- ステータス (Status)
  status contract_status NOT NULL DEFAULT 'DRAFT',

  -- 電子署名情報 (Electronic Signature Information)
  customer_signed_at TIMESTAMP WITH TIME ZONE,
  admin_signed_at TIMESTAMP WITH TIME ZONE,
  signature_data JSONB,  -- Stores: { customer_signature: {}, admin_signature: {}, timestamps: {}, ip_addresses: {} }

  -- PDF URL (契約書PDF)
  pdf_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT contract_number_format CHECK (
    contract_number ~ '^CTR-\d{4}-\d{4}$'
  ),
  CONSTRAINT total_amount_non_negative CHECK (total_amount >= 0),
  CONSTRAINT valid_signature_flow CHECK (
    -- Customer must sign before admin (or both for new contract)
    (customer_signed_at IS NULL AND admin_signed_at IS NULL) OR
    (customer_signed_at IS NOT NULL AND admin_signed_at IS NULL) OR
    (customer_signed_at IS NOT NULL AND admin_signed_at IS NOT NULL)
  )
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX idx_contracts_contract_number ON contracts(contract_number);
CREATE INDEX idx_contracts_order_id ON contracts(order_id);
CREATE INDEX idx_contracts_work_order_id ON contracts(work_order_id);
CREATE INDEX idx_contracts_company_id ON contracts(company_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);

-- =====================================================
-- Trigger: Update updated_at timestamp
-- =====================================================

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Trigger: Auto-generate contract number
-- =====================================================

CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
  new_number TEXT;
  max_seq INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  -- Get the highest sequence number for this year
  SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 12 FOR 4) AS INTEGER)), 0)
  INTO max_seq
  FROM contracts
  WHERE contract_number LIKE 'CTR-' || year_part || '-%';

  seq_part := LPAD((max_seq + 1)::TEXT, 4, '0');
  new_number := 'CTR-' || year_part || '-' || seq_part;

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contract_generate_number
  BEFORE INSERT ON contracts
  FOR EACH ROW
  WHEN (NEW.contract_number IS NULL OR NEW.contract_number = '')
  EXECUTE FUNCTION generate_contract_number();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Customers can view their own contracts
CREATE POLICY "Customers can view own contracts"
  ON contracts FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins can view all contracts
CREATE POLICY "Admins can view all contracts"
  ON contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can insert contracts
CREATE POLICY "Admins can insert contracts"
  ON contracts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Only admins can update contracts
CREATE POLICY "Admins can update contracts"
  ON contracts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Customers can sign their own contracts
CREATE POLICY "Customers can sign own contracts"
  ON contracts FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    OLD.status = 'SENT' AND
    NEW.status = 'CUSTOMER_SIGNED' AND
    NEW.customer_signed_at = NOW() AND
    NEW.customer_name = (
      SELECT kanji_last_name || ' ' || kanji_first_name
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get contract by order ID
CREATE OR REPLACE FUNCTION get_contract_by_order(order_uuid UUID)
RETURNS contracts AS $$
DECLARE
  contract_record contracts;
BEGIN
  SELECT * INTO contract_record
  FROM contracts
  WHERE order_id = order_uuid;

  RETURN contract_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if contract is fully signed
CREATE OR REPLACE FUNCTION is_contract_fully_signed(contract_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM contracts
    WHERE id = contract_uuid
      AND customer_signed_at IS NOT NULL
      AND admin_signed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON contracts TO authenticated, anon;
GRANT ALL ON contracts TO authenticated;
