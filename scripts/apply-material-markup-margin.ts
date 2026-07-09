/**
 * DB Migration: Material Markup Rate + Manufacturer Margin
 *
 * 1. INSERT material_markup_rate = 0.10 (film_material category)
 *    - 원단 단가에 10% 인상 적용 (협상 결과)
 *    - 기준원가는 기존 *_unit_price 값으로 보존, 이 rate를 곱해 적용단가 산출
 *
 * 2. UPDATE manufacturer_margin = 0.30 (pricing category)
 *    - 제조사 마진 40% → 30% (협상 결과)
 *
 * Usage: npx tsx scripts/apply-material-markup-margin.ts
 * Idempotent: INSERT ... ON CONFLICT + UPDATE
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

async function upsertSetting(category: string, key: string, value: number, description: string) {
  // Check existing
  const { data: existing } = await client
    .from('system_settings')
    .select('id, value')
    .eq('category', category)
    .eq('key', key)
    .single();

  if (existing) {
    const { error } = await client
      .from('system_settings')
      .update({ value, is_active: true, updated_at: new Date().toISOString() })
      .eq('category', category)
      .eq('key', key);
    if (error) {
      console.error(`UPDATE failed for ${category}.${key}:`, error.message);
      return false;
    }
    console.log(`✓ UPDATED ${category}.${key}: ${existing.value} → ${value}`);
    return true;
  }

  const { error } = await client.from('system_settings').insert({
    category,
    key,
    value,
    value_type: 'number',
    is_active: true,
    description,
  });
  if (error) {
    console.error(`INSERT failed for ${category}.${key}:`, error.message);
    return false;
  }
  console.log(`✓ INSERTED ${category}.${key}: ${value}`);
  return true;
}

async function main() {
  console.log('=== Material Markup + Manufacturer Margin Migration ===\n');

  // 1. Material markup rate (원단 10% 인상)
  await upsertSetting(
    'film_material',
    'material_markup_rate',
    0.10,
    '원단 단가 인상률 (협상결과). 적용단가 = 기준원가 × (1 + rate). 예: PET 4300 × 1.10 = 4730'
  );

  // 2. Manufacturer margin 40% → 30%
  await upsertSetting(
    'pricing',
    'manufacturer_margin',
    0.30,
    '제조사 마진율 (협상결과: 40%→30%)'
  );

  // Verify
  console.log('\n=== Verification ===');
  const { data, error } = await client
    .from('system_settings')
    .select('category, key, value, is_active')
    .or('and(category.eq.film_material,key.eq.material_markup_rate),and(category.eq.pricing,key.eq.manufacturer_margin)')
    .order('category');

  if (error) {
    console.error('Verification query failed:', error.message);
    process.exit(1);
  }

  console.table(data);
  console.log('\n✓ Migration complete.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
