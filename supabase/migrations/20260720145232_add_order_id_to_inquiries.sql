-- =====================================================
-- 注文ページからのお問い合わせチャット連携（order-inquiry-link）
-- Order inquiry link — Phase 1 Step 1
-- =====================================================

-- 1. order_id 列追加（FK -> orders.id ON DELETE SET NULL）
ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- 2. 部分UNIQUE索引（1注文=1スレッド強制・NULL 許容）
CREATE UNIQUE INDEX IF NOT EXISTS inquiries_order_id_unique
  ON inquiries(order_id)
  WHERE order_id IS NOT NULL;

-- 3. 部分索引（注文経由スレッド検索用）
CREATE INDEX IF NOT EXISTS idx_inquiries_order_id
  ON inquiries(order_id)
  WHERE order_id IS NOT NULL;

-- 4. inquiries SELECT ポリシー拡張（AC-ROB-1・order_id 経由検証を OR 結合）
DROP POLICY IF EXISTS "Users can view own inquiries" ON inquiries;

CREATE POLICY "Users can view own inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR (
      order_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = inquiries.order_id
          AND orders.user_id = auth.uid()
      )
    )
  );

-- 5. inquiries INSERT ポリシー拡張（order_id 設定時は自分の注文であることを検証）
DROP POLICY IF EXISTS "Users can insert own inquiries" ON inquiries;

CREATE POLICY "Users can insert own inquiries"
  ON inquiries FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      order_id IS NULL
      OR EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = inquiries.order_id
          AND orders.user_id = auth.uid()
      )
    )
  );;
