/**
 * Apply Duplicate Settings Cleanup Migration
 *
 * Run with: npx tsx scripts/apply-cleanup-migration.ts
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const MIGRATION_SQL = `
-- ============================================
-- Remove Duplicate Settings and Keep Only FilmCostSettings Keys
-- ============================================

-- DELETE DUPLICATE FILM MATERIAL SETTINGS
DELETE FROM system_settings
WHERE category = 'film_material'
  AND key IN (
    'opp_alu_foil_cost',
    'kraft_pe_cost',
    'alu_vapor_cost',
    'pet_transparent_cost',
    'pet_cost',
    'pp_cost',
    'pe_cost',
    'aluminum_cost',
    'paper_laminate_cost',
    'pp_density',
    'pe_density',
    'aluminum_density',
    'paper_laminate_density'
  );

-- Remove old material_cost_* keys
DELETE FROM system_settings
WHERE category = 'material'
  AND key LIKE 'material_cost_%';

-- Remove old material_density_* keys
DELETE FROM system_settings
WHERE category = 'material'
  AND key LIKE 'material_density_%';

-- Remove old material_price_krw_* keys
DELETE FROM system_settings
WHERE category = 'material_krw';

-- INSERT CORRECT FILM MATERIAL SETTINGS
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('film_material', 'PET_unit_price', 2800, 'number', 'PETフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'AL_unit_price', 7800, 'number', 'ALフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'LLDPE_unit_price', 2800, 'number', 'LLDPEフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'NY_unit_price', 5400, 'number', 'NYフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'VMPET_unit_price', 3600, 'number', 'VMPETフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'PET_density', 1.40, 'number', 'PETフィルム密度 (kg/m³)', 'kg/m³'),
  ('film_material', 'AL_density', 2.71, 'number', 'ALフィルム密度 (kg/m³)', 'kg/m³'),
  ('film_material', 'LLDPE_density', 0.92, 'number', 'LLDPEフィルム密度 (kg/m³)', 'kg/m³'),
  ('film_material', 'NY_density', 1.16, 'number', 'NYフィルム密度 (kg/m³)', 'kg/m³'),
  ('film_material', 'VMPET_density', 1.40, 'number', 'VMPETフィルム密度 (kg/m³)', 'kg/m³')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      unit = EXCLUDED.unit,
      updated_at = NOW();

-- Printing
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('printing', 'cost_per_m2', 475, 'number', '印刷単価 (m²あたり)', '원/m²'),
  ('printing', 'matte_cost_per_m', 40, 'number', 'マット印刷単価 (mあたり)', '원/m')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      unit = EXCLUDED.unit,
      updated_at = NOW();

-- Lamination
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('lamination', 'cost_per_m2', 75, 'number', 'ラミネート単価 (m²あたり)', '원/m²')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      unit = EXCLUDED.unit,
      updated_at = NOW();

-- Slitter
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('slitter', 'cost_per_m', 10, 'number', 'スリッター単価 (mあたり)', '원/m'),
  ('slitter', 'min_cost', 30000, 'number', 'スリッター最小コスト', '원')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      unit = EXCLUDED.unit,
      updated_at = NOW();

-- Exchange Rate
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('exchange_rate', 'krw_to_jpy', 0.12, 'number', '為替レート (KRW→JPY)', '')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- Duty Rate
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('duty_rate', 'import_duty', 0.05, 'number', '関税率 (5%)', '')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- Delivery
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('delivery', 'cost_per_roll', 16800, 'number', '配送料 (1ロールあたり)', '円/롤'),
  ('delivery', 'kg_per_roll', 30, 'number', '1ロールの重量', 'kg')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      unit = EXCLUDED.unit,
      updated_at = NOW();

-- Production
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('production', 'default_loss_rate', 0.4, 'number', '基本ロス率 (40%)', '')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- Pricing
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  ('pricing', 'default_markup_rate', 0.2, 'number', 'デフォルトマージン率 (20%)', '')
ON CONFLICT (category, key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();
`

async function applyMigration() {
  console.log('Applying duplicate settings cleanup migration...')

  try {
    // First, let's verify the migration file exists
    const { data: existingSettings, error: fetchError } = await supabase
      .from('system_settings')
      .select('category', 'key', 'value')
      .order('category', 'key')

    if (fetchError) {
      console.error('Error fetching existing settings:', fetchError)
      process.exit(1)
    }

    console.log(`Found ${existingSettings?.length || 0} existing settings`)

    // Apply the migration using SQL
    // Note: DDL operations like DELETE/INSERT can't be done via RPC
    // We need to use the raw SQL execution if available
    console.log('SQL migration ready to apply...')
    console.log('')
    console.log('========================================')
    console.log('IMPORTANT: This script requires manual execution')
    console.log('========================================')
    console.log('')
    console.log('Please run the following SQL in Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/xypgmmgqzvdhjvlachwn/sql')
    console.log('')
    console.log('SQL to execute:')
    console.log('---')
    console.log(MIGRATION_SQL)
    console.log('---')
    console.log('')
    console.log('After executing, verify with:')
    console.log("SELECT category, key, value, description FROM system_settings WHERE category IN ('film_material', 'printing', 'lamination', 'slitter', 'exchange_rate', 'duty_rate', 'delivery', 'production', 'pricing') ORDER BY category, key;")

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

applyMigration()
