'use client';

/**
 * Specification Edit Modal
 *
 * 顧客用仕様変更モーダル
 * - 注文後の仕様変更を許可
 * - 再計算と差金表示
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';

// =====================================================
// Types
// =====================================================

interface Specification {
  width: number;
  height: number;
  depth?: number;
  materialId?: string;
  bagType?: string;
  printingType?: string;
  printingColors?: number;
  postProcessingOptions?: string[];
  thicknessSelection?: string;
}

interface PriceDifference {
  originalPrice: number;
  newPrice: number;
  priceDifference: number;
  differencePercentage: number;
}

interface SpecificationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  itemId: string;
  currentSpecifications: Specification;
  currentPrice: number;
  onConfirm?: (newSpecifications: Specification, priceDifference: PriceDifference) => void;
  isAdmin?: boolean; // 管理者モードフラグ
}

// =====================================================
// Component
// =====================================================

export function SpecificationEditModal({
  isOpen,
  onClose,
  orderId,
  itemId,
  currentSpecifications,
  currentPrice,
  onConfirm,
  isAdmin = false // デフォルトは顧客モード
}: SpecificationEditModalProps) {
  const [specifications, setSpecifications] = useState<Specification>(currentSpecifications);
  const [isCalculating, setIsCalculating] = useState(false);
  const [priceDifference, setPriceDifference] = useState<PriceDifference | null>(null);
  const [changeReason, setChangeReason] = useState('');

  // 仕様が変更されたら再計算
  useEffect(() => {
    if (isOpen) {
      calculateNewPrice();
    }
  }, [specifications, isOpen]);

  // 新しい価格を計算
  const calculateNewPrice = async () => {
    setIsCalculating(true);
    try {
      // 管理者モードと顧客モードでAPIエンドポイントを切り替え
      const apiUrl = isAdmin
        ? `/api/admin/orders/${orderId}/specification-change`
        : `/api/member/orders/${orderId}/specification-change`;

      // 動的インポートで循環参照を回避
      const { adminFetch, memberFetch } = await import('@/lib/auth-client');
      const authFetch = isAdmin ? adminFetch : memberFetch;

      const response = await authFetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          itemId,
          specifications
        })
      });

      if (response.ok) {
        const result = await response.json();
        setPriceDifference(result);
      } else {
        console.error('価格計算エラー:', await response.text());
      }
    } catch (error) {
      console.error('価格計算エラー:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // 仕様を変更
  const handleSpecificationChange = (field: keyof Specification, value: any) => {
    setSpecifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 変更確定
  const handleConfirm = () => {
    if (!priceDifference || !onConfirm) return;

    onConfirm(specifications, priceDifference);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-testid="specification-modal-overlay">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" data-testid="specification-modal">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <h2 className="text-xl font-semibold text-gray-900" data-testid="spec-modal-title">
            {isAdmin ? '仕様変更（管理者）' : '仕様変更'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? '管理者として注文の仕様を変更できます。変更履歴が記録されます。'
              : '注文後の仕様変更をリクエストできます'}
          </p>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* サイズ */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">サイズ</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">幅 (mm)</label>
                <input
                  type="number"
                  data-testid="spec-width-input"
                  value={specifications.width}
                  onChange={(e) => handleSpecificationChange('width', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="幅"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">高さ (mm)</label>
                <input
                  type="number"
                  data-testid="spec-height-input"
                  value={specifications.height}
                  onChange={(e) => handleSpecificationChange('height', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="高さ"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">マチ (mm)</label>
                <input
                  type="number"
                  data-testid="spec-depth-input"
                  value={specifications.depth || ''}
                  onChange={(e) => handleSpecificationChange('depth', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="マチ"
                />
              </div>
            </div>
          </div>

          {/* 素材 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">素材</h3>
            <select
              data-testid="spec-material-select"
              value={specifications.materialId || ''}
              onChange={(e) => handleSpecificationChange('materialId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">選択してください</option>
              <option value="pet_al">PET/AL (アルミ箔ラミネート)</option>
              <option value="pet_ny">PET/NY (ナイロン)</option>
              <option value="pet_ny_al">PET/NY/AL</option>
              <option value="kp_pe">KP/PE (クラフト紙)</option>
            </select>
          </div>

          {/* 印刷 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">印刷</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">印刷方式</label>
                <select
                  data-testid="spec-printing-type-select"
                  value={specifications.printingType || 'gravure'}
                  onChange={(e) => handleSpecificationChange('printingType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="gravure">グラビア印刷</option>
                  <option value="digital">デジタル印刷</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">色数</label>
                <input
                  type="number"
                  data-testid="spec-colors-input"
                  min="1"
                  max="8"
                  value={specifications.printingColors || 1}
                  onChange={(e) => handleSpecificationChange('printingColors', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* 後加工オプション */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">後加工</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  data-testid="spec-zipper-checkbox"
                  checked={specifications.postProcessingOptions?.includes('zipper-yes')}
                  onChange={(e) => {
                    const current = specifications.postProcessingOptions || [];
                    if (e.target.checked) {
                      handleSpecificationChange('postProcessingOptions', [...current, 'zipper-yes']);
                    } else {
                      handleSpecificationChange('postProcessingOptions', current.filter(o => o !== 'zipper-yes'));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">ジッパー</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  data-testid="spec-matte-checkbox"
                  checked={specifications.postProcessingOptions?.includes('matte')}
                  onChange={(e) => {
                    const current = specifications.postProcessingOptions || [];
                    if (e.target.checked) {
                      handleSpecificationChange('postProcessingOptions', [...current, 'matte']);
                    } else {
                      handleSpecificationChange('postProcessingOptions', current.filter(o => o !== 'matte'));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">マット仕上げ</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  data-testid="spec-glossy-checkbox"
                  checked={specifications.postProcessingOptions?.includes('glossy')}
                  onChange={(e) => {
                    const current = specifications.postProcessingOptions || [];
                    if (e.target.checked) {
                      handleSpecificationChange('postProcessingOptions', [...current, 'glossy']);
                    } else {
                      handleSpecificationChange('postProcessingOptions', current.filter(o => o !== 'glossy'));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">光沢仕上げ</span>
              </label>
            </div>
          </div>

          {/* 厚さ */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">厚さ</h3>
            <select
              value={specifications.thicknessSelection || 'standard'}
              onChange={(e) => handleSpecificationChange('thicknessSelection', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="light">軽量タイプ (~100g)</option>
              <option value="medium">標準タイプ (~300g)</option>
              <option value="standard">レギュラータイプ (~500g)</option>
              <option value="heavy">高耐久タイプ (~800g)</option>
              <option value="ultra">超耐久タイプ (800g~)</option>
            </select>
          </div>

          {/* 変更理由 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">変更理由</h3>
            <textarea
              data-testid="spec-change-reason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="仕様変更の理由を入力してください..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* 価格差額表示 */}
          {priceDifference && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4" data-testid="price-difference-section">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">価格差額</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">元の金額:</span>
                  <span className="font-medium">¥{priceDifference.originalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">新しい金額:</span>
                  <span className="font-medium">¥{priceDifference.newPrice.toLocaleString()}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${
                  priceDifference.priceDifference > 0 ? 'border-red-300' : 'border-green-300'
                }`}>
                  <span className="font-semibold">差額:</span>
                  <span className={`font-bold ${
                    priceDifference.priceDifference > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {priceDifference.priceDifference > 0 ? '+' : ''}
                    ¥{priceDifference.priceDifference.toLocaleString()}
                    ({priceDifference.differencePercentage > 0 ? '+' : ''}
                    {priceDifference.differencePercentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {isCalculating && (
            <div className="text-center text-sm text-gray-500">
              計算中...
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
          <Button
            variant="outline"
            data-testid="spec-cancel-button"
            onClick={onClose}
            disabled={isCalculating}
          >
            キャンセル
          </Button>
          <Button
            data-testid="spec-confirm-button"
            onClick={handleConfirm}
            disabled={!priceDifference || !changeReason || isCalculating}
          >
            変更を確定
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SpecificationEditModal;
