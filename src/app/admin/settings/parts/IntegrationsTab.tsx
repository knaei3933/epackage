/**
 * Integrations tab content for AdminSettingsClient
 * Extracted for maintainability
 */

'use client';

import { motion } from 'framer-motion';
import { Loader2, Save, AlertCircle, Mail, Trash2, Plus, RotateCcw, PercentIcon, Users, Cloud, ExternalLink, Settings2, Tag, Package, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { CustomerMarkupData } from './types';

interface IntegrationsTabProps {
  googleDriveStatus: { connected: boolean; loading: boolean };
}

export function IntegrationsTab({
  googleDriveStatus,
}: IntegrationsTabProps) {
  return (
    <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Google Drive */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Cloud className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Google Drive 연동</h3>
                        <p className="text-sm text-gray-500">고객 입고 데이터 및 교정 파일 업로드 연동</p>
                      </div>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border',
                      googleDriveStatus.loading
                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : googleDriveStatus.connected
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                    )}>
                      {googleDriveStatus.loading
                        ? '확인 중...'
                        : googleDriveStatus.connected
                          ? '연결됨'
                          : '미연결'}
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p>
                        파일 업로드 시 관리자 Google Drive 계정에 저장됩니다.
                        연결이 끊어진 경우 재인증이 필요합니다.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/admin/settings/google-drive"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Cloud className="w-4 h-4" />
                        Google Drive 설정 열기
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Customer Markup Rate */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">고객 단가율 설정</h3>
                        <p className="text-sm text-gray-500">고객별 마크업 단가율 관리</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3 text-sm text-gray-600">
                      <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p>고객별 단가율(마크업) 설정은 전용 페이지에서 관리합니다.</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href="/admin/settings/customers"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        고객 단가율 설정 열기
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
    </>
  );
}
