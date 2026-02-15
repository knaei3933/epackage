-- ============================================
-- Seed System Settings Data
-- ============================================
-- Purpose: Initialize system with default pricing and cost values
-- Based on: docs/reports/tjfrP/필름 계산.md

-- ============================================
-- Film Material Unit Prices (원/kg)
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('film_material', 'PET_unit_price', 2800, 'PET 필름 단가', '원/kg'),
('film_material', 'AL_unit_price', 7800, '알루미늄箔 단가', '원/kg'),
('film_material', 'LLDPE_unit_price', 2800, 'LLDPE 단가', '원/kg'),
('film_material', 'NY_unit_price', 5400, '나일론 단가', '원/kg'),
('film_material', 'VMPET_unit_price', 3600, '증착 PET 단가', '원/kg')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Film Material Density (kg/m³)
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('film_material', 'PET_density', 1.40, 'PET 밀도', 'kg/m³'),
('film_material', 'AL_density', 2.71, '알루미늄 밀도', 'kg/m³'),
('film_material', 'LLDPE_density', 0.92, 'LLDPE 밀도', 'kg/m³'),
('film_material', 'NY_density', 1.16, '나일론 밀도', 'kg/m³'),
('film_material', 'VMPET_density', 1.40, '증착 PET 밀도', 'kg/m³')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Pouch Processing Costs (원화)
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('pouch_processing', 'flat_3_side_cost', 400000, '3방파우치 가공비', '원'),
('pouch_processing', 'stand_up_cost', 400000, '스탠드파우치 가공비', '원'),
('pouch_processing', 'box_cost', 400000, '박스형파우치 가공비', '원'),
('pouch_processing', 'other_cost', 300000, '기타 파우치 가공비', '원')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Printing Costs
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('printing', 'cost_per_m2', 475, '인쇄 단가 (m²당)', '원/m²'),
('printing', 'matte_cost_per_m', 20, '매트 인쇄 추가비 (m당)', '원/m')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Lamination Costs
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('lamination', 'cost_per_m2', 75, '라미네이트 단가 (m²당)', '원/m²')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Slitter Costs
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('slitter', 'cost_per_m', 10, '슬리터 단가 (m당)', '원/m'),
('slitter', 'min_cost', 30000, '슬리터 최소 비용', '원')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Exchange Rate & Duty
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('exchange_rate', 'krw_to_jpy', 0.12, '원화-엔화 환율', ''),
('duty_rate', 'import_duty', 0.05, '관세율', '%')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Delivery Costs
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('delivery', 'cost_per_roll', 16800, '배송비 (롤당)', '엔/롤'),
('delivery', 'kg_per_roll', 30, '1롤당 중량', 'kg')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Production Defaults
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('production', 'default_loss_rate', 0.4, '기본 로스율 (40%)', ''),
('production', 'material_width_540', 540, '재료 폭 (540mm)', 'mm'),
('production', 'material_width_740', 740, '재료 폭 (740mm)', 'mm')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- Pricing Defaults
-- ============================================
INSERT INTO system_settings (category, key, value, description, unit) VALUES
('pricing', 'default_markup_rate', 0.5, '기본 마크업율 (50%)', ''),
('pricing', 'minimum_price_jpy', 170000, '최소 주문 가격', '엔')
ON CONFLICT (category, key) DO NOTHING;
