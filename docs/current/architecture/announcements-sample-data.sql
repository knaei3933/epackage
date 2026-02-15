-- =====================================================
-- Announcements Table Sample Data
-- =====================================================
-- This script adds sample announcements for the homepage
--
-- Table: announcements
-- Purpose: System announcements for users
-- Schema: See database-schema-v2.md lines 402-419
-- =====================================================

-- Note: The announcements table already exists in the database schema
-- This script only adds sample data for testing and demonstration

-- Clear existing sample data (optional - comment out if you want to keep existing data)
-- DELETE FROM announcements WHERE title LIKE '%サンプル%' OR title LIKE '%Sample%';

-- Insert sample announcements
INSERT INTO announcements (title, content, category, priority, is_published, published_at, created_at, updated_at) VALUES
  -- High priority announcement
  (
    '新年キャンペーン2026開催中',
    '2026年1月31日までにご注文のお客様限定で、初回お見積もりから10%OFFの特別価格をご提供いたします。この機会にぜひご利用ください。',
    'promotion',
    'high',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),

  -- Medium priority update
  (
    '製品カタログ2026年版を公開',
    '最新の製品ラインナップを含む2026年版カタログを公開しました。新製品の追加や仕様変更に関する情報も含まれています。',
    'update',
    'medium',
    true,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),

  -- Low priority notice
  (
    '年末年始の営業時間について',
    '12月29日から1月3日までの期間、年末年始休業となります。1月4日より通常営業を再開いたします。',
    'notice',
    'low',
    true,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  ),

  -- Maintenance announcement (example - set published_at to future if needed)
  (
    'システムメンテナンスのお知らせ',
    '2026年1月15日(水) 2:00〜4:00の間、サーバーメンテナンスを実施いたします。この時間帯はサービスが一時的に利用できません。',
    'maintenance',
    'medium',
    true,
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
  ),

  -- Another promotion
  (
    '新規会員登録キャンペーン',
    '今、新規会員登録をしていただいた方全員に、初回注文のお試しサンプル無料キャンペーンを実施中です。',
    'promotion',
    'medium',
    true,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  ),

  -- Product update
  (
    '一部製品の仕様変更について',
    'スタンドアップパウチの一部製品において、耐熱性能を向上いたしました。詳細は製品ページをご確認ください。',
    'update',
    'low',
    true,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '14 days'
  ),

  -- Important notice
  (
    '原材料価格の変更に伴う価格改定について',
    '原油価格や原材料価格の高騰により、誠に恐縮ながら一部製品の価格を改定させていただくことになりました。',
    'notice',
    'high',
    true,
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '20 days'
  ),

  -- Future announcement (scheduled)
  (
    '春の新製品発表会開催決定',
    '2026年3月に新製品発表会を開催いたします。詳細は追ってお知らせいたします。',
    'update',
    'medium',
    false,
    '2026-02-15 09:00:00+00',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Verify inserted data
SELECT
  id,
  title,
  category,
  priority,
  is_published,
  published_at,
  created_at
FROM announcements
ORDER BY published_at DESC NULLS LAST, created_at DESC;

-- =====================================================
-- Usage Notes:
-- =====================================================
--
-- To publish a scheduled announcement:
-- UPDATE announcements SET is_published = true, published_at = NOW() WHERE id = '...';
--
-- To create a new announcement:
-- INSERT INTO announcements (title, content, category, priority, is_published, published_at)
-- VALUES ('Your Title', 'Your Content', 'notice', 'medium', true, NOW());
--
-- To unpublish an announcement:
-- UPDATE announcements SET is_published = false WHERE id = '...';
--
-- To delete old announcements:
-- DELETE FROM announcements WHERE published_at < NOW() - INTERVAL '1 year';
--
-- Categories: 'maintenance', 'update', 'notice', 'promotion'
-- Priorities: 'low', 'medium', 'high'
--
-- =====================================================
