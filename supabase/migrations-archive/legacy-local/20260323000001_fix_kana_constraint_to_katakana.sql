-- =====================================================
-- Fix Kana Fields Constraint: Change from Hiragana to Katakana
-- =====================================================
-- The kana_* fields should accept Katakana (フリガナ), not Hiragana
-- Japanese reading typically uses Katakana for pronunciation guides

-- Drop old hiragana constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS kana_last_name_hiragana;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS kana_first_name_hiragana;

-- Add new katakana constraints
ALTER TABLE profiles
  ADD CONSTRAINT kana_last_name_katakana
    CHECK (kana_last_name ~ '^[\u30A0-\u30FF\u30FC\u3000\s]*$'),
  ADD CONSTRAINT kana_first_name_katakana
    CHECK (kana_first_name ~ '^[\u30A0-\u30FF\u30FC\u3000\s]*$');

-- Note: \u30FC is the long vowel mark (ー), \u3000 is ideographic space
