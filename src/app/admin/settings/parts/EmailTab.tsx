/**
 * Email tab content for AdminSettingsClient
 * Extracted for maintainability
 */

'use client';

import { motion } from 'framer-motion';
import { Loader2, Save, AlertCircle, Mail, Trash2, Plus, RotateCcw, PercentIcon, Users, Cloud, ExternalLink, Settings2, Tag, Package, ChevronRight, X, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { CustomerMarkupData } from './types';

interface EmailTabProps {
  emailSettings: any;
  loadingEmailSettings: boolean;
  savingEmailSettings: boolean;
  newRecipientEmail: { type: 'admin' | 'sales' | 'production'; email: string };
  setEmailSettings: (v: any) => void;
  setNewRecipientEmail: (v: { type: 'admin' | 'sales' | 'production'; email: string }) => void;
  saveEmailSettingsSection: (s: string, d: any) => void;
  loadEmailSettings: () => void;
}

export function EmailTab({
  emailSettings,
  loadingEmailSettings,
  savingEmailSettings,
  newRecipientEmail,
  setEmailSettings,
  setNewRecipientEmail,
  saveEmailSettingsSection,
  loadEmailSettings,
}: EmailTabProps) {
  return (
    <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {loadingEmailSettings ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">로딩 중...</p>
                  </div>
                ) : emailSettings ? (
                  <>
                    {/* SMTP Settings */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Settings2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">SMTP 설정</h3>
                            <p className="text-sm text-gray-500">이메일 서버 연결 설정</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
                            <input
                              type="text"
                              value={emailSettings.smtp.host}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                smtp: { ...emailSettings.smtp, host: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="sv12515.xserver.jp"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                            <input
                              type="number"
                              value={emailSettings.smtp.port}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                smtp: { ...emailSettings.smtp, port: parseInt(e.target.value) || 587 }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                              type="text"
                              value={emailSettings.smtp.user}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                smtp: { ...emailSettings.smtp, user: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                              type="password"
                              value={emailSettings.smtp.password}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                smtp: { ...emailSettings.smtp, password: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                            <input
                              type="email"
                              value={emailSettings.smtp.from_email}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                smtp: { ...emailSettings.smtp, from_email: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reply-To</label>
                            <input
                              type="email"
                              value={emailSettings.smtp.reply_to}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                smtp: { ...emailSettings.smtp, reply_to: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                            <input
                              type="email"
                              value={emailSettings.smtp.admin_email}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                smtp: { ...emailSettings.smtp, admin_email: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => saveEmailSettingsSection('smtp', emailSettings.smtp)}
                            disabled={savingEmailSettings}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            저장
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Email Toggles */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Tag className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">기능 토글</h3>
                            <p className="text-sm text-gray-500">이메일 자동 발송 설정</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(emailSettings.toggles).map(([key, value]) => (
                            <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                              <span className="text-sm font-medium text-gray-700">
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                              <input
                                type="checkbox"
                                checked={Boolean(value)}
                                onChange={(e) => setEmailSettings({
                                  ...emailSettings,
                                  toggles: { ...emailSettings.toggles, [key]: e.target.checked }
                                })}
                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </label>
                          ))}
                        </div>
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => saveEmailSettingsSection('toggles', emailSettings.toggles)}
                            disabled={savingEmailSettings}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            저장
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Package className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">회사 정보</h3>
                            <p className="text-sm text-gray-500">이메일 서명용 회사 정보</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">회사명 (日本語)</label>
                            <input
                              type="text"
                              value={emailSettings.companyInfo.company_name_ja}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                companyInfo: { ...emailSettings.companyInfo, company_name_ja: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">회사명 (English)</label>
                            <input
                              type="text"
                              value={emailSettings.companyInfo.company_name_en}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                companyInfo: { ...emailSettings.companyInfo, company_name_en: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">지원 이메일</label>
                            <input
                              type="email"
                              value={emailSettings.companyInfo.support_email}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                companyInfo: { ...emailSettings.companyInfo, support_email: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">지원 전화</label>
                            <input
                              type="text"
                              value={emailSettings.companyInfo.support_phone}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                companyInfo: { ...emailSettings.companyInfo, support_phone: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                            <input
                              type="text"
                              value={emailSettings.companyInfo.postal_code}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                companyInfo: { ...emailSettings.companyInfo, postal_code: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                            <input
                              type="text"
                              value={emailSettings.companyInfo.address}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                companyInfo: { ...emailSettings.companyInfo, address: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => saveEmailSettingsSection('companyInfo', emailSettings.companyInfo)}
                            disabled={savingEmailSettings}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            저장
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bank Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <Coins className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">은행 계좌</h3>
                            <p className="text-sm text-gray-500">청구서용 은행 계좌 정보</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">은행명</label>
                            <input
                              type="text"
                              value={emailSettings.bankInfo.bank_name}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                bankInfo: { ...emailSettings.bankInfo, bank_name: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">지점명</label>
                            <input
                              type="text"
                              value={emailSettings.bankInfo.branch_name}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                bankInfo: { ...emailSettings.bankInfo, branch_name: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">계좌 종류</label>
                            <input
                              type="text"
                              value={emailSettings.bankInfo.account_type}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                bankInfo: { ...emailSettings.bankInfo, account_type: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">계좌 번호</label>
                            <input
                              type="text"
                              value={emailSettings.bankInfo.account_number}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                bankInfo: { ...emailSettings.bankInfo, account_number: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
                            <input
                              type="text"
                              value={emailSettings.bankInfo.account_holder}
                              onChange={(e) => setEmailSettings({
                                ...emailSettings,
                                bankInfo: { ...emailSettings.bankInfo, account_holder: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => saveEmailSettingsSection('bankInfo', emailSettings.bankInfo)}
                            disabled={savingEmailSettings}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            저장
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Notification Recipients */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-100 rounded-lg">
                            <Mail className="w-5 h-5 text-cyan-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">알림 수신자</h3>
                            <p className="text-sm text-gray-500">관리자/영업/생산팀 알림 이메일</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 space-y-6">
                        {/* Admin Emails */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">관리자 알림</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {emailSettings.recipients.admin_emails.map((email: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {email}
                                <button
                                  onClick={() => setEmailSettings({
                                    ...emailSettings,
                                    recipients: {
                                      ...emailSettings.recipients,
                                      admin_emails: emailSettings.recipients.admin_emails.filter((_: string, i: number) => i !== idx)
                                    }
                                  })}
                                  className="hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              placeholder="이메일 주소"
                              value={newRecipientEmail.type === 'admin' ? newRecipientEmail.email : ''}
                              onChange={(e) => setNewRecipientEmail({ type: 'admin', email: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                if (newRecipientEmail.type === 'admin' && newRecipientEmail.email) {
                                  setEmailSettings({
                                    ...emailSettings,
                                    recipients: {
                                      ...emailSettings.recipients,
                                      admin_emails: [...emailSettings.recipients.admin_emails, newRecipientEmail.email]
                                    }
                                  });
                                  setNewRecipientEmail({ type: 'admin', email: '' });
                                }
                              }}
                              className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                              추가
                            </button>
                          </div>
                        </div>
                        {/* Sales Emails */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">영업팀 알림</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {emailSettings.recipients.sales_emails.map((email: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {email}
                                <button
                                  onClick={() => setEmailSettings({
                                    ...emailSettings,
                                    recipients: {
                                      ...emailSettings.recipients,
                                      sales_emails: emailSettings.recipients.sales_emails.filter((_: string, i: number) => i !== idx)
                                    }
                                  })}
                                  className="hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              placeholder="이메일 주소"
                              value={newRecipientEmail.type === 'sales' ? newRecipientEmail.email : ''}
                              onChange={(e) => setNewRecipientEmail({ type: 'sales', email: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                if (newRecipientEmail.type === 'sales' && newRecipientEmail.email) {
                                  setEmailSettings({
                                    ...emailSettings,
                                    recipients: {
                                      ...emailSettings.recipients,
                                      sales_emails: [...emailSettings.recipients.sales_emails, newRecipientEmail.email]
                                    }
                                  });
                                  setNewRecipientEmail({ type: 'sales', email: '' });
                                }
                              }}
                              className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                              추가
                            </button>
                          </div>
                        </div>
                        {/* Production Emails */}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">생산팀 알림</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {emailSettings.recipients.production_emails.map((email: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
                                {email}
                                <button
                                  onClick={() => setEmailSettings({
                                    ...emailSettings,
                                    recipients: {
                                      ...emailSettings.recipients,
                                      production_emails: emailSettings.recipients.production_emails.filter((_: string, i: number) => i !== idx)
                                    }
                                  })}
                                  className="hover:text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              placeholder="이메일 주소"
                              value={newRecipientEmail.type === 'production' ? newRecipientEmail.email : ''}
                              onChange={(e) => setNewRecipientEmail({ type: 'production', email: e.target.value })}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                if (newRecipientEmail.type === 'production' && newRecipientEmail.email) {
                                  setEmailSettings({
                                    ...emailSettings,
                                    recipients: {
                                      ...emailSettings.recipients,
                                      production_emails: [...emailSettings.recipients.production_emails, newRecipientEmail.email]
                                    }
                                  });
                                  setNewRecipientEmail({ type: 'production', email: '' });
                                }
                              }}
                              className="px-3 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                            >
                              추가
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => saveEmailSettingsSection('recipients', emailSettings.recipients)}
                            disabled={savingEmailSettings}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                          >
                            {savingEmailSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            저장
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-sm text-gray-500">이메일 설정을 불러올 수 없습니다</p>
                    <button
                      onClick={loadEmailSettings}
                      className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      다시 시도
                    </button>
                  </div>
                )}
              </motion.div>
    </>
  );
}
