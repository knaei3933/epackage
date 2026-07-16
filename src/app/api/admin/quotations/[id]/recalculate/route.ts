import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { unifiedPricingEngine, type UnifiedQuoteParams } from '@/lib/unified-pricing-engine';
import { getDefaultFilmLayers } from '@/lib/film-structure';
import type { FilmStructureLayer } from '@/lib/film-cost-calculator';
import { revalidatePath, revalidateTag } from 'next/cache';

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

    // M-8: デフォルト素材を正系の 'kp_pe' に修正（旧 'pet_pe' は表示マップ専用の非正系・getDefaultFilmLayers/materialData 未対応）。
    const materialId = (specs.materialId as string) || 'kp_pe';
    const thicknessSelection = (specs.thicknessSelection as string) || 'medium';

    // getDefaultFilmLayers（正系: src/lib/film-structure）で kraft 系 + pet_vmpet を含む全系統のデフォルトレイヤーを取得
    const filmLayers: FilmStructureLayer[] = getDefaultFilmLayers(materialId, thicknessSelection);

    // Build UnifiedQuoteParams from specifications
    const params: UnifiedQuoteParams = {
      // M-7: デフォルト bagTypeId を正系の 'stand_up' に修正（旧 'standup_pouch' は非存在・pricing-engine/product-data の正系 enum 外で計算ルーティングが不正）。
      bagTypeId: (specs.bagTypeId as string) || 'stand_up',
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
      spoutSize: specs.spoutSize ? (parseInt(String(specs.spoutSize), 10) as 9 | 15 | 18 | 22 | 28) : undefined,
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
      pouchProcessingCostFromFilmCost: (result.filmCostDetails as any)?.pouchProcessingCost,
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

    // C-9: cost_breakdown は専用カラム（quotation_items.cost_breakdown・jsonb実在）へ保存。
    // film_cost_details カラムは非存在のため specifications 内に保存（現状維持）。
    // 旧コメント「film_cost_detailsカラムとcost_breakdownカラムは存在しないため」は誤り（cost_breakdown カラム実在）。
    const updatedSpecs = {
      ...specs,
      film_cost_details: filmCostDetails,  // カラム非存在 → specifications 内
    };

    // デバッグ：保存する値を確認
    console.log('[Recalculate API] Saving to database:', {
      itemId: item.id,
      hasCostBreakdown: !!costBreakdown,
      hasFilmCostDetails: !!filmCostDetails,
      costBreakdownKeys: costBreakdown ? Object.keys(costBreakdown) : [],
      filmCostDetailsKeys: filmCostDetails ? Object.keys(filmCostDetails) : []
    });

    // C-9 + H-16: cost_breakdown を専用カラムへ、unit_price/total_price も更新（再計算結果を反映）。
    // 旧: specifications のみ更新で cost_breakdown カラム・unit_price・total_price が未反映（[id]/route.ts の item.cost_breakdown/unit_price 読込と非対称）。
    const { error: updateError } = await serviceClient
      .from('quotation_items')
      .update({
        specifications: updatedSpecs,
        cost_breakdown: costBreakdown,  // C-9: 専用カラム（[id]/route.ts 読込先と対称）
        unit_price: result.unitPrice,   // H-16: 再計算の単価（小数含む・100円丸め前）
        total_price: result.totalPrice, // H-16: 再計算の行小計（100円丸め済）
      })
      .eq('id', item.id);

    if (!updateError) {
      console.log('[Recalculate API] Database update successful for item:', item.id);
      updatedItems.push({ id: item.id, filmCostDetails });
    } else {
      console.error('[Recalculate API] Database update error:', updateError);
    }
  }

  // H-16: quotations ヘッダ金額（subtotal_amount/tax_amount/total_amount）を再計算して反映。
  // [id]/route.ts recalculateTotals と同一ロジック（Σ quantity*unit_price → 100円丸め → 税10%）。
  // 旧: item の unit_price/total_price 更新なしで quotations.total_amount も未更新 → 再計算結果が一覧・明細に反映されない。
  const { data: refreshedItems } = await serviceClient
    .from('quotation_items')
    .select('quantity, unit_price')
    .eq('quotation_id', quotationId);

  if (refreshedItems && refreshedItems.length > 0) {
    const subtotal = refreshedItems.reduce(
      (sum: number, it: { quantity: number; unit_price: number | string }) =>
        sum + (it.quantity * Number(it.unit_price)),
      0
    );
    const roundedSubtotal = Math.round(subtotal / 100) * 100;
    const roundedTax = Math.round(roundedSubtotal * 0.1);
    const total = roundedSubtotal + roundedTax;

    await serviceClient
      .from('quotations')
      .update({
        subtotal_amount: roundedSubtotal,
        tax_amount: roundedTax,
        total_amount: total,
        updated_at: new Date().toISOString(),
      })
      .eq('id', quotationId);
  }

  // ダッシュボード統計の即時反映（C2・Phase 4-3・quotations 金額更新 → recentQuotations/quotation KPI 直結）
  revalidatePath('/admin/dashboard');
  revalidateTag('admin-dashboard', 'max');

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
