-- ============================================
-- Add KRAFT Material Settings
-- ============================================
-- Purpose: Add missing KRAFT_unit_price and KRAFT_density settings
-- These values are used in film-cost-calculator.ts for kraft paper materials

-- ============================================
-- Film Material: KRAFT Unit Price (원/kg)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('film_material', 'KRAFT_unit_price', 3000, 'number', 'クラフト紙単価', '원/kg')
ON CONFLICT (category, key) DO UPDATE SET value = 3000, description = 'クラフト紙単価';

-- ============================================
-- Film Material: KRAFT Density (kg/m³)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('film_material', 'KRAFT_density', 0.80, 'number', 'クラフト紙密度', 'kg/m³')
ON CONFLICT (category, key) DO UPDATE SET value = 0.80, description = 'クラフト紙密度';

-- ============================================
-- Film Material: LLDPE Unit Price (for completeness)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('film_material', 'LLDPE_unit_price', 2800, 'number', 'LLDPE単価', '원/kg')
ON CONFLICT (category, key) DO UPDATE SET value = 2800, description = 'LLDPE単価';

-- ============================================
-- Film Material: LLDPE Density (for completeness)
-- ============================================
INSERT INTO system_settings (category, key, value, value_type, description, unit) VALUES
('film_material', 'LLDPE_density', 0.92, 'number', 'LLDPE密度', 'kg/m³')
ON CONFLICT (category, key) DO UPDATE SET value = 0.92, description = 'LLDPE密度';
