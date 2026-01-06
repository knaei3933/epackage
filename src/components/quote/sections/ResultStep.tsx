/**
 * ResultStep Component
 *
 * Displays quote results with PDF download and save functionality
 * Extracted from ImprovedQuotingWizard for better maintainability
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuote, useQuoteState } from '@/contexts/QuoteContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext';
import { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import { generateQuotePDF, QuoteData } from '@/lib/pdf-generator';
import { safeMap } from '@/lib/array-helpers';
import MultiQuantityComparisonTable from '../MultiQuantityComparisonTable';
import { MATERIAL_TYPE_LABELS_JA, getMaterialDescription } from '@/constants/materialTypes';
import { RefreshCw, BarChart3, Download } from 'lucide-react';
import type { MultiQuantityResult } from '@/types/multi-quantity';

interface ResultStepProps {
  result: UnifiedQuoteResult;
  multiQuantityResult: MultiQuantityResult | null;
  onReset: () => void;
}

/**
 * Component for displaying quote results with actions
 */
export function ResultStep({ result, multiQuantityResult, onReset }: ResultStepProps) {
  const state = useQuoteState();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Get multi-quantity state at component level (before any handlers)
  const { state: multiQuantityState } = useMultiQuantityQuote();

  // Get multi-quantity calculations from prop first, then fallback to context
  const multiQuantityCalculations = multiQuantityResult?.calculations || multiQuantityState.multiQuantityResults;
  const hasMultiQuantityResults = multiQuantityCalculations && multiQuantityCalculations.size > 0;

  // Build quotes array from multi-quantity results
  const multiQuantityQuotes = hasMultiQuantityResults
    ? Array.from(multiQuantityCalculations.entries()).map(([quantity, quote]) => ({
        quantity: quantity,
        unitPrice: quote.unitPrice,
        totalPrice: quote.totalPrice,
        discountRate: 0,
        priceBreak: '通常',
        leadTimeDays: quote.leadTimeDays || result.leadTimeDays,
        isValid: true
      })).sort((a, b) => a.quantity - b.quantity)
    : [];

  // Helper function to get material description in Japanese
  const getMaterialDescriptionJa = (materialId: string): string => {
    const descriptions: Record<string, string> = {
      'pet_al': 'PET+AL (高バリア)',
      'pet_vmpet': 'PET+VMPET (蒸着)',
      'pet_ldpe': 'PET+LLDPE (透明)',
      'pet_ny_al': 'PET+NY+AL (超高バリア)'
    };
    return descriptions[materialId] || materialId;
  };

  // Get material label (for PDF display)
  const getMaterialLabelJa = (materialId: string): string => {
    return MATERIAL_TYPE_LABELS_JA[materialId as keyof typeof MATERIAL_TYPE_LABELS_JA] || materialId;
  };

  // Get film structure specification from materials data
  const getFilmStructureSpec = (materialId: string, thicknessId: string): string => {
    const materials = [
      {
        id: 'pet_al',
        thicknessOptions: [
          { id: 'light', specificationEn: 'PET 12μ + AL 7μ + PET 12μ + PE 60μ' },
          { id: 'medium', specificationEn: 'PET 12μ + AL 7μ + PET 12μ + PE 80μ' },
          { id: 'heavy', specificationEn: 'PET 12μ + AL 7μ + PET 12μ + PE 100μ' },
          { id: 'ultra', specificationEn: 'PET 12μ + AL 7μ + PET 12μ + PE 110μ' }
        ]
      },
      {
        id: 'pet_vmpet',
        thicknessOptions: [
          { id: 'light', specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + PE 60μ' },
          { id: 'medium', specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + PE 80μ' },
          { id: 'heavy', specificationEn: 'PET 12μ + AL VMPET 7μ + PET 12μ + PE 100μ' }
        ]
      },
      {
        id: 'pet_ldpe',
        thicknessOptions: [
          { id: 'medium', specificationEn: 'PET 12μ + LLDPE 110μ' },
          { id: 'heavy', specificationEn: 'PET 12μ + LLDPE 120μ' },
          { id: 'ultra', specificationEn: 'PET 12μ + LLDPE 130μ' }
        ]
      },
      {
        id: 'pet_ny_al',
        thicknessOptions: [
          { id: 'light', specificationEn: 'PET 12μ + NY 16μ + AL 7μ + PE 60μ' },
          { id: 'medium', specificationEn: 'PET 12μ + NY 16μ + AL 7μ + PE 80μ' },
          { id: 'heavy', specificationEn: 'PET 12μ + NY 16μ + AL 7μ + PE 100μ' }
        ]
      }
    ];

    const material = materials.find(m => m.id === materialId);
    if (material) {
      const thickness = material.thicknessOptions.find(t => t.id === thicknessId);
      if (thickness) {
        return thickness.specificationEn;
      }
    }
    return '指定なし';
  };

  // Helper function to get bag type description in Japanese
  const getBagTypeDescriptionJa = (bagTypeId: string): string => {
    const descriptions: Record<string, string> = {
      'flat_3_side': '三方シール平袋',
      'stand_up': 'スタンドパウチ',
      'box': 'BOX型パウチ',
      'spout_pouch': 'スパウトパウチ',
      'roll_film': 'ロールフィルム'
    };
    return descriptions[bagTypeId] || bagTypeId;
  };

  // Helper function to get bag type label
  const getBagTypeLabel = (bagTypeId: string): string => {
    const labels: Record<string, string> = {
      'flat_3_side': '三方シール平袋',
      'stand_up': 'スタンドパウチ',
      'box': 'BOX型パウチ',
      'spout_pouch': 'スパウトパウチ',
      'roll_film': 'ロールフィルム'
    };
    return labels[bagTypeId] || bagTypeId;
  };

  // Helper function to get post-processing label
  const getPostProcessingLabel = (optionId: string): string => {
    const labels: Record<string, string> = {
      'zipper-yes': 'ジッパー付き',
      'zipper-no': 'ジッパーなし',
      'hanging_hole-6mm': '吊り下げ穴 (6mm)',
      'hanging_hole-8mm': '吊り下げ穴 (8mm)',
      'zipper-position-delegate': 'ジッパー位置 (お任せ)',
      'zipper-position-specify': 'ジッパー位置 (指定)'
    };
    return labels[optionId] || optionId.replace('_', ' ');
  };

  // Helper to generate PDF quote data
  const generateQuoteData = (): QuoteData => {
    const today = new Date();
    const issueDate = today.toISOString().split('T')[0];
    const expiryDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Build items from multi-quantity quotes or single quote
    const items = hasMultiQuantityResults && multiQuantityQuotes.length > 0
      ? multiQuantityQuotes.map((quote, index) => ({
          id: `item-${index + 1}`,
          name: `${getBagTypeDescriptionJa(state.bagTypeId)} - ${getMaterialDescriptionJa(state.materialId)}`,
          description: `サイズ: ${state.width}×${state.height}${state.depth > 0 ? `×${state.depth}` : ''}mm`,
          quantity: quote.quantity,
          unit: '個',
          unitPrice: Math.round(quote.unitPrice),
          amount: Math.round(quote.totalPrice)
        }))
      : [{
          id: 'item-1',
          name: `${getBagTypeDescriptionJa(state.bagTypeId)} - ${getMaterialDescriptionJa(state.materialId)}`,
          description: `サイズ: ${state.width}×${state.height}${state.depth > 0 ? `×${state.depth}` : ''}mm`,
          quantity: state.quantity,
          unit: '個',
          unitPrice: Math.round(result.unitPrice),
          amount: Math.round(result.totalPrice)
        }];

    // Default remarks
    const defaultRemarks = `※製造工程上の都合により、実際の納品数量はご注文数量に対し最大10％程度の過不足が生じる場合がございます。
数量の完全保証はいたしかねますので、あらかじめご了承ください。
※不足分につきましては、実際に納品した数量に基づきご請求いたします。
前払いにてお支払いいただいた場合は、差額分を返金いたします。
※原材料価格の変動等により、見積有効期限経過後は価格が変更となる場合がございます。
再見積の際は、あらかじめご了承くださいますようお願いいたします。
※本見積金額には郵送費を含んでおります。
※お客様によるご確認の遅れ、その他やむを得ない事情により、納期が前後する場合がございます。
※年末年始等の長期休暇期間を挟む場合、通常より納期が延びる可能性がございます。
※天候不良、事故、交通事情等の影響により、やむを得ず納期が遅延する場合がございますので、あらかじめご了承ください。`;

    // Helper function to parse post-processing options
    const parseOptionalProcessing = () => {
      const options = state.postProcessingOptions || [];
      return {
        zipper: options.includes('zipper-yes'),
        notch: options.includes('notch-yes'),
        hangingHole: options.includes('hang-hole-6mm') || options.includes('hang-hole-8mm'),
        cornerProcessing: options.includes('corner-round'),
        gasValve: options.includes('valve-yes'),
        easyCut: options.includes('top-open') || options.includes('bottom-open'),
        dieCut: false
      };
    };

    // Get printing information
    const getPrintingInfo = () => {
      const printingType = state.isUVPrinting ? 'UVデジタル印刷' : (state.printingType || 'グラビア印刷');
      const colors = state.printingColors || 1;
      const sided = state.doubleSided ? ' (両面)' : '';
      return {
        printingType,
        colors: `${colors}色${sided}`
      };
    };

    const printingInfo = getPrintingInfo();

    // Build specifications with defaults
    const quoteSpecs: QuoteData['specifications'] = {
      bagType: getBagTypeDescriptionJa(state.bagTypeId) || '指定なし',
      contents: '粉体',
      material: getMaterialLabelJa(state.materialId) || '指定なし',
      size: `${state.width || 0}×${state.height || 0}${state.depth > 0 ? `×${state.depth}` : ''}mm`,
      thicknessType: state.thicknessSelection && state.materialId
        ? getFilmStructureSpec(state.materialId, state.thicknessSelection)
        : '指定なし',
      sealWidth: '5mm',
      sealDirection: '上',
      notchShape: state.postProcessingOptions?.includes('notch-yes') ? 'V' : undefined,
      notchPosition: state.postProcessingOptions?.includes('notch-yes') ? '指定位置' : undefined,
      hanging: (state.postProcessingOptions?.includes('hang-hole-6mm') || state.postProcessingOptions?.includes('hang-hole-8mm')) ? 'あり' : 'なし',
      hangingPosition: (state.postProcessingOptions?.includes('hang-hole-6mm') || state.postProcessingOptions?.includes('hang-hole-8mm')) ? '指定位置' : undefined,
      zipperPosition: state.postProcessingOptions?.includes('zipper-yes') ? '指定位置' : undefined,
      cornerR: state.postProcessingOptions?.includes('corner-round') ? 'R5' : undefined
    };

    return {
      quoteNumber: `QT-${Date.now()}`,
      issueDate,
      expiryDate,
      customerName: user?.kanjiLastName && user?.kanjiFirstName
        ? `${user.kanjiLastName} ${user.kanjiFirstName}`
        : user?.companyName || '有限会社加豆フーズ',
      companyName: user?.companyName || '有限会社加豆フーズ',
      postalCode: user?.postalCode || '〒379-2311',
      address: user?.prefecture && user?.city && user?.street
        ? `${user.prefecture}${user.city}${user.street}`
        : '群馬県みどり市懸町阿佐美1940',
      contactPerson: user?.kanjiLastName && user?.kanjiFirstName
        ? `${user.kanjiLastName} ${user.kanjiFirstName}`
        : '田中 太郎',
      items,
      specifications: quoteSpecs,
      optionalProcessing: parseOptionalProcessing(),
      paymentTerms: '銀行振込（前払い）',
      deliveryDate: `校了から約${result.leadTimeDays}日`,
      deliveryLocation: state.deliveryLocation === 'domestic' ? '日本国内' : '海外',
      validityPeriod: `見積日から30日間\n有効期限経過後は価格変更となる場合がございますので\n再見積の際はご相談ください`,
      remarks: defaultRemarks
    };
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    setPdfStatus('idle');

    try {
      const quoteData = generateQuoteData();
      const pdfResult = await generateQuotePDF(quoteData, {
        filename: `見積書_${quoteData.quoteNumber}.pdf`
      });

      if (pdfResult.success && pdfResult.pdfBuffer) {
        // 1. PDF 다운로드
        const uint8Array = new Uint8Array(pdfResult.pdfBuffer);
        const blob = new Blob([uint8Array], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfResult.filename || `見積書_${quoteData.quoteNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setPdfStatus('success');
        setTimeout(() => setPdfStatus('idle'), 3000);

        // 2. 자동으로 데이터베이스에 저장
        if (user?.id) {
          console.log('[handleDownloadPdf] 자동 저장 시작...');
          await saveQuotationToDatabase();
        }
      } else {
        throw new Error(pdfResult.error || 'PDF生成に失敗しました');
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      setPdfStatus('error');
      setTimeout(() => setPdfStatus('idle'), 3000);
      alert('PDF生成中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 데이터베이스 저장 함수 (handleDownloadPdf에서 자동 호출)
  const saveQuotationToDatabase = async () => {
    if (!user?.id) {
      console.warn('[saveQuotationToDatabase] User not logged in, skipping save');
      return;
    }

    try {
      // 아이템 데이터 변환
      const itemsToSave = hasMultiQuantityResults
        ? multiQuantityQuotes.map((quote) => {
            const itemState = state.items.find(i => i.id === quote.itemId);
            return {
              productId: itemState?.id || 'custom',
              productName: itemState?.name || 'カスタム製品',
              quantity: quote.quantity,
              unitPrice: quote.unitPrice,
              specifications: {
                ...quoteSpecs,
                width: state.width,
                height: state.height,
                depth: state.depth,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                printingType: state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''} mm`
              }
            };
          })
        : [
            {
              productId: state.items[0]?.id || 'custom',
              productName: state.items[0]?.name || 'カスタム製品',
              quantity: 1,
              unitPrice: result.totalPrice,
              specifications: {
                ...quoteSpecs,
                width: state.width,
                height: state.height,
                depth: state.depth,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                printingType: state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''} mm`
              }
            }
          ];

      const totalAmountFromItems = itemsToSave.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      const quotationData = {
        userId: user.id,
        quotationNumber: `QT-${Date.now()}`,
        status: 'draft' as const,
        totalAmount: totalAmountFromItems,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: null,
        items: itemsToSave
      };

      const response = await fetch('/api/quotations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save quotation');
      }

      const savedQuotation = await response.json();
      console.log('[saveQuotationToDatabase] 견적이 자동 저장되었습니다:', savedQuotation);
    } catch (error) {
      console.error('[saveQuotationToDatabase] 저장 실패:', error);
      // 사용자 경험을 방해하지 않기 위해 에러를 표시하지 않음
      // PDF 다운로드는 성공했으므로 계속 진행
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const itemsToSave = hasMultiQuantityResults && multiQuantityQuotes.length > 0
        ? multiQuantityQuotes.map((mq) => ({
            productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
            quantity: mq.quantity,
            unitPrice: mq.unitPrice,
            specifications: {
              bagTypeId: state.bagTypeId,
              materialId: state.materialId,
              width: state.width,
              height: state.height,
              depth: state.depth,
              thicknessSelection: state.thicknessSelection,
              isUVPrinting: state.isUVPrinting,
              printingType: state.printingType,
              printingColors: state.printingColors,
              doubleSided: state.doubleSided,
              postProcessingOptions: state.postProcessingOptions,
              deliveryLocation: state.deliveryLocation,
              urgency: state.urgency,
              dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''} mm`,
              isMultiQuantityItem: true,
            }
          }))
        : [
            {
              productName: `${getBagTypeLabel(state.bagTypeId)} - ${getMaterialDescription(state.materialId, 'ja')}`,
              quantity: state.quantity,
              unitPrice: result.unitPrice,
              specifications: {
                bagTypeId: state.bagTypeId,
                materialId: state.materialId,
                width: state.width,
                height: state.height,
                depth: state.depth,
                thicknessSelection: state.thicknessSelection,
                isUVPrinting: state.isUVPrinting,
                printingType: state.printingType,
                printingColors: state.printingColors,
                doubleSided: state.doubleSided,
                postProcessingOptions: state.postProcessingOptions,
                deliveryLocation: state.deliveryLocation,
                urgency: state.urgency,
                dimensions: `${state.width} x ${state.height} ${state.depth > 0 ? `x ${state.depth}` : ''} mm`
              }
            }
          ];

      const totalAmountFromItems = itemsToSave.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

      const quotationData = {
        userId: user.id,
        quotationNumber: `QT-${Date.now()}`,
        status: 'draft' as const,
        totalAmount: totalAmountFromItems,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: null,
        items: itemsToSave
      };

      const response = await fetch('/api/quotations/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to save quotation');
      }

      const savedQuotation = await response.json();
      console.log('Quotation saved successfully:', savedQuotation);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);

      setTimeout(() => {
        window.location.href = '/member/quotations';
      }, 1500);
    } catch (error) {
      console.error('Failed to save quote:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {hasMultiQuantityResults ? '数量比較見積もり' : '見積もり完了'}
        </h2>
        <p className="text-gray-600">
          {hasMultiQuantityResults
            ? `${multiQuantityQuotes.length}件の数量で比較しました`
            : '以下の内容でお見積もりいたしました'
          }
        </p>
      </div>

      {/* Price Display */}
      {hasMultiQuantityResults && multiQuantityQuotes.length > 0 ? (
        <div className="bg-gradient-to-r from-navy-700 to-navy-900 text-white p-8 rounded-xl">
          <div className="text-sm font-medium mb-4">数量別見積もり</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {multiQuantityQuotes.map((quote) => (
              <div key={quote.quantity} className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-sm font-medium mb-1">{quote.quantity.toLocaleString()}個</div>
                <div className="text-xl font-bold">¥{quote.totalPrice.toLocaleString()}</div>
                <div className="text-xs opacity-90 mt-1">
                  単価: ¥{quote.unitPrice.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          {multiQuantityState.comparison && (
            <div className="mt-4 pt-4 border-t border-white/20 text-center">
              <div className="text-sm opacity-90">
                最適数量: <span className="font-bold">{multiQuantityState.comparison.bestValue.quantity.toLocaleString()}個</span>
                （{multiQuantityState.comparison.bestValue.percentage}%節約）
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-r from-navy-700 to-navy-900 text-white p-8 rounded-xl text-center">
          <div className="text-sm font-medium mb-2">合計金額（税別）</div>
          <div className="text-4xl font-bold mb-4">
            ¥{result.totalPrice.toLocaleString()}
          </div>
          <div className="text-sm opacity-90">
            単価: ¥{result.unitPrice.toLocaleString()} / 最小注文数: {result.minOrderQuantity.toLocaleString()}個
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">注文内容の確認</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">基本仕様</h4>
            <div className="text-sm space-y-1 text-gray-600">
              <div>タイプ: {getBagTypeLabel(state.bagTypeId)}</div>
              <div>素材: {getMaterialDescription(state.materialId, 'ja')}</div>
              <div>サイズ: {state.width} × {state.height} {state.depth > 0 && `× ${state.depth}`} mm</div>
              {state.thicknessSelection && <div>厚さ: {state.thicknessSelection}</div>}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">数量・印刷</h4>
            <div className="text-sm space-y-1 text-gray-600">
              {hasMultiQuantityResults ? (
                <div>
                  <div className="font-medium">数量比較見積もり:</div>
                  {safeMap(multiQuantityQuotes, (mq) => (
                    <div key={mq.quantity} className="ml-2">
                      • {mq.quantity.toLocaleString()}個 = ¥{mq.totalPrice.toLocaleString()}
                    </div>
                  ))}
                  <div className="mt-2">印刷: {state.isUVPrinting ? 'UVデジタル印刷' : state.printingType}</div>
                  <div>色数: {state.printingColors} {state.doubleSided && '(両面)'}</div>
                </div>
              ) : (
                <>
                  <div>数量: {state.quantity.toLocaleString()}個</div>
                  <div>印刷: {state.isUVPrinting ? 'UVデジタル印刷' : state.printingType}</div>
                  <div>色数: {state.printingColors} {state.doubleSided && '(両面)'}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {state.postProcessingOptions && state.postProcessingOptions.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">後加工</h4>
            <div className="text-sm text-gray-600">
              {safeMap(state.postProcessingOptions, option => (
                <span key={option} className="mr-2">
                  {getPostProcessingLabel(option)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">配送・納期</h4>
          <div className="text-sm space-y-1 text-gray-600">
            <div>配送先: {state.deliveryLocation === 'domestic' ? '国内' : '海外'}</div>
            <div>納期: {state.urgency === 'standard' ? '標準' : '迅速'}（{result.leadTimeDays}日）</div>
          </div>
        </div>
      </div>

      {/* Multi-Quantity Comparison Results */}
      {multiQuantityState.comparison && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-navy-600" />
              数量比較分析結果
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-500">最適数量</p>
                <p className="text-lg font-bold text-green-600">
                  {multiQuantityState.comparison.bestValue.quantity.toLocaleString()}個
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-500">最大節約</p>
                <p className="text-lg font-bold text-blue-600">
                  {multiQuantityState.comparison.bestValue.percentage}%
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-500">効率性改善</p>
                <p className="text-lg font-bold text-purple-600">
                  {multiQuantityState.comparison.trends.optimalQuantity.toLocaleString()}個
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-xs text-gray-500">価格トレンド</p>
                <p className="text-lg font-bold text-yellow-600">
                  {multiQuantityState.comparison.trends.priceTrend === 'decreasing' ? '低下' :
                   multiQuantityState.comparison.trends.priceTrend === 'increasing' ? '上昇' : '安定'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">数量比較詳細</h4>
              <MultiQuantityComparisonTable
                quotes={Object.entries(multiQuantityState.comparison!.economiesOfScale).map(([quantity, data]) => ({
                  quantity: parseInt(quantity),
                  unitPrice: data.unitPrice,
                  totalPrice: data.unitPrice * parseInt(quantity),
                  discountRate: Math.round((1 - data.efficiency / 100) * 100),
                  priceBreak: multiQuantityState.comparison!.priceBreaks.find(pb => pb.quantity === parseInt(quantity))?.priceBreak || '通常',
                  leadTimeDays: result.leadTimeDays,
                  isValid: true
                }))}
                comparison={multiQuantityState.comparison!}
                selectedQuantity={state.quantity}
                onQuantitySelect={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">価格内訳</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>素材費:</span>
            <span>¥{result.breakdown.material.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>加工費:</span>
            <span>¥{result.breakdown.processing.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>印刷費:</span>
            <span>¥{result.breakdown.printing.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>セットアップ費:</span>
            <span>¥{result.breakdown.setup.toLocaleString()}</span>
          </div>
          {result.breakdown.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>数量割引:</span>
              <span>−¥{result.breakdown.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>配送費:</span>
            <span>¥{result.breakdown.delivery.toLocaleString()}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span>合計:</span>
              <span>¥{result.breakdown.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <motion.button
          onClick={onReset}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          新しい見積もり
        </motion.button>

        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center ${
            isGeneratingPdf
              ? 'bg-gray-400 cursor-not-allowed'
              : pdfStatus === 'success'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : pdfStatus === 'error'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-navy-700 hover:bg-navy-600 text-white'
          }`}
        >
          {isGeneratingPdf ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              PDF生成中...
            </>
          ) : pdfStatus === 'success' ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ダウンロード完了 (自動保存済み)
            </>
          ) : pdfStatus === 'error' ? (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              失敗
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              PDFダウンロード (自動保存)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
