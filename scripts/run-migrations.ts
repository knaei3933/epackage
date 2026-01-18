/**
 * Database Migration Runner
 *
 * This script runs the film cost system migrations on Supabase database.
 * Run with: npx tsx scripts/run-migrations.ts
 */

import { Pool } from 'pg'

// Connection string from .env.local
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:vozlwl1109@db.ijlgpzjdfipzmjvawofp.supabase.co:5432/postgres'

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

const migrations = [
  {
    name: 'Create system_settings table',
    file: '20260112_create_system_settings_table.sql',
    sql: `
-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  value_type TEXT NOT NULL DEFAULT 'number',
  description TEXT,
  unit TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_date TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_is_active ON system_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_system_settings_category_key ON system_settings(category, key);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_system_settings_updated_at ON system_settings;
CREATE TRIGGER trigger_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_system_settings_updated_at();

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can delete settings" ON system_settings;

-- Create RLS policies
CREATE POLICY "Admins can view all settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete settings"
  ON system_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant service role access
GRANT ALL ON system_settings TO service_role;
`
  },
  {
    name: 'Add markup_rate to profiles',
    file: '20260112_add_markup_rate_to_profiles.sql',
    sql: `
-- Add markup_rate column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'markup_rate'
  ) THEN
    ALTER TABLE profiles ADD COLUMN markup_rate NUMERIC DEFAULT 0.5;
  END IF;
END $$;

-- Add markup_rate_note column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'markup_rate_note'
  ) THEN
    ALTER TABLE profiles ADD COLUMN markup_rate_note TEXT;
  END IF;
END $$;

-- Drop and recreate constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_markup_rate_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_markup_rate_check
CHECK (markup_rate >= 0 AND markup_rate <= 2);

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_markup_rate ON profiles(markup_rate);

-- Add comments
COMMENT ON COLUMN profiles.markup_rate IS 'Customer-specific markup rate (0.5 = 50%). Default is 0.5';
COMMENT ON COLUMN profiles.markup_rate_note IS 'Internal notes about why this markup rate was set';
`
  },
  {
    name: 'Create coupons table',
    file: '20260112_create_coupons_table.sql',
    sql: `
-- Create enums
DO $$ BEGIN
  CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE coupon_status AS ENUM ('active', 'inactive', 'expired', 'scheduled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ja TEXT,
  description TEXT,
  description_ja TEXT,
  type coupon_type NOT NULL DEFAULT 'percentage',
  value NUMERIC NOT NULL,
  minimum_order_amount NUMERIC DEFAULT 0,
  maximum_discount_amount NUMERIC,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  max_uses_per_customer INTEGER DEFAULT 1,
  status coupon_status DEFAULT 'active',
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  applicable_customers UUID[] DEFAULT NULL,
  applicable_customer_types TEXT[] DEFAULT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_type ON coupons(type);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_applicable_customers ON coupons USING GIN(applicable_customers);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_coupons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_coupons_updated_at ON coupons;
CREATE TRIGGER trigger_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_coupons_updated_at();

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active coupons by code" ON coupons;
DROP POLICY IF EXISTS "Admins can view all coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can insert coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can update coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can delete coupons" ON coupons;

-- Create RLS policies
CREATE POLICY "Anyone can view active coupons by code"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can view all coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert coupons"
  ON coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update coupons"
  ON coupons
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete coupons"
  ON coupons
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Grant service role access
GRANT ALL ON coupons TO service_role;
`
  },
  {
    name: 'Create coupon_usage table',
    file: '20260112_create_coupon_usage_table.sql',
    sql: `
-- Create coupon_usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  discount_amount NUMERIC NOT NULL,
  original_amount NUMERIC NOT NULL,
  final_amount NUMERIC NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quotation_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON coupon_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_quotation_id ON coupon_usage(quotation_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_used_at ON coupon_usage(used_at);

-- Enable RLS
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "Admins can view all coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "System can insert coupon usage" ON coupon_usage;

-- Create RLS policies
CREATE POLICY "Users can view their own coupon usage"
  ON coupon_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all coupon usage"
  ON coupon_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert coupon usage"
  ON coupon_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Grant service role access
GRANT ALL ON coupon_usage TO service_role;
`
  },
  {
    name: 'Seed system settings',
    file: '20260112_seed_system_settings.sql',
    sql: `
-- Film Material Unit Prices
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('film_material', 'PET_unit_price', 2800, 'PET 필름 단가', '원/kg'),
('film_material', 'AL_unit_price', 7800, '알루미늄箔 단가', '원/kg'),
('film_material', 'LLDPE_unit_price', 2800, 'LLDPE 단가', '원/kg'),
('film_material', 'NY_unit_price', 5400, '나일론 단가', '원/kg'),
('film_material', 'VMPET_unit_price', 3600, '증착 PET 단가', '원/kg')
ON CONFLICT (category, key) DO NOTHING;

-- Film Material Density
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('film_material', 'PET_density', 1.40, 'PET 밀도', 'kg/m³'),
('film_material', 'AL_density', 2.71, '알루미늄 밀도', 'kg/m³'),
('film_material', 'LLDPE_density', 0.92, 'LLDPE 밀도', 'kg/m³'),
('film_material', 'NY_density', 1.16, '나일론 밀도', 'kg/m³'),
('film_material', 'VMPET_density', 1.40, '증착 PET 밀도', 'kg/m³')
ON CONFLICT (category, key) DO NOTHING;

-- Pouch Processing Costs
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('pouch_processing', 'flat_3_side_cost', 400000, '3방파우치 가공비', '원'),
('pouch_processing', 'stand_up_cost', 400000, '스탠드파우치 가공비', '원'),
('pouch_processing', 'box_cost', 400000, '박스형파우치 가공비', '원'),
('pouch_processing', 'other_cost', 300000, '기타 파우치 가공비', '원')
ON CONFLICT (category, key) DO NOTHING;

-- Printing Costs
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('printing', 'cost_per_m2', 475, '인쇄 단가 (m²당)', '원/m²'),
('printing', 'matte_cost_per_m', 20, '매트 인쇄 추가비 (m당)', '원/m')
ON CONFLICT (category, key) DO NOTHING;

-- Lamination Costs
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('lamination', 'cost_per_m2', 75, '라미네이트 단가 (m²당)', '원/m²')
ON CONFLICT (category, key) DO NOTHING;

-- Slitter Costs
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('slitter', 'cost_per_m', 10, '슬리터 단가 (m당)', '원/m'),
('slitter', 'min_cost', 30000, '슬리터 최소 비용', '원')
ON CONFLICT (category, key) DO NOTHING;

-- Exchange Rate & Duty
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('exchange_rate', 'krw_to_jpy', 0.12, '원화-엔화 환율', ''),
('duty_rate', 'import_duty', 0.05, '관세율', '%')
ON CONFLICT (category, key) DO NOTHING;

-- Delivery Costs
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('delivery', 'cost_per_roll', 16800, '배송비 (롤당)', '엔/롤'),
('delivery', 'kg_per_roll', 30, '1롤당 중량', 'kg')
ON CONFLICT (category, key) DO NOTHING;

-- Production Defaults
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('production', 'default_loss_rate', 0.4, '기본 로스율 (40%)', ''),
('production', 'material_width_540', 540, '재료 폭 (540mm)', 'mm'),
('production', 'material_width_740', 740, '재료 폭 (740mm)', 'mm')
ON CONFLICT (category, key) DO NOTHING;

-- Pricing Defaults
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('pricing', 'default_markup_rate', 0.5, '기본 마크업율 (50%)', ''),
('pricing', 'minimum_price_jpy', 170000, '최소 주문 가격', '엔')
ON CONFLICT (category, key) DO NOTHING;
`
  },
  {
    name: 'Seed sample coupons',
    file: '20260112_seed_sample_coupons.sql',
    sql: `
-- 5% Welcome Discount
INSERT INTO coupons (
  code, name, name_ja, description, description_ja, type, value,
  minimum_order_amount, max_uses, max_uses_per_customer, status
) VALUES (
  'WELCOME5', '웰컴 5% 할인', '新規5%割引',
  '신규 고객을 위한 5% 할인 쿠폰', '新規お客様向け5%割引クーポン',
  'percentage', 5, 0, NULL, 1, 'active'
) ON CONFLICT (code) DO NOTHING;

-- 10% VIP Coupon
INSERT INTO coupons (
  code, name, name_ja, description, description_ja, type, value,
  minimum_order_amount, max_uses, max_uses_per_customer, status
) VALUES (
  'VIP10', 'VIP 10% 할인', 'VIP10%割引',
  'VIP 고객을 위한 10% 할인 쿠폰 (50,000엔 이상)', 'VIPお客様向け10%割引クーポン（50,000円以上）',
  'percentage', 10, 50000, NULL, 1, 'active'
) ON CONFLICT (code) DO NOTHING;

-- Free Shipping
INSERT INTO coupons (
  code, name, name_ja, description, description_ja, type, value,
  minimum_order_amount, max_uses, max_uses_per_customer, status
) VALUES (
  'FREESHIP', '무료 배송', '送料無料',
  '배송비 무료 쿠폰', '送料無料クーポン',
  'free_shipping', 0, 0, NULL, 1, 'active'
) ON CONFLICT (code) DO NOTHING;

-- Test Coupon
INSERT INTO coupons (
  code, name, name_ja, description, description_ja, type, value,
  minimum_order_amount, max_uses, max_uses_per_customer, status, notes
) VALUES (
  'TEST3', '테스트 3% 할인', 'テスト3%割引',
  '시스템 테스트용 3% 할인 쿠폰', 'システムテスト用3%割引クーポン',
  'percentage', 3, 0, NULL, 10, 'active',
  'Internal testing coupon - can be used multiple times'
) ON CONFLICT (code) DO NOTHING;
`
  }
]

async function runMigration(migration: typeof migrations[0]) {
  console.log(`\n🔄 Running: ${migration.name} (${migration.file})`)

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Split SQL by semicolon and execute each statement
    const statements = migration.sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement)
      }
    }

    await client.query('COMMIT')
    console.log(`✅ ${migration.name} - completed`)
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error(`❌ ${migration.name} - FAILED:`, error.message)
    throw error
  } finally {
    client.release()
  }
}

async function main() {
  console.log('🚀 Starting Film Cost System Migrations')
  console.log(`📍 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`)
  console.log(`📋 Total migrations: ${migrations.length}`)

  for (const migration of migrations) {
    await runMigration(migration)
  }

  await pool.end()

  console.log('\n✨ All migrations completed successfully!')
  console.log('\n📊 Next steps:')
  console.log('  1. Verify tables in Supabase Dashboard')
  console.log('  2. Test API endpoints')
  console.log('  3. Access admin pages at /admin/settings and /admin/coupons')
}

main().catch(console.error)
