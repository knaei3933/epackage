/**
 * Add system_settings.manufacturer_order_email key (idempotent upsert).
 * Admin enters the Korean manufacturer's email address on /admin/settings.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const category = 'production';
  const key = 'manufacturer_order_email';
  const value = ''; // admin fills via settings page
  const { data: existing } = await client.from('system_settings').select('id,value').eq('category', category).eq('key', key).single();
  if (existing) {
    console.log(`✓ EXISTS ${category}.${key} (current value: "${existing.value}")`);
    process.exit(0);
  }
  const { error } = await client.from('system_settings').insert({
    category, key, value, value_type: 'string', unit: '', is_active: true,
    description: '한국 제조사 발주 메일 수신 주소 (관리자 입력)',
  });
  if (error) { console.error(`INSERT FAIL:`, error.message); process.exit(1); }
  console.log(`✓ INSERTED ${category}.${key} (빈값 - 관리자 설정 페이지에서 입력 필요)`);
  process.exit(0);
}
main().catch(e => { console.error('Fatal:', e); process.exit(1); });
