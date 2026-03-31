import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('=== Supabase Tables ===\n');

  // Supabase schema 확인
  const { data, error } = await client
    .from('quotation_items')
    .select('id')
    .limit(1);

  if (!error) {
    console.log('quotation_items 테이블 존재함');
  }

  // film_cost_details를 직접 확인
  const { data: items, error: itemsError } = await client
    .from('quotation_items')
    .select('specifications')
    .limit(1);

  if (!itemsError && items && items.length > 0) {
    const specs = items[0].specifications as any;
    const fcd = specs.film_cost_details;

    if (fcd && fcd.materialLayerDetails) {
      console.log('\n=== Sample Material Layer Details ===');
      for (const layer of fcd.materialLayerDetails) {
        console.log(`${layer.nameJa} ${layer.thicknessMicron}μm:`);
        console.log(`  - density: ${layer.density}`);
        console.log(`  - weightKg: ${layer.weightKg}`);
      }
    }
  }

  // system_settings 테이블 확인
  const { data: sysSettings, error: sysError } = await client
    .from('system_settings')
    .select('*')
    .limit(10);

  if (!sysError && sysSettings) {
    console.log('\n=== system_settings table ===');
    for (const s of sysSettings) {
      console.log(`- ${s.setting_key}: ${s.setting_value}`);
    }
  } else {
    console.log('\nsystem_settings 테이블 없음');
  }
}

main().catch(console.error);
