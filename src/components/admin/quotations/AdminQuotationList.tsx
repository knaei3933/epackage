'use client';

import { Card, Badge } from '@/components/ui';
import { Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDateJa } from '@/utils/formatters';
import { useState } from 'react';
import type { Quotation } from '@/types/quotation';

interface AdminQuotationListProps {
  quotations: Quotation[];
  selectedQuotation: Quotation | null;
  onSelectQuotation: (quotation: Quotation) => void;
  onSendEmail: (quotation: Quotation) => void;
  statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }>;
}

/**
 * AdminQuotationList - 管理者用見積リストコンポーネント
 * 明細情報を折りたたみ可能で表示
 */
export function AdminQuotationList({
  quotations,
  selectedQuotation,
  onSelectQuotation,
  onSendEmail,
  statusLabels,
}: AdminQuotationListProps) {
  // 各見積もの展開状態を管理
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // 明細情報を取得するヘルパー関数
  const getItemDetails = (quotation: Quotation) => {
    const items = quotation.items || [];
    if (items.length === 0) return null;

    const item = items[0];
    // breakdown.specificationsを優先、なければspecificationsを使用
    const specifications = item.breakdown?.specifications || item.specifications || {};

    // デバッグログ: データ構造を確認
    console.log('[AdminQuotationList] Item data:', {
      quotationId: quotation.id,
      itemId: item.id,
      hasBreakdown: !!item.breakdown,
      hasBreakdownSpecs: !!item.breakdown?.specifications,
      hasDirectSpecs: !!item.specifications,
      specifications,
      breakdown: item.breakdown,
      keys: Object.keys(item)
    });

    // 数量と単価を計算
    const totalQuantity = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
    const unitPrice = quotation.subtotal_amount ? Math.round(quotation.subtotal_amount / totalQuantity) : 0;

    // タイプ表示
    const bagTypeDisplay = specifications.bag_type_display || specifications.bag_type || specifications.bagTypeId || '-';

    // サイズ表示
    let sizeDisplay = '-';
    if (specifications.width && specifications.height) {
      sizeDisplay = `${specifications.width}×${specifications.height}`;
      if (specifications.depth) {
        sizeDisplay += `×${specifications.depth}`;
      }
      sizeDisplay += 'mm';
    } else if (specifications.size) {
      sizeDisplay = specifications.size;
    } else if (specifications.dimensions) {
      sizeDisplay = specifications.dimensions;
    }

    // 素材表示：film_cost_details.materialLayerDetailsから構築
    let materialDisplay = '-';
    const filmCostDetails = specifications.film_cost_details;
    if (filmCostDetails?.materialLayerDetails && filmCostDetails.materialLayerDetails.length > 0) {
      const layers = filmCostDetails.materialLayerDetails;
      materialDisplay = layers
        .map(layer => `${layer.nameJa} ${layer.thicknessMicron}μ`)
        .join(' + ');
    } else if (specifications.material_display || specifications.material || specifications.material_specification) {
      materialDisplay = specifications.material_display || specifications.material || specifications.material_specification;
    }

    // 印刷表示
    const printingDisplay = specifications.printing_display || specifications.printing || '-';

    // 厚さ表示：film_cost_detailsから取得
    let thicknessDisplay = materialDisplay;
    if (filmCostDetails?.materialLayerDetails && filmCostDetails.materialLayerDetails.length > 0) {
      // materialDisplayと同じなので、そのまま使用
      thicknessDisplay = materialDisplay;
    } else if (specifications.thickness_display || specifications.thickness) {
      thicknessDisplay = specifications.thickness_display || specifications.thickness;
    }

    // 後加工表示 - postProcessingOptionsから取得
    const postProcessingOptions = specifications.postProcessingOptions || specifications.post_processing_display || specifications.post_processing || [];

    // 後加工を配列に変換
    const postProcessingList = Array.isArray(postProcessingOptions)
      ? postProcessingOptions
      : typeof postProcessingOptions === 'string'
        ? postProcessingOptions.split(',').map(s => s.trim())
        : [];

    // 後加工の日本語表示マップ（POST_PROCESSING_JAと一致させる）
    const postProcessingLabels: Record<string, string> = {
      'zipper-yes': 'ジッパー付き',
      'zipper-no': 'ジッパーなし',
      'zipper': 'ジッパー',
      'matte': 'マット紙',
      'glossy': '光沢紙',
      'corner-round': '角丸',
      'corner-square': '角直角',
      'hang-hole-6mm': '吊り下げ穴 (6mm)',
      'hang-hole-8mm': '吊り下げ穴 (8mm)',
      'hang-hole-no': '吊り穴なし',
      'notch-yes': 'ノッチ付き',
      'notch-no': 'ノッチなし',
      'valve-yes': 'バルブ付き',
      'valve-no': 'バルブなし',
      'top-open': '上端開封',
      'bottom-open': '下端開封',
      'machi-printing-yes': 'マチ印刷あり',
      'machi-printing-no': 'マチ印刷なし',
      'easy-cut': 'イージーカット',
      'embossing': 'エンボス加工',
    };

    const postProcessingJapanese = postProcessingList
      .map(pp => postProcessingLabels[pp] || pp)
      .join('、');

    // 重量表示
    const weightDisplay = specifications.weight_range || '-';

    // 色数表示
    const colorsDisplay = specifications.colors === 'フルカラー' ? 'フルカラー' : specifications.colors || '-';

    // ジッパー表示
    const zipperDisplay = specifications.zipper || specifications.zipper === true ? 'あり' : '-';

    // SKU情報
    const skuInfo = item.sku_info || item.breakdown?.sku_info;
    const skuCountDisplay = skuInfo ? `${skuInfo.count}種類` : '-';

    return {
      totalQuantity,
      unitPrice,
      bagTypeDisplay,
      sizeDisplay,
      materialDisplay,
      printingDisplay,
      thicknessDisplay,
      postProcessingJapanese,
      weightDisplay,
      colorsDisplay,
      zipperDisplay,
      skuCountDisplay,
      hasData: items.length > 0
    };
  };

  const toggleExpanded = (quotationId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [quotationId]: !prev[quotationId]
    }));
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">見積もり一覧</h2>
      <div className="space-y-3">
        {quotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            見積もりがありません
          </div>
        ) : (
          quotations.map((quotation) => {
            const details = getItemDetails(quotation);
            const totalPrice = quotation.subtotal_amount || quotation.total_amount || 0;
            const isExpanded = expandedItems[quotation.id] || false;

            return (
              <div
                key={quotation.id}
                className={`border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedQuotation?.id === quotation.id ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                {/* ヘッダー: 見積番号とステータス */}
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => onSelectQuotation(quotation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm">{quotation.quotation_number}</p>
                        <Badge variant={statusLabels[quotation.status]?.variant || 'default'} className="text-xs">
                          {statusLabels[quotation.status]?.label || quotation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">{quotation.company_name || quotation.customer_name}</p>
                      <p className="text-xs text-gray-500 truncate">{quotation.customer_email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ¥{totalPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDateJa(quotation.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSendEmail(quotation);
                        }}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        title="メール送信"
                      >
                        <Mail className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* 明細情報（コンパクト表示） */}
                  {details?.hasData && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-700">
                        <span className="font-medium">
                          {details.totalQuantity.toLocaleString()}個 × ¥{details.unitPrice.toLocaleString()}
                        </span>
                        <span className="font-bold text-blue-700">
                          ¥{totalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mt-1 text-xs">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                          {details.bagTypeDisplay}
                        </span>
                        {details.sizeDisplay !== '-' && (
                          <span>{details.sizeDisplay}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 詳細仕様（折りたたみ） */}
                {details?.hasData && (
                  <div className="border-t border-gray-200">
                    <button
                      onClick={() => toggleExpanded(quotation.id)}
                      className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span>詳細仕様</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="px-3 py-2 text-xs bg-gray-50 space-y-1.5">
                        {/* タイプ */}
                        <div className="flex items-center">
                          <span className="text-gray-500 w-16 shrink-0">タイプ:</span>
                          <span className="text-gray-900">{details.bagTypeDisplay}</span>
                        </div>

                        {/* 素材 */}
                        {details.materialDisplay !== '-' ? (
                          <div className="flex items-start">
                            <span className="text-gray-500 w-16 shrink-0">素材:</span>
                            <span className="text-gray-900">{details.materialDisplay}</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <span className="text-gray-500 w-16 shrink-0">素材:</span>
                            <span className="text-gray-400">データなし</span>
                          </div>
                        )}

                        {/* サイズ */}
                        <div className="flex items-center">
                          <span className="text-gray-500 w-16 shrink-0">サイズ:</span>
                          <span className="text-gray-900">{details.sizeDisplay}</span>
                        </div>

                        {/* 印刷 */}
                        {details.printingDisplay && details.printingDisplay !== '-' && (
                          <div className="flex items-center">
                            <span className="text-gray-500 w-16 shrink-0">印刷:</span>
                            <span className="text-gray-900">{details.printingDisplay}</span>
                          </div>
                        )}

                        {/* 色数 */}
                        {details.colorsDisplay && details.colorsDisplay !== '-' && (
                          <div className="flex items-center">
                            <span className="text-gray-500 w-16 shrink-0">色数:</span>
                            <span className="text-gray-900">{details.colorsDisplay}</span>
                          </div>
                        )}

                        {/* 厚さ */}
                        {details.thicknessDisplay && details.thicknessDisplay !== '-' && details.thicknessDisplay !== details.materialDisplay && (
                          <div className="flex items-start">
                            <span className="text-gray-500 w-16 shrink-0">厚さ:</span>
                            <span className="text-gray-900">{details.thicknessDisplay}</span>
                          </div>
                        )}

                        {/* 重量 */}
                        {details.weightDisplay && details.weightDisplay !== '-' && (
                          <div className="flex items-center">
                            <span className="text-gray-500 w-16 shrink-0">重量:</span>
                            <span className="text-gray-900">{details.weightDisplay}</span>
                          </div>
                        )}

                        {/* ジッパー */}
                        {details.zipperDisplay && details.zipperDisplay !== '-' && (
                          <div className="flex items-center">
                            <span className="text-gray-500 w-16 shrink-0">ジッパー:</span>
                            <span className="text-gray-900">{details.zipperDisplay}</span>
                          </div>
                        )}

                        {/* SKU数 */}
                        {details.skuCountDisplay && details.skuCountDisplay !== '-' && (
                          <div className="flex items-center">
                            <span className="text-gray-500 w-16 shrink-0">SKU数:</span>
                            <span className="text-gray-900">{details.skuCountDisplay}</span>
                          </div>
                        )}

                        {/* 後加工 */}
                        {details.postProcessingJapanese && (
                          <div className="flex items-start">
                            <span className="text-gray-500 w-16 shrink-0">後加工:</span>
                            <span className="text-gray-900">{details.postProcessingJapanese}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
