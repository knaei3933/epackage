-- =====================================================
-- Migration: Create customer_contacts table
-- Description: 顧客コンタクト履歴（email/call/note）保存テーブル
-- Created: 2026-07-30
-- 背景: admin 顧客管理機能のコンタクト履歴タブが実DBテーブル未存在で空扱い
--       になっていた（contact-history/route.ts GET は graceful 空配列・POST は501）。
--       本テーブル作成で API が正常動作する。
-- =====================================================

-- =====================================================
-- Part 1: customer_contacts テーブル作成
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'call', 'note')),
  subject TEXT,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス: 顧客別履歴取得（customer_id）+ 新着順（created_at DESC）
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer_id ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_created_at ON customer_contacts(created_at DESC);

COMMENT ON TABLE customer_contacts IS '顧客コンタクト履歴（メール/電話/メモ）。admin 顧客管理で記録・参照。';
COMMENT ON COLUMN customer_contacts.type IS 'コンタクト種別: email(メール) / call(電話) / note(メモ)';
COMMENT ON COLUMN customer_contacts.created_by IS '記録者名（API は createdBy → created_by へ挿入・既定 System）';

-- =====================================================
-- Part 2: RLS 有効化 + 管理系ロールポリシー
-- contact-history/route.ts は service client（RLS bypass）で動作するため、
-- RLS は API 動作に影響しない。cookie client / 直接クエリ対策として、
-- ADMIN/OPERATOR/SALES のみフルアクセスを許可（MEMBER/KOREA_DESIGNER は不可）。
-- =====================================================
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin staff can manage customer contacts" ON customer_contacts;
CREATE POLICY "Admin staff can manage customer contacts"
  ON customer_contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('ADMIN', 'OPERATOR', 'SALES')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('ADMIN', 'OPERATOR', 'SALES')
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON customer_contacts TO authenticated;
