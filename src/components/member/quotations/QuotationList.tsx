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
import { Eye, Download, Trash2, FileText } from 'lucide-react';
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
    <div className="space-y-4">
      {quotations.map((quotation) => (
        <Card key={quotation.id} className="p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* ヘッダー */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-text-primary">
                  {quotation.quotationNumber}
                </span>
                <Badge variant={MEMBER_STATUS_VARIANTS[quotation.status]} size="sm">
                  {MEMBER_STATUS_LABELS[quotation.status]}
                </Badge>
              </div>

              {/* メタ情報 */}
              <p className="text-sm text-text-muted mb-3">
                {quotation.validUntil ? (
                  <>有効期限: {new Date(quotation.validUntil).toLocaleDateString('ja-JP')}</>
                ) : (
                  <>有効期限: 設定されていません</>
                )}
                {quotation.sentAt && (
                  <span className="ml-3">
                    送信日: {new Date(quotation.sentAt).toLocaleDateString('ja-JP')}
                  </span>
                )}
              </p>

              {/* ステータス別メッセージ */}
              {(quotation.status === 'DRAFT' || quotation.status === 'draft') && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 text-lg">⏳</span>
                    <div className="text-sm">
                      <p className="font-medium text-blue-800">現在、管理者による内容確認中です</p>
                      <p className="text-xs mt-1 text-blue-600">承認完了後、注文確定ボタンが表示されます</p>
                    </div>
                  </div>
                </div>
              )}

              {(quotation.status === 'APPROVED' || quotation.status === 'approved' || quotation.status === 'QUOTATION_APPROVED') && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <div className="text-sm">
                      <p className="font-medium text-green-800">管理者の承認が完了しました</p>
                      <p className="text-xs mt-1 text-green-600">右側の「注文に変換」ボタンをクリックして注文を確定してください</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 製品仕様プレビュー */}
              {quotation.items?.[0] && (() => {
                const breakdown = quotation.items[0].breakdown;
                let specs = breakdown?.specifications || quotation.items[0].specifications || {};

                // Extract dimensions from various possible sources
                const width = enrichedSpecs.width || enrichedSpecs.size?.width || breakdown?.width;
                const height = enrichedSpecs.height || enrichedSpecs.size?.height || breakdown?.height;
                const depth = enrichedSpecs.depth || enrichedSpecs.size?.depth || breakdown?.depth || enrichedSpecs.sideWidth;

                // Create enriched specs with dimensions
                const enrichedSpecs = {
                  ...specs,
                  width: width || undefined,
                  height: height || undefined,
                  depth: depth || undefined,
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

                const productCategoryMap = {
                  'food': '食品',
                  'cosmetics': '化粧品',
                  'medicine': '医薬品',
                  'other': 'その他'
                };
                const contentsTypeMap = {
                  'solid': '固形',
                  'liquid': '液状',
                  'powder': '粉状'
                };
                const mainIngredientMap = {
                  'general_neutral': '一般・中性',
                  'oily': '油性・界面活性剤',
                  'acidic_alkaline': '酸性・アルカリ性'
                };
                const distributionEnvironmentMap = {
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

                let sealWidthDisplay = null;
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
                  <div className="mb-4 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* 製品タイプ画像 */}
                      <div className="flex-shrink-0">
                        <div className="w-36 h-36 lg:w-44 lg:h-44 relative bg-white rounded-xl p-3 shadow-md">
                          <img
                            src={bagTypeInfo.image}
                            alt={bagTypeInfo.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      </div>

                      {/* 製品仕様 */}
                      <div className="flex-1">
                        <div className="border-b border-blue-200 pb-2 mb-3">
                          <h3 className="text-lg font-bold text-blue-900">
                            詳細仕様
                          </h3>
                        </div>

                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 font-medium flex-shrink-0">内容物:</span>
                              <span className="text-gray-900">{contentsJa}</span>
                            </div>
                            {(enrichedSpecs.width || enrichedSpecs.height || enrichedSpecs.depth || enrichedSpecs.size) && (
                              <div className="flex items-start gap-2">
                                <span className="text-gray-600 font-medium flex-shrink-0">サイズ:</span>
                                <span className="text-gray-900">
                                  {enrichedSpecs.width && enrichedSpecs.height
                                    ? `${enrichedSpecs.width} x ${enrichedSpecs.height}${enrichedSpecs.depth ? ` x ${enrichedSpecs.depth}` : ''} mm`
                                    : enrichedSpecs.size || '-'}
                                </span>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 font-medium flex-shrink-0">袋タイプ:</span>
                              <span className="text-gray-900">{translateBagType(enrichedSpecs.bagTypeId)}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 font-medium flex-shrink-0">素材:</span>
                              <span className="text-gray-900">{translateMaterialType(enrichedSpecs.materialId)}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 font-medium flex-shrink-0">厚さ:</span>
                              <span className="text-gray-900">
                                {enrichedSpecs.material_specification || enrichedSpecs.thickness_display || enrichedSpecs.weight_range || getMaterialSpecification(enrichedSpecs.materialId, enrichedSpecs.printingType) || '-'}
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 font-medium flex-shrink-0">印刷:</span>
                              <span className="text-gray-900">{printingJa}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 font-medium flex-shrink-0">納期:</span>
                              <span className="text-gray-900">{urgencyJa}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-gray-600 font-medium flex-shrink-0">配送先:</span>
                              <span className="text-gray-900">{deliveryJa}</span>
                            </div>
                          </div>

                          {/* 後加工オプション */}
                          {finalPostProcessingList.length > 0 && (
                            <div className="pt-3 border-t border-blue-100">
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                                <span className="text-gray-600 font-medium">後加工:</span>
                                {finalPostProcessingList.map((pp, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                    {pp}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {enrichedSpecs.sideWidth && (
                            <div className="pt-2 border-t border-blue-100 text-sm">
                              <span className="text-gray-600 font-medium">マチサイズ:</span>
                              <span className="text-gray-900 ml-2">{enrichedSpecs.sideWidth}mm</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Post Processing Preview */}
              {quotation.items?.[0]?.breakdown?.specifications && (
                <PostProcessingPreview
                  selectedOptions={convertToPreviewOptions(quotation.items[0].breakdown.specifications.postProcessingOptions || [])}
                  className="mb-3"
                />
              )}

              {/* SKU Items */}
              <div className="text-sm text-text-muted space-y-1 mb-3">
                {safeMap((quotation.items || []).slice(0, 3), (item) => {
                  const specs = item.breakdown?.specifications || item.specifications || {};
                  const skuQuantities = enrichedSpecs.sku_quantities;
                  const hasMultipleSKUs = skuQuantities && skuQuantities.length > 1;

                  return (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded bg-bg-secondary/30">
                      <div className="flex items-center gap-2">
                        {hasMultipleSKUs ? (
                          <>
                            <span className="text-text-primary font-medium">SKU分割: {skuQuantities.length}種類</span>
                            <span className="text-border-secondary">合計: {skuQuantities.reduce((sum: number, q: number) => sum + q, 0)}個</span>
                          </>
                        ) : (
                          <span className="text-text-primary font-medium">{item.productName || `SKU ${item.id}`}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-semibold">
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
                              className="text-xs text-primary hover:underline cursor-pointer"
                            >
                              注文を確認
                            </a>
                          ) : (
                            <span className="text-xs text-text-muted">注文詳細で確認</span>
                          )
                        ) : (
                          <Badge variant="secondary" size="sm">未注文</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                {quotation.items && quotation.items.length > 3 && (
                  <p className="text-text-muted text-center">
                    他 {quotation.items.length - 3} 点
                  </p>
                )}
              </div>

              {/* 合計金額 */}
              <div className="text-lg font-semibold text-text-primary">
                合計: {formatPrice(quotation.totalAmount || quotation.total_amount || 0)}円
              </div>

              {/* Download History */}
              {downloadStats[quotation.id]?.count > 0 && (
                <div className="flex items-center gap-2 text-xs text-text-muted mt-2">
                  <Download className="w-3 h-3" />
                  <span>
                    PDFダウンロード {downloadStats[quotation.id].count}回
                    {downloadStats[quotation.id].lastDownloadedAt && (
                      <>
                        {' '}(最後: {new Date(downloadStats[quotation.id].lastDownloadedAt!).toLocaleDateString('ja-JP')})
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* アクションボタン */}
            <div className="text-right shrink-0">
              <div className="text-xs text-text-muted mb-3">
                {quotation.createdAt ? (
                  formatDistanceToNow(new Date(quotation.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })
                ) : (
                  '作成日不明'
                )}
              </div>
              <div className="flex flex-col gap-2.5">
                {/* 詳細表示ボタン */}
                <a
                  href={`/member/quotations/${quotation.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/member/quotations/${quotation.id}`;
                  }}
                  className="block"
                >
                  <Button variant="secondary" size="sm" className="w-full group/btn">
                    <Eye className="w-4 h-4 mr-1.5 transition-transform group-hover/btn:scale-110" />
                    詳細を見る
                  </Button>
                </a>

                {/* PDFダウンロードボタン */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadPDF(quotation)}
                  disabled={downloadingQuoteId === quotation.id}
                  className="w-full group/btn"
                >
                  <Download className={`w-4 h-4 mr-1.5 transition-transform ${downloadingQuoteId === quotation.id ? 'animate-spin' : 'group-hover/btn:scale-110'}`} />
                  {downloadingQuoteId === quotation.id ? 'PDF作成中...' : 'PDFダウンロード'}
                </Button>

                {/* 削除ボタン - DRAFTステータスのみ */}
                {(quotation.status === 'DRAFT' || quotation.status === 'draft' || quotation.status === 'QUOTATION_PENDING') && onDeleteQuotation && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteQuotation(quotation.id)}
                    disabled={deletingQuoteId === quotation.id}
                    className="w-full group/btn"
                  >
                    <Trash2 className={`w-4 h-4 mr-1.5 transition-transform ${deletingQuoteId === quotation.id ? 'animate-pulse' : 'group-hover/btn:scale-110'}`} />
                    {deletingQuoteId === quotation.id ? '削除中...' : '削除'}
                  </Button>
                )}

                {/* 注文変換ボタン - APPROVEDステータスのみ */}
                {(quotation.status === 'APPROVED' || quotation.status === 'approved' || quotation.status === 'QUOTATION_APPROVED') && onConvertToOrder && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onConvertToOrder(quotation)}
                    className="w-full group/btn shadow-md hover:shadow-lg"
                  >
                    <FileText className="w-4 h-4 mr-1.5 transition-transform group-hover/btn:scale-110" />
                    注文に変換
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default QuotationList;
