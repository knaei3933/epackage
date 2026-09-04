-- order_agreements: 見積→注文変換時の同意証憠（電子消費者契約法・電子署名法2条 準拠）
CREATE TABLE IF NOT EXISTS order_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  agreed_terms jsonb NOT NULL,
  ip_address text,
  user_agent text,
  terms_version text NOT NULL DEFAULT 'v1',
  agreed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_agreements_order_id ON order_agreements(order_id);
CREATE INDEX IF NOT EXISTS idx_order_agreements_user_id ON order_agreements(user_id);

ALTER TABLE order_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_agreements_owner_select" ON order_agreements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "order_agreements_owner_insert" ON order_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);;
