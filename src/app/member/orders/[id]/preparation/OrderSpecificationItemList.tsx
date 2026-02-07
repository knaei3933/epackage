'use client';

/**
 * Order Specification Item List Component
 *
 * 顧客用仕様変更アイテムリスト
 * - 注文アイテムごとに仕様変更を可能にする
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import SpecificationEditModal from '@/components/member/orders/SpecificationEditModal';

// =====================================================
// Types
// =====================================================

interface OrderSpecificationItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: {
    width?: number;
    height?: number;
    depth?: number;
    material?: string;
    bag_type?: string;
    printing_type?: string;
    printing_colors?: number;
    thicknessSelection?: string;
    post_processing?: string[];
  };
}

interface OrderSpecificationItemListProps {
  items: OrderSpecificationItem[];
  orderId: string;
  canModify: boolean;
}

// =====================================================
// Component
// =====================================================

export function OrderSpecificationItemList({
  items,
  orderId,
  canModify
}: OrderSpecificationItemListProps) {
  const [modals, setModals] = useState<Record<string, boolean>>({});
  const [changeHistories, setChangeHistories] = useState<Record<string, any[]>>({});

  const toggleModal = (itemId: string, isOpen: boolean) => {
    setModals(prev => ({ ...prev, [itemId]: isOpen }));
  };

  const handleConfirmSpecificationChange = async (
    itemId: string,
    specs: any,
    newSpecifications: any,
    priceDifference: any
  ) => {
    // 仕様変更確定の処理
    console.log('Specification change confirmed:', { newSpecifications, priceDifference });
    // TODO: 実際の仕様変更処理を実装

    // 変更履歴を更新
    setChangeHistories(prev => ({
      ...prev,
      [itemId]: [
        ...(prev[itemId] || []),
        {
          timestamp: new Date().toISOString(),
          oldSpecs: specs,
          newSpecs: newSpecifications,
          priceDifference
        }
      ]
    }));

    toggleModal(itemId, false);
  };

  return (
    <div className="space-y-4" data-testid="order-specification-list">
      {items.map((item) => (
        <OrderSpecificationItem
          key={item.id}
          item={item}
          orderId={orderId}
          canModify={canModify}
          isModalOpen={modals[item.id] || false}
          changeHistory={changeHistories[item.id] || []}
          onToggleModal={(isOpen) => toggleModal(item.id, isOpen)}
          onConfirm={(newSpecs, priceDiff) =>
            handleConfirmSpecificationChange(item.id, item.specifications, newSpecs, priceDiff)
          }
        />
      ))}
    </div>
  );
}

// =====================================================
// Order Specification Item Component
// =====================================================

interface OrderSpecificationItemProps {
  item: OrderSpecificationItem;
  orderId: string;
  canModify: boolean;
  isModalOpen: boolean;
  changeHistory: any[];
  onToggleModal: (isOpen: boolean) => void;
  onConfirm: (newSpecifications: any, priceDifference: any) => void;
}

function OrderSpecificationItem({
  item,
  orderId,
  canModify,
  isModalOpen,
  changeHistory,
  onToggleModal,
  onConfirm
}: OrderSpecificationItemProps) {
  const specs = item.specifications || {};

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4" data-testid={`order-spec-item-${item.id}`}>
      {/* 商品ヘッダー */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-text-primary">{item.product_name}</p>
          <p className="text-xs text-text-muted">
            数量: {item.quantity.toLocaleString()}個 × ¥{item.unit_price.toLocaleString()}
          </p>
        </div>
        <p className="font-semibold text-text-primary">
          ¥{item.total_price.toLocaleString()}
        </p>
      </div>

      {/* 現在の仕様 */}
      <div data-testid="current-specs">
        <h4 className="text-sm font-semibold text-text-primary mb-2">現在の仕様</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {specs.width && specs.height && (
            <div>
              <span className="text-text-muted">サイズ:</span>
              <span className="ml-1">
                {specs.width}×{specs.height}
                {specs.depth ? `×${specs.depth}` : ''}mm
              </span>
            </div>
          )}
          {specs.material && (
            <div>
              <span className="text-text-muted">素材:</span>
              <span className="ml-1">{specs.material}</span>
            </div>
          )}
          {specs.bag_type && (
            <div>
              <span className="text-text-muted">タイプ:</span>
              <span className="ml-1">{specs.bag_type}</span>
            </div>
          )}
          {specs.printing_type && (
            <div>
              <span className="text-text-muted">印刷:</span>
              <span className="ml-1">{specs.printing_type}</span>
            </div>
          )}
          {specs.printing_colors && (
            <div>
              <span className="text-text-muted">色数:</span>
              <span className="ml-1">{specs.printing_colors}色</span>
            </div>
          )}
          {specs.thicknessSelection && (
            <div>
              <span className="text-text-muted">厚さ:</span>
              <span className="ml-1">{specs.thicknessSelection}</span>
            </div>
          )}
        </div>
        {specs.post_processing && specs.post_processing.length > 0 && (
          <div className="mt-2">
            <span className="text-text-muted text-xs">後加工:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {specs.post_processing.map((opt: string) => (
                <span key={opt} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {opt === 'zipper-yes' ? 'ジッパー' :
                   opt === 'matte' ? 'マット仕上げ' :
                   opt === 'glossy' ? '光沢仕上げ' : opt}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 変更履歴 */}
      {changeHistory.length > 0 && (
        <div className="bg-gray-50 p-3 rounded" data-testid="change-history">
          <h4 className="text-sm font-semibold text-text-primary mb-2">変更履歴</h4>
          <div className="space-y-2 text-xs">
            {changeHistory.map((history, index) => (
              <div key={index} className="border-b border-gray-200 pb-2 last:pb-0">
                <div className="flex justify-between text-text-muted">
                  <span>{new Date(history.timestamp).toLocaleString('ja-JP')}</span>
                  <span className={history.priceDifference.priceDifference > 0 ? 'text-red-600' : 'text-green-600'}>
                    {history.priceDifference.priceDifference > 0 ? '+' : ''}
                    ¥{history.priceDifference.priceDifference.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 仕様変更ボタン */}
      {canModify && (
        <Button
          data-testid="member-spec-change-button"
          onClick={() => onToggleModal(true)}
          variant="outline"
          className="w-full"
        >
          仕様を変更
        </Button>
      )}

      {/* 仕様変更モーダル */}
      {isModalOpen && (
        <SpecificationEditModal
          isOpen={isModalOpen}
          onClose={() => onToggleModal(false)}
          orderId={orderId}
          itemId={item.id}
          currentSpecifications={{
            width: specs.width || 0,
            height: specs.height || 0,
            depth: specs.depth || 0,
            materialId: specs.material,
            bagType: specs.bag_type,
            printingType: specs.printing_type,
            printingColors: specs.printing_colors || 1,
            postProcessingOptions: specs.post_processing || [],
            thicknessSelection: specs.thicknessSelection
          }}
          currentPrice={item.total_price}
          onConfirm={onConfirm}
        />
      )}
    </div>
  );
}
