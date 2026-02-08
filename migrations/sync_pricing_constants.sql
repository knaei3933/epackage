-- ========================================
-- Sync system_settings with unified-pricing-engine.ts CONSTANTS
-- ========================================
-- This migration ensures database values match the quote-simulator's actual calculation logic
-- Uses ON CONFLICT DO UPDATE for safe repeated execution
-- ========================================

-- ========================================
-- BASIC QUOTE SETTINGS
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('min_order_quantity', '100', 'quote', '最小注文数量 (MIN_ORDER_QUANTITY)', NOW()),
  ('max_order_quantity', '100000', 'quote', '最大注文数量 (MAX_ORDER_QUANTITY)', NOW()),
  ('small_lot_threshold', '3000', 'quote', '小ロットしきい値 (SMALL_LOT_THRESHOLD)', NOW()),
  ('minimum_price', '0', 'quote', '最小価格 - 無効化 (MINIMUM_PRICE)', NOW()),
  ('small_lot_surcharge', '30000', 'quote', '小量注文手数料 (SMALL_LOT_SURCHARGE)', NOW()),
  ('default_post_processing_multiplier', '1.0', 'quote', '後加工乗数デフォルト (DEFAULT_POST_PROCESSING_MULTIPLIER)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- MATERIAL COSTS (円/kg)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('material_cost_opp-alu-foil', '1200', 'material', '素材コスト: opp-alu-foil (円/kg)', NOW()),
  ('material_cost_kraft-pe', '380', 'material', '素材コスト: kraft-pe (円/kg)', NOW()),
  ('material_cost_alu-vapor', '900', 'material', '素材コスト: alu-vapor (円/kg)', NOW()),
  ('material_cost_pet-transparent', '450', 'material', '素材コスト: pet-transparent (円/kg)', NOW()),
  ('material_cost_PET', '450', 'material', '素材コスト: PET (円/kg)', NOW()),
  ('material_cost_PP', '300', 'material', '素材コスト: PP (円/kg)', NOW()),
  ('material_cost_PE', '250', 'material', '素材コスト: PE (円/kg)', NOW()),
  ('material_cost_ALUMINUM', '1200', 'material', '素材コスト: ALUMINUM (円/kg)', NOW()),
  ('material_cost_PAPER_LAMINATE', '380', 'material', '素材コスト: PAPER_LAMINATE (円/kg)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- MATERIAL DENSITY (kg/m³)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('material_density_PET', '1.38', 'material', '素材密度: PET (kg/m³)', NOW()),
  ('material_density_PP', '0.90', 'material', '素材密度: PP (kg/m³)', NOW()),
  ('material_density_PE', '0.92', 'material', '素材密度: PE (kg/m³)', NOW()),
  ('material_density_ALUMINUM', '2.70', 'material', '素材密度: ALUMINUM (kg/m³)', NOW()),
  ('material_density_PAPER_LAMINATE', '0.80', 'material', '素材密度: PAPER_LAMINATE (kg/m³)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- PROCESSING COSTS (円/個)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('processing_cost_flat-pouch', '15', 'processing', '加工費: flat-pouch (円/個)', NOW()),
  ('processing_cost_standing-pouch', '18', 'processing', '加工費: standing-pouch (円/個)', NOW()),
  ('processing_cost_flat_3_side', '15', 'processing', '加工費: flat_3_side (円/個)', NOW()),
  ('processing_cost_stand_up', '18', 'processing', '加工費: stand_up (円/個)', NOW()),
  ('processing_cost_gusset', '20', 'processing', '加工費: gusset (円/個)', NOW()),
  ('processing_cost_box', '22', 'processing', '加工費: box (円/個)', NOW()),
  ('processing_cost_flat_with_zip', '20', 'processing', '加工費: flat_with_zip (円/個)', NOW()),
  ('processing_cost_special', '25', 'processing', '加工費: special (円/個)', NOW()),
  ('processing_cost_soft_pouch', '17', 'processing', '加工費: soft_pouch (円/個)', NOW()),
  ('processing_cost_roll_film', '10', 'processing', '加工費: roll_film (円/個)', NOW()),
  ('processing_cost_spout_pouch', '20', 'processing', '加工費: spout_pouch (円/個)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- PRINTING COSTS (Digital)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('printing_digital_setup_fee', '10000', 'printing', 'デジタル印刷セットアップ費 (ウォン)', NOW()),
  ('printing_digital_per_color_per_meter', '475', 'printing', 'デジタル印刷費 (ウォン/m²)', NOW()),
  ('printing_digital_min_charge', '5000', 'printing', 'デジタル印刷最小料金 (ウォン)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- PRINTING COSTS (Gravure)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('printing_gravure_setup_fee', '50000', 'printing', 'グラビア印刷セットアップ費 (ウォン)', NOW()),
  ('printing_gravure_per_color_per_meter', '200', 'printing', 'グラビア印刷費 (ウォン/m²)', NOW()),
  ('printing_gravure_min_charge', '20000', 'printing', 'グラビア印刷最小料金 (ウォン)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- DELIVERY COSTS (Domestic)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('delivery_domestic_base', '1500', 'delivery', '国内配送基本料 (円)', NOW()),
  ('delivery_domestic_per_kg', '150', 'delivery', '国内配送料/kg (円)', NOW()),
  ('delivery_domestic_free_threshold', '50000', 'delivery', '国内配送無料しきい値 (円)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- DELIVERY COSTS (International)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('delivery_international_base', '5000', 'delivery', '国際配送基本料 (円)', NOW()),
  ('delivery_international_per_kg', '500', 'delivery', '国際配送料/kg (円)', NOW()),
  ('delivery_international_free_threshold', '200000', 'delivery', '国際配送無料しきい値 (円)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- UV PRINTING COSTS
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('uv_printing_fixed_cost', '15000', 'printing', 'UV印刷固定費 (円)', NOW()),
  ('uv_printing_surcharge', '20000', 'printing', 'UV印刷追加料金 (円)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- ROLL FILM COSTS
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('roll_film_cost_per_m', '100', 'roll_film', 'ロールフィルム単価 (円/m)', NOW()),
  ('roll_film_printing_cost_per_m', '475', 'roll_film', 'ロールフィルム印刷費 (ウォン/m)', NOW()),
  ('roll_film_lamination_cost_per_m', '75', 'roll_film', 'ロールフィルムラミネート費 (ウォン/m)', NOW()),
  ('roll_film_slitter_min_cost', '30000', 'roll_film', 'ロールフィルムスリッター最小費用 (ウォン)', NOW()),
  ('roll_film_slitter_cost_per_m', '10', 'roll_film', 'ロールフィルムスリッター費 (ウォン/m)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- FILM COST CALCULATION SETTINGS
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('manufacturer_margin', '0.4', 'film_cost', '製造業者マージン率 (40%)', NOW()),
  ('sales_margin', '0.2', 'film_cost', '販売マージン率 (20%)', NOW()),
  ('default_markup_rate', '0.2', 'film_cost', 'デフォルトマージン率 (20%)', NOW()),
  ('default_loss_rate', '0.4', 'film_cost', '基本ロス率 (40%)', NOW()),
  ('default_material_width', '760', 'film_cost', '基本原反幅 (mm) - 590 or 760', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- POUCH PROCESSING COSTS (KRW/cm)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('pouch_processing_flat_3_side_coefficient', '0.4', 'pouch_processing', '3方パウチ係数 (KRW/cm)', NOW()),
  ('pouch_processing_flat_3_side_minimum', '200000', 'pouch_processing', '3方パウチ最小価格 (ウォン)', NOW()),
  ('pouch_processing_stand_up_coefficient', '1.2', 'pouch_processing', 'スタンドパウチ係数 (KRW/cm)', NOW()),
  ('pouch_processing_stand_up_minimum', '250000', 'pouch_processing', 'スタンドパウチ最小価格 (ウォン)', NOW()),
  ('pouch_processing_t_shape_coefficient', '1.2', 'pouch_processing', 'T方パウチ係数 (KRW/cm)', NOW()),
  ('pouch_processing_t_shape_minimum', '440000', 'pouch_processing', 'T方パウチ最小価格 (ウォン)', NOW()),
  ('pouch_processing_m_shape_coefficient', '1.2', 'pouch_processing', 'M方パウチ係数 (KRW/cm)', NOW()),
  ('pouch_processing_m_shape_minimum', '440000', 'pouch_processing', 'M方パウチ最小価格 (ウォン)', NOW()),
  ('pouch_processing_box_coefficient', '1.2', 'pouch_processing', 'ボックス型パウチ係数 (KRW/cm)', NOW()),
  ('pouch_processing_box_minimum', '440000', 'pouch_processing', 'ボックス型パウチ最小価格 (ウォン)', NOW()),
  ('pouch_processing_other_coefficient', '1.0', 'pouch_processing', 'その他係数 (KRW/cm)', NOW()),
  ('pouch_processing_other_minimum', '200000', 'pouch_processing', 'その他最小価格 (ウォン)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- ZIPPER SURCHARGES (KRW)
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('zipper_surcharge_flat_3_side', '50000', 'zipper', 'ジッパー追加料金: 3方パウチ (ウォン)', NOW()),
  ('zipper_surcharge_stand_up', '30000', 'zipper', 'ジッパー追加料金: スタンドパウチ (ウォン)', NOW()),
  ('zipper_surcharge_t_shape', '0', 'zipper', 'ジッパー追加料金: T方パウチ (ウォン) - 変化なし', NOW()),
  ('zipper_surcharge_m_shape', '0', 'zipper', 'ジッパー追加料金: M方パウチ (ウォン) - 変化なし', NOW()),
  ('zipper_surcharge_box', '0', 'zipper', 'ジッパー追加料金: ボックス型 (ウォン) - 変化なし', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- KOREAN MATERIAL PRICES (ウォン/kg) - Static Class Constants
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('material_price_krw_PET_unit', '2800', 'material_krw', '韓国素材価格: PET (ウォン/kg)', NOW()),
  ('material_price_krw_PET_density', '1.40', 'material_krw', '韓国素材密度: PET (kg/m³)', NOW()),
  ('material_price_krw_AL_unit', '7800', 'material_krw', '韓国素材価格: AL (ウォン/kg)', NOW()),
  ('material_price_krw_AL_density', '2.71', 'material_krw', '韓国素材密度: AL (kg/m³)', NOW()),
  ('material_price_krw_LLDPE_unit', '2800', 'material_krw', '韓国素材価格: LLDPE (ウォン/kg)', NOW()),
  ('material_price_krw_LLDPE_density', '0.92', 'material_krw', '韓国素材密度: LLDPE (kg/m³)', NOW()),
  ('material_price_krw_NY_unit', '5400', 'material_krw', '韓国素材価格: NY (ウォン/kg)', NOW()),
  ('material_price_krw_NY_density', '1.16', 'material_krw', '韓国素材密度: NY (kg/m³)', NOW()),
  ('material_price_krw_VMPET_unit', '3600', 'material_krw', '韓国素材価格: VMPET (ウォン/kg)', NOW()),
  ('material_price_krw_VMPET_density', '1.40', 'material_krw', '韓国素材密度: VMPET (kg/m³)', NOW()),
  ('material_price_krw_CPP_unit', '2700', 'material_krw', '韓国素材価格: CPP (ウォン/kg)', NOW()),
  ('material_price_krw_CPP_density', '0.91', 'material_krw', '韓国素材密度: CPP (kg/m³)', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- PACKAGE WEIGHT LIMIT
-- ========================================

INSERT INTO system_settings (key, value, category, description, updated_at)
VALUES
  ('package_weight_limit', '27', 'delivery', '包装単位重量制限 (kg) - ドル最大重量', NOW())
ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      description = EXCLUDED.description,
      updated_at = NOW();

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- After running this migration, verify the settings with:
-- SELECT category, key, value, description FROM system_settings ORDER BY category, key;

-- Check for any discrepancies:
-- SELECT key, value FROM system_settings WHERE key LIKE '%cost%' OR key LIKE '%price%' OR key LIKE '%margin%';
