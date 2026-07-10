/**
 * Add Customer Modal for AdminCustomerManagementClient
 */

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui';

interface AddCustomerModalProps {
  showAddCustomerModal: boolean;
  setShowAddCustomerModal: (open: boolean) => void;
  showMessage: (type: 'success' | 'error', text: string) => void;
  loadCustomers: () => void;
}

export function AddCustomerModal({ showAddCustomerModal, setShowAddCustomerModal, showMessage, loadCustomers }: AddCustomerModalProps) {
  return (
    <>
      {/* Add Customer Modal */}
      <Dialog open={showAddCustomerModal} onOpenChange={setShowAddCustomerModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新規顧客追加</DialogTitle>
            <DialogDescription>
              新しい顧客アカウントを作成します
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-center text-gray-500 py-8">
              顧客登録フォームがここに表示されます
            </p>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowAddCustomerModal(false)}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={() => {
                showMessage('success', '顧客を追加しました');
                setShowAddCustomerModal(false);
                loadCustomers();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              追加する
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
