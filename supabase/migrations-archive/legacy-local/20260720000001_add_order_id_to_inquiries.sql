-- =====================================================
-- 注文ページからのお問い合わせチャット連携（order-inquiry-link）
-- Order inquiry link — Phase 1 Step 1
-- =====================================================
-- 新設:
--   1. inquiries.order_id 列（UUID・nullable・FK -> orders.id ON DELETE SET NULL）
--   2. 部分UNIQUE索引（1注文=1スレッド強制・NULL は許容で一般 inquiry と共存）
--   3. 部分索引（注文経由のスレッド検索用）
--   4. inquiries SELECT ポリシー拡張（order_id 経由で order.user_id を検証・AC-ROB-1）
--   5. inquiries INSERT ポリシー拡張（order_id 設定時は自分の注文であることを検証）
--
-- 設計原則（consensus 計画準拠）:
--   - アプリ層認可 = 第一防御線（POST で orders.user_id = auth.uid() を検証・AC-API-3）
--   - RLS = 第二防御線（万が一の直アクセス対策・AC-ROB-1）
--   - 1注文=1スレッドをデータ制約で強制（UNIQUE 部分索引）
--   - 注文削除時は ON DELETE SET NULL でチャットは会員履歴に残存
-- =====================================================

-- =====================================================
-- 1. order_id 列追加
-- =====================================================

ALTER TABLE inquiries
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- =====================================================
-- 2. 部分UNIQUE索引（1注文=1スレッド強制）
-- =====================================================
-- NULL は許容（一般 inquiry は order_id が NULL・複数存在可能）
-- order_id IS NOT NULL の行のみ UNIQUE 制約を適用

CREATE UNIQUE INDEX IF NOT EXISTS inquiries_order_id_unique
  ON inquiries(order_id)
  WHERE order_id IS NOT NULL;

-- =====================================================
-- 3. 部分索引（注文経由スレッド検索用）
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_inquiries_order_id
  ON inquiries(order_id)
  WHERE order_id IS NOT NULL;

-- =====================================================
-- 4. inquiries SELECT ポリシー拡張（AC-ROB-1）
-- =====================================================
-- 既存 "Users can view own inquiries"（user_id = auth.uid()）に
-- order_id 経由の検証を OR 結合（user_id が欠落した注文 inquiry の二重防御）

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

-- =====================================================
-- 5. inquiries INSERT ポリシー拡張
-- =====================================================
-- user_id = auth.uid() に加え・order_id 設定時は自分の注文であることを検証
-- （他人の注文へのスレッド作成を RLS レベルでも拒否・AC-API-3 第二防御線）

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
  );

-- =====================================================
-- 検証用
-- =====================================================

SELECT 'order_id column added to inquiries' AS status;
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'inquiries' AND column_name = 'order_id';
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'inquiries' AND indexname LIKE '%order_id%';
