import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { unifiedPricingEngine } from '../src/lib/unified-pricing-engine';
import { getDefaultLayers } from '../src/lib/common/film-calculations';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function recalculateQT202604011568() {
  console.log('=== QT20260401-1568 再計画 (v2) ===\n');

  // Get quotation ID
  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260401-1568')
    .single();

  if (!quote) {
    console.log('Quote not found');
    return;
  }

  // Get quotation items
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (!items || items.length === 0) {
    console.log('No items found');
    return;
  }

  const item = items[0];
  const specs = item.specifications as Record<string, unknown>;

  console.log('【現在のspecifications】');
  console.log('  spoutSize:', specs.spoutSize, typeof specs.spoutSize);
  console.log('  spoutPosition:', specs.spoutPosition);
  console.log('  bagTypeId:', specs.bagTypeId);
  console.log('');

  // Build params for unified pricing engine
  const materialId = (specs.materialId as string) || 'pet_pe';
  const thicknessSelection = (specs.thicknessSelection as string) || 'medium';
  const filmLayers = getDefaultLayers(materialId, thicknessSelection);

  const params = {
    bagTypeId: (specs.bagTypeId as string) || 'standup_pouch',
    materialId,
    quantity: item.quantity,
    skuQuantities: [item.quantity],
    useSKUCalculation: true,
    width: (specs.width as number) || 0,
    height: (specs.height as number) || 0,
    depth: (specs.depth as number) || 0,
    thickness: (specs.thickness as number) || 80,
    thicknessSelection,
    printingColors: (specs.printingColors as number) || 4,
    printingType: (specs.printingType as 'digital' | 'gravure') || 'digital',
    doubleSided: (specs.doubleSided as boolean) || false,
    postProcessingOptions: (specs.postProcessingOptions as string[]) || [],
    filmLayers,
    useFilmCostCalculation: true,
    markupRate: (specs.markupRate as number) || 0.5,
    lossRate: (specs.lossRate as number) || 0.4,
    // Convert spoutSize to number
    spoutSize: specs.spoutSize ? parseInt(String(specs.spoutSize), 10) : undefined,
    spoutPosition: (specs.spoutPosition as 'top-left' | 'top-center' | 'top-right') || undefined,
  };

  console.log('【再計算パラメータ】');
  console.log('  spoutSize:', params.spoutSize, typeof params.spoutSize);
  console.log('  spoutPosition:', params.spoutPosition);
  console.log('');

  // Recalculate
  console.log('再計算開始...');
  const result = await unifiedPricingEngine.calculateQuote(params);

  console.log('【再計算結果】');
  const pouchProcessingCost = result.breakdown?.processing || result.breakdown?.pouchProcessingCost || 0;
  console.log('  pouchProcessingCost:', Math.round(pouchProcessingCost), 'JPY');
  console.log('  期待値 (15mm): 66,000 JPY (₩550,000)');
  console.log('  一致:', Math.round(pouchProcessingCost) === 66000 ? '✓ YES' : '✗ NO');
  console.log('');

  // Update only cost_breakdown (film_cost_details column doesn't exist)
  const costBreakdown = result.breakdown ? {
    materialCost: result.breakdown.material || 0,
    laminationCost: item.cost_breakdown?.laminationCost || 0,
    slitterCost: item.cost_breakdown?.slitterCost || 0,
    surfaceTreatmentCost: item.cost_breakdown?.surfaceTreatmentCost || 0,
    pouchProcessingCost: pouchProcessingCost,
    printingCost: item.cost_breakdown?.printingCost || 0,
    manufacturingMargin: item.cost_breakdown?.manufacturingMargin || 0,
    duty: item.cost_breakdown?.duty || 0,
    delivery: item.cost_breakdown?.delivery || 0,
    salesMargin: item.cost_breakdown?.salesMargin || 0,
    totalCost: result.breakdown.total || 0,
    baseCost: result.breakdown.baseCost || 0,
  } : null;

  console.log('【保存する値】');
  console.log('  cost_breakdown.pouchProcessingCost:', costBreakdown?.pouchProcessingCost);
  console.log('');

  // Update database - only cost_breakdown
  const { error: updateError } = await supabase
    .from('quotation_items')
    .update({ cost_breakdown: costBreakdown })
    .eq('id', item.id);

  if (updateError) {
    console.error('更新エラー:', updateError);
  } else {
    console.log('✓ データベース更新成功');
    console.log('');
    console.log('次の手順:');
    console.log('1. ブラウザで管理者ページをリロード (F5)');
    console.log('2. QT20260401-1568をクリックして詳細を表示');
    console.log('3. 製袋加工費が₩550,000になっていることを確認');
    console.log('4. スパウトサイズ(15mm)と位置(top-center)が表示されていることを確認');
  }
}

recalculateQT202604011568().catch(console.error);
