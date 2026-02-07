/**
 * Check Roll Film Pitch Data
 * ロールフィルムピッチデータ確認スクリプト
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkQuotations() {
  console.log('=== Roll Film Pitch Data Check ===\n');

  const { data: quotations, error } = await supabase
    .from('quotations')
    .select('id, quote_number, specifications, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Total quotations: ${quotations?.length || 0}\n`);

  if (quotations && quotations.length > 0) {
    quotations.forEach((q, i) => {
      console.log(`[${i + 1}] ${q.quote_number}`);
      console.log(`    Created: ${q.created_at}`);

      if (q.specifications) {
        const specs = q.specifications as any;
        console.log(`    bagTypeId: ${specs.bagTypeId}`);
        console.log(`    width: ${specs.width}`);
        console.log(`    height: ${specs.height}`);
        console.log(`    depth: ${specs.depth}`);
        console.log(`    pitch: ${specs.pitch ?? 'undefined'}`);
        console.log(`    dimensions: ${specs.dimensions ?? 'undefined'}`);
        console.log(`    materialId: ${specs.materialId}`);
        console.log(`    Has pitch in specifications: ${specs.pitch !== undefined}`);
      } else {
        console.log('    specifications: null');
      }
      console.log('');
    });
  }
}

checkQuotations()
  .then(() => {
    console.log('完了');
    process.exit(0);
  })
  .catch((error) => {
    console.error('エラー:', error);
    process.exit(1);
  });
