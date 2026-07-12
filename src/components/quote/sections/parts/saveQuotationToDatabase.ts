/**
 * Save quotation to database.
 * Extracted from ResultStep for maintainability.
 */

import { calcDuty, calcManufacturingMargin } from '@/lib/duty-calculator';
import { saveGuestQuote } from '@/lib/guest-quote-storage';
import type { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import type { QuoteState } from '@/contexts/QuoteContext';
import type { MultiQuantityQuote } from './types';

interface PersistenceStatus {
  status: 'idle' | 'success' | 'error';
  message: string;
  quotationNumber?: string | null;
}

interface SaveQuotationParams {
  user: { id?: string | null; email?: string | null; kanjiLastName?: string | null; kanjiFirstName?: string | null; corporatePhone?: string | null } | null;
  result: UnifiedQuoteResult;
  state: QuoteState;
  hasValidSKUData: boolean;
  multiQuantityQuotes: MultiQuantityQuote[];
  hasMultiQuantityResults: boolean;
  setPersistenceStatus: (status: PersistenceStatus) => void;
}

export async function saveQuotationToDatabase({
  user,
  result,
  state,
  hasValidSKUData,
  multiQuantityQuotes,
  hasMultiQuantityResults,
  setPersistenceStatus,
}: SaveQuotationParams): Promise<{ id: string | null; quotationNumber: string | null }> {
    // ✅ 認証チェック: ログインしていない場合でも itemsToSave 構築後にsessionStorageへ保存
    const isGuest = !user?.id;
    setPersistenceStatus({ status: 'idle', message: '見積を保存中...' });

    try {
      // ========================================
      // 原価内訳の計算（DB保存用）
      // ========================================

      // 🔍 デバッグ: resultオブジェクトの値を確認
      console.log('[saveQuotationToDatabase] DEBUG result:', {
        totalPrice: result.totalPrice,
        unitPrice: result.unitPrice,
        baseCost: result.breakdown?.baseCost,
        quantity: result.quantity,
        skuCostDetails: result.skuCostDetails,
        hasValidSKUData: result.hasValidSKUData
      });

      // SKUモードの場合はskuCostDetailsから、通常モードはresultから計算
      let costBreakdown: Record<string, number> | null = null;

      if (result.skuCostDetails?.costPerSKU && result.skuCostDetails.costPerSKU.length > 0) {
      // 複数SKUモード: 各SKUの原価を合計
      // totalCost = 各SKUの最終販売価格合計（costBreakdown.totalCost は per-SKU final price in JPY）
      // cost_breakdown.totalCost = 仕入原価（component sum）, sellPrice = 最終販売価格
      const totalFinalPrice = result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.totalCost || 0), 0);
      const manufacturerCostSum = result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { materialCost?: number; printingCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; manufacturingMargin?: number } }) =>
        sum + (sku.costBreakdown?.materialCost || 0) + (sku.costBreakdown?.printingCost || 0) + (sku.costBreakdown?.laminationCost || 0) + (sku.costBreakdown?.slitterCost || 0) + (sku.costBreakdown?.surfaceTreatmentCost || 0) + (sku.costBreakdown?.pouchProcessingCost || 0) + (sku.costBreakdown?.manufacturingMargin || 0), 0);

        costBreakdown = {
          materialCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.materialCost || 0), 0)),
          laminationCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.laminationCost || 0), 0)),
          slitterCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.slitterCost || 0), 0)),
          surfaceTreatmentCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.surfaceTreatmentCost || 0), 0)),
          pouchProcessingCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.pouchProcessingCost || 0), 0)),
          printingCost: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.printingCost || 0), 0)),
          manufacturingMargin: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.manufacturingMargin || 0), 0)),
          duty: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.duty || 0), 0)),
          delivery: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.delivery || 0), 0)),
          salesMargin: Math.round(result.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.salesMargin || 0), 0)),
          totalCost: Math.round(manufacturerCostSum),
          sellPrice: Math.round(totalFinalPrice),
          intlShippingJPY: result.skuCostDetails?.summary?.intlShippingJPY ?? 0,
          domesticShippingJPY: result.skuCostDetails?.summary?.domesticShippingJPY ?? 0,
          deliveryBoxes: result.skuCostDetails?.summary?.deliveryBoxes ?? 0
        };
      } else if (result.breakdown?.baseCost || result.breakdown?.filmCost || result.breakdown?.pouchProcessingCost) {
        // 【追加】result.breakdownから直接計算（SKUモード対応）
        // baseCost は原価ベース（breakdown.baseCost / filmCost）。売価(totalPrice)は含まない。
        const breakdown = result.breakdown;
        const baseCost = breakdown.baseCost || breakdown.filmCost || 0;
        // duty はSKUモード（ベースライン）と同じ計算式に統一:
        //   duty = 製造者価格(原価 + manufacturingMargin) × 0.05
        //   manufacturingMargin = 原価 × 0.4
        // （旧実装の duty = 原価 × 0.05 は製造者価格ではなく原価に5%を適用しており、
        //   base-strategy.ts:227 / pouch-cost-calculator.ts:1287 の正確仕様と約40%乖離していた）
       const manufacturingMargin = breakdown.manufacturingMargin ?? calcManufacturingMargin(baseCost);
        const materialCost = Math.round(breakdown.filmCost || baseCost * 0.4);
        const laminationCost = Math.round(breakdown.laminationCost || baseCost * 0.06);
        const slitterCost = Math.round(breakdown.slitterCost || baseCost * 0.03);
        const surfaceTreatmentCost = 0;
        const pouchProcessingCost = Math.round(breakdown.pouchProcessingCost || baseCost * 0.15);
        const printingCost = Math.round(breakdown.printing || baseCost * 0.1);
        const manufacturingMarginRounded = Math.round(manufacturingMargin);
       costBreakdown = {
          materialCost,
          laminationCost,
          slitterCost,
          surfaceTreatmentCost,
          pouchProcessingCost,
          printingCost,
          manufacturingMargin: manufacturingMarginRounded,
         duty: Math.round(breakdown.duty ?? calcDuty(baseCost, manufacturingMargin)), // 製造者価格×0.05
         delivery: Math.round(breakdown.delivery || baseCost * 0.08),
        salesMargin: Math.round(breakdown.salesMargin || baseCost * 0.25),
          totalCost: Math.round(materialCost + laminationCost + slitterCost + surfaceTreatmentCost + pouchProcessingCost + printingCost + manufacturingMarginRounded),
         sellPrice: Math.round(result.totalPrice || 0),
          // フォールバック: 国際/国内分離不明のため delivery 全額を国際として扱う
          intlShippingJPY: Math.round(breakdown.delivery || baseCost * 0.08),
          domesticShippingJPY: 0,
          deliveryBoxes: 0
        };
      } else if ((result.totalPrice && result.totalPrice > 0) || (result.unitPrice && result.unitPrice > 0) || (result.breakdown?.baseCost && result.breakdown.baseCost > 0)) {
        // 通常モード・単一SKUモード: resultから計算
        // 【重要】baseCost は原価ベースに統一。売価(totalPrice / unitPrice*qty)を含むと
        //   duty が売価×5%に跳ね上がり約40%乖離するため、result.breakdown.baseCost のみを使用。
        //   breakdown.baseCost が無い場合は計算不能としてスキップ（duty=0）。
       const baseCost = result.breakdown?.baseCost || 0;
       const manufacturingMargin = result.breakdown?.manufacturingMargin ?? calcManufacturingMargin(baseCost);
        const materialCost2 = Math.round(baseCost * 0.4); // 約40%
        const laminationCost2 = Math.round(baseCost * 0.06); // 約6%
        const slitterCost2 = Math.round(baseCost * 0.03); // 約3%
        const surfaceTreatmentCost2 = 0;
        const pouchProcessingCost2 = Math.round(baseCost * 0.15); // 約15%
        const printingCost2 = Math.round(baseCost * 0.1); // 約10%
        const manufacturingMarginRounded2 = Math.round(manufacturingMargin);
        costBreakdown = {
          materialCost: materialCost2,
          laminationCost: laminationCost2,
          slitterCost: slitterCost2,
          surfaceTreatmentCost: surfaceTreatmentCost2,
          pouchProcessingCost: pouchProcessingCost2,
          printingCost: printingCost2,
          manufacturingMargin: manufacturingMarginRounded2,
         duty: Math.round(result.breakdown?.duty ?? calcDuty(baseCost, manufacturingMargin)), // 製造者価格×0.05
         delivery: Math.round(result.breakdown?.delivery || baseCost * 0.08), // 約8%
         salesMargin: Math.round(result.breakdown?.salesMargin || baseCost * 0.25), // 約25%
          totalCost: Math.round(materialCost2 + laminationCost2 + slitterCost2 + surfaceTreatmentCost2 + pouchProcessingCost2 + printingCost2 + manufacturingMarginRounded2),
          sellPrice: Math.round(result.totalPrice || 0),
         // フォールバック: 国際/国内分離不明のため delivery 全額を国際として扱う
          intlShippingJPY: Math.round(result.breakdown?.delivery || baseCost * 0.08),
          domesticShippingJPY: 0,
          deliveryBoxes: 0
        };
      }

      console.log('[saveQuotationToDatabase] 原価内訳:', costBreakdown);

      // アイテムデータ変換
      // PDF表示用のquoteSpecsとは別に、DB保存用のクリーンなデータを作成
      // カスタム見積のため、productIdとproductNameは固定値を使用
      // SKU数量の合計を計算（会員見積ページでの正しい数量表示のため）
      const totalSKUQuantity = state.skuQuantities?.reduce((sum, qty) => sum + (Number(qty) || 0), 0) || state.quantity;

      const itemsToSave = hasMultiQuantityResults
        ? multiQuantityQuotes.map((quote) => {
            return {
              productId: 'custom',
              productName: 'カスタム製品',
              quantity: quote.patternTotalQuantity ?? quote.quantity,
              unitPrice: quote.unitPrice,
              totalPrice: quote.totalPrice, // 正確な合計金額を追加（丸め誤差防止）
              specifications: {
                // 基本的な製品情報のみを保存（PDF用の変換フィールドは除外）
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''}${state.sideWidth ? ` x 側面${state.sideWidth}` : ''} mm`,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                // Issue 2 fix: resolve 'auto' to actual method
                printingType: state.printingType === 'auto' ? (quote.recommendedMethod || 'digital') : state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                // 後加工オプションは配列としてのみ保存（個別フィールドは保存しない）
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                // 【追加】側面幅
                sideWidth: state.sideWidth,
                // 【追加】シール幅（個別フィールド）
                sealWidth: state.sealWidth,
                // 【追加】内容量（製品タイプ・内容物・主成分・流通環境）
                productCategory: state.productCategory,
                contentsType: state.contentsType,
                mainIngredient: state.mainIngredient,
                distributionEnvironment: state.distributionEnvironment,
                // 【追加】表示用フィールド（AdminQuotationListとの互換性）
                colors: state.printingColors ? 'フルカラー' : undefined,
                zipper: state.postProcessingOptions?.some(opt => opt.includes('zipper-yes') || opt.includes('zipper')),
                // 印刷表示用 (Issue 2: resolve auto)
                printing_display: (state.printingType === 'auto' ? (quote.recommendedMethod || 'digital') : state.printingType) === 'digital' ? 'デジタル印刷' : 'グラビア印刷',
                // 重量範囲（MATERIAL_THICKNESS_OPTIONSから取得）
                weight_range: (() => {
                  if (!state.materialId || !state.thicknessSelection) return undefined;
                  const { MATERIAL_THICKNESS_OPTIONS } = require('@/lib/unified-pricing-engine');
                  const options = MATERIAL_THICKNESS_OPTIONS[state.materialId];
                  const option = options?.find((opt: { id: string }) => opt.id === state.thicknessSelection);
                  return option?.weightRange;
                })(),
                // ロールフィルム専用フィールド
                ...(state.bagTypeId === 'roll_film' && {
                  materialWidth: state.materialWidth,
                  totalLength: state.totalLength,
                  rollCount: state.rollCount,
                  pitch: state.pitch,
                  filmLayers: state.filmLayers
                }),
                // スパウトパウチ専用フィールド
                ...(state.bagTypeId === 'spout_pouch' && {
                  spoutPosition: state.spoutPosition,
                  spoutSize: state.spoutSize
                }),
                // 【追加】フィルム原価詳細（各素材レイヤーの完全な計算詳細）
                film_cost_details: result.filmCostDetails ? {
                materialLayerDetails: result.filmCostDetails.materialLayerDetails?.map(m => ({
                  materialId: m.materialId,
                  name: m.name,
                  nameJa: m.nameJa,
                  thicknessMicron: m.thicknessMicron,
                  density: m.density,
                  unitPriceKRW: m.unitPriceKRW,
                  areaM2: m.areaM2,
                  meters: m.meters,
                  widthM: m.widthM,
                  weightKg: m.weightKg,
                  costKRW: m.costKRW,
                  costJPY: m.costJPY
                })) || [],
                totalCostKRW: result.filmCostDetails.totalCostKRW,
                costJPY: result.filmCostDetails.costJPY,
                totalWeight: result.filmCostDetails.totalWeight,
                totalMeters: result.filmCostDetails.totalMeters,
                materialWidthMM: result.filmCostDetails.materialWidthMM,
                areaM2: result.filmCostDetails.areaM2,
                // G003: 상세 패널 표시용 DB 기반 실제값
                materialMarkupRate: result.filmCostDetails.materialMarkupRate,
                laminationUnitPriceKRW: result.filmCostDetails.laminationUnitPriceKRW,
                laminationCycles: result.filmCostDetails.laminationCycles,
                hasALMaterial: result.filmCostDetails.hasALMaterial,
                slitterUnitPriceKRW: result.filmCostDetails.slitterUnitPriceKRW,
                slitterMinCostKRW: result.filmCostDetails.slitterMinCostKRW
              } : null,
              sku_quantities: hasValidSKUData ? state.skuQuantities : undefined
            },
            cost_breakdown: quote.skuCostDetails?.costPerSKU && quote.skuCostDetails.costPerSKU.length > 0 ? {
                materialCost: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.materialCost || 0), 0)),
                laminationCost: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.laminationCost || 0), 0)),
                slitterCost: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.slitterCost || 0), 0)),
                surfaceTreatmentCost: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.surfaceTreatmentCost || 0), 0)),
                pouchProcessingCost: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.pouchProcessingCost || 0), 0)),
                printingCost: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.printingCost || 0), 0)),
                manufacturingMargin: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.manufacturingMargin || 0), 0)),
                duty: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.duty || 0), 0)),
                delivery: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.delivery || 0), 0)),
                salesMargin: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number; materialCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; printingCost?: number; manufacturingMargin?: number; duty?: number; delivery?: number; salesMargin?: number } }) => sum + (sku.costBreakdown?.salesMargin || 0), 0)),
                totalCost: Math.round(
                  quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { materialCost?: number; printingCost?: number; laminationCost?: number; slitterCost?: number; surfaceTreatmentCost?: number; pouchProcessingCost?: number; manufacturingMargin?: number } }) =>
                    sum + (sku.costBreakdown?.materialCost || 0) + (sku.costBreakdown?.printingCost || 0) + (sku.costBreakdown?.laminationCost || 0) + (sku.costBreakdown?.slitterCost || 0) + (sku.costBreakdown?.surfaceTreatmentCost || 0) + (sku.costBreakdown?.pouchProcessingCost || 0) + (sku.costBreakdown?.manufacturingMargin || 0), 0)
                ),
                sellPrice: Math.round(quote.skuCostDetails.costPerSKU.reduce((sum: number, sku: { costBreakdown?: { totalCost?: number } }) => sum + (sku.costBreakdown?.totalCost || 0), 0)),
               intlShippingJPY: quote.skuCostDetails?.summary?.intlShippingJPY ?? 0,
                domesticShippingJPY: quote.skuCostDetails?.summary?.domesticShippingJPY ?? 0,
                deliveryBoxes: quote.skuCostDetails?.summary?.deliveryBoxes ?? 0,
                exchangeRate: quote.skuCostDetails?.costPerSKU?.[0]?.costBreakdown?.exchangeRate,
                manufacturerMarginRate: quote.skuCostDetails?.costPerSKU?.[0]?.costBreakdown?.manufacturerMarginRate,
                materialMarkupRate: quote.skuCostDetails?.costPerSKU?.[0]?.costBreakdown?.materialMarkupRate,
                boxWeightKg: quote.skuCostDetails?.costPerSKU?.[0]?.costBreakdown?.boxWeightKg,
              } : costBreakdown
          };
        })
        : [
            {
              productId: 'custom',
              productName: 'カスタム製品',
              quantity: totalSKUQuantity,
              unitPrice: result.unitPrice,
              totalPrice: result.totalPrice, // 100円単位切り上げ済み
              specifications: {
                // 基本的な製品情報のみを保存（PDF用の変換フィールドは除外）
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''}${state.sideWidth ? ` x 側面${state.sideWidth}` : ''} mm`,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                // Issue 2 fix: resolve 'auto' to actual method
                printingType: state.printingType === 'auto' ? (result.breakdown.gravureProductionMeters ? 'gravure' : 'digital') : state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                // 後加工オプションは配列としてのみ保存（個別フィールドは保存しない）
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                // 【追加】側面幅
                sideWidth: state.sideWidth,
                // 【追加】シール幅（個別フィールド）
                sealWidth: state.sealWidth,
                // 【追加】内容量（製品タイプ・内容物・主成分・流通環境）
                productCategory: state.productCategory,
                contentsType: state.contentsType,
                mainIngredient: state.mainIngredient,
                distributionEnvironment: state.distributionEnvironment,
                // 【追加】表示用フィールド（AdminQuotationListとの互換性）
                colors: state.printingColors ? 'フルカラー' : undefined,
                zipper: state.postProcessingOptions?.some(opt => opt.includes('zipper-yes') || opt.includes('zipper')),
                // 印刷表示用 (Issue 2: resolve auto)
                printing_display: (state.printingType === 'auto' ? (result.breakdown.gravureProductionMeters ? 'gravure' : 'digital') : state.printingType) === 'digital' ? 'デジタル印刷' : 'グラビア印刷',
                // 重量範囲（MATERIAL_THICKNESS_OPTIONSから取得）
                weight_range: (() => {
                  if (!state.materialId || !state.thicknessSelection) return undefined;
                  const { MATERIAL_THICKNESS_OPTIONS } = require('@/lib/unified-pricing-engine');
                  const options = MATERIAL_THICKNESS_OPTIONS[state.materialId];
                  const option = options?.find((opt: { id: string }) => opt.id === state.thicknessSelection);
                  return option?.weightRange;
                })(),
                // ロールフィルム専用フィールド
                ...(state.bagTypeId === 'roll_film' && {
                  materialWidth: state.materialWidth,
                  totalLength: state.totalLength,
                  rollCount: state.rollCount,
                  pitch: state.pitch,
                  filmLayers: state.filmLayers
                }),
                // スパウトパウチ専用フィールド
                ...(state.bagTypeId === 'spout_pouch' && {
                  spoutPosition: state.spoutPosition,
                  spoutSize: state.spoutSize
                }),
                // 【追加】フィルム原価詳細（単一アイテムの場合も保存）
                film_cost_details: result.filmCostDetails ? {
                materialLayerDetails: result.filmCostDetails.materialLayerDetails?.map(m => ({
                  materialId: m.materialId,
                  name: m.name,
                  nameJa: m.nameJa,
                  thicknessMicron: m.thicknessMicron,
                  density: m.density,
                  unitPriceKRW: m.unitPriceKRW,
                  areaM2: m.areaM2,
                  meters: m.meters,
                  widthM: m.widthM,
                  weightKg: m.weightKg,
                  costKRW: m.costKRW,
                  costJPY: m.costJPY
                })) || [],
                totalCostKRW: result.filmCostDetails.totalCostKRW,
                costJPY: result.filmCostDetails.costJPY,
                totalWeight: result.filmCostDetails.totalWeight,
                totalMeters: result.filmCostDetails.totalMeters,
                materialWidthMM: result.filmCostDetails.materialWidthMM,
                areaM2: result.filmCostDetails.areaM2,
                // G003: 상세 패널 표시용 DB 기반 실제값
                materialMarkupRate: result.filmCostDetails.materialMarkupRate,
                laminationUnitPriceKRW: result.filmCostDetails.laminationUnitPriceKRW,
                laminationCycles: result.filmCostDetails.laminationCycles,
                hasALMaterial: result.filmCostDetails.hasALMaterial,
                slitterUnitPriceKRW: result.filmCostDetails.slitterUnitPriceKRW,
                slitterMinCostKRW: result.filmCostDetails.slitterMinCostKRW
              } : null,
              // 【追加】SKU数量情報（単一アイテムモード）
              sku_quantities: hasValidSKUData ? state.skuQuantities : undefined
            },
            cost_breakdown: costBreakdown
          }
        ];

      // AC-Q5: unitPrice*quantity の再計算ではなく、丸め済みの totalPrice を優先（整合性確保）。
      // totalPrice は各 item 構築箇所で「100円単位切り上げ済み」の正確な合計。
      // totalPrice がない item のみ unitPrice*quantity にフォールバック。
      const totalAmountFromItems = (itemsToSave as Array<{ totalPrice?: number; unitPrice: number; quantity: number }>).reduce((sum, item) => sum + (item.totalPrice ?? item.unitPrice * item.quantity), 0);

      // デバッグ: stateのsideWidthとsealWidthを確認
      console.log('[saveQuotationToDatabase] DEBUG state:', {
        sideWidth: state.sideWidth,
        sealWidth: state.sealWidth,
        bagTypeId: state.bagTypeId
      });

      const quotationData = {
        userId: user.id,
        totalAmount: totalAmountFromItems,
        items: itemsToSave
      };

      console.log('[saveQuotationToDatabase] Saving quotation:', quotationData);
      console.log('[saveQuotationToDatabase] itemsToSave[0].specifications:', itemsToSave[0]?.specifications);

      // ✅ ゲスト（非ログイン）の場合: sessionStorageに一時保存し、ログイン時に自動連携
      if (isGuest) {
        console.log('[saveQuotationToDatabase] Guest user — saving snapshot to sessionStorage');
        try {
          const guestItems = itemsToSave.map(item => {
            const safeUnitPrice = (typeof item.unitPrice === 'number' && isFinite(item.unitPrice)) ? item.unitPrice : 0;
            const safeQty = (typeof item.quantity === 'number' && isFinite(item.quantity) && item.quantity > 0) ? item.quantity : 1;
            return {
              product_name: item.productName || 'カスタム製品',
              quantity: safeQty,
              unit_price: safeUnitPrice,
              specifications: item.specifications,
              cost_breakdown: (item as any).cost_breakdown || {}
            };
          });
          saveGuestQuote({
            savedAt: new Date().toISOString(),
            totalAmount: totalAmountFromItems,
            items: guestItems,
            cost_breakdown: costBreakdown || null,
          });
          setPersistenceStatus({
            status: 'success',
            message: '見積を一時保存しました。ログインすると自動的に会員見積に反映されます。',
          });
        } catch (e) {
          console.warn('[saveQuotationToDatabase] Failed to save guest quote:', e);
          setPersistenceStatus({ status: 'error', message: '一時保存に失敗しました。' });
        }
        return { id: null, quotationNumber: null };
      }

      // ✅ /api/member/quotations を使用（認証必須）
      const response = await fetch('/api/member/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          customer_name: user?.kanjiLastName && user?.kanjiFirstName
            ? `${user.kanjiLastName} ${user.kanjiFirstName}`
            : user?.email?.split('@')[0] || 'Guest',
          customer_email: user?.email || 'guest@example.com',
          customer_phone: user?.corporatePhone || null,
          status: 'SENT',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: null,
          // 【追加】見積全体の原価内訳（合計）
          cost_breakdown: costBreakdown || {},
          items: itemsToSave.map(item => {
            // Sanitize: ensure quantity and unit_price are finite numbers.
            // JSON.stringify omits undefined keys, so a missing unit_price would arrive as
            // undefined on the API side and fail validation. Coerce to 0 if invalid.
            const safeUnitPrice = (typeof item.unitPrice === 'number' && isFinite(item.unitPrice)) ? item.unitPrice : 0;
            const safeQty = (typeof item.quantity === 'number' && isFinite(item.quantity) && item.quantity > 0) ? item.quantity : 1;
            return {
              product_name: item.productName || 'カスタム製品',
              quantity: safeQty,
              unit_price: safeUnitPrice,
              specifications: item.specifications,
              cost_breakdown: (item as any).cost_breakdown || {}
            };
          }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error', errorEn: 'Failed to save quotation' }));
        console.error('[saveQuotationToDatabase] ========================================');
        console.error('[saveQuotationToDatabase] API error status:', response.status);
        console.error('[saveQuotationToDatabase] API error data:', errorData);
        console.error('[saveQuotationToDatabase] Request data:', {
          customer_name: user?.kanjiLastName && user?.kanjiFirstName
            ? `${user.kanjiLastName} ${user.kanjiFirstName}`
            : user?.email?.split('@')[0] || 'Guest',
          customer_email: user?.email || 'guest@example.com',
          itemCount: itemsToSave.length,
        });
        console.error('[saveQuotationToDatabase] ========================================');
        throw new Error(errorData.error || errorData.errorEn || 'Failed to save quotation');
      }

      const savedQuotation = await response.json();
      console.log('[saveQuotationToDatabase] 見積が自動保存されました:', savedQuotation);
      const qNumber = savedQuotation.quotation_number || savedQuotation.quotation?.quotation_number || null;
      const qId = savedQuotation.id || savedQuotation.quotation?.id || null;
      setPersistenceStatus({
        status: 'success',
        message: qId ? '見積を保存しました。会員ページの見積一覧に反映されています。' : '見積を保存しました。',
        quotationNumber: qNumber,
      });
      return { id: qId, quotationNumber: qNumber };
    } catch (error) {
      console.error('[saveQuotationToDatabase] ========================================');
      console.error('[saveQuotationToDatabase] 保存失敗 (CATCH):');
      console.error('[saveQuotationToDatabase] Error name:', error instanceof Error ? error.name : typeof error);
      console.error('[saveQuotationToDatabase] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[saveQuotationToDatabase] Error stack:', error instanceof Error ? error.stack : 'no stack');
      console.error('[saveQuotationToDatabase] User authenticated:', !!user?.id);
      console.error('[saveQuotationToDatabase] User email:', user?.email || 'N/A');
      console.error('[saveQuotationToDatabase] ========================================');
      // Phase 1 fix: surface the failure to the user instead of silent console-only logging.
      const msg = error instanceof Error ? error.message : String(error);
      setPersistenceStatus({
        status: 'error',
        message: `見積の保存に失敗しました: ${msg}。PDFはダウンロード済みです。お手数ですが、お問い合わせフォームよりご連絡ください。`,
      });
      return { id: null, quotationNumber: null };
    }
  };
