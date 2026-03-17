'use client';

/**
 * Price Difference Summary Component
 *
 * 差金明細表示コンポーネント
 * - 元の金額と新しい金額の比較
 * - 差額とその理由を表示
 */

import { Card } from '@/components/ui';

// =====================================================
// Types
// =====================================================

export interface PriceDifferenceSummaryProps {
  originalPrice: number;
  newPrice: number;
  priceDifference: number;
  differencePercentage: number;
  reason: string;
  originalSpecs?: any;
  newSpecs?: any;
  showDetails?: boolean;
}

// =====================================================
// Component
// =====================================================

export function PriceDifferenceSummary({
  originalPrice,
  newPrice,
  priceDifference,
  differencePercentage,
  reason,
  originalSpecs,
  newSpecs,
  showDetails = false
}: PriceDifferenceSummaryProps) {
  const isIncrease = priceDifference > 0;
  const isDecrease = priceDifference < 0;

  return (
    <Card className={`p-6 ${isIncrease ? 'bg-red-50 border-red-200' : isDecrease ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isIncrease ? 'text-red-800' : isDecrease ? 'text-green-800' : 'text-gray-800'
      }`}>
        💰 価格変更サマリー
      </h3>

      {/* 価格比較 */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">元の金額:</span>
          <span className="font-medium text-gray-900">
            ¥{originalPrice.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">新しい金額:</span>
          <span className="font-medium text-gray-900">
            ¥{newPrice.toLocaleString()}
          </span>
        </div>
        <div className={`flex justify-between items-center pt-3 border-t ${
          isIncrease ? 'border-red-300' : isDecrease ? 'border-green-300' : 'border-gray-300'
        }`}>
          <span className="font-semibold text-gray-900">差額:</span>
          <span className={`font-bold text-lg ${
            isIncrease ? 'text-red-600' : isDecrease ? 'text-green-600' : 'text-gray-900'
          }`}>
            {isIncrease ? '+' : isDecrease ? '-' : ''}
            ¥{Math.abs(priceDifference).toLocaleString()}
            <span className="text-sm ml-2">
              ({differencePercentage > 0 ? '+' : ''}{differencePercentage.toFixed(1)}%)
            </span>
          </span>
        </div>
      </div>

      {/* 変更理由 */}
      {reason && (
        <div className="bg-white bg-opacity-60 p-3 rounded text-sm mb-4">
          <p className="font-semibold text-gray-700 mb-1">変更理由:</p>
          <p className="text-gray-600">{reason}</p>
        </div>
      )}

      {/* 仕様変更詳細（オプション） */}
      {showDetails && originalSpecs && newSpecs && (
        <div className="border-t border-gray-300 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">仕様変更詳細</h4>
          <div className="space-y-2 text-xs">
            <SpecChangeDetail
              label="サイズ"
              original={`${originalSpecs.width}×${originalSpecs.height}${(originalSpecs.depth && originalSpecs.bag_type !== 'lap_seal') ? `×${originalSpecs.depth}` : ''}mm`}
              newValue={`${newSpecs.width}×${newSpecs.height}${(newSpecs.depth && newSpecs.bag_type !== 'lap_seal') ? `×${newSpecs.depth}` : ''}mm`}
            />
            <SpecChangeDetail
              label="素材"
              original={originalSpecs.material || '-'}
              newValue={newSpecs.materialId || '-'}
            />
            <SpecChangeDetail
              label="印刷方式"
              original={originalSpecs.printing_type || '-'}
              newValue={newSpecs.printingType || '-'}
            />
            <SpecChangeDetail
              label="色数"
              original={`${originalSpecs.printing_colors || 1}色`}
              newValue={`${newSpecs.printingColors || 1}色`}
            />
            <SpecChangeDetail
              label="厚さ"
              original={originalSpecs.thicknessSelection || '-'}
              newValue={newSpecs.thicknessSelection || '-'}
            />
          </div>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-yellow-50 p-3 rounded text-xs">
        <p className="font-semibold text-yellow-800 mb-1">⚠️ 注意</p>
        <ul className="text-yellow-700 space-y-1 list-disc list-inside">
          <li>変更確定後、新しい金額で請求されます</li>
          <li>差額が発生する場合、追加請求または割り引きが適用されます</li>
          <li>製造開始後の変更はできない場合があります</li>
        </ul>
      </div>
    </Card>
  );
}

// =====================================================
// Helper Components
// =====================================================

interface SpecChangeDetailProps {
  label: string;
  original: string;
  newValue: string;
}

function SpecChangeDetail({ label, original, newValue }: SpecChangeDetailProps) {
  const hasChanged = original !== newValue;

  return (
    <div className="flex items-center">
      <span className="text-gray-500 w-24">{label}:</span>
      <span className="mx-2 text-gray-900 line-through opacity-60">{original}</span>
      <span className="mx-2 text-gray-400">→</span>
      <span className={`font-medium ${hasChanged ? 'text-blue-600' : 'text-gray-900'}`}>{newValue}</span>
    </div>
  );
}

export default PriceDifferenceSummary;
