/**
 * Designer tab content for AdminSettingsClient
 * Extracted for maintainability
 */

'use client';

import { motion } from 'framer-motion';
import { Loader2, Save, AlertCircle, Mail, Trash2, Plus, RotateCcw, PercentIcon, Users, Cloud, ExternalLink, Settings2, Tag, Package, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { CustomerMarkupData } from './types';

interface DesignerTabProps {
  designerEmails: string[];
  loadingDesignerEmails: boolean;
  savingDesignerEmails: boolean;
  newDesignerEmail: string;
  emailError: string | null;
  setNewDesignerEmail: (v: string) => void;
  setEmailError: (v: string | null) => void;
  handleAddDesignerEmail: () => void;
  handleRemoveDesignerEmail: (e: string) => void;
  loadDesignerEmails: () => void;
}

export function DesignerTab({
  designerEmails,
  loadingDesignerEmails,
  savingDesignerEmails,
  newDesignerEmail,
  emailError,
  setNewDesignerEmail,
  setEmailError,
  handleAddDesignerEmail,
  handleRemoveDesignerEmail,
  loadDesignerEmails,
}: DesignerTabProps) {
  return (
    <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">디자이너 이메일 주소</h3>
                      <p className="text-sm text-gray-500">데이터 입고 알림의 수신 이메일 주소</p>
                    </div>
                  </div>
                  <button
                    onClick={loadDesignerEmails}
                    disabled={loadingDesignerEmails}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {loadingDesignerEmails ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    새로고침
                  </button>
                </div>

                {/* Add Email Form */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        type="email"
                        placeholder="이메일 주소를 입력하세요..."
                        value={newDesignerEmail}
                        onChange={(e) => {
                          setNewDesignerEmail(e.target.value);
                          setEmailError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddDesignerEmail();
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      {emailError && (
                        <p className="text-xs text-red-600 mt-1">{emailError}</p>
                      )}
                    </div>
                    <button
                      onClick={handleAddDesignerEmail}
                      disabled={savingDesignerEmails || !newDesignerEmail.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {savingDesignerEmails ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      추가
                    </button>
                  </div>
                </div>

                {/* Email List */}
                <div className="divide-y divide-gray-100">
                  {loadingDesignerEmails ? (
                    <div className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">로딩 중...</p>
                    </div>
                  ) : designerEmails.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">등록된 이메일 주소가 없습니다</p>
                      <p className="text-xs text-gray-400 mt-1">위의 양식에서 이메일 주소를 추가하세요</p>
                    </div>
                  ) : (
                    designerEmails.map((email: string) => (
                      <div
                        key={email}
                        className="px-6 py-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Mail className="w-4 h-4 text-gray-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{email}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveDesignerEmail(email)}
                          disabled={savingDesignerEmails}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Info Box */}
                <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">알림 정보</p>
                      <p className="mt-1">여기에 설정된 이메일 주소로 고객이 데이터를 업로드할 때 알림이 발송됩니다.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
    </>
  );
}
