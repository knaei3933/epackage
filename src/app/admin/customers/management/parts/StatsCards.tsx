/**
 * Stats cards for customer management dashboard.
 */

'use client';

import { Users, Check, Clock, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface StatsCardsProps {
  totalItems: number;
  active: number;
  pending: number;
  newThisMonth: number;
}

export function StatsCards({ totalItems, active, pending, newThisMonth }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
      <Card variant="default" className="p-3 md:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">総顧客数</p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
              {totalItems}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card variant="default" className="p-3 md:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">アクティブ</p>
            <p className="text-xl md:text-2xl font-bold text-green-600 mt-1">
              {active}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card variant="default" className="p-3 md:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">承認待ち</p>
            <p className="text-xl md:text-2xl font-bold text-yellow-600 mt-1">
              {pending}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
          </div>
        </div>
      </Card>

      <Card variant="default" className="p-3 md:p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-600">今月新規</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600 mt-1">
              {newThisMonth}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
