-- order_agreements: 見積→注文変換時の同意証憠（電子消費者契約法・電子署名法2条 準拠）
--
-- 注文確定時に取得した 5項目の同意 + フルネーム入力を証憠として保存する。
-- 証憠の不変性を担保するため、UPDATE/DELETE ポリシーは定義せず
-- RLS のデフォルト deny で全員拒否とする。修正/削除は service client（RLS バイパス）のみ可能。
-- 管理者画面からの参照も service client 経由を前提とする（cookie 認証の管理者は直接 SELECT しない設計）。

CREATE TABLE IF NOT EXISTS order_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  agreed_terms jsonb NOT NULL,          -- {itemIds:[5項目], texts:{本体}, version:'v1'}
  ip_address text,
  user_agent text,
  terms_version text NOT NULL DEFAULT 'v1',
  agreed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_agreements_order_id ON order_agreements(order_id);
CREATE INDEX IF NOT EXISTS idx_order_agreements_user_id ON order_agreements(user_id);

ALTER TABLE order_agreements ENABLE ROW LEVEL SECURITY;

-- 本人のみ SELECT（同意記録の参照は本人に限定）
CREATE POLICY "order_agreements_owner_select" ON order_agreements
  FOR SELECT USING (auth.uid() = user_id);

-- 本人のみ INSERT（自分の同意記録のみ作成可能）
CREATE POLICY "order_agreements_owner_insert" ON order_agreements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE/DELETE ポリシーは定義しない（RLS デフォルト deny で全員拒否）。
-- これにより証憠の不変性を担保する。修正/削除は service client（RLS バイパス）のみ。
