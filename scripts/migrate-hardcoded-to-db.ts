/**
 * DB Migration: Hardcoded Constants → system_settings
 *
 * Syncs all hardcoded pricing constants into DB so admin can manage them.
 * Strategy: code values are authoritative → DB updated to match.
 * Idempotent: upsert (INSERT if missing, UPDATE if exists)
 *
 * Usage: npx tsx scripts/migrate-hardcoded-to-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceRoleKey);

async function upsert(category: string, key: string, value: number, unit: string, description: string) {
  const { data: existing } = await client
    .from('system_settings')
    .select('id, value')
    .eq('category', category)
    .eq('key', key)
    .single();

  if (existing) {
    const { error } = await client
      .from('system_settings')
      .update({ value, unit, is_active: true, updated_at: new Date().toISOString() })
      .eq('category', category)
      .eq('key', key);
    if (error) { console.error(`UPDATE FAIL ${category}.${key}:`, error.message); return false; }
    const changed = existing.value !== value;
    console.log(`✓ UPDATED ${category}.${key}: ${existing.value} → ${value}${changed ? '' : ' (unchanged)'}`);
    return true;
  }

  const { error } = await client.from('system_settings').insert({
    category, key, value, value_type: 'number', unit, is_active: true, description,
  });
  if (error) { console.error(`INSERT FAIL ${category}.${key}:`, error.message); return false; }
  console.log(`✓ INSERTED ${category}.${key}: ${value} (${unit})`);
  return true;
}

async function main() {
  console.log('=== Hardcoded Constants → DB Migration ===\n');

  // --- A. Exchange rate: 0.11 → 0.12 (code value authoritative) ---
  await upsert('exchange_rate', 'krw_to_jpy', 0.12, '', '환율 KRW→JPY (코드 하드코딩값 0.12 기준)');

  // --- B. Pouch processing: sync *_coefficient to code values (pricePerCm) ---
  await upsert('pouch_processing', 'flat_3_side_coefficient', 0.4, '원/cm', '삼방파우치 cm당 단가 (pricePerCm)');
  await upsert('pouch_processing', 'stand_up_coefficient', 1.2, '원/cm', '스탠드파우치 cm당 단가');
  await upsert('pouch_processing', 't_shape_coefficient', 1.2, '원/cm', 'T방파우치 cm당 단가');
  await upsert('pouch_processing', 'm_shape_coefficient', 1.2, '원/cm', 'M방파우치 cm당 단가');
  await upsert('pouch_processing', 'box_coefficient', 1.2, '원/cm', '박스(가제트) cm당 단가');
  await upsert('pouch_processing', 'other_coefficient', 1.2, '원/cm', '기타 cm당 단가');

  // --- C. Pouch processing: new keys ---
  await upsert('pouch_processing', 'outsourcing_shipping', 150000, '원', '외주 가공 배송료 (t_shape, m_shape, box)');
  await upsert('pouch_processing', 'spout_price_9', 70, '원/개', '스패웃 9파이 단가');
  await upsert('pouch_processing', 'spout_price_15', 80, '원/개', '스패웃 15파이 단가');
  await upsert('pouch_processing', 'spout_price_18', 110, '원/개', '스패웃 18파이 단가');
  await upsert('pouch_processing', 'spout_price_22', 130, '원/개', '스패웃 22파이 단가');
  await upsert('pouch_processing', 'spout_price_28', 200, '원/개', '스패웃 28파이 단가');
  await upsert('pouch_processing', 'spout_round_trip_shipping', 150000, '원', '스패웃 왕복 배송료');

  // --- D. Production: new keys ---
  await upsert('production', 'spout_min_quantity', 5000, '개', '스패웃 최소 주문 수량');

  // --- E. Delivery: new key ---
  await upsert('delivery', 'box_weight_kg', 0.7, 'kg', '골판지 박스 1개 중량');

  // --- F. Fix processing_cost phantom category ---
  // Code uses getSetting('processing_cost', bagTypeId, ...) but DB has 'pouch_processing' category.
  // Insert proper keys under pouch_processing matching CONSTANTS.PROCESSING_COSTS.
  // Keys: flat-pouch, standing-pouch, flat_3_side, stand_up, gusset, box, flat_with_zip, special, soft_pouch, roll_film, spout_pouch
  // Note: these already exist as *_cost keys. We need the code to query correctly.
  // Decision: code will be fixed to use getSetting('pouch_processing', `${bagTypeId}_cost`, ...)

  console.log('\n=== Migration complete ===');
  process.exit(0);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
// === Roll film slitter keys (idempotent upsert) ===
// production.roll_film_slitter_min_cost = 30000, production.roll_film_slitter_cost_per_m = 10
