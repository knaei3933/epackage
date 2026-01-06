import { Card } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  error?: string;
  loading?: boolean;
  color?: 'gray' | 'green' | 'blue' | 'orange' | 'red';
  subtitle?: string;
}

export function StatsCard({
  title,
  value,
  error,
  loading,
  color = 'gray',
  subtitle
}: StatsCardProps) {
  // カラーマッピング
  const colorClasses = {
    gray: 'text-gray-900',
    green: 'text-green-600',
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    red: 'text-red-600'
  };

  // ローディング状態
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
        </div>
      </Card>
    );
  }

  // エラー状態
  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">{title}</span>
          <div className="flex items-center mt-2">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm text-red-600">読み込み失敗</span>
          </div>
        </div>
      </Card>
    );
  }

  // 通常状態
  return (
    <Card className="p-6">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className={`text-3xl font-bold ${colorClasses[color]} mt-2`}>{value}</span>
        {subtitle && (
          <span className="text-xs text-gray-500 mt-1">{subtitle}</span>
        )}
      </div>
    </Card>
  );
}
