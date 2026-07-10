/**
 * Mobile card view for customer list.
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Eye, Building2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/types/portal';
import type { Profile } from './types';
import { getStatusBadge, getQuotationStatusBadge } from './badges';

interface MobileCustomerListProps {
  customers: Profile[];
  selectedCustomers: Set<string>;
  toggleCustomerSelection: (customerId: string) => void;
  handleSendEmail: (customer?: Profile) => void;
  openCustomerDetail: (customer: Profile) => void;
}

export function MobileCustomerList({
  customers,
  selectedCustomers,
  toggleCustomerSelection,
  handleSendEmail,
  openCustomerDetail,
}: MobileCustomerListProps) {
  return (
    <div className="md:hidden space-y-3">
      <AnimatePresence>
        {customers.map((customer, index) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 active:shadow-md transition-shadow",
              selectedCustomers.has(customer.id) && "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
            )}
          >
            <div className="flex items-start gap-3 mb-3">
              <input
                type="checkbox"
                checked={selectedCustomers.has(customer.id)}
                onChange={() => toggleCustomerSelection(customer.id)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-sm">
                    {(customer.kanji_last_name || customer.email)[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {customer.kanji_last_name} {customer.kanji_first_name}
                      </h3>
                      {getStatusBadge(customer.status)}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {customer.kana_last_name} {customer.kana_first_name}
                    </p>
                  </div>
                </div>
                {customer.company_name && (
                  <div className="flex items-center text-xs text-gray-700 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{customer.company_name}</span>
                  </div>
                )}
                <div className="text-xs text-gray-900 mb-1 truncate">{customer.email}</div>
                {customer.corporate_phone && (
                  <div className="flex items-center text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    <span>{customer.corporate_phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <div className="text-base font-bold text-gray-900">
                  {customer.totalOrders || 0}
                </div>
                <div className="text-[10px] text-gray-500">注文</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-green-600">
                  ¥{(((customer.totalSpent || 0) / 10000).toFixed(1))}万
                </div>
                <div className="text-[10px] text-gray-500">購入額</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-gray-600">
                  {Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-[10px] text-gray-500">日前</div>
              </div>
            </div>

            {/* Quotation info */}
            {customer.latestQuotation && (
              <div className="mb-3 p-2.5 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-1">
                  <a
                    href={`/admin/quotations?id=${customer.latestQuotation.id}`}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 hover:underline"
                  >
                    {customer.latestQuotation.quotation_number}
                  </a>
                  {getQuotationStatusBadge(customer.latestQuotation.status)}
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  ¥{(customer.latestQuotation.total_amount || 0).toLocaleString()}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleSendEmail(customer)}
                className="flex-1 py-2.5 px-3 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 active:bg-green-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                メール
              </button>
              <button
                onClick={() => openCustomerDetail(customer)}
                className="flex-1 py-2.5 px-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                詳細
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
