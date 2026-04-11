'use client';

import { AdminPagination } from '@/components/admin/shared';

interface AdminQuotationPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * AdminQuotationPagination - 管理者用見積ページネーションコンポーネント
 * Delegates to shared AdminPagination
 */
export function AdminQuotationPagination(props: AdminQuotationPaginationProps) {
  return <AdminPagination {...props} />;
}
