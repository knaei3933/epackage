-- =====================================================
-- Test Data Creation Script for E2E Testing
-- =====================================================
-- This script creates mock data for:
-- - Orders with order items
-- - Quotations with quotation items
-- - Sample requests
-- - Contact submissions (inquiries)
-- =====================================================

-- First, get the test user ID
-- The test user email is: test-member@example.com

-- =====================================================
-- 1. Create Orders
-- =====================================================

-- Order 1: Manufacturing status
INSERT INTO orders (id, user_id, order_number, status, total_amount, notes, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM auth.users WHERE email = 'test-member@example.com' LIMIT 1),
  'ORD-TEST-001',
  'manufacturing',
  150000,
  'テスト注文1',
  NOW() - INTERVAL '7 days'
) ON CONFLICT (order_number) DO NOTHING;

INSERT INTO order_items (order_id, product_name, quantity, unit_price, specifications)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '化粧箱 A4サイズ',
  100,
  1500,
  '{"size": "A4", "material": "紙製"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Order 2: Processing status
INSERT INTO orders (id, user_id, order_number, status, total_amount, notes, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  (SELECT id FROM auth.users WHERE email = 'test-member@example.com' LIMIT 1),
  'ORD-TEST-002',
  'processing',
  280000,
  'テスト注文2',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (order_number) DO NOTHING;

INSERT INTO order_items (order_id, product_name, quantity, unit_price, specifications)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '段ボール箱',
  200,
  1400,
  '{"size": "30x20x10", "material": "段ボール"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Order 3: Delivered status
INSERT INTO orders (id, user_id, order_number, status, total_amount, delivered_at, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  (SELECT id FROM auth.users WHERE email = 'test-member@example.com' LIMIT 1),
  'ORD-TEST-003',
  'delivered',
  95000,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '10 days'
) ON CONFLICT (order_number) DO NOTHING;

INSERT INTO order_items (order_id, product_name, quantity, unit_price, specifications)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  '透明パッケージ',
  50,
  1900,
  '{"size": "カスタム", "material": "PET"}'::jsonb
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. Create Quotations
-- =====================================================

-- Quotation 1: Approved
INSERT INTO quotations (id, user_id, quotation_number, status, total_amount, valid_until, approved_at, created_at)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM auth.users WHERE email = 'test-member@example.com' LIMIT 1),
  'Q-TEST-001',
  'approved',
  150000,
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '5 days'
) ON CONFLICT (quotation_number) DO NOTHING;

INSERT INTO quotation_items (quotation_id, product_name, quantity, unit_price, specifications)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  'スタンドパウチ',
  500,
  300,
  '{"size": "200x300", "material": "CPP"}'::jsonb
) ON CONFLICT DO NOTHING;

-- Quotation 2: Sent status
INSERT INTO quotations (id, user_id, quotation_number, status, total_amount, valid_until, sent_at, created_at)
VALUES (
  '660e8400-e29b-41d4-a716-446655440002',
  (SELECT id FROM auth.users WHERE email = 'test-member@example.com' LIMIT 1),
  'Q-TEST-002',
  'sent',
  280000,
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '2 days'
) ON CONFLICT (quotation_number) DO NOTHING;

INSERT INTO quotation_items (quotation_id, product_name, quantity, unit_price, specifications)
VALUES (
  '660e8400-e29b-41d4-a716-446655440002',
  'チャック付き袋',
  1000,
  280,
  '{"size": "250x350", "material": "PE"}'::jsonb
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. Create Sample Requests
-- =====================================================

INSERT INTO sample_requests (id, user_id, request_number, status, notes, created_at)
VALUES (
  '770e8400-e29b-41d4-a716-446655440001',
  (SELECT id FROM auth.users WHERE email = 'test-member@example.com' LIMIT 1),
  'S-TEST-001',
  'received',
  'ソフトパウチのサンプルを希望',
  NOW() - INTERVAL '3 days'
) ON CONFLICT (request_number) DO NOTHING;

INSERT INTO sample_requests (id, user_id, request_number, status, notes, created_at)
VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  (SELECT id FROM auth.users WHERE email = 'test-member@example.com' LIMIT 1),
  'S-TEST-002',
  'processing',
  'スタンドパウチのサンプルを希望',
  NOW() - INTERVAL '1 day'
) ON CONFLICT (request_number) DO NOTHING;

-- =====================================================
-- 4. Create Contact Submissions (Inquiries)
-- =====================================================

INSERT INTO contact_submissions (id, name, email, phone, company, inquiry_type, message, status, created_at)
VALUES (
  '880e8400-e29b-41d4-a716-446655440001',
  'テストユーザー',
  'test-member@example.com',
  '080-6942-7235',
  'テスト株式会社',
  'quotation',
  '化粧箱の見積もりについてご相談があります',
  'new',
  NOW() - INTERVAL '2 days'
) ON CONFLICT DO NOTHING;

INSERT INTO contact_submissions (id, name, email, phone, company, inquiry_type, message, status, created_at)
VALUES (
  '880e8400-e29b-41d4-a716-446655440002',
  'テストユーザー',
  'test-member@example.com',
  '080-6942-7235',
  'テスト株式会社',
  'product',
  '段ボール箱の耐荷重について教えてください',
  'replied',
  NOW() - INTERVAL '5 days'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- Summary of created data:
-- - 3 orders (with order items)
-- - 2 quotations (with quotation items)
-- - 2 sample requests
-- - 2 contact submissions (inquiries)
-- =====================================================
