import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';
import { MATERIAL_THICKNESS_OPTIONS } from '../src/lib/pricing/core/constants';

config({ path: '.env.local' });

const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

function parseFilmSpecToLayers(spec: string) {
  const layers: any[] = [];
  const parts = spec.split('+').map(p => p.trim());
  for (const part of parts) {
    const match = part.match(/^([A-Z]+)\s+(\d+)\s*μ?$/);
    if (match) layers.push({ materialId: match[1], thickness: parseInt(match[2], 10) });
  }
  return layers;
}

function getFilmLayers(materialId: string, thicknessSelection?: string) {
  const options = MATERIAL_THICKNESS_OPTIONS[materialId];
  if (!options) return [{ materialId: 'PET', thickness: 12 }, { materialId: 'PE', thickness: 80 }];
  const selected = options.find(opt => opt.id === thicknessSelection);
  if (selected?.specification) return parseFilmSpecToLayers(selected.specification);
  const first = options[0];
  return first?.specification ? parseFilmSpecToLayers(first.specification) : [];
}

async function main() {
  console.log('=== Force Recalculate All Recent Items ===\n');

  // 最近作成されたアイテムを取得
  const { data: items, error } = await client
    .from('quotation_items')
    .select('id, quantity, specifications, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Fetch error:', error.message);
    return;
  }

  console.log(`Found ${items?.length || 0} recent items\n`);

  let successCount = 0;
  for (const item of items || []) {
    try {
      const specs = item.specifications as any;

      // specificationsが不足している場合はスキップ
      if (!specs || !specs.bagTypeId) {
        console.log(`⏭️  SKIP ${item.id?.substring(0, 8)} - missing specifications\n`);
        continue;
      }

      const materialId = specs.materialId || 'pet_al';
      const thicknessSelection = specs.thicknessSelection || 'medium';
      const filmLayers = getFilmLayers(materialId, thicknessSelection);

      const params: any = {
        bagTypeId: specs.bagTypeId,
        materialId,
        quantity: item.quantity || 1000,
        width: specs.width || 0,
        height: specs.height || 0,
        depth: specs.depth || 0,
        thickness: specs.thickness || 80,
        thicknessSelection,
        printingColors: specs.printingColors || 4,
        printingType: specs.printingType || 'digital',
        doubleSided: specs.doubleSided || false,
        postProcessingOptions: specs.postProcessingOptions || [],
        filmLayers,
        useFilmCostCalculation: true,
        markupRate: specs.markupRate || 0.5,
        lossRate: specs.lossRate || 0.4,
      };

      // スプウトパウチ用パラメータ
      if (specs.bagTypeId === 'spout_pouch') {
        params.spoutPosition = specs.spoutPosition;
        params.spoutSize = specs.spoutSize;
      }

      // ロールフィルム用パラメータ
      if (specs.bagTypeId === 'roll_film') {
        params.materialWidth = specs.materialWidth;
        params.totalLength = specs.totalLength;
        params.rollCount = specs.rollCount;
        params.pitch = specs.pitch;
      }

      const result = await unifiedPricingEngine.calculateQuote(params);
      const filmCostDetails = result.filmCostDetails;

      if (filmCostDetails && filmCostDetails.materialLayerDetails) {
        const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };
        const { error: updateError } = await client
          .from('quotation_items')
          .update({ specifications: updatedSpecs })
          .eq('id', item.id);

        if (!updateError) {
          successCount++;
          const firstLayer = filmCostDetails.materialLayerDetails[0];
          const oldCost = ((specs.film_cost_details as any)?.materialLayerDetails?.[0]?.costKRW || 0);
          console.log(`✅ OK ${item.id?.substring(0, 8)} ${specs.bagTypeId} ${materialId}`);
          console.log(`   Cost: ₩${oldCost.toLocaleString()} → ₩${firstLayer.costKRW.toLocaleString()}`);
          console.log(`   Meters: ${filmCostDetails.totalMeters}, Layers: ${filmCostDetails.materialLayerDetails.length}\n`);
        } else {
          console.error(`❌ FAIL ${item.id?.substring(0, 8)} - ${updateError.message}\n`);
        }
      } else {
        console.error(`❌ NO FCD ${item.id?.substring(0, 8)}\n`);
      }
    } catch (err: any) {
      console.error(`❌ ERROR ${item.id?.substring(0, 8)} - ${err.message}\n`);
    }
  }

  console.log(`\n=== Complete: ${successCount}/${items?.length || 0} updated ===`);
}

main().catch(console.error);
