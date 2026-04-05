/**
 * QuotationList Component
 *
 * 見積もりリストコンポーネント
 *
 * 見積もりカードのリスト表示を担当
 *
 * @module components/member/quotations/QuotationList
 */

'use client';

import React from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Eye, Download, Trash2, FileText, Calendar, Clock, Package, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { QuotationStatusBadge } from '@/components/quotations/StatusBadge';
import { QuotationCard } from '@/components/quotations/QuotationCard';
import { formatPrice } from '@/utils/formatters';
import { PostProcessingPreview } from '@/components/quote/previews/PostProcessingPreview';
import { safeMap } from '@/lib/array-helpers';
import {
  BAG_TYPE_IMAGES,
  MEMBER_STATUS_LABELS,
  MEMBER_STATUS_VARIANTS,
  convertToPreviewOptions
} from '@/constants/product-type-config';
import { translateBagType, translateMaterialType, BAG_TYPE_JA, POST_PROCESSING_JA } from '@/constants/enToJa';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import type { Quotation, QuotationStatus } from '@/types/entities';

export interface QuotationListProps {
  /** 見積もりデータ配列 */
  quotations: Quotation[];
  /** PDFダウンロード中の見積もりID */
  downloadingQuoteId?: string | null;
  /** 削除中の見積もりID */
  deletingQuoteId?: string | null;
  /** ダウンロード統計 */
  downloadStats?: Record<string, { count: number; lastDownloadedAt: string | null }>;
  /** PDFダウンロードハンドラー */
  onDownloadPDF: (quotation: Quotation) => void;
  /** 削除ハンドラー */
  onDeleteQuotation?: (quotationId: string) => void;
  /** 詳細表示ハンドラー */
  onViewDetails?: (quotation: Quotation) => void;
  /** 注文変換ハンドラー */
  onConvertToOrder?: (quotation: Quotation) => void;
  /** 現在選択されているステータス（フィルター） */
  selectedStatus?: QuotationStatus | 'all';
  /** フィルターオプション */
  statusFilterOptions?: Array<{ value: string; label: string }>;
  /** 空状態メッセージ */
  emptyMessage?: string;
}

/**
 * QuotationList コンポーネント
 */
export function QuotationList({
  quotations,
  downloadingQuoteId = null,
  deletingQuoteId = null,
  downloadStats = {},
  onDownloadPDF,
  onDeleteQuotation,
  onViewDetails,
  onConvertToOrder,
  selectedStatus = 'all',
  statusFilterOptions = [],
  emptyMessage
}: QuotationListProps) {
  // 空状態
  if (quotations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-text-muted mb-4">
          {emptyMessage || (
            selectedStatus === 'all'
              ? '見積依頼がありません'
              : statusFilterOptions.find((o) => o.value === selectedStatus)?.label + "の見積はありません"
          )}
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            ↻ 更新
          </Button>
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/quote-simulator')}
          >
            見積を作成する
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {quotations.map((quotation) => (
        <Card key={quotation.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200">
          {/* Top Section - Header with Meta Information */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between gap-6">
              {/* Left - Number and Status */}
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                      {quotation.quotationNumber}
                    </h3>
                    <Badge variant={MEMBER_STATUS_VARIANTS[quotation.status]} size="md" className="font-semibold">
                      {MEMBER_STATUS_LABELS[quotation.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {quotation.validUntil ? (
                          <>有効期限: {new Date(quotation.validUntil).toLocaleDateString('ja-JP')}</>
                        ) : (
                          <>有効期限: 設定されていません</>
                        )}
                      </span>
                    </div>
                    {quotation.sentAt && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>送信: {new Date(quotation.sentAt).toLocaleDateString('ja-JP')}</span>
                      </div>
                    )}
                    {downloadStats[quotation.id]?.count > 0 && (
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <Download className="w-4 h-4" />
                        <span className="font-medium">
                          {downloadStats[quotation.id].count}回
                          {downloadStats[quotation.id].lastDownloadedAt && (
                            <span className="text-gray-500 font-normal">
                              {' '}(最後: {new Date(downloadStats[quotation.id].lastDownloadedAt!).toLocaleDateString('ja-JP')})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right - Total Price and Creation Date */}
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {formatPrice(quotation.totalAmount || quotation.total_amount || 0)}
                  <span className="text-xl ml-1">円</span>
                </div>
                <div className="text-xs text-gray-500">
                  {quotation.createdAt ? (
                    formatDistanceToNow(new Date(quotation.createdAt), {
                      addSuffix: true,
                      locale: ja,
                    })
                  ) : (
                    '作成日不明'
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          <div className="px-6 pt-4">
            {(quotation.status === 'DRAFT' || quotation.status === 'draft') && (
              <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900 mb-1">管理者による内容確認中</p>
                    <p className="text-sm text-amber-700">承認完了後、注文確定ボタンが表示されます</p>
                  </div>
                </div>
              </div>
            )}

            {(quotation.status === 'APPROVED' || quotation.status === 'approved' || quotation.status === 'QUOTATION_APPROVED') && (
              <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-1">承認完了 - 注文可能です</p>
                    <p className="text-sm text-green-700">右側の「注文に変換」ボタンをクリックして注文を確定してください</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Product Details Section - Takes 2 columns on large screens */}
              <div className="lg:col-span-2 space-y-4">
                {/* Product Type Card */}
                {quotation.items?.[0] && (() => {
                  const breakdown = quotation.items[0].breakdown;
                  const specs = breakdown?.specifications || quotation.items[0].specifications || {};

                  const enrichedSpecs = {
                    ...specs,
                    width: specs.width || specs.size?.width || breakdown?.width,
                    height: specs.height || specs.size?.height || breakdown?.height,
                    depth: specs.depth || specs.size?.depth || breakdown?.depth || specs.sideWidth,
                  };

                  let bagTypeId = enrichedSpecs.bagTypeId || enrichedSpecs.bag_type || enrichedSpecs.type;
                  let bagTypeInfo = bagTypeId ? BAG_TYPE_IMAGES[bagTypeId] : null;

                  if (!bagTypeInfo && bagTypeId) {
                    const jaName = translateBagType(bagTypeId);
                    if (jaName && jaName !== '-') {
                      const entry = Object.entries(BAG_TYPE_IMAGES).find(([key, value]) => value.name === jaName);
                      if (entry) {
                        bagTypeId = entry[0];
                        bagTypeInfo = BAG_TYPE_IMAGES[bagTypeId];
                      }
                    }
                  }

                  if (!bagTypeInfo && bagTypeId) {
                    const jaName = BAG_TYPE_JA[bagTypeId as keyof typeof BAG_TYPE_JA];
                    if (jaName) {
                      const entry = Object.entries(BAG_TYPE_IMAGES).find(([key, value]) => value.name === jaName);
                      if (entry) {
                        bagTypeId = entry[0];
                        bagTypeInfo = BAG_TYPE_IMAGES[bagTypeId];
                      }
                    }
                  }

                  if (!bagTypeInfo) return null;

                  const productCategoryMap: Record<string, string> = {
                    'food': '食品',
                    'cosmetics': '化粧品',
                    'medicine': '医薬品',
                    'other': 'その他'
                  };
                  const contentsTypeMap: Record<string, string> = {
                    'solid': '固形',
                    'liquid': '液状',
                    'powder': '粉状'
                  };
                  const mainIngredientMap: Record<string, string> = {
                    'general_neutral': '一般・中性',
                    'oily': '油性・界面活性剤',
                    'acidic_alkaline': '酸性・アルカリ性'
                  };
                  const distributionEnvironmentMap: Record<string, string> = {
                    'room_temperature': '一般（常温）',
                    'refrigerated': '冷蔵',
                    'frozen': '冷凍'
                  };

                  const contentsJa = [
                    enrichedSpecs.productCategory ? productCategoryMap[enrichedSpecs.productCategory] : null,
                    enrichedSpecs.contentsType ? contentsTypeMap[enrichedSpecs.contentsType] : null,
                    enrichedSpecs.mainIngredient ? mainIngredientMap[enrichedSpecs.mainIngredient] : null,
                    enrichedSpecs.distributionEnvironment ? distributionEnvironmentMap[enrichedSpecs.distributionEnvironment] : null,
                  ].filter(Boolean).join('、') || '-';

                  const printingJa = enrichedSpecs.printingType === 'digital'
                    ? 'デジタル印刷（フルカラー）'
                    : enrichedSpecs.printingType === 'gravure' ? 'グラビア印刷（フルカラー）' : '-';

                  const deliveryJa = enrichedSpecs.deliveryLocation === 'domestic' ? '国内' : enrichedSpecs.deliveryLocation === 'international' ? '海外' : '-';
                  const urgencyJa = enrichedSpecs.urgency === 'standard' ? '標準' : enrichedSpecs.urgency === 'express' ? '急ぎ' : '-';

                  const isLimitedPostProcessing = enrichedSpecs.bagTypeId === 'roll_film' || enrichedSpecs.bagTypeId === 'spout_pouch';
                  const filteredOptions = (enrichedSpecs.postProcessingOptions || [])
                    .filter((opt: string) => !opt.startsWith('sealing-width-'));
                  const filteredPostProcessingOptions = isLimitedPostProcessing
                    ? filteredOptions.filter((opt: string) => opt === 'glossy' || opt === 'matte')
                    : filteredOptions;

                  const postProcessingList = filteredPostProcessingOptions.map((opt: string) => {
                    return POST_PROCESSING_JA[opt as keyof typeof POST_PROCESSING_JA] || opt;
                  }).filter(Boolean);

                  let sealWidthDisplay: string | null = null;
                  if (enrichedSpecs.sealWidth) {
                    sealWidthDisplay = `シール幅 ${enrichedSpecs.sealWidth}`;
                  } else {
                    const sealWidthOption = (enrichedSpecs.postProcessingOptions || []).find((opt: string) => opt.startsWith('sealing-width-'));
                    if (sealWidthOption) {
                      const widthMatch = sealWidthOption.match(/sealing-width-(.+)$/);
                      if (widthMatch) {
                        const width = widthMatch[1].replace('-', '.');
                        sealWidthDisplay = `シール幅 ${width}`;
                      }
                    }
                  }

                  const finalPostProcessingList = [...postProcessingList];
                  if (sealWidthDisplay && !isLimitedPostProcessing) {
                    finalPostProcessingList.unshift(sealWidthDisplay);
                  }

                  return (
                    <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-blue-300">
                      {/* Product Type Header - Enhanced */}
                      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-500">
                        <div className="flex items-center gap-5">
                          <div className="w-28 h-28 relative bg-white rounded-xl p-3 shadow-xl flex-shrink-0">
                            <img
                              src={bagTypeInfo.image}
                              alt={bagTypeInfo.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-black text-2xl drop-shadow-md mb-1">{bagTypeInfo.name}</div>
                            <div className="text-blue-100 text-base font-medium">製品タイプ</div>
                          </div>
                        </div>
                      </div>

                      {/* Specifications Body - Enhanced */}
                      <div className="p-6 bg-gradient-to-b from-blue-50 to-white">
                        {/* Specifications Title */}
                        <div className="mb-5 pb-3 border-b-2 border-blue-200">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-700" />
                            <div className="text-base font-bold text-blue-900">詳細仕様</div>
                          </div>
                        </div>

                        {/* Specifications Grid - Enhanced */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          {/* Each specification item */}
                          {[
                            { label: '内容物', value: contentsJa },
                            { label: 'サイズ', value: (enrichedSpecs.width && enrichedSpecs.height
                              ? `${enrichedSpecs.width} x ${enrichedSpecs.height}${enrichedSpecs.depth ? ` x ${enrichedSpecs.depth}` : ''} mm`
                              : enrichedSpecs.size || '-') },
                            { label: '袋タイプ', value: translateBagType(enrichedSpecs.bagTypeId) },
                            { label: '素材', value: translateMaterialType(enrichedSpecs.materialId) },
                            { label: '厚さ', value: enrichedSpecs.material_specification || enrichedSpecs.thickness_display || enrichedSpecs.weight_range || getMaterialSpecification(enrichedSpecs.materialId, enrichedSpecs.printingType) || '-' },
                            { label: '印刷', value: printingJa },
                            { label: '納期', value: urgencyJa },
                            { label: '配送先', value: deliveryJa },
                          ].map((spec, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-200 hover:shadow-sm transition-all">
                              <div className="flex-shrink-0 w-20 font-bold text-gray-700 text-xs uppercase tracking-wide">
                                {spec.label}
                              </div>
                              <div className="flex-1 text-gray-900 font-medium leading-snug">
                                {spec.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Post Processing Options - Enhanced */}
                        {finalPostProcessingList.length > 0 && (
                          <div className="mt-5 pt-5 border-t-2 border-blue-200">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="font-bold text-gray-700 text-xs uppercase tracking-wide">後加工:</div>
                              <div className="flex flex-wrap gap-2">
                                {finalPostProcessingList.map((pp, idx) => (
                                  <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-shadow">
                                    {pp}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Side Width - Enhanced */}
                        {enrichedSpecs.sideWidth && (
                          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="font-bold text-amber-900 text-xs uppercase tracking-wide">マチサイズ:</span>
                            <span className="ml-3 font-bold text-amber-800">{enrichedSpecs.sideWidth}mm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Post Processing Preview */}
                {quotation.items?.[0]?.breakdown?.specifications && (
                  <PostProcessingPreview
                    selectedOptions={convertToPreviewOptions(quotation.items[0].breakdown.specifications.postProcessingOptions || [])}
                    className="rounded-xl"
                  />
                )}
              </div>

              {/* Right Sidebar - SKU Items and Actions */}
              <div className="space-y-4">
                {/* SKU Items Card */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-300">
                    <Package className="w-5 h-5 text-gray-700" />
                    <h4 className="font-bold text-gray-900">SKUアイテム</h4>
                  </div>
                  <div className="space-y-2">
                    {safeMap((quotation.items || []).slice(0, 3), (item) => {
                      const specs = item.breakdown?.specifications || item.specifications || {};
                      const skuQuantities = specs.sku_quantities;
                      const hasMultipleSKUs = skuQuantities && skuQuantities.length > 1;

                      return (
                        <div key={item.id} className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                              {hasMultipleSKUs ? (
                                <>
                                  <span>SKU分割: {skuQuantities.length}種類</span>
                                  <span className="text-gray-400">合計: {skuQuantities.reduce((sum: number, q: number) => sum + q, 0)}個</span>
                                </>
                              ) : (
                                <span>{item.productName || `SKU ${item.id}`}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-blue-600">
                              {formatPrice(item.unitPrice * item.quantity)}円
                            </span>
                            {quotation.status === 'CONVERTED' || quotation.status === 'converted' ? (
                              item.orderId ? (
                                <a
                                  href={`/member/orders/${item.orderId}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = `/member/orders/${item.orderId}`;
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
                                >
                                  注文を確認 →
                                </a>
                              ) : (
                                <span className="text-xs text-gray-500">注文詳細で確認</span>
                              )
                            ) : (
                              <Badge variant="secondary" size="sm">未注文</Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {quotation.items && quotation.items.length > 3 && (
                      <div className="text-center py-2 text-sm text-gray-500 bg-gray-100 rounded-lg">
                        他 {quotation.items.length - 3} 点
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons Card */}
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                  <div className="flex flex-col gap-3">
                    {/* View Details */}
                    <a
                      href={`/member/quotations/${quotation.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/member/quotations/${quotation.id}`;
                      }}
                      className="block"
                    >
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full group/btn font-semibold"
                      >
                        <Eye className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                        詳細を見る
                      </Button>
                    </a>

                    {/* PDF Download */}
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => onDownloadPDF(quotation)}
                      disabled={downloadingQuoteId === quotation.id}
                      className="w-full group/btn font-semibold border-2"
                    >
                      <Download className={`w-5 h-5 transition-transform ${downloadingQuoteId === quotation.id ? 'animate-spin' : 'group-hover/btn:scale-110'}`} />
                      {downloadingQuoteId === quotation.id ? 'PDF作成中...' : 'PDFダウンロード'}
                    </Button>

                    {/* Delete Button - DRAFT only */}
                    {(quotation.status === 'DRAFT' || quotation.status === 'draft' || quotation.status === 'QUOTATION_PENDING') && onDeleteQuotation && (
                      <Button
                        variant="destructive"
                        size="md"
                        onClick={() => onDeleteQuotation(quotation.id)}
                        disabled={deletingQuoteId === quotation.id}
                        className="w-full group/btn font-semibold"
                      >
                        <Trash2 className={`w-5 h-5 transition-transform ${deletingQuoteId === quotation.id ? 'animate-pulse' : 'group-hover/btn:scale-110'}`} />
                        {deletingQuoteId === quotation.id ? '削除中...' : '削除'}
                      </Button>
                    )}

                    {/* Convert to Order Button - APPROVED only */}
                    {(quotation.status === 'APPROVED' || quotation.status === 'approved' || quotation.status === 'QUOTATION_APPROVED') && onConvertToOrder && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => onConvertToOrder(quotation)}
                        className="w-full group/btn font-bold shadow-lg hover:shadow-xl text-base py-3"
                      >
                        <FileText className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                        注文に変換
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default QuotationList;
