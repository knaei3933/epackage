/**
 * QuotationPagination Component
 *
 * 見積もりページネーションコンポーネント
 *
 * ページネーションUIを担当
 *
 * @module components/member/quotations/QuotationPagination
 */

'use client';

import React from 'react';

export interface QuotationPaginationProps {
  /** 現在のページ */
  currentPage: number;
  /** 総ページ数 */
  totalPages: number;
  /** 総件数 */
  totalItems: number;
  /** ページ変更ハンドラー */
  onPageChange: (page: number) => void;
  /** 最大表示ページ数（省略時は5） */
  maxVisiblePages?: number;
}

/**
 * ページネーションで表示するページ番号の配列を生成
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number = 5
): (number | null)[] {
  const pages: (number | null)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    // 最初のページ、最後のページ、現在のページの周辺を表示
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - Math.floor(maxVisiblePages / 2) &&
        i <= currentPage + Math.floor(maxVisiblePages / 2))
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== null) {
      // 省略記号を追加（連続していない場合のみ）
      pages.push(null);
    }
  }

  return pages;
}

/**
 * QuotationPagination コンポーネント
 */
export function QuotationPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  maxVisiblePages = 5
}: QuotationPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = generatePageNumbers(currentPage, totalPages, maxVisiblePages);

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {/* 前へボタン */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
          currentPage === 1
            ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
            : 'bg-bg-secondary text-text-primary hover:bg-border-secondary cursor-pointer'
        }`}
        aria-label="前のページ"
      >
        前へ
      </button>

      {/* ページ番号 */}
      {pageNumbers.map((pageNum, index) => {
        if (pageNum === null) {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-text-muted"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-bg-secondary text-text-primary hover:bg-border-secondary cursor-pointer'
            }`}
            aria-label={`ページ ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* 次へボタン */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
          currentPage === totalPages
            ? 'bg-bg-tertiary text-text-muted cursor-not-allowed'
            : 'bg-bg-secondary text-text-primary hover:bg-border-secondary cursor-pointer'
        }`}
        aria-label="次のページ"
      >
        次へ
      </button>

      {/* ページ情報 */}
      <div className="text-sm text-text-muted px-4">
        {currentPage} / {totalPages} ページ
        （全{totalItems}件）
      </div>
    </div>
  );
}

export default QuotationPagination;
