/**
 * Header and message toast for customer management.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  message: { type: 'success' | 'error'; text: string } | null;
  setShowAddCustomerModal: (open: boolean) => void;
}

export function Header({ message, setShowAddCustomerModal }: HeaderProps) {
  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                顧客管理
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                顧客情報の検索・管理・連絡
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddCustomerModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              顧客追加
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-50"
          >
            <div className={cn(
              "px-6 py-4 rounded-lg shadow-lg border flex items-center gap-3",
              message.type === 'success'
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            )}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
