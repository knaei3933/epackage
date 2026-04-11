import { Card } from '@/components/ui';
import { AlertCircle } from 'lucide-react';

interface AdminStatsCardProps {
  /** Display label (alias for title) */
  label?: string;
  /** Card title (used if label is not provided) */
  title?: string;
  value: number | string;
  error?: string;
  loading?: boolean;
  color?: 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'yellow';
  subtitle?: string;
}

const colorClasses = {
  gray: 'text-gray-900',
  green: 'text-green-600',
  blue: 'text-blue-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
};

/**
 * AdminStatsCard - Shared admin stats card component
 * Extends dashboard StatsCard with yellow color support and label alias
 */
export function AdminStatsCard({
  label,
  title,
  value,
  error,
  loading,
  color = 'gray',
  subtitle,
}: AdminStatsCardProps) {
  const displayTitle = label || title || '';

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

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">{displayTitle}</span>
          <div className="flex items-center mt-2">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-sm text-red-600">読み込み失敗</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">{displayTitle}</span>
        <span className={`text-3xl font-bold ${colorClasses[color]} mt-2`}>{value}</span>
        {subtitle && (
          <span className="text-xs text-gray-500 mt-1">{subtitle}</span>
        )}
      </div>
    </Card>
  );
}
