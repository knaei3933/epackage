-- ============================================
-- Remove Duplicate Settings and Keep Only FilmCostSettings Keys
-- ============================================
-- Purpose: Remove duplicate settings and keep only the keys used by film-cost-calculator.ts
-- Based on: FilmCostSettings interface in src/lib/film-cost-calculator.ts
-- ============================================

-- ============================================
-- DELETE DUPLICATE FILM MATERIAL SETTINGS
-- ============================================
-- These keys are not used by the code and should be removed:

-- Old duplicate material cost keys (not used by code)
DELETE FROM system_settings
WHERE category = 'film_material'
  AND key IN (
    'opp_alu_foil_cost',
    'kraft_pe_cost',
    'alu_vapor_cost',      -- VMPET is the aluminum-vaporized PET, use VMPET_unit_price instead
    'pet_transparent_cost',  -- Duplicate of PET_unit_price
    'pet_cost',             -- Duplicate of PET_unit_price
    'pp_cost',
    'pe_cost',
    'aluminum_cost',
    'paper_laminate_cost'
  );

-- ============================================
-- DELETE DUPLICATE DENSITY SETTINGS
-- ============================================
-- Old density keys (not used by code)
DELETE FROM system_settings
WHERE category = 'film_material'
  AND key IN (
    'pp_density',
    'pe_density',
    'aluminum_density',
    'paper_laminate_density'
  );

-- ============================================
-- INSERT CORRECT FILM MATERIAL SETTINGS
-- These keys are used by film-cost-calculator.ts
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit)
VALUES
  -- Film Material Unit Prices (원/kg)
  ('film_material', 'PET_unit_price', 2800, 'number', 'PETフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'AL_unit_price', 7800, 'number', 'ALフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'LLDPE_unit_price', 2800, 'number', 'LLDPEフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'NY_unit_price', 5400, 'number', 'NYフィルム単価 (원/kg)', '원/kg'),
  ('film_material', 'VMPET_unit_price', 3600, 'number', 'VMPETフィルム単価 (원/kg)', '원/kg'),

  -- Film Material Densities (kg/m³)
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

-- ============================================
-- DELETE OTHER DUPLICATE SETTINGS (not used by code)
-- ============================================
-- Remove old material_cost_* keys from sync_pricing_constants.sql
DELETE FROM system_settings
WHERE category = 'material'
  AND key LIKE 'material_cost_%';

-- Remove old material_density_* keys
DELETE FROM system_settings
WHERE category = 'material'
  AND key LIKE 'material_density_%';

-- Remove old material_price_krw_* keys (use film_material.*_unit_price instead)
DELETE FROM system_settings
WHERE category = 'material_krw';

-- ============================================
-- ENSURE CORRECT SETTINGS EXIST FOR OTHER CATEGORIES
-- ============================================
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

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- After running this migration, verify settings with:
-- SELECT category, key, value, description, unit
-- FROM system_settings
-- WHERE category IN ('film_material', 'printing', 'lamination', 'slitter', 'exchange_rate', 'duty_rate', 'delivery', 'production', 'pricing')
-- ORDER BY category, key;
