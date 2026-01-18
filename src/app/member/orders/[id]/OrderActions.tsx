/**
 * Order Detail Actions - Client Component
 *
 * 注文詳細ページのアクションボタン
 * - 戻るボタン
 * - 注文管理ボタン
 */

'use client';

import { useRouter } from 'next/navigation';
import type { Order } from '@/types/dashboard';
import { Button } from '@/components/ui';
import { OrderManagementButtons } from '@/components/orders';

interface OrderActionsProps {
  order: Order;
}

export function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();

  const handleOrderCancelled = () => {
    router.push('/member/orders');
  };

  const handleOrderModified = () => {
    window.location.reload();
  };

  const handleReordered = (newOrderId: string) => {
    router.push(`/member/orders/${newOrderId}`);
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="space-y-4">
      <OrderManagementButtons
        order={order}
        showPDFDownload={true}
        showDetailView={false}
        onOrderCancelled={handleOrderCancelled}
        onOrderModified={handleOrderModified}
        onReordered={handleReordered}
      />

      <Button variant="secondary" onClick={handleBack}>
        戻る
      </Button>
    </div>
  );
}
