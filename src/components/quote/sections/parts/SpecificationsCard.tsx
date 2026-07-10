/**
 * Order specifications confirmation card.
 */

import { Package, Layers, Settings, Truck } from 'lucide-react';
import { safeMap } from '@/lib/array-helpers';
import { getMaterialDescription, getFilmStructureLabel } from '@/constants/materialTypes';
import {
  getBagTypeLabel,
  getPostProcessingLabel,
  getFilteredPostProcessingOptions,
} from '../result-helpers';
import type { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';

import type { QuoteState } from '@/contexts/QuoteContext';

interface MultiQuantityQuote {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  recommendedMethod?: string;
  patternTotalQuantity?: number;
}

interface SpecificationsCardProps {
  state: QuoteState;
  result: UnifiedQuoteResult;
  showPatternComparison: boolean;
  multiQuantityQuotes: MultiQuantityQuote[];
}

export function SpecificationsCard({ state, result, showPatternComparison, multiQuantityQuotes }: SpecificationsCardProps) {
  return (
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* セクションヘッダー */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-navy-600 text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">注文内容の確認</h3>
              <p className="text-xs text-gray-500 mt-0.5">ご指定いただいた仕様・条件のまとめ</p>
            </div>
          </div>
        </div>

        {/* ボディ：2カラム（モバイル1列） */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── 基本仕様 ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Package className="w-4 h-4 text-navy-600 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-gray-900">基本仕様</h4>
              </div>
              <dl className="space-y-2.5 text-sm">
                {/* 内容物 */}
                {(() => {
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
                  const categoryLabel = PRODUCT_CATEGORY_LABELS[state.productCategory || ''];
                  const typeLabel = CONTENTS_TYPE_LABELS[state.contentsType || ''];
                  const ingredientLabel = MAIN_INGREDIENT_LABELS[state.mainIngredient || ''];
                  const environmentLabel = DISTRIBUTION_ENVIRONMENT_LABELS[state.distributionEnvironment || ''];
                  const contentsDisplay = (categoryLabel && typeLabel && ingredientLabel && environmentLabel)
                    ? `${categoryLabel}（${typeLabel}） / ${ingredientLabel} / ${environmentLabel}`
                    : '';
                  return contentsDisplay ? (
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">内容物</dt>
                      <dd className="text-gray-900 font-medium">{contentsDisplay}</dd>
                    </div>
                  ) : null;
                })()}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                  <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">袋タイプ</dt>
                  <dd className="text-gray-900 font-medium">{getBagTypeLabel(state.bagTypeId)}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                  <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">サイズ</dt>
                  <dd className="text-gray-900 font-medium">
                    {state.bagTypeId === 'roll_film'
                      ? `幅: ${state.width} mm`
                      : `${state.width} × ${state.height} ${(state.depth > 0 && state.bagTypeId !== 'lap_seal') ? `× ${state.depth}` : ''} mm`}
                  </dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                  <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">素材</dt>
                  <dd className="text-gray-900 font-medium">{getMaterialDescription(state.materialId, 'ja')}</dd>
                </div>
                {state.thicknessSelection && (
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                    <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">厚さ</dt>
                    <dd className="text-gray-900 font-medium">{getFilmStructureLabel(state.materialId, state.thicknessSelection)}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* ── 数量・印刷 ── */}
            <div className="space-y-3 md:border-l md:border-gray-100 md:pl-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Layers className="w-4 h-4 text-navy-600 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-gray-900">数量・印刷</h4>
              </div>
              <dl className="space-y-2.5 text-sm">
                {showPatternComparison && multiQuantityQuotes.length > 0 ? (
                  <>
                    {multiQuantityQuotes.map((quote, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                        <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">数量{multiQuantityQuotes.length > 1 ? ` ${index + 1}` : ''}</dt>
                        <dd className="text-gray-900 font-medium">
                          {quote.patternTotalQuantity ?? quote.quantity}{state.bagTypeId === 'roll_film' ? 'm' : '個'}
                        </dd>
                      </div>
                    ))}
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">印刷</dt>
                      <dd className="text-gray-900 font-medium">{state.isUVPrinting ? 'UVデジタル印刷' : state.printingType}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">色数</dt>
                      <dd className="text-gray-900 font-medium">{state.printingColors} {state.doubleSided && '（両面）'}</dd>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">数量</dt>
                      <dd className="text-gray-900 font-medium">
                        {
                          state.bagTypeId === 'roll_film' && state.skuQuantities && state.skuQuantities.length > 0
                            ? state.skuQuantities[0].toLocaleString()
                            : state.quantity.toLocaleString()
                        }{state.bagTypeId === 'roll_film' ? 'm' : '個'}
                      </dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">印刷</dt>
                      <dd className="text-gray-900 font-medium">{state.isUVPrinting ? 'UVデジタル印刷' : state.printingType}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                      <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">色数</dt>
                      <dd className="text-gray-900 font-medium">{state.printingColors} {state.doubleSided && '（両面）'}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* ── 後加工（全幅・条件付き） ── */}
          {state.postProcessingOptions && state.postProcessingOptions.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Settings className="w-4 h-4 text-navy-600 flex-shrink-0" />
                <h4 className="text-sm font-semibold text-gray-900">後加工</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {safeMap(getFilteredPostProcessingOptions(state.postProcessingOptions, state.bagTypeId), option => (
                  <span
                    key={option}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-700"
                  >
                    {getPostProcessingLabel(option)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── 配送・納期（全幅） ── */}
          <div className="space-y-3 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Truck className="w-4 h-4 text-navy-600 flex-shrink-0" />
              <h4 className="text-sm font-semibold text-gray-900">配送・納期</h4>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">配送先</dt>
                <dd className="text-gray-900 font-medium">{state.deliveryLocation === 'domestic' ? '国内' : '海外'}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
                <dt className="text-xs text-gray-500 sm:w-24 sm:flex-shrink-0 uppercase tracking-wide">納期</dt>
                <dd className="text-gray-900 font-medium">
                  {state.urgency === 'standard' ? '標準' : '迅速'}
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-navy-50 text-navy-700">
                    {result.leadTimeDays}日
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
  );
}
