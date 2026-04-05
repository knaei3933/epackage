'use client';

interface AdminQuotationStatsProps {
  stats: {
    total: number;
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
  };
}

const colors = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  gray: 'bg-gray-50 text-gray-700 border-gray-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
};

/**
 * AdminQuotationStats - 管理者用見積統計カードコンポーネント
 */
export function AdminQuotationStats({ stats }: AdminQuotationStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatsCard label="総見積数" value={stats.total} color="blue" />
      <StatsCard label="ドラフト" value={stats.draft} color="gray" />
      <StatsCard label="送信済み" value={stats.sent} color="yellow" />
      <StatsCard label="承認済み" value={stats.approved} color="green" />
      <StatsCard label="拒否" value={stats.rejected} color="red" />
    </div>
  );
}

function StatsCard({ label, value, color }: { label: string; value: number; color: keyof typeof colors }) {
  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
