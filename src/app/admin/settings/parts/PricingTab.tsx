/**
 * Pricing tab content for AdminSettingsClient
 * Extracted for maintainability
 */

'use client';

import { motion } from 'framer-motion';
import { Loader2, Save, AlertCircle, Mail, Trash2, Plus, RotateCcw, PercentIcon, Users, Cloud, ExternalLink, Settings2, Tag, Package, ChevronRight, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { CustomerMarkupData } from './types';

interface PricingTabProps {
  customers: CustomerMarkupData[];
  loadingCustomers: boolean;
  savingCustomer: string | null;
  customerSearch: string;
  editingCustomerId: string | null;
  editFormData: { markupRate: number; markupRateNote: string };
  filteredCustomers: CustomerMarkupData[];
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
  setCustomerSearch: (v: string) => void;
  setCurrentPage: (v: number) => void;
  setEditFormData: (v: { markupRate: number; markupRateNote: string }) => void;
  setEditingCustomerId: (v: string | null) => void;
  handleStartEdit: (c: CustomerMarkupData) => void;
  handleCancelEdit: () => void;
  handleSaveCustomerMarkup: (id: string) => void;
  handlePageChange: (p: number) => void;
  loadCustomers: (page?: number) => void;
  handleCustomerSearch: (search: string) => void;
}

export function PricingTab({
  customers,
  loadingCustomers,
  savingCustomer,
  customerSearch,
  editingCustomerId,
  editFormData,
  filteredCustomers,
  currentPage,
  totalPages,
  totalCustomers,
  setCustomerSearch,
  setCurrentPage,
  setEditFormData,
  setEditingCustomerId,
  handleStartEdit,
  handleCancelEdit,
  handleSaveCustomerMarkup,
  handlePageChange,
  loadCustomers,
  handleCustomerSearch,
}: PricingTabProps) {
  return (
    <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Group Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <PercentIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">고객별 할인율</h3>
                      <p className="text-sm text-gray-500">고객별 할인율 관리 (0% ~ -50%)</p>
                    </div>
                  </div>
                  <button
                    onClick={() => loadCustomers()}
                    disabled={loadingCustomers}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {loadingCustomers ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    새로고침
                  </button>
                </div>

                {/* Customer Search */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="고객 검색... (이메일, 회사명)"
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Customer Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객 정보</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">회사명</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">할인율</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">메모</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loadingCustomers ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-500">로딩 중...</p>
                          </td>
                        </tr>
                      ) : filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <p className="text-sm text-gray-500">
                              {customerSearch ? '검색 결과가 없습니다.' : '고객 데이터가 없습니다.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                                <p className="text-xs text-gray-500">{customer.role}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-700">{customer.companyName || '-'}</p>
                            </td>
                            <td className="px-6 py-4">
                              {editingCustomerId === customer.id ? (
                                <div>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="-0.5"
                                    max="0"
                                    value={editFormData.markupRate}
                                    onChange={(e) => setEditFormData({ ...editFormData, markupRate: parseFloat(e.target.value) || 0 })}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                  <p className="text-xs text-gray-400 mt-1">
                                    예: -0.1 (10% 할인), -0.2 (20% 할인)
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm font-medium text-gray-900">
                                  {((customer.markupRate ?? 0) * 100).toFixed(0)}%
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {editingCustomerId === customer.id ? (
                                <input
                                  type="text"
                                  value={editFormData.markupRateNote}
                                  onChange={(e) => setEditFormData({ ...editFormData, markupRateNote: e.target.value })}
                                  placeholder="메모 입력..."
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              ) : (
                                <p className="text-sm text-gray-600">{customer.markupRateNote || '-'}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {editingCustomerId === customer.id ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={handleCancelEdit}
                                    disabled={savingCustomer === customer.id}
                                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                                  >
                                    취소
                                  </button>
                                  <button
                                    onClick={() => handleSaveCustomerMarkup(customer.id)}
                                    disabled={savingCustomer === customer.id}
                                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                                  >
                                    {savingCustomer === customer.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <Save className="w-3 h-3" />
                                        저장
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleStartEdit(customer)}
                                  className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                                >
                                  편집
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        총 <span className="font-medium">{totalCustomers}</span>명의 고객
                        <span className="mx-2">•</span>
                        <span className="font-medium">{currentPage}</span> / {totalPages} 페이지
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || loadingCustomers}
                          className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <ChevronRight className="w-4 h-4 rotate-180" />
                          이전
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={cn(
                                  "min-w-[2rem] px-3 py-1 text-sm font-medium border rounded-lg",
                                  currentPage === pageNum
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "border-gray-300 hover:bg-gray-50"
                                )}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages || loadingCustomers}
                          className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          다음
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
    </>
  );
}
