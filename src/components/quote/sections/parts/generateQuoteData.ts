/**
 * Generate QuoteData for PDF generation.
 * Extracted from ResultStep for maintainability.
 *
 * Restores full quote data: customer info, product descriptions, SKU
 * breakdowns, remarks, optional processing, and quote specifications
 * (commit 597d158f parity).
 */

import type { QuoteData } from '@/lib/pdf-generator';
import type { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import type { QuoteState } from '@/contexts/QuoteContext';
import type { MultiQuantityQuote } from './types';
import {
  getMaterialDescriptionJa,
  getMaterialLabelJa,
  getBagTypeDescriptionJa,
  translateSpoutPosition,
} from '../result-helpers';
import { getFilmStructureLabel } from '@/constants/materialTypes';

/** Minimal user shape used for customer info (avoids coupling to full User type). */
interface QuoteUser {
  id?: string | null;
  email?: string | null;
  kanjiLastName?: string | null;
  kanjiFirstName?: string | null;
  companyName?: string | null;
  postalCode?: string | null;
  prefecture?: string | null;
  city?: string | null;
  street?: string | null;
}

interface GenerateQuoteDataParams {
  state: QuoteState;
  result: UnifiedQuoteResult;
  hasValidSKUData: boolean;
  hasMultiQuantityResults: boolean;
  multiQuantityQuotes: MultiQuantityQuote[];
  overrideQuoteNumber?: string;
  user?: QuoteUser | null;
}

/**
 * Resolve the printing type for display.
 * - Explicit 'digital'/'gravure' → 日本語ラベル
 * - 'auto' (or undefined) → result.recommendation.method で解決
 * - フォールバック → 'digital'
 */
function resolvePrintingTypeLabel(state: QuoteState, result: UnifiedQuoteResult): string {
  const explicit = state.printingType;
  let method: 'digital' | 'gravure';
  if (explicit === 'gravure') {
    method = 'gravure';
  } else if (explicit === 'digital') {
    method = 'digital';
  } else {
    // 'auto' or undefined: use the engine's resolved recommendation
    method = result.recommendation?.method === 'gravure' ? 'gravure' : 'digital';
  }
  return method === 'gravure' ? 'グラビア印刷' : 'デジタル印刷';
}

// Label maps for contents field (preserved from original).
const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  'food': '食品',
  'health_supplement': '健康食品',
  'cosmetic': '化粧品',
  'quasi_drug': '医薬部外品',
  'drug': '医薬品',
  'other': 'その他'
};

const CONTENTS_TYPE_LABELS: Record<string, string> = {
  'solid': '固体',
  'powder': '粉体',
  'liquid': '液体'
};

const MAIN_INGREDIENT_LABELS: Record<string, string> = {
  'general_neutral': '一般/中性',
  'oil_surfactant': 'オイル/界面活性剤',
  'acidic_salty': '酸性/塩分',
  'volatile_fragrance': '揮発性/香料',
  'other': 'その他'
};

const DISTRIBUTION_ENVIRONMENT_LABELS: Record<string, string> = {
  'general_roomTemp': '一般/常温',
  'light_oxygen_sensitive': '光/酸素敏感',
  'refrigerated': '冷凍保管',
  'high_temp_sterilized': '高温殺菌',
  'other': 'その他'
};

const DEFAULT_REMARKS = `※製造工程上の都合により、実際の納品数量はご注文数量に対し最大10％程度の過不足が生じる場合がございます。
数量の完全保証はいたしかねますので、あらかじめご了承ください。
※不足分につきましては、実際に納品した数量に基づきご請求いたします。
前払いにてお支払いいただいた場合は、差額分を返金いたします。
※原材料価格の変動等により、見積有効期限経過後は価格が変更となる場合がございます。
再見積の際は、あらかじめご了承くださいますようお願いいたします。
※本見積金額には郵送費を含んでおります。
※お客様によるご確認の遅れ、その他やむを得ない事情により、納期が前後する場合がございます。
※年末年始等の長期休暇期間を挟む場合、通常より納期が延びる可能性がございます。
※天候不良、事故、交通事情等の影響により、やむを得ず納期が遅延する場合がございますので、あらかじめご了承ください。`;

function buildContents(state: QuoteState): string {
  const categoryLabel = PRODUCT_CATEGORY_LABELS[state.productCategory || ''] || '';
  const typeLabel = CONTENTS_TYPE_LABELS[state.contentsType || ''] || '';
  const ingredientLabel = MAIN_INGREDIENT_LABELS[state.mainIngredient || ''] || '';
  const environmentLabel = DISTRIBUTION_ENVIRONMENT_LABELS[state.distributionEnvironment || ''] || '';

  let contents = '粉体';
  if (categoryLabel && typeLabel && ingredientLabel && environmentLabel) {
    contents = `${categoryLabel}（${typeLabel}） / ${ingredientLabel} / ${environmentLabel}`;
  } else if (categoryLabel && typeLabel) {
    contents = `${categoryLabel}（${typeLabel}）`;
  } else if (categoryLabel) {
    contents = categoryLabel;
  } else if (typeLabel) {
    contents = typeLabel;
  }
  return contents;
}

function parseOptionalProcessing(state: QuoteState): QuoteData['optionalProcessing'] {
  let options = state.postProcessingOptions || [];

  if (state.bagTypeId === 'roll_film' || state.bagTypeId === 'spout_pouch') {
    const allowedOptions = ['glossy', 'matte'];
    options = options.filter(opt => allowedOptions.includes(opt));
    if (options.length === 0) {
      options = ['glossy'];
    }
  }

  const parsed = {
    zipper: options.includes('zipper-yes'),
    notch: options.includes('notch-yes'),
    hangingHole: options.includes('hang-hole-6mm') || options.includes('hang-hole-8mm'),
    hangHoleSize: options.includes('hang-hole-6mm') ? '6mm' as const :
                  options.includes('hang-hole-8mm') ? '8mm' as const : undefined,
    cornerProcessing: options.includes('corner-round'),
    gasValve: options.includes('valve-yes'),
    easyCut: options.includes('top-open') || options.includes('bottom-open'),
    dieCut: false,
    surfaceFinish: options.includes('matte') ? 'マット仕上げ' as const :
                   options.includes('glossy') ? '光沢仕上げ' as const : undefined,
    zipperPositionSpecified: options.includes('zipper-position-specified'),
    openingPosition: options.includes('top-open') ? '上端' as const :
                     options.includes('bottom-open') ? '下端' as const : undefined
  };
  return parsed as unknown as QuoteData['optionalProcessing'];
}

export function generateQuoteData({
  state,
  result,
  hasValidSKUData,
  hasMultiQuantityResults,
  multiQuantityQuotes,
  overrideQuoteNumber,
  user,
}: GenerateQuoteDataParams): QuoteData {
    const today = new Date();
    const issueDate = today.toISOString().split('T')[0];
    const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const skuQuantities = state.skuQuantities ?? [];
    const totalSKUQuantity = skuQuantities.reduce((sum, qty) => sum + (Number(qty) || 0), 0) || state.quantity;

    // Build items: SKU mode → multi-quantity → single
    const items = hasValidSKUData && skuQuantities.length > 0
      ? skuQuantities.map((qty, index) => {
          const skuCost = result.skuCostDetails?.costPerSKU?.[index];
          const totalQuantity = skuQuantities.reduce((sum, q) => sum + q, 0);
          const proportion = qty / totalQuantity;
          const unitPrice = result.unitPrice;
          const amount = result.totalPrice * proportion;
          return {
            id: `sku-${index + 1}`,
            name: `SKU ${index + 1}`,
            description: `${getBagTypeDescriptionJa(state.bagTypeId)} - ${getMaterialDescriptionJa(state.materialId)}`,
            quantity: qty,
            unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
            unitPrice,
            amount,
            skuBreakdown: skuCost ? [{ skuNumber: index + 1, quantity: qty }] : undefined
          };
        })
      : hasMultiQuantityResults && multiQuantityQuotes.length > 0
      ? multiQuantityQuotes.map((quote, index) => ({
          id: `item-${index + 1}`,
          name: `${getBagTypeDescriptionJa(state.bagTypeId)} - ${getMaterialDescriptionJa(state.materialId)}`,
          description: `サイズ: ${state.width}×${state.height}${(state.depth > 0 && state.bagTypeId !== 'lap_seal') ? `×${state.depth}` : ''}mm`,
          quantity: quote.patternTotalQuantity ?? quote.quantity,
          unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
          unitPrice: quote.unitPrice,
          amount: quote.totalPrice
        }))
      : [{
          id: 'item-1',
          name: `${getBagTypeDescriptionJa(state.bagTypeId)} - ${getMaterialDescriptionJa(state.materialId)}`,
          description: `サイズ: ${state.width}×${state.height}${(state.depth > 0 && state.bagTypeId !== 'lap_seal') ? `×${state.depth}` : ''}mm`,
          quantity: totalSKUQuantity,
          unit: state.bagTypeId === 'roll_film' ? 'm' : '個',
          unitPrice: result.unitPrice,
          amount: result.totalPrice
        }];

    const contents = buildContents(state);

    // machiPrinting は QuoteData['specifications'] 型に含まれない実行時専用キーだが、
    // PDF生成・DB保存時に使用されるため、緩い型で保持（実行時ロジック不変）
    const quoteSpecs: QuoteData['specifications'] & Record<string, any> = {
      bagType: getBagTypeDescriptionJa(state.bagTypeId) || '指定なし',
      contents,
      material: getMaterialLabelJa(state.materialId) || '指定なし',
      size: `${state.width || 0}×${state.height || 0}${(state.depth > 0 && state.bagTypeId !== 'lap_seal') ? `×${state.depth}` : ''}mm`,
      thicknessType: state.thicknessSelection && state.materialId
        ? getFilmStructureLabel(state.materialId, state.thicknessSelection)
        : '指定なし',
      // 印刷方式: 'auto' を実際の方式（デジタル/グラビア）に解決して表示
      printingType: resolvePrintingTypeLabel(state, result),
      // 色数
      printingColors: state.printingColors ? `${state.printingColors}色` : 'フルカラー',
      sealWidth: state.sealWidth || '5mm',
      sealDirection: '上',
      notchShape: state.postProcessingOptions?.includes('notch-yes') ? 'V' :
                  state.postProcessingOptions?.includes('notch-straight') ? '直線' :
                  state.postProcessingOptions?.includes('notch-no') ? 'なし' : undefined,
      notchPosition: (state.postProcessingOptions?.includes('notch-yes') ||
                      state.postProcessingOptions?.includes('notch-straight')) ? '指定位置' : undefined,
      hanging: (state.postProcessingOptions?.includes('hang-hole-6mm') ||
                state.postProcessingOptions?.includes('hang-hole-8mm')) ? 'あり' : 'なし',
      hangingPosition: state.postProcessingOptions?.includes('hang-hole-6mm') ? '6mm' :
                      state.postProcessingOptions?.includes('hang-hole-8mm') ? '8mm' : undefined,
      zipperPosition: state.postProcessingOptions?.includes('zipper-yes') ? '指定位置' : undefined,
      cornerR: state.postProcessingOptions?.includes('corner-round') ? 'R5' :
               state.postProcessingOptions?.includes('corner-square') ? 'R0' : undefined,
      machiPrinting: (state.bagTypeId === 'stand_up' ||
                      state.bagTypeId === 'lap_seal' ||
                      state.bagTypeId === 'flat_3_side' ||
                      state.bagTypeId === 'box') &&
                     state.depth > 0
                     ? (state.postProcessingOptions?.includes('machi-printing-yes') ? 'あり' : 'なし')
                     : undefined,
      spoutPosition: state.bagTypeId === 'spout_pouch' && state.spoutPosition ? translateSpoutPosition(state.spoutPosition) : undefined,
      spoutSize: state.bagTypeId === 'spout_pouch' && state.spoutSize ? `${state.spoutSize}パイ（φ${state.spoutSize}mm）` : undefined,
      hasGusset: state.bagTypeId === 'spout_pouch' && state.hasGusset !== undefined ? (state.hasGusset ? 'マチあり（スタンドパウチ準用）' : 'マチなし（平袋準用）') : undefined,
      rollFilmSpecs: state.bagTypeId === 'roll_film' ? {
        materialWidth: state.materialWidth,
        totalLength: state.totalLength,
        rollCount: state.rollCount,
        pitch: state.pitch
      } : undefined
    };

    return {
      quoteNumber: overrideQuoteNumber || `QT-${Date.now()}`,
      issueDate,
      expiryDate,
      customerName: user?.kanjiLastName && user?.kanjiFirstName
        ? `${user.kanjiLastName} ${user.kanjiFirstName}`
        : user?.companyName || '',
      companyName: user?.companyName || '',
      postalCode: user?.postalCode || '',
      address: user?.prefecture && user?.city && user?.street
        ? `${user.prefecture}${user.city}${user.street}`
        : '',
      contactPerson: user?.kanjiLastName && user?.kanjiFirstName
        ? `${user.kanjiLastName} ${user.kanjiFirstName}`
        : '',
      items,
      skuData: hasValidSKUData && skuQuantities.length > 0 ? {
        count: state.skuCount,
        items: skuQuantities.map((qty, index) => {
          const totalQuantity = skuQuantities.reduce((sum, q) => sum + q, 0);
          const proportion = qty / totalQuantity;
          return {
            skuNumber: index + 1,
            quantity: qty,
            unitPrice: result.unitPrice,
            totalPrice: result.totalPrice * proportion
          };
        })
      } : undefined,
      specifications: quoteSpecs,
      optionalProcessing: parseOptionalProcessing(state),
      paymentTerms: '銀行振込（前払い）',
      deliveryDate: `校了から約${result.leadTimeDays}日`,
      deliveryLocation: state.deliveryLocation === 'domestic' ? '日本国内' : '海外',
      validityPeriod: `見積日から30日間\n有効期限経過後は価格変更となる場合がございますので\n再見積の際はご相談ください`,
      remarks: DEFAULT_REMARKS
    } as unknown as QuoteData;
}

/**
 * Build MultiQuantityQuoteInput array for multi-pattern PDF generation.
 */
import type { MultiQuantityQuoteInput } from '@/lib/pdf-generator';

interface BuildMultiPatternPdfInputsParams {
  state: QuoteState;
  multiQuantityQuotes: MultiQuantityQuote[];
}

export function buildMultiPatternPdfInputs({
  state,
  multiQuantityQuotes,
}: BuildMultiPatternPdfInputsParams): MultiQuantityQuoteInput[] {
    return multiQuantityQuotes.map((quote) => {
     const costPerSKU = quote.skuCostDetails?.costPerSKU;
      return {
        quantity: quote.patternTotalQuantity ?? 0,
        unitPrice: quote.unitPrice,
        totalPrice: quote.totalPrice,
        recommendation: {
          method: quote.recommendedMethod === 'gravure' ? 'gravure' : 'digital',
        },
        skuDetails: costPerSKU && costPerSKU.length >= 2
          ? (costPerSKU as Array<{ quantity?: number }>).map((s, i) => ({ label: `SKU ${i + 1}`, quantity: s.quantity }))
          : undefined,
      } as MultiQuantityQuoteInput;
    });
}
