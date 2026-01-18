-- ============================================
-- Seed Sample Coupons
-- ============================================
-- Purpose: Provide initial coupon examples for testing

-- ============================================
-- 5% Welcome Discount Coupon
-- ============================================
INSERT INTO coupons (
  code,
  name,
  name_ja,
  description,
  description_ja,
  type,
  value,
  minimum_order_amount,
  max_uses,
  max_uses_per_customer,
  status
) VALUES (
  'WELCOME5',
  '웰컴 5% 할인',
  '新規5%割引',
  '신규 고객을 위한 5% 할인 쿠폰',
  '新規お客様向け5%割引クーポン',
  'percentage',
  5,
  0,
  NULL,
  1,
  'active'
) ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 10% VIP Coupon (50,000엔 이상)
-- ============================================
INSERT INTO coupons (
  code,
  name,
  name_ja,
  description,
  description_ja,
  type,
  value,
  minimum_order_amount,
  max_uses,
  max_uses_per_customer,
  status
) VALUES (
  'VIP10',
  'VIP 10% 할인',
  'VIP10%割引',
  'VIP 고객을 위한 10% 할인 쿠폰 (50,000엔 이상)',
  'VIPお客様向け10%割引クーポン（50,000円以上）',
  'percentage',
  10,
  50000,
  NULL,
  1,
  'active'
) ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Free Shipping Coupon
-- ============================================
INSERT INTO coupons (
  code,
  name,
  name_ja,
  description,
  description_ja,
  type,
  value,
  minimum_order_amount,
  max_uses,
  max_uses_per_customer,
  status
) VALUES (
  'FREESHIP',
  '무료 배송',
  '送料無料',
  '배송비 무료 쿠폰',
  '送料無料クーポン',
  'free_shipping',
  0,
  0,
  NULL,
  1,
  'active'
) ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Test Coupon (3% discount for testing)
-- ============================================
INSERT INTO coupons (
  code,
  name,
  name_ja,
  description,
  description_ja,
  type,
  value,
  minimum_order_amount,
  max_uses,
  max_uses_per_customer,
  status,
  notes
) VALUES (
  'TEST3',
  '테스트 3% 할인',
  'テスト3%割引',
  '시스템 테스트용 3% 할인 쿠폰',
  'システムテスト用3%割引クーポン',
  'percentage',
  3,
  0,
  NULL,
  10,
  'active',
  'Internal testing coupon - can be used multiple times'
) ON CONFLICT (code) DO NOTHING;
