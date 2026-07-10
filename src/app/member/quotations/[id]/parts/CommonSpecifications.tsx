/**
 * Common Specifications section for QuotationDetailClient
 */

'use client';

import { Card } from '@/components/ui';
import { translateBagType, translateMaterialType, translatePostProcessing, BAG_TYPE_JA } from '@/constants/enToJa';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import { getFilmStructureLabel } from '@/constants/materialTypes';
import { getBagTypeName, getMaterialName, getThicknessName, getContentsDisplay } from './specs-helpers';
import { getPrintingLabelJa } from '@/lib/product-display-name';

interface CommonSpecificationsProps {
  quotation: any;
}

export function CommonSpecifications({ quotation }: CommonSpecificationsProps) {
  return (
    <>
      {/* Common Specifications - Display once for all items */}
      {quotation.items?.[0]?.specifications && typeof quotation.items[0].specifications === 'object' && Object.keys(quotation.items[0].specifications).length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">製品仕様（共通）</h2>
          <div className="bg-bg-secondary p-4 rounded-lg space-y-3">
            {/* Contents */}
            {quotation.items[0].specifications && (
              <div className="text-sm">
                <span className="text-text-muted">内容物:</span>
                <span className="ml-2 text-text-primary">
                  {getContentsDisplay(quotation.items[0].specifications)}
                </span>
              </div>
            )}

            {/* Size */}
            {quotation.items[0].specifications && (
              <div className="text-sm">
                <span className="text-text-muted">サイズ:</span>
                <span className="ml-2 text-text-primary">
                  {(() => {
                    const specs = quotation.items[0].specifications;
                    if (specs?.bagTypeId === 'roll_film' || specs?.bagTypeId === 'standup_pouch') {
                      return (
                        <>
                          幅: {specs?.width}mm
                          {specs?.pitch && `、ピッチ: ${specs.pitch}mm`}
                        </>
                      );
                    }
                    const existingDimensions = specs?.dimensions;
                    const sideWidth = specs?.sideWidth;
                    if (existingDimensions) {
                      if (sideWidth && !existingDimensions.includes('側面')) {
                        return existingDimensions.replace(' mm', `×側面${sideWidth} mm`);
                      } else {
                        return existingDimensions;
                      }
                    } else {
                      return (
                        <>
                          {specs?.width}mm × {specs?.height}mm
                          {(specs?.depth && specs?.bagTypeId !== 'lap_seal') && ` × ${specs?.depth}mm`}
                          {specs?.sideWidth && ` × 側面${specs?.sideWidth}mm`}
                        </>
                      );
                    }
                  })()}
                </span>
              </div>
            )}

            {/* Bag Type */}
            {quotation.items[0].specifications?.bagTypeId && (
              <div className="text-sm">
                <span className="text-text-muted">袋タイプ:</span>
                <span className="ml-2 text-text-primary">
                  {getBagTypeName(quotation.items[0].specifications?.bagTypeId)}
                </span>
              </div>
            )}

            {/* Material */}
            {quotation.items[0].specifications?.materialId && (
              <div className="text-sm">
                <span className="text-text-muted">素材:</span>
                <span className="ml-2 text-text-primary">
                  {getMaterialName(quotation.items[0].specifications?.materialId)}
                </span>
              </div>
            )}

            {/* Thickness */}
            {quotation.items[0].specifications?.thicknessSelection && (
              <div className="text-sm">
                <span className="text-text-muted">厚さ:</span>
                <span className="ml-2 text-text-primary">
                  {getThicknessName(
                    quotation.items[0].specifications?.materialId,
                    quotation.items[0].specifications?.thicknessSelection
                  )}
                </span>
              </div>
            )}

            {/* Printing */}
            {(quotation.items[0].specifications?.printingType || quotation.items[0].specifications?.printingColors) && (
              <div className="text-sm">
                <span className="text-text-muted">印刷:</span>
                <span className="ml-2 text-text-primary">
                  {(() => {
                    const pt = quotation.items[0].specifications?.printingType;
                    return getPrintingLabelJa(pt as string | undefined, quotation.items[0].specifications?.cost_breakdown as Record<string, unknown> | null | undefined);
                  })()}
                </span>
              </div>
            )}

            {/* Spout Specifications (スパウトパウチの場合のみ) */}
            {quotation.items[0].specifications?.bagTypeId === 'spout_pouch' && (() => {
              const specs = quotation.items[0].specifications;
              const hasSpoutSpecs = specs?.spoutSize || specs?.spoutPosition || specs?.hasGusset !== undefined;
              if (!hasSpoutSpecs) return null;

              return (
                <>
                  {/* スパウト仕様 */}
                  <div className="text-sm">
                    <span className="text-text-muted">スパウト仕様:</span>
                    <span className="ml-2 text-text-primary">
                      {specs?.spoutSize && `サイズ: ${specs.spoutSize}`}
                      {specs?.spoutPosition && `、位置: ${specs.spoutPosition === 'top-center' ? '上部中央' : specs.spoutPosition === 'top-left' ? '上部左側' : specs.spoutPosition === 'top-right' ? '上部右側' : specs.spoutPosition}`}
                      {specs?.hasGusset !== undefined && `、マチ: ${specs.hasGusset ? 'あり' : 'なし'}`}
                    </span>
                  </div>

                  {/* マチサイズ */}
                  {specs?.sideWidth && (
                    <div className="text-sm">
                      <span className="text-text-muted">マチサイズ:</span>
                      <span className="ml-2 text-text-primary">
                        {specs.sideWidth}mm
                      </span>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Post Processing Options */}
            {quotation.items[0].specifications && (() => {
              const specs = quotation.items[0].specifications;
              const bagTypeId = specs?.bagTypeId as string;
              const isLimitedPostProcessing = bagTypeId === 'roll_film' || bagTypeId === 'standup_pouch';

              // 시일 폭 표시 - sealWidth 필드 우선, 없으면 postProcessingOptions에서 추출
              let sealWidthDisplay = null;
              if (specs.sealWidth) {
                sealWidthDisplay = `シール幅 ${specs.sealWidth}`;
              } else {
                const sealWidthOption = (specs.postProcessingOptions || []).find((opt: string) => opt.startsWith('sealing-width-'));
                if (sealWidthOption) {
                  const widthMatch = sealWidthOption.match(/sealing-width-(.+)$/);
                  if (widthMatch) {
                    sealWidthDisplay = `シール幅 ${widthMatch[1].replace('-', '.')}`;
                  }
                }
              }

              // Issue 3 fix: filter post-processing to only show ACTIVE selections.
              // "none"-type options (zipper-no, valve-no, machi-printing-no, etc.) are excluded
              // unless ALL options are "none", in which case show "なし".
              const allOptions = (specs.postProcessingOptions || []) as string[];

              // Options that represent "none / not selected" — filtered out of active display
              const noneOptionPatterns = [
                'zipper-no', 'valve-no', 'machi-printing-no', 'notch-no', 'hang-hole-no',
                'corner-square',
              ];
              const isNoneOption = (opt: string) =>
                noneOptionPatterns.includes(opt) || /-no$/.test(opt);

              // Remove sealing-width-* (handled separately) and filter out "none" options
              const otherOptions = allOptions.filter((opt: string) =>
                !opt.startsWith('sealing-width-') && !isNoneOption(opt)
              );

              // Limited post-processing (roll_film, standup_pouch): only show surface finish (glossy/matte)
              const allowedOptions = isLimitedPostProcessing
                ? otherOptions.filter((opt: string) => opt === 'glossy' || opt === 'matte')
                : otherOptions;

              const displayOptions = (!isLimitedPostProcessing && sealWidthDisplay)
                ? [{ label: sealWidthDisplay, isSealWidth: true }, ...allowedOptions.map((opt: string) => ({ label: opt, isSealWidth: false }))]
                : allowedOptions.map((opt: string) => ({ label: opt, isSealWidth: false }));

              // If nothing active and no seal width, show "なし"
              if (displayOptions.length === 0) {
                return (
                  <div className="text-sm">
                    <span className="text-text-muted">後加工:</span>
                    <span className="ml-2 text-text-primary">なし</span>
                  </div>
                );
              }

              return (
                <div className="text-sm">
                  <span className="text-text-muted">後加工:</span>
                  <div className="ml-2 mt-1 flex flex-wrap gap-2">
                    {displayOptions.map((item: { label: string; isSealWidth?: boolean }) => {
                      // 시일 폭이면 그대로 표시
                      if (item.isSealWidth) {
                        return (
                          <span
                            key="seal-width"
                            className="px-2 py-1 bg-bg-primary rounded text-xs border border-border-secondary"
                          >
                            {item.label}
                          </span>
                        );
                      }

                      // 標準定義を使用（POST_PROCESSING_JA）
                      const opt = item.label;
                      const standardTranslation = translatePostProcessing(opt);
                      // 標準定義にない項目のみフォールバック
                      const fallbackMap: Record<string, string> = {
                        'notch-straight': '直線ノッチ',
                        'top-open': '上部解放',
                        'bottom-open': '下端解放',
                        'top-sealed': '上部密封',
                        'sealing-width-5mm': 'シール幅 5mm',
                        'sealing-width-7.5mm': 'シール幅 7.5mm',
                        'sealing-width-10mm': 'シール幅 10mm',
                        'machi-printing-yes': 'マチ印刷あり',
                        'machi-printing-no': 'マチ印刷なし',
                      };
                      const label = standardTranslation !== opt ? standardTranslation : fallbackMap[opt] || opt;
                      return (
                        <span
                          key={opt}
                          className="px-2 py-1 bg-bg-primary rounded text-xs border border-border-secondary"
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Delivery Location */}
            {quotation.items[0].specifications?.deliveryLocation && (
              <div className="text-sm">
                <span className="text-text-muted">配送先:</span>
                <span className="ml-2 text-text-primary">
                  {quotation.items[0].specifications?.deliveryLocation === 'domestic' && '国内'}
                  {quotation.items[0].specifications?.deliveryLocation === 'international' && '海外'}
                </span>
              </div>
            )}

            {/* Urgency */}
            {quotation.items[0].specifications?.urgency && (
              <div className="text-sm">
                <span className="text-text-muted">納期:</span>
                <span className="ml-2 text-text-primary">
                  {quotation.items[0].specifications?.urgency === 'urgent' && '急ぎ'}
                  {quotation.items[0].specifications?.urgency === 'standard' && '標準'}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

    </>
  );
}
