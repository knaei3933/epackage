/**
 * Admin Order Workflow Tabs Component
 *
 * 管理者注文ワークフロータブコンポーネント（新版）
 * - 2タブ構造: データ・校正管理、顧客承認
 * - データ・校正管理タブ内でデータ入稿/送信/校正を統合管理
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OrderCommentsSectionWrapper } from '@/components/orders';
import { DataAndCorrectionManagementTab } from './DataAndCorrectionManagementTab';
import { AdminCustomerApprovalTab } from './AdminCustomerApprovalTab';
import { adminFetch } from '@/lib/auth-client';
import type { Order as DashboardOrder } from '@/types/dashboard';

// =====================================================
// Utilities
// =====================================================

// 入力のサニタイズ（XSS対策）
const sanitizeInput = (input: string, maxLength: number = 500): string => {
  return input.trim().slice(0, maxLength);
};

// =====================================================
// Types & Props
// =====================================================

interface AdminOrderWorkflowTabsProps {
  order: DashboardOrder;
  orderId: string;
  adminNotes: string;
  onAdminNotesChange: (notes: string) => void;
  onUpdateNotes: () => void;
  onSendToKorea: () => void;
  sendingToKorea: boolean;
  koreaMessage: { type: 'success' | 'error'; text: string } | null;
}

// =====================================================
// Main Component
// =====================================================

export function AdminOrderWorkflowTabs({
  order,
  orderId,
  adminNotes,
  onAdminNotesChange,
  onUpdateNotes,
  onSendToKorea,
  sendingToKorea,
  koreaMessage,
}: AdminOrderWorkflowTabsProps) {
  const [activeTab, setActiveTab] = useState('data-management');

  // 新しい2タブ構造
  const STEPS = [
    { id: 'data-management', label: 'データ・校正管理', description: 'データ入稿、送信、校正の統合管理' },
    { id: 'approval', label: '顧客承認', description: '顧客による校正データ承認' },
  ];

  return (
    <div className="space-y-6">
      {/* ワークフロータブ */}
      <Tabs defaultValue="data-management" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* タブリスト - 2タブ構造 */}
        <TabsList className="grid grid-cols-2 w-full h-auto gap-1 bg-gray-100 p-1 rounded-lg">
          {STEPS.map((step) => (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <span className="text-sm font-medium">{step.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* タブコンテンツ: データ・校正管理（統合タブ） */}
        <TabsContent value="data-management" className="space-y-4 mt-4">
          <DataAndCorrectionManagementTab
            order={order}
            orderId={orderId}
            adminNotes={adminNotes}
            onAdminNotesChange={onAdminNotesChange}
            onUpdateNotes={onUpdateNotes}
            onSendToKorea={onSendToKorea}
            sendingToKorea={sendingToKorea}
            koreaMessage={koreaMessage}
            fetchFn={adminFetch}
          />
        </TabsContent>

        {/* タブコンテンツ: 顧客承認 */}
        <TabsContent value="approval" className="space-y-4 mt-4">
          <AdminCustomerApprovalTab orderId={orderId} order={order} />
          {/* コメントセクションも表示 */}
          <Card className="p-6">
            <OrderCommentsSectionWrapper orderId={orderId} fetchFn={adminFetch} isAdmin={true} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
