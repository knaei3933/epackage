-- ============================================
-- Populate System Settings with Default Values
-- ============================================
-- Purpose: Initialize system_settings with all constants from unified-pricing-engine.ts
-- Source: src/lib/unified-pricing-engine.ts (CONSTANTS section, lines 357-475)
-- Categories: film_material, pouch_processing, printing, lamination, slitter, delivery, production, pricing

-- ============================================
-- Production: Order Quantities
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('production', 'min_order_quantity', 100, 'number', '最小注文数量', '個'),
('production', 'max_order_quantity', 100000, 'number', '最大注文数量', '個'),
('production', 'small_lot_threshold', 3000, 'number', '小ロット判定閾値', '個'),
('production', 'minimum_price', 0, 'number', '最小価格（無効化済み）', '円')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Film Material: Costs (円/kg)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('film_material', 'opp_alu_foil_cost', 1200, 'number', 'OPPアルミ箔素材コスト', '円/kg'),
('film_material', 'kraft_pe_cost', 380, 'number', 'クラフトPE素材コスト', '円/kg'),
('film_material', 'alu_vapor_cost', 900, 'number', 'アルミ蒸着素材コスト', '円/kg'),
('film_material', 'pet_transparent_cost', 450, 'number', 'PET透明素材コスト', '円/kg'),
('film_material', 'pet_cost', 450, 'number', 'PET素材コスト', '円/kg'),
('film_material', 'pp_cost', 300, 'number', 'PP素材コスト', '円/kg'),
('film_material', 'pe_cost', 250, 'number', 'PE素材コスト', '円/kg'),
('film_material', 'aluminum_cost', 1200, 'number', 'アルミ素材コスト', '円/kg'),
('film_material', 'paper_laminate_cost', 380, 'number', '紙ラミネート素材コスト', '円/kg')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Film Material: Density (kg/m³)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('film_material', 'pet_density', 1.38, 'number', 'PET素材密度', 'kg/m³'),
('film_material', 'pp_density', 0.90, 'number', 'PP素材密度', 'kg/m³'),
('film_material', 'pe_density', 0.92, 'number', 'PE素材密度', 'kg/m³'),
('film_material', 'aluminum_density', 2.70, 'number', 'アルミ素材密度', 'kg/m³'),
('film_material', 'paper_laminate_density', 0.80, 'number', '紙ラミネート素材密度', 'kg/m³')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Pouch Processing: Costs (円/個)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('pouch_processing', 'flat_pouch_cost', 15, 'number', 'フラットパウチ加工費', '円/個'),
('pouch_processing', 'standing_pouch_cost', 18, 'number', 'スタンディングパウチ加工費', '円/個'),
('pouch_processing', 'flat_3_side_cost', 15, 'number', '三方袋加工費', '円/個'),
('pouch_processing', 'stand_up_cost', 18, 'number', 'スタンドアップパウチ加工費', '円/個'),
('pouch_processing', 'gusset_cost', 20, 'number', 'ガセットパウチ加工費', '円/個'),
('pouch_processing', 'box_cost', 22, 'number', 'ボックス型パウチ加工費', '円/個'),
('pouch_processing', 'flat_with_zip_cost', 20, 'number', 'ジッパー付きフラットパウチ加工費', '円/個'),
('pouch_processing', 'special_cost', 25, 'number', '特殊パウチ加工費', '円/個'),
('pouch_processing', 'soft_pouch_cost', 17, 'number', 'ソフトパウチ加工費', '円/個'),
('pouch_processing', 'roll_film_cost', 10, 'number', 'ロールフィルム加工費', '円/個'),
('pouch_processing', 'spout_pouch_cost', 20, 'number', 'スパウトパウチ加工費', '円/個')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Printing: Digital Costs
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('printing', 'digital_setup_fee', 10000, 'number', 'デジタル印刷セットアップ費', '円'),
('printing', 'digital_per_color_per_meter', 475, 'number', 'デジタル印刷費（色・m²あたり）', 'ウォン/m²'),
('printing', 'digital_min_charge', 5000, 'number', 'デジタル印刷最低料金', 'ウォン')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Printing: Gravure Costs
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('printing', 'gravure_setup_fee', 50000, 'number', 'グラビア印刷セットアップ費', 'ウォン'),
('printing', 'gravure_per_color_per_meter', 200, 'number', 'グラビア印刷費（色・m²あたり）', 'ウォン/m²'),
('printing', 'gravure_min_charge', 20000, 'number', 'グラビア印刷最低料金', 'ウォン')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Delivery: Domestic Costs (円)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('delivery', 'domestic_base_cost', 1500, 'number', '国内配送基本料金', '円'),
('delivery', 'domestic_per_kg_cost', 150, 'number', '国内配送重量別料金', '円/kg'),
('delivery', 'domestic_free_threshold', 50000, 'number', '国内配送無料閾値', '円')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Delivery: International Costs (円)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('delivery', 'international_base_cost', 5000, 'number', '国際配送基本料金', '円'),
('delivery', 'international_per_kg_cost', 500, 'number', '国際配送重量別料金', '円/kg'),
('delivery', 'international_free_threshold', 200000, 'number', '国際配送無料閾値', '円')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Production: Small Lot & UV Printing
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('production', 'small_lot_surcharge', 30000, 'number', '小量注文手数料', '円'),
('production', 'uv_printing_fixed_cost', 15000, 'number', 'UV印刷固定コスト', '円'),
('production', 'uv_printing_surcharge', 20000, 'number', 'UV印刷追加料金', '円')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Production: Roll Film Settings
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('production', 'roll_film_cost_per_m', 100, 'number', 'ロールフィルム単価（mあたり）', '円/m'),
('production', 'default_post_processing_multiplier', 1.0, 'number', 'デフォルト後加工乗数', ''),
('production', 'manufacturer_margin', 0.4, 'number', '製造業界マージン率（40%）', ''),
('production', 'sales_margin', 0.2, 'number', '販売マージン率（20%）', ''),
('production', 'default_loss_rate', 0.4, 'number', '基本ロス率（40%）', ''),
('production', 'default_material_width', 760, 'number', '基本原反幅（590または760）', 'mm')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Roll Film: Specialized Costs (원/m, 원)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('production', 'roll_film_printing_cost_per_m', 475, 'number', 'ロールフィルム印刷費（幅無関係）', '원/m'),
('production', 'roll_film_lamination_cost_per_m', 75, 'number', 'ロールフィルムラミネート費', '원/m'),
('production', 'roll_film_slitter_min_cost', 30000, 'number', 'ロールフィルムスリッター最小コスト', '원'),
('production', 'roll_film_slitter_cost_per_m', 10, 'number', 'ロールフィルムスリッター単価', '원/m')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Pouch Processing: Formula-Based Costs (원/cm)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('pouch_processing', 'flat_3_side_coefficient', 0.4, 'number', '三方袋係数（横CM×係数）', ''),
('pouch_processing', 'flat_3_side_minimum_price', 200000, 'number', '三方袋最小単価', '원'),
('pouch_processing', 'stand_up_coefficient', 1.2, 'number', 'スタンドパウチ係数（横CM×係数）', ''),
('pouch_processing', 'stand_up_minimum_price', 250000, 'number', 'スタンドパウチ最小単価', '원'),
('pouch_processing', 't_shape_coefficient', 1.2, 'number', 'T型パウチ係数（横CM×係数）', ''),
('pouch_processing', 't_shape_minimum_price', 440000, 'number', 'T型パウチ最小単価', '원'),
('pouch_processing', 'm_shape_coefficient', 1.2, 'number', 'M型パウチ係数（横CM×係数）', ''),
('pouch_processing', 'm_shape_minimum_price', 440000, 'number', 'M型パウチ最小単価', '원'),
('pouch_processing', 'box_coefficient', 1.2, 'number', 'ボックス型係数（横CM×係数）', ''),
('pouch_processing', 'box_minimum_price', 440000, 'number', 'ボックス型最小単価', '원'),
('pouch_processing', 'other_coefficient', 1.0, 'number', 'その他係数（横CM×係数）', ''),
('pouch_processing', 'other_minimum_price', 200000, 'number', 'その他最小単価', '원')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Pouch Processing: Zipper Surcharges (원)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('pouch_processing', 'flat_3_side_zipper_surcharge', 50000, 'number', '三方袋ジッパー追加料金（200,000→250,000）', '원'),
('pouch_processing', 'stand_up_zipper_surcharge', 30000, 'number', 'スタンドパウチジッパー追加料金（250,000→280,000）', '원'),
('pouch_processing', 't_shape_zipper_surcharge', 0, 'number', 'T型パウチジッパー追加料金（変更なし）', '원'),
('pouch_processing', 'm_shape_zipper_surcharge', 0, 'number', 'M型パウチジッパー追加料金（変更なし）', '원'),
('pouch_processing', 'box_zipper_surcharge', 0, 'number', 'ボックス型ジッパー追加料金（変更なし）', '원')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Pricing: Markup & Margins
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('pricing', 'default_markup_rate', 0.2, 'number', 'デフォルトマージン率（20%）', '')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Lamination: Costs (for completeness)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('lamination', 'cost_per_m2', 75, 'number', 'ラミネート単価（m²あたり）', '원/m²')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Slitter: Costs (for completeness)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('slitter', 'cost_per_m', 10, 'number', 'スリッター単価（mあたり）', '원/m'),
('slitter', 'min_cost', 30000, 'number', 'スリッター最小コスト', '원')
ON CONFLICT (category, key) DO NOTHING;
