import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// materialId별 기본 filmLayers
const DEFAULT_FILM_LAYERS: Record<string, Array<{ materialId: string; thickness: number }>> = {
  'pet_al': [
    { materialId: 'PET', thickness: 12 },
    { materialId: 'AL', thickness: 7 },
    { materialId: 'PET', thickness: 12 },
    { materialId: 'LLDPE', thickness: 80 }
  ],
  'pet_ny_al': [
    { materialId: 'PET', thickness: 12 },
    { materialId: 'NY', thickness: 15 },
    { materialId: 'AL', thickness: 7 },
    { materialId: 'PET', thickness: 12 },
    { materialId: 'LLDPE', thickness: 80 }
  ],
  'kraft_vmpet_lldpe': [
    { materialId: 'KRAFT', thickness: 50 },
    { materialId: 'VMPET', thickness: 12 },
    { materialId: 'LLDPE', thickness: 50 }
  ],
  'ny_lldpe': [
    { materialId: 'NY', thickness: 15 },
    { materialId: 'LLDPE', thickness: 70 }
  ],
  'pet_pe': [
    { materialId: 'PET', thickness: 12 },
    { materialId: 'PE', thickness: 80 }
  ]
};

async function recalcAllQuotes() {
  console.log('=== 캐시 비우고 재계산 (소수점 2자리) ===\n');

  // 1. 캐시 비우기
  console.log('1. 캐시 비우는 중...');
  unifiedPricingEngine.clearCache();
  console.log('   ✅ 캐시 비움 완료\n');

  // 2. 모든 항목 가져오기
  const { data: items, error } = await client
    .from('quotation_items')
    .select('id, quantity, specifications, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`2. ${items?.length || 0}개 항목 재계산 중...\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const item of items || []) {
    const specs = item.specifications as any;
    const materialId = specs.materialId || '';

    // Get filmLayers (use default if not exists)
    let filmLayers = specs.filmLayers;
    if (!filmLayers || filmLayers.length === 0) {
      filmLayers = DEFAULT_FILM_LAYERS[materialId];
    }

    if (!filmLayers || filmLayers.length === 0) {
      skipped++;
      console.log(`   ⏭️  Skip ${item.id?.substring(0, 8)}: unknown material ${materialId}`);
      continue;
    }

    try {
      const params = {
        bagTypeId: specs.bagTypeId,
        materialId: specs.materialId,
        quantity: item.quantity,
        width: specs.width,
        height: specs.height,
        depth: specs.depth,
        thicknessSelection: specs.thicknessSelection || 'standard',
        printingColors: specs.printingColors || 4,
        printingType: specs.printingType || 'digital',
        doubleSided: specs.doubleSided || false,
        postProcessingOptions: specs.postProcessingOptions || [],
        useFilmCostCalculation: true,
        markupRate: 0.3,
        lossRate: specs.lossRate || 0.4,
        filmLayers: filmLayers
      };

      const result = await unifiedPricingEngine.calculateQuote(params);

      // Show weight details for verification
      if (result.filmCostDetails?.materialLayerDetails) {
        const pet = result.filmCostDetails.materialLayerDetails.find((l: any) => l.materialId === 'PET');
        const al = result.filmCostDetails.materialLayerDetails.find((l: any) => l.materialId === 'AL');

        console.log(`   ✅ ${item.id?.substring(0, 8)} ${materialId}`);
        if (pet) console.log(`      PET 12μm: ${pet.weightKg}kg`);
        if (al) console.log(`      AL 7μm: ${al.weightKg}kg`);
      }

      // Update database
      const updatedSpecs = {
        ...specs,
        film_cost_details: result.filmCostDetails,
        filmLayers: filmLayers
      };

      const { error: updateError } = await client
        .from('quotation_items')
        .update({ specifications: updatedSpecs })
        .eq('id', item.id);

      if (!updateError) {
        updated++;
      } else {
        failed++;
        console.log(`   ❌ FAIL ${item.id?.substring(0, 8)}`);
      }

    } catch (err: any) {
      failed++;
      console.log(`   ❌ ERROR ${item.id?.substring(0, 8)}: ${err.message}`);
    }
  }

  console.log(`\n=== 완료: ${updated}개 업데이트, ${skipped}개 스킵, ${failed}개 실패 ===`);
}

recalcAllQuotes().catch(console.error);
