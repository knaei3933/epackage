/**
 * Data and Correction Management Tab
 *
 * データ・校正管理統合タブ
 * - データ入稿
 * - データ送信
 * - 校正データ管理（複数版数対応）
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { OrderCommentsSectionWrapper } from '@/components/orders';
import { DataReceiptSection } from './DataReceiptSection';
import { KoreaSendSection } from './KoreaSendSection';
import { CorrectionRevisionsManager } from './CorrectionRevisionsManager';
import type { DataAndCorrectionManagementTabProps } from './types';

export function DataAndCorrectionManagementTab({
  order,
  orderId,
  adminNotes,
  onAdminNotesChange,
  onUpdateNotes,
  onSendToKorea,
  sendingToKorea,
  koreaMessage,
  fetchFn,
}: DataAndCorrectionManagementTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'receipt' | 'send' | 'correction'>('receipt');

  const SUB_TABS = [
    { id: 'receipt', label: 'データ入稿', description: '顧客からの入稿データ確認' },
    { id: 'send', label: 'データ送信', description: '韓国パートナーへ送信' },
    { id: 'correction', label: '校正データ', description: '校正データの管理' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Sub-tabs for different sections */}
      <Tabs defaultValue="receipt" value={activeSubTab} onValueChange={(v) => setActiveSubTab(v as any)} className="space-y-6">
        {/* Tab List */}
        <TabsList className="grid grid-cols-3 w-full h-auto gap-1 bg-gray-100 p-1 rounded-lg">
          {SUB_TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <span className="text-sm font-medium">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content: Data Receipt */}
        <TabsContent value="receipt" className="space-y-4 mt-4">
          <DataReceiptSection orderId={orderId} fetchFn={fetchFn} />
          {/* Comments Section */}
          <Card className="p-6">
            <OrderCommentsSectionWrapper orderId={orderId} fetchFn={fetchFn} />
          </Card>
        </TabsContent>

        {/* Tab Content: Korea Send */}
        <TabsContent value="send" className="space-y-4 mt-4">
          <KoreaSendSection
            orderId={orderId}
            adminNotes={adminNotes}
            onAdminNotesChange={onAdminNotesChange}
            onUpdateNotes={onUpdateNotes}
            onSendToKorea={onSendToKorea}
            sendingToKorea={sendingToKorea}
            koreaMessage={koreaMessage}
            fetchFn={fetchFn}
          />
        </TabsContent>

        {/* Tab Content: Correction Management */}
        <TabsContent value="correction" className="space-y-4 mt-4">
          <CorrectionRevisionsManager orderId={orderId} fetchFn={fetchFn} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { DataReceiptSection, KoreaSendSection, CorrectionRevisionsManager };
export type { DataAndCorrectionManagementTabProps };
