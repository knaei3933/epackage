/**
 * Desktop table view for customer list.
 *
 * 列表示カスタマイズ（Step 9）:
 * - 表示/非表示をトグルで切り替え可能。
 * - 設定は localStorage (key: admin.customer.columns) に保存・復元される。
 * - デフォルト表示列: 担当者名・会社名・住所・電話番号・FAX番号・メールアドレス・直近見積・最新注文。
 * - カスタマイズ可能（非デフォルト）: 法人/個人・ステータス・登録日。
 * - バージョン管理: COLUMN_CONFIG の defaultVisible を変更したら COLUMN_CONFIG_VERSION を +1 する。
 */

'use client';

import { useEffect, useState } from 'react';
import type React from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Eye, Building2, Building, Phone, MoreVertical, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/types/portal';
import { ORDER_STATUS_LABELS, isOrderStatus } from '@/types/order-status';
import type { Profile } from './types';
import { getStatusBadge, getQuotationStatusBadge } from './badges';
import { DesktopPagination } from './Pagination';

type ColumnKey =
  | 'contact'
  | 'company'
  | 'businessType'
  | 'status'
  | 'quotation'
  | 'email'
  | 'phone'
  | 'registeredDate'
  | 'address'
  | 'fax'
  | 'latestOrder';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  defaultVisible: boolean;
}

const COLUMN_CONFIG: ColumnConfig[] = [
  { key: 'contact', label: '担当者名', defaultVisible: true },
  { key: 'company', label: '会社名', defaultVisible: true },
  { key: 'address', label: '住所', defaultVisible: true },
  { key: 'phone', label: '電話番号', defaultVisible: true },
  { key: 'fax', label: 'FAX番号', defaultVisible: true },
  { key: 'email', label: 'メールアドレス', defaultVisible: true },
  { key: 'quotation', label: '直近見積', defaultVisible: true },
  { key: 'latestOrder', label: '最新注文', defaultVisible: true },
  { key: 'businessType', label: '法人/個人', defaultVisible: false },
  { key: 'status', label: 'ステータス', defaultVisible: false },
  { key: 'registeredDate', label: '登録日', defaultVisible: false },
];

const STORAGE_KEY = 'admin.customer.columns';
// COLUMN_CONFIG の defaultVisible を変更したら VERSION を +1 する。
// localStorage の version が一致するときだけカスタマイズを反映し、
// 不一致・旧構造・不正の場合は DEFAULT_VISIBLE を使うことで、
// 新しいデフォルト列が既存ユーザーへ確実に反映される。
const COLUMN_CONFIG_VERSION = 2;

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = COLUMN_CONFIG.reduce(
  (acc, col) => {
    acc[col.key] = col.defaultVisible;
    return acc;
  },
  {} as Record<ColumnKey, boolean>
);

// 注文ステータス用の簡易 badge（badges.tsx の getStatusBadge は UserStatus 専用のため）
function getOrderStatusBadge(status: string) {
  if (!isOrderStatus(status)) {
    return <Badge variant="secondary" size="sm">{status}</Badge>;
  }
  const statusConfig = ORDER_STATUS_LABELS[status];
  if (!statusConfig) {
    return <Badge variant="secondary" size="sm">{status}</Badge>;
  }
  const variantMap: Record<string, 'success' | 'warning' | 'error' | 'secondary' | 'info'> = {
    initial: 'secondary',
    active: 'info',
    production: 'warning',
    final: 'success',
    terminated: 'error',
  };
  const variant = variantMap[statusConfig.category] ?? 'secondary';
  return <Badge variant={variant} size="sm">{statusConfig.ja}</Badge>;
}

interface DesktopCustomerTableProps {
  customers: Profile[];
  selectedCustomers: Set<string>;
  toggleCustomerSelection: (customerId: string) => void;
  toggleAllSelection: () => void;
  handleSendEmail: (customer?: Profile) => void;
  onOpenCustomerDetail: (customer: Profile) => void;
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
  onOpenCustomerDetail,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  setCurrentPage,
}: DesktopCustomerTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(DEFAULT_VISIBLE);
  const [hydrated, setHydrated] = useState(false);
  const [showColumnToggle, setShowColumnToggle] = useState(false);

  // localStorage から表示設定を復元（SSR 安全のため初回効果で読み込み）
  // バージョン管理: storedVersion が COLUMN_CONFIG_VERSION と一致するときだけ
  // カスタマイズを反映。不一致・旧構造（boolean 直マップ・version フィールドなし）・
  // JSON 不正の場合は DEFAULT_VISIBLE をそのまま使用（setVisibleColumns しない）。
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        // 正常構造の検証: { version, columns } 形式 + columns は object
        if (
          parsed &&
          typeof parsed === 'object' &&
          !Array.isArray(parsed) &&
          (parsed as { version?: unknown }).version === COLUMN_CONFIG_VERSION &&
          (parsed as { columns?: unknown }).columns &&
          typeof (parsed as { columns?: unknown }).columns === 'object'
        ) {
          const storedColumns = (parsed as { columns: Partial<Record<ColumnKey, boolean>> }).columns;
          const merged = { ...DEFAULT_VISIBLE };
          (Object.keys(merged) as ColumnKey[]).forEach((key) => {
            if (storedColumns[key] !== undefined) {
              merged[key] = Boolean(storedColumns[key]);
            }
          });
          setVisibleColumns(merged);
        }
        // version 不一致・旧構造・不正の場合は DEFAULT_VISIBLE をそのまま使用
      }
    } catch {
      // 不正な JSON はデフォルト設定を使用
    }
    setHydrated(true);
  }, []);

  // 表示設定を localStorage に保存（hydrate 後のみ）
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: COLUMN_CONFIG_VERSION, columns: visibleColumns })
        );
      } catch {
        // ストレージ書き込み失敗（プライベートモード等）は無視
      }
    }
  }, [visibleColumns, hydrated]);

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card variant="default" className="overflow-hidden hidden md:block">
      {/* カラムカスタマイズバー */}
      <div className="flex justify-end items-center px-4 py-2.5 border-b border-gray-200 bg-gray-50/60">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColumnToggle((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            列の表示
          </button>
          {showColumnToggle && (
            <>
              {/* 外側クリックでドロップダウンを閉じるためのオーバーレイ */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowColumnToggle(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  表示する列
                </div>
                {COLUMN_CONFIG.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key]}
                      onChange={() => toggleColumn(col.key)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2.5 text-sm text-gray-700">{col.label}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

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
              {visibleColumns.contact && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  顧客名
                </th>
              )}
              {visibleColumns.company && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  会社名
                </th>
              )}
              {visibleColumns.address && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  住所
                </th>
              )}
              {visibleColumns.phone && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  電話番号
                </th>
              )}
              {visibleColumns.fax && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FAX番号
                </th>
              )}
              {visibleColumns.email && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
              )}
              {visibleColumns.quotation && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  見積情報
                </th>
              )}
              {visibleColumns.latestOrder && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最新注文
                </th>
              )}
              {visibleColumns.businessType && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  法人/個人
                </th>
              )}
              {visibleColumns.status && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
              )}
              {visibleColumns.registeredDate && (
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
              )}
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
                  {visibleColumns.contact && (
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                          {(customer.kanji_last_name || customer.email)[0]}
                        </div>
                        <div className="ml-4">
                          <button
                            type="button"
                            onClick={() => onOpenCustomerDetail(customer)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline text-left"
                          >
                            {customer.kanji_last_name} {customer.kanji_first_name}
                          </button>
                          <div className="text-xs text-gray-500">
                            {customer.kana_last_name} {customer.kana_first_name}
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.company && (
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
                  )}
                  {visibleColumns.address && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {customer.postal_code || customer.prefecture || customer.city || customer.street ? (
                          <span>
                            {customer.postal_code && `〒${customer.postal_code} `}
                            {customer.prefecture}
                            {customer.city}
                            {customer.street}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.phone && (
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {customer.corporate_phone || customer.personal_phone || '-'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.fax && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {customer.fax || <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                  )}
                  {visibleColumns.email && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{customer.email}</div>
                    </td>
                  )}
                  {visibleColumns.quotation && (
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
                            {formatDate(customer.latestQuotation.created_at, 'ja')}
                          </div>
                          <div className="text-xs text-gray-600">
                            ¥{(customer.latestQuotation.total_amount || 0).toLocaleString()}
                          </div>
                          {(customer.totalQuotations || 0) > 1 && (
                            <div className="text-[11px] text-gray-500">
                              全{customer.totalQuotations}件
                            </div>
                          )}
                        </div>
                      ) : customer.totalQuotations && customer.totalQuotations > 0 ? (
                        <div className="space-y-0.5">
                          <div className="text-sm text-gray-600">
                            {customer.totalQuotations}件の見積
                          </div>
                          {customer.pendingQuotations ? (
                            <div className="text-xs text-amber-600">
                              未対応 {customer.pendingQuotations}件
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                  )}
                  {visibleColumns.latestOrder && (
                    <td className="px-6 py-4">
                      {customer.latestOrder ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={`/admin/orders?id=${customer.latestOrder.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {customer.latestOrder.order_number}
                            </a>
                            {getOrderStatusBadge(customer.latestOrder.status)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {formatDate(customer.latestOrder.created_at, 'ja')}
                          </div>
                          <div className="text-xs text-gray-600">
                            ¥{(customer.latestOrder.total_amount || 0).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                  )}
                  {visibleColumns.businessType && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-900">
                        <Building className="w-4 h-4 text-gray-400" />
                        {customer.business_type === 'CORPORATION' ? '法人' : '個人'}
                      </div>
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-6 py-4">
                      {getStatusBadge(customer.status)}
                    </td>
                  )}
                  {visibleColumns.registeredDate && (
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(customer.created_at, 'ja')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.floor((Date.now() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24))}日前
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenCustomerDetail(customer)}
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
