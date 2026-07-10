/**
 * Desktop table view for customer list.
 */

'use client';
import type React from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Eye, Building2, Phone, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/types/portal';
import type { Profile } from './types';
import { getStatusBadge, getQuotationStatusBadge } from './badges';
import { DesktopPagination } from './Pagination';

interface DesktopCustomerTableProps {
  customers: Profile[];
  selectedCustomers: Set<string>;
  toggleCustomerSelection: (customerId: string) => void;
  toggleAllSelection: () => void;
  handleSendEmail: (customer?: Profile) => void;
  openCustomerDetail: (customer: Profile) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export function DesktopCustomerTable({
  customers,
  selectedCustomers,
  toggleCustomerSelection,
  toggleAllSelection,
  handleSendEmail,
  openCustomerDetail,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  setCurrentPage,
}: DesktopCustomerTableProps) {
  return (
    <Card variant="default" className="overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedCustomers.size === customers.length && customers.length > 0}
                  onChange={toggleAllSelection}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                顧客名
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                会社名
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                メールアドレス
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                電話番号
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                登録日
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                注文数
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                見積情報
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <AnimatePresence>
              {customers.map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    selectedCustomers.has(customer.id) && "bg-blue-50"
                  )}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.has(customer.id)}
                      onChange={() => toggleCustomerSelection(customer.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                        {(customer.kanji_last_name || customer.email)[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.kanji_last_name} {customer.kanji_first_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {customer.kana_last_name} {customer.kana_first_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      {customer.company_name ? (
                        <>
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {customer.company_name}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                    {customer.position && (
                      <div className="text-xs text-gray-500 mt-1">{customer.position}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {customer.corporate_phone || customer.personal_phone || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {formatDate(customer.created_at, 'ja')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24))}日前
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium">
                      {customer.totalOrders || 0}
                    </div>
                    <div className="text-xs text-gray-500">
                      ¥{(((customer.totalSpent || 0) / 10000).toFixed(1))}万
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {customer.latestQuotation ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/quotations?id=${customer.latestQuotation.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {customer.latestQuotation.quotation_number}
                          </a>
                          {getQuotationStatusBadge(customer.latestQuotation.status)}
                        </div>
                        <div className="text-xs text-gray-600">
                          ¥{(customer.latestQuotation.total_amount || 0).toLocaleString()}
                        </div>
                      </div>
                    ) : customer.totalQuotations && customer.totalQuotations > 0 ? (
                      <div className="text-sm text-gray-600">
                        {customer.totalQuotations}件の見積
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openCustomerDetail(customer)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="詳細を表示"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendEmail(customer)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="メール送信"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="その他"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <DesktopPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
      />
    </Card>
  );
}
