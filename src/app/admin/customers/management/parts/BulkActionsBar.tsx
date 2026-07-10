/**
 * Bulk actions bar for customer management.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Download, X } from 'lucide-react';

interface BulkActionsBarProps {
  showBulkActions: boolean;
  selectedCustomers: Set<string>;
  customersLength: number;
  toggleAllSelection: () => void;
  handleSendEmail: () => void;
  setShowExportModal: (open: boolean) => void;
  clearSelection: () => void;
}

export function BulkActionsBar({
  showBulkActions,
  selectedCustomers,
  customersLength,
  toggleAllSelection,
  handleSendEmail,
  setShowExportModal,
  clearSelection,
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {showBulkActions && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <input
              type="checkbox"
              checked={selectedCustomers.size === customersLength}
              onChange={toggleAllSelection}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-blue-900">
              {selectedCustomers.size}件選択中
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendEmail}
                className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"
              >
                <Mail className="w-3.5 h-3.5 md:w-4 h-4" />
                <span className="hidden sm:inline">メール送信</span>
                <span className="sm:hidden">メール</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3 md:px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors flex items-center gap-1.5 md:gap-2 text-xs md:text-sm"
              >
                <Download className="w-3.5 h-3.5 md:w-4 h-4" />
                <span className="hidden sm:inline">エクスポート</span>
                <span className="sm:hidden">出力</span>
              </button>
            </div>
            <button
              onClick={clearSelection}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
