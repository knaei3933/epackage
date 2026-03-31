import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('=== DB Film Material Settings ===\n');

  // pricing_settings 테이블 확인
  const { data: settings, error } = await client
    .from('pricing_settings')
    .select('*')
    .like('setting_key', '%density%')
    .order('setting_key');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Density Settings in DB:');
  for (const setting of settings || []) {
    console.log(`- ${setting.setting_key}: ${setting.setting_value}`);
  }

  console.log('\n=== Expected vs Actual ===');
  console.log('PET density should be: 1.40');
  console.log('Current DB value: Check above');

  // film_materials 테이블이 있는지 확인
  const { data: materials, error: matError } = await client
    .from('film_materials')
    .select('*')
    .order('material_id');

  if (!matError && materials) {
    console.log('\n=== film_materials table ===');
    for (const mat of materials) {
      console.log(`- ${mat.material_id}: density=${mat.density}`);
    }
  } else if (matError) {
    console.log('\nfilm_materials table does not exist');
  }
}

main().catch(console.error);
