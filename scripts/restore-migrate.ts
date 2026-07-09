/**
 * DB Migration: Hardcoded Constants → system_settings (re-clamp to code values).
 * Idempotent: upsert (INSERT if missing, UPDATE if exists).
 * Usage: npx tsx scripts/restore-migrate.ts
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
    if (error) { console.error(`UPDATE FAIL ${category}.${key}:`, error.message); return; }
    const changed = existing.value !== value;
    console.log(`✓ UPDATED ${category}.${key}: ${existing.value} → ${value}${changed ? '' : ' (unchanged)'}`);
    return;
  }
  const { error } = await client.from('system_settings').insert({
    category, key, value, value_type: 'number', unit, is_active: true, description,
  });
  if (error) { console.error(`INSERT FAIL ${category}.${key}:`, error.message); return; }
  console.log(`✓ INSERTED ${category}.${key}: ${value} (${unit})`);
}

async function main() {
  console.log('=== Hardcoded Constants → DB Migration (restore) ===\n');

  await upsert('exchange_rate', 'krw_to_jpy', 0.12, '', '환율 KRW→JPY (코드 하드코딩값 0.12 기준)');

  await upsert('pouch_processing', 'flat_3_side_coefficient', 0.4, '원/cm', '삼방파우치 cm당 단가 (pricePerCm)');
  await upsert('pouch_processing', 'stand_up_coefficient', 1.2, '원/cm', '스탠드파우치 cm당 단가');
  await upsert('pouch_processing', 't_shape_coefficient', 1.2, '원/cm', 'T방파우치 cm당 단가');
  await upsert('pouch_processing', 'm_shape_coefficient', 1.2, '원/cm', 'M방파우치 cm당 단가');
  await upsert('pouch_processing', 'box_coefficient', 1.2, '원/cm', '박스(가제트) cm당 단가');
  await upsert('pouch_processing', 'other_coefficient', 1.2, '원/cm', '기타 cm당 단가');

  await upsert('pouch_processing', 'flat_3_side_minimum_price', 200000, '원', '삼방 최소 가공비');
  await upsert('pouch_processing', 'stand_up_minimum_price', 250000, '원', '스탠드 최소 가공비');
  await upsert('pouch_processing', 't_shape_minimum_price', 440000, '원', 'T방 최소 가공비');
  await upsert('pouch_processing', 'm_shape_minimum_price', 440000, '원', 'M방 최소 가공비');
  await upsert('pouch_processing', 'box_minimum_price', 440000, '원', '박스 최소 가공비');
  await upsert('pouch_processing', 'other_minimum_price', 200000, '원', '기타 최소 가공비');

  await upsert('pouch_processing', 'flat_3_side_zipper_surcharge', 50000, '원', '삼방 지퍼 추가');
  await upsert('pouch_processing', 'stand_up_zipper_surcharge', 30000, '원', '스탠드 지퍼 추가');
  await upsert('pouch_processing', 't_shape_zipper_surcharge', 0, '원', 'T방 지퍼 추가');
  await upsert('pouch_processing', 'm_shape_zipper_surcharge', 0, '원', 'M방 지퍼 추가');
  await upsert('pouch_processing', 'box_zipper_surcharge', 0, '원', '박스 지퍼 추가');

  await upsert('pouch_processing', 'outsourcing_shipping', 150000, '원', '외주 가공 배송료 (t_shape, m_shape, box)');
  await upsert('pouch_processing', 'spout_price_9', 70, '원/개', '스패웃 9파이 단가');
  await upsert('pouch_processing', 'spout_price_15', 80, '원/개', '스패웃 15파이 단가');
  await upsert('pouch_processing', 'spout_price_18', 110, '원/개', '스패웃 18파이 단가');
  await upsert('pouch_processing', 'spout_price_22', 130, '원/개', '스패웃 22파이 단가');
  await upsert('pouch_processing', 'spout_price_28', 200, '원/개', '스패웃 28파이 단가');
  await upsert('pouch_processing', 'spout_round_trip_shipping', 150000, '원', '스패웃 왕복 배송료');

  await upsert('production', 'spout_min_quantity', 5000, '개', '스패웃 최소 주문 수량');
  await upsert('delivery', 'box_weight_kg', 0.7, 'kg', '골판지 박스 1개 중량');

  // Lamination / slitter (roll_film)
  await upsert('lamination', 'cost_per_m2', 65, '원/m', '라미네이트 단가 (AL 무)');
  await upsert('lamination', 'cost_per_m2_with_al', 80, '원/m', '라미네이트 단가 (AL 유)');
  await upsert('slitter', 'cost_per_m', 10, '원/m', '슬리터 m당 단가');
  await upsert('slitter', 'min_cost', 30000, '원', '슬리터 최소 비용');

  console.log('\n=== Migration complete ===');
  process.exit(0);
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
