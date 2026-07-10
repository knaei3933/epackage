/**
 * Customer Detail Modal for AdminCustomerManagementClient
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Phone, Building2, Calendar, ShoppingBag, MessageSquare, FileText, Package, Clock, Send, Download, Loader2, Eye, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { formatDate } from '@/types/portal';


interface CustomerDetailModalProps {
  showDetailModal: boolean;
  selectedCustomer: any;
  customerDetail: any;
  loadingCustomerDetail: boolean;
  setShowDetailModal: (open: boolean) => void;
  setCustomerDetail: (d: any) => void;
  setSelectedCustomer: (c: any) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getQuotationStatusBadge: (status: string) => React.ReactNode;
  handleSendEmail: (customer?: any) => void;
  setShowExportModal: (open: boolean) => void;
}

export function CustomerDetailModal(props: CustomerDetailModalProps) {
  const { showDetailModal, selectedCustomer, customerDetail, loadingCustomerDetail, setShowDetailModal, setCustomerDetail, setSelectedCustomer, getStatusBadge, getQuotationStatusBadge, handleSendEmail, setShowExportModal } = props;
  return (
    <>
      {/* Customer Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={(open) => {
        setShowDetailModal(open);
        if (!open) {
          setCustomerDetail(null);
          setSelectedCustomer(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {(selectedCustomer.kanji_last_name || selectedCustomer.email)[0]}
                  </div>
                  <div>
                    {selectedCustomer.kanji_last_name} {selectedCustomer.kanji_first_name}
                    <div className="text-sm font-normal text-gray-500">
                      {selectedCustomer.kana_last_name} {selectedCustomer.kana_first_name}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedCustomer.email}
                </DialogDescription>
              </DialogHeader>

              {loadingCustomerDetail ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="mt-4 text-gray-600">読み込み中...</p>
                </div>
              ) : customerDetail ? (
                <div className="space-y-6 mt-6">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">基本情報</h4>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">ステータス</dt>
                          <dd>{getStatusBadge(selectedCustomer.status)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">種別</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.business_type === 'CORPORATION' ? '法人' :
                             (selectedCustomer.business_type as string) === 'SOLE_PROPRIETOR' ? '個人事業主' : '個人'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">登録日</dt>
                          <dd className="text-sm text-gray-900">
                            {formatDate(selectedCustomer.created_at, 'ja')}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">最終ログイン</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.last_login_at
                              ? formatDate(selectedCustomer.last_login_at, 'ja')
                              : '-'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">連絡先</h4>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">会社電話</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.corporate_phone || '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">携帯電話</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.personal_phone || '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">会社名</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.company_name || '-'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">役職</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedCustomer.position || '-'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Order Statistics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">注文・見積統計</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {customerDetail.statistics.totalOrders}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">総注文数</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ¥{(((customerDetail.statistics.totalSpent || 0) / 10000).toFixed(1))}万
                        </div>
                        <div className="text-xs text-gray-600 mt-1">総購入額</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {customerDetail.statistics.totalQuotations || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">総見積数</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">
                          {customerDetail.statistics.pendingQuotations || 0}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">見積待ち</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact History */}
                  {customerDetail.contactHistory && customerDetail.contactHistory.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">連絡履歴</h4>
                      <div className="space-y-3">
                        {customerDetail.contactHistory.map((contact: any) => (
                          <div
                            key={contact.id}
                            className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                              contact.type === 'email' && "bg-blue-100 text-blue-600",
                              contact.type === 'call' && "bg-green-100 text-green-600",
                              contact.type === 'note' && "bg-yellow-100 text-yellow-600"
                            )}>
                              {contact.type === 'email' && <Mail className="w-5 h-5" />}
                              {contact.type === 'call' && <Phone className="w-5 h-5" />}
                              {contact.type === 'note' && <FileText className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {contact.subject || (contact.type === 'email' ? 'メール送信' : contact.type === 'call' ? '電話対応' : 'メモ')}
                                </p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(contact.createdAt, 'ja')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{contact.content}</p>
                              <p className="text-xs text-gray-500 mt-1">作成者: {contact.createdBy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quotations History */}
                  {customerDetail.quotations && customerDetail.quotations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center justify-between">
                        <span>見積もり履歴</span>
                        <span className="text-xs text-gray-500">{customerDetail.quotations.length}件</span>
                      </h4>
                      <div className="space-y-3">
                        {customerDetail.quotations.map((quotation: any) => (
                          <div
                            key={quotation.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">
                                    {quotation.quotation_number}
                                  </span>
                                  {getQuotationStatusBadge(quotation.status)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(quotation.created_at, 'ja')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  ¥{((quotation.total_amount || 0).toLocaleString())}
                                </div>
                              </div>
                            </div>

                            {/* Quotation Items Summary */}
                            {quotation.items && quotation.items.length > 0 && (
                              <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                                <div className="text-gray-600 mb-1">明細:</div>
                                <div className="space-y-1">
                                  {quotation.items.slice(0, 3).map((item: any, index: number) => (
                                    <div key={item.id} className="flex justify-between text-xs">
                                      <span className="text-gray-700">
                                        {item.product_name} × {item.quantity}
                                      </span>
                                      <span className="text-gray-600">
                                        ¥{item.total_price.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                  {quotation.items.length > 3 && (
                                    <div className="text-xs text-gray-500 italic">
                                      他 {quotation.items.length - 3} 品目...
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Quotation Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                              <div className="text-xs text-gray-500">
                                {quotation.admin_notes && (
                                  <span className="inline-flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    管理者メモあり
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {quotation.pdf_url && (
                                  <a
                                    href={quotation.pdf_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                  >
                                    <Download className="w-3 h-3" />
                                    PDF
                                  </a>
                                )}
                                <a
                                  href={`/admin/quotations?id=${quotation.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  詳細
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <DialogFooter className="gap-3">
                <button
                  onClick={() => {
                    handleSendEmail(selectedCustomer!);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  メール送信
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowExportModal(true);
                  }}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  エクスポート
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg transition-colors"
                >
                  閉じる
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
