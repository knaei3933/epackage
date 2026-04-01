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
    const costBreakdown = result.breakdown ? {
      materialCost: result.breakdown.material || 0,
      laminationCost: filmCostDetails?.laminationCost || 0,
      slitterCost: filmCostDetails?.slitterCost || 0,
      surfaceTreatmentCost: filmCostDetails?.surfaceTreatmentCost || 0,
      // pouchProcessingCostはresult.breakdown.processing（円貨）を使用
      pouchProcessingCost: result.breakdown.processing || result.breakdown.pouchProcessingCost || filmCostDetails?.pouchProcessingCost || 0,
      printingCost: filmCostDetails?.printingCost || 0,
      manufacturingMargin: filmCostDetails?.manufacturingMargin || 0,
      duty: filmCostDetails?.duty || 0,
      delivery: filmCostDetails?.delivery || 0,
      salesMargin: filmCostDetails?.salesMargin || 0,
      totalCost: result.breakdown.total || 0,
      baseCost: result.breakdown.baseCost || 0,
    } : null;

    // Update both specifications.film_cost_details, film_cost_details column, and cost_breakdown
    const updatedSpecs = { ...specs, film_cost_details: filmCostDetails };

    // デバッグ：保存する値を確認
    console.log('[Recalculate API] Saving to database:', {
      itemId: item.id,
      pouchProcessingCostInBreakdown: costBreakdown?.pouchProcessingCost,
      pouchProcessingCostInFilmCost: filmCostDetails?.pouchProcessingCost,
      processingInBreakdown: result.breakdown?.processing,
      expectedPouchProcessingCostFor15mm: 66000, // 80 KRW * 5000 + 150000 = 550000 KRW * 0.12 = 66000 JPY
      expectedPouchProcessingCostFor18mm: 84000 // 110 KRW * 5000 + 150000 = 700000 KRW * 0.12 = 84000 JPY
    });

    const { error: updateError } = await serviceClient
      .from('quotation_items')
      .update({
        specifications: updatedSpecs,
        film_cost_details: filmCostDetails,  // Also update dedicated column
        cost_breakdown: costBreakdown  // Update cost_breakdown with new calculation
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
