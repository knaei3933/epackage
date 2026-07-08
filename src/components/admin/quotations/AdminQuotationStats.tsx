'use client';

import { AdminStatsCard } from '@/components/admin/shared';

interface AdminQuotationStatsProps {
  stats: {
    total: number;
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
  };
}

export function AdminQuotationStats({ stats }: AdminQuotationStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <AdminStatsCard label="総見積数" value={stats.total} color="blue" />
      <AdminStatsCard label="ドラフト" value={stats.draft} color="gray" />
      <AdminStatsCard label="送信済み" value={stats.sent} color="yellow" />
      <AdminStatsCard label="注文済み" value={stats.approved} color="green" />
    </div>
  );
}
