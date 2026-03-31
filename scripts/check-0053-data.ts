import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('=== QT20260331-0053 Analysis ===\n');

  // quotationsテーブルからQT20260331-0053を探す
  const { data: quotes, error } = await client
    .from('quotations')
    .select('id, quotation_number')
    .ilike('quotation_number', '%0053%')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (!quotes || quotes.length === 0) {
    console.log('No quotation found');
    return;
  }

  const quote = quotes[0];
  console.log('Quote:', quote.quotation_number, 'ID:', quote.id);

  // quotation_itemsを取得
  const { data: items, error: itemsError } = await client
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (itemsError) {
    console.error('Error:', itemsError);
    return;
  }

  for (const item of items || []) {
    const specs = item.specifications as any;
    const fcd = specs.film_cost_details;

    console.log('\n--- Item:', item.id?.substring(0, 8), '---');
    console.log('Quantity:', item.quantity);
    console.log('Bag Type:', specs.bagTypeId);
    console.log('Size:', specs.width, 'x', specs.height, 'x', specs.depth, 'mm');
    console.log('Material:', specs.materialId);
    console.log('');

    if (fcd) {
      console.log('Film Cost Details:');
      console.log('- totalMeters:', fcd.totalMeters);
      console.log('- materialWidthMM:', fcd.materialWidthMM);
      console.log('- areaM2:', fcd.areaM2);
      console.log('');

      // 사용자의 계산대로 확인
      const widthM = fcd.materialWidthMM / 1000;
      const meters = fcd.totalMeters;

      console.log('사용자 계산 조건:');
      console.log(`- 미터 수: ${meters}m`);
      console.log(`- 폭: ${fcd.materialWidthMM}mm = ${widthM}m`);
      console.log('');

      console.log('Material Layers (시스템 저장값 vs 사용자 계산값):');
      if (fcd.materialLayerDetails) {
        for (let i = 0; i < fcd.materialLayerDetails.length; i++) {
          const layer = fcd.materialLayerDetails[i];

          // 사용자 계산 방식
          const userCalcWeight = (layer.thicknessMicron / 1000000) * widthM * meters * layer.density * 1000;

          console.log(`  ${i + 1}. ${layer.nameJa} ${layer.thicknessMicron}μm`);
          console.log(`     - 시스템 저장값: ${layer.weightKg}kg`);
          console.log(`     - 사용자 계산값: ${userCalcWeight.toFixed(4)}kg`);
          console.log(`     - 비중: ${layer.density}`);

          if (i === 0) { // 첫 번째 PET
            console.log(`     - 계산식: ${layer.thicknessMicron}/1000000 × ${widthM} × ${meters} × ${layer.density} × 1000`);
            console.log(`     - 차이: ${(layer.weightKg - userCalcWeight).toFixed(4)}kg`);
          }
        }
      }
    }
  }
}

main().catch(console.error);
