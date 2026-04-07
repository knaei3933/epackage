import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { unifiedPricingEngine, type UnifiedQuoteParams } from '@/lib/unified-pricing-engine';
import { getDefaultLayers } from '@/lib/common/film-calculations';
import type { FilmStructureLayer } from '@/lib/film-cost-calculator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth) return unauthorizedResponse();

  const { id: quotationId } = await params;
  const serviceClient = createServiceClient();

  // Fetch quotation items
  const { data: items, error } = await serviceClient
    .from('quotation_items')
    .select('id, specifications, quantity')
    .eq('quotation_id', quotationId);

  if (error || !items) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }

  const updatedItems = [];

  for (const item of items) {
    const specs = item.specifications as Record<string, unknown> || {};

    const materialId = (specs.materialId as string) || 'pet_pe';
    const thicknessSelection = (specs.thicknessSelection as string) || 'medium';

    // Use getDefaultLayers from film-calculations.ts for proper Kraft support
    const filmLayers: FilmStructureLayer[] = getDefaultLayers(materialId, thicknessSelection);

    // Build UnifiedQuoteParams from specifications
    const params: UnifiedQuoteParams = {
      bagTypeId: (specs.bagTypeId as string) || 'standup_pouch',
      materialId,
      quantity: item.quantity,
      skuQuantities: [item.quantity],  // SKUモード用: 単一SKUとして数量を配列で渡す
      useSKUCalculation: true,  // SKUモードを明示的に有効化
      width: (specs.width as number) || 0,
      height: (specs.height as number) || 0,
      depth: (specs.depth as number) || 0,
      thickness: (specs.thickness as number) || 80,
      thicknessSelection,
      printingColors: (specs.printingColors as number) || 4,
      printingType: (specs.printingType as 'digital' | 'gravure') || 'digital',
      doubleSided: (specs.doubleSided as boolean) || false,
      postProcessingOptions: (specs.postProcessingOptions as string[]) || [],
      filmLayers,  // Include filmLayers for proper calculation
      useFilmCostCalculation: true,
      markupRate: (specs.markupRate as number) || 0.5,
      lossRate: (specs.lossRate as number) || 0.4,
      // スパウトパウチ専用パラメータ（文字列から数値に変換）
      spoutSize: specs.spoutSize ? parseInt(String(specs.spoutSize), 10) : undefined,
      spoutPosition: (specs.spoutPosition as 'top-left' | 'top-center' | 'top-right') || undefined,
    };

    // デバッグログ：paramsオブジェクト全体を確認
    console.log('[Recalculate API] Full params object:', JSON.stringify({
      bagTypeId: params.bagTypeId,
      spoutSize: params.spoutSize,
      spoutSizeType: typeof params.spoutSize,
      spoutPosition: params.spoutPosition,
      quantity: params.quantity,
      skuQuantities: params.skuQuantities,
      useSKUCalculation: params.useSKUCalculation,
      specsOriginal: {
        spoutSize: specs.spoutSize,
        spoutSizeType: typeof specs.spoutSize,
        spoutSizeIsNumber: typeof specs.spoutSize === 'number',
        spoutSizeValue: specs.spoutSize,
        spoutSizeConverted: parseInt(String(specs.spoutSize || ''), 10)
      }
    }, null, 2));

    // Recalculate
    const result = await unifiedPricingEngine.calculateQuote(params);

    // デバッグログ：結果を確認
    console.log('[Recalculate API] Result:', {
      breakdown: result.breakdown,
      filmCostDetails: result.filmCostDetails,
      pouchProcessingCostFromBreakdown: result.breakdown?.pouchProcessingCost,
      processingFromBreakdown: result.breakdown?.processing,
      pouchProcessingCostFromFilmCost: result.filmCostDetails?.pouchProcessingCost,
      totalCost: result.breakdown?.total
    });
    const filmCostDetails = result.filmCostDetails || null;

    // Create cost_breakdown from result.breakdown
    // 【修正】breakdownの値は円（JPY）です。filmCostDetailsの値はウォン（KRW）ですが、二重変換を防ぐためbreakdownを使用
    const costBreakdown = result.breakdown ? {
      materialCost: result.breakdown.material || 0,
      laminationCost: result.breakdown.laminationCost || 0,  // 円（JPY）
      slitterCost: result.breakdown.slitterCost || 0,  // 円（JPY）
      surfaceTreatmentCost: result.breakdown.surfaceTreatmentCost || 0,  // 円（JPY）
      pouchProcessingCost: result.breakdown.processing || result.breakdown.pouchProcessingCost || 0,  // 円（JPY）
      printingCost: result.breakdown.printing || 0,  // 円（JPY）
      manufacturingMargin: result.breakdown.manufacturingMargin || 0,
      duty: result.breakdown.duty || 0,
      delivery: result.breakdown.delivery || 0,
      salesMargin: result.breakdown.salesMargin || 0,
      totalCost: result.breakdown.total || 0,
      baseCost: result.breakdown.baseCost || 0,
    } : null;

    // Update both specifications.film_cost_details and specifications.cost_breakdown
    // film_cost_detailsカラムとcost_breakdownカラムは存在しないため、specifications内に保存
    const updatedSpecs = {
      ...specs,
      film_cost_details: filmCostDetails,
      cost_breakdown: costBreakdown  // specifications内に保存
    };

    // デバッグ：保存する値を確認
    console.log('[Recalculate API] Saving to database:', {
      itemId: item.id,
      hasCostBreakdown: !!costBreakdown,
      hasFilmCostDetails: !!filmCostDetails,
      costBreakdownKeys: costBreakdown ? Object.keys(costBreakdown) : [],
      filmCostDetailsKeys: filmCostDetails ? Object.keys(filmCostDetails) : []
    });

    const { error: updateError } = await serviceClient
      .from('quotation_items')
      .update({
        specifications: updatedSpecs
      })
      .eq('id', item.id);

    if (!updateError) {
      console.log('[Recalculate API] Database update successful for item:', item.id);
      updatedItems.push({ id: item.id, filmCostDetails });
    } else {
      console.error('[Recalculate API] Database update error:', updateError);
    }
  }

  return NextResponse.json({
    success: true,
    message: `Updated ${updatedItems.length} item(s)`,
    updatedItems
  }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
