/**
 * Extra DB keys: roll_film lamination AL/no-AL + slitter keys (idempotent).
 * These keep lamination cost_per_m2 (no-AL) and cost_per_m2_with_al authoritative in DB.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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
  console.log('=== Extra Roll Film / Lamination / Slitter Keys ===\n');
  // Lamination AL-별 단가 (lamination 카테고리)
  await upsert('lamination', 'cost_per_m2', 65, '원/m', '라미네이트 단가 (AL 무) - roll_film NO_AL');
  await upsert('lamination', 'cost_per_m2_with_al', 80, '원/m', '라미네이트 단가 (AL 유) - roll_film WITH_AL');
  // Slitter keys (slitter 카테고리 — code queries slitter.cost_per_m / slitter.min_cost)
  await upsert('slitter', 'cost_per_m', 10, '원/m', '슬리터 m당 단가 (roll_film)');
  await upsert('slitter', 'min_cost', 30000, '원', '슬리터 최소 비용 (roll_film)');
  console.log('\n=== Done ===');
  process.exit(0);
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
