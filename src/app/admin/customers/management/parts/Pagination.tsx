import type React from 'react';

/**
 * Pagination components for customer management (desktop + mobile).
 */

import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export function DesktopPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  setCurrentPage,
}: PaginationProps) {
  return (
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        全 {totalItems}件中 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)}件を表示
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          前へ
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                currentPage === pageNum
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
              )}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          次へ
        </button>
      </div>
    </div>
  );
}

export function MobilePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  setCurrentPage,
}: PaginationProps) {
  return (
    <div className="sticky bottom-0 bg-gray-50 px-3 py-2.5 rounded-lg shadow-lg border border-gray-200 flex items-center justify-between mt-4">
      <div className="text-xs text-gray-600 font-medium">
        {(() => {
          const start = ((currentPage - 1) * itemsPerPage) + 1;
          const end = Math.min(currentPage * itemsPerPage, totalItems);
          return `${start}-${end} / ${totalItems}`;
        })()}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[72px]"
        >
          前へ
        </button>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[72px]"
        >
          次へ
        </button>
      </div>
    </div>
  );
}
