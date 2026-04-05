/**
 * QuotationActions Component
 *
 * 見積もりアクションボタンコンポーネント
 *
 * ヘッダーエリアのアクションボタン群を担当
 *
 * @module components/member/quotations/QuotationActions
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export interface QuotationActionsProps {
  /** 更新ハンドラー */
  onRefresh?: () => void;
  /** 新規見積作成ハンドラー */
  onCreateNew?: () => void;
  /** 追加ボタンを表示するか */
  showCreateButton?: boolean;
  /** カスタムアクションボタン */
  customActions?: React.ReactNode;
  /** ローディング状態 */
  isLoading?: boolean;
}

/**
 * QuotationActions コンポーネント
 */
export function QuotationActions({
  onRefresh,
  onCreateNew,
  showCreateButton = true,
  customActions,
  isLoading = false
}: QuotationActionsProps) {
  const router = useRouter();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      window.location.href = '/quote-simulator';
    }
  };

  return (
    <div className="flex gap-2">
      {/* 更新ボタン */}
      <Button
        variant="outline"
        onClick={handleRefresh}
        disabled={isLoading}
      >
        ↻ 更新
      </Button>

      {/* 新規見積ボタン */}
      {showCreateButton && (
        <Button
          variant="primary"
          onClick={handleCreateNew}
        >
          <span className="mr-2">+</span>新規見積
        </Button>
      )}

      {/* カスタムアクション */}
      {customActions}
    </div>
  );
}

export default QuotationActions;
