/**
 * Export Modal for AdminCustomerManagementClient
 */

'use client';

import { Download, FileSpreadsheet, FileText, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui';

interface ExportModalProps {
  showExportModal: boolean;
  setShowExportModal: (open: boolean) => void;
  handleExport: (format: 'csv' | 'excel') => void;
}

export function ExportModal({ showExportModal, setShowExportModal, handleExport }: ExportModalProps) {
  return (
    <>
      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>データエクスポート</DialogTitle>
            <DialogDescription>
              選択した顧客データをエクスポートします
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <button
              onClick={() => handleExport('csv')}
              className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">CSV形式</div>
                <div className="text-sm text-gray-500">Excelで開ける汎用フォーマット</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </button>

            <button
              onClick={() => handleExport('excel')}
              className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Excel形式</div>
                <div className="text-sm text-gray-500">書式設定済みのExcelファイル</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </button>
          </div>

          <DialogFooter>
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
