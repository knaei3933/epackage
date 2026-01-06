/**
 * Korea Corrections Manager Component
 *
 * 한국 파트너 수정사항 관리 컴포넌트
 * - 수정사항 목록 표시
 * - 상태 업데이트
 * - 수정 파일 업로드
 * - 고객 알림 발송
 *
 * @admin
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  Upload,
  Check,
  Clock,
  X,
  AlertCircle,
  Download,
  Send,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ============================================================
// Types
// ============================================================

interface KoreaCorrection {
  id: string;
  order_id: string;
  quotation_id?: string;
  correction_source: 'email' | 'phone' | 'portal' | 'manual';
  correction_reference?: string;
  correction_date: string;
  issue_description: string;
  issue_category?: string;
  urgency: 'normal' | 'urgent' | 'expedited';
  corrected_data: Record<string, any>;
  correction_notes?: string;
  assigned_to?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  admin_notes?: string;
  corrected_files?: string[];
  customer_notified: boolean;
  customer_notification_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  orders?: {
    id: string;
    order_number: string;
    customer_name: string;
    customer_company?: string;
  };
  quotations?: {
    id: string;
    quotation_number: string;
  };
}

interface KoreaCorrectionsManagerProps {
  orderId?: string;
  readOnly?: boolean;
  onCorrectionUpdate?: (correction: KoreaCorrection) => void;
}

// ============================================================
// Helper Functions
// ============================================================

function getStatusBadge(status: KoreaCorrection['status']) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
  };

  const labels = {
    pending: '대기 중',
    in_progress: '진행 중',
    completed: '완료',
    rejected: '거부',
  };

  const icons = {
    pending: <Clock className="w-4 h-4" />,
    in_progress: <RefreshCw className="w-4 h-4" />,
    completed: <Check className="w-4 h-4" />,
    rejected: <X className="w-4 h-4" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
}

function getUrgencyBadge(urgency: KoreaCorrection['urgency']) {
  const styles = {
    normal: 'bg-gray-100 text-gray-800 border-gray-300',
    urgent: 'bg-orange-100 text-orange-800 border-orange-300',
    expedited: 'bg-red-100 text-red-800 border-red-300',
  };

  const labels = {
    normal: '일반',
    urgent: '긴급',
    expedited: '최우선',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${styles[urgency]}`}>
      {labels[urgency]}
    </span>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================
// Component
// ============================================================

export function KoreaCorrectionsManager({
  orderId,
  readOnly = false,
  onCorrectionUpdate,
}: KoreaCorrectionsManagerProps) {
  const [corrections, setCorrections] = useState<KoreaCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch corrections
  const fetchCorrections = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = orderId
        ? `/api/b2b/korea/corrections?orderId=${orderId}`
        : '/api/b2b/korea/corrections';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setCorrections(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch corrections');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Update correction status
  const updateStatus = async (correctionId: string, status: KoreaCorrection['status']) => {
    try {
      const response = await fetch('/api/b2b/korea/corrections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctionId,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCorrections(prev =>
          prev.map(c => c.id === correctionId ? { ...c, ...data.data } : c)
        );
        onCorrectionUpdate?.(data.data);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  // Handle file upload
  const handleFileUpload = async (correctionId: string, files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    try {
      const response = await fetch(`/api/b2b/korea/corrections/${correctionId}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(`${data.data.uploadedFiles.length}개 파일 업로드 완료`);
        fetchCorrections(); // Refresh to show updated files
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  // Notify customer
  const notifyCustomer = async (correction: KoreaCorrection) => {
    try {
      const response = await fetch('/api/b2b/korea/corrections', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctionId: correction.id,
          customerNotified: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCorrections(prev =>
          prev.map(c => c.id === correction.id ? { ...c, customer_notified: true } : c)
        );
        alert('고객 알림 발송 완료');
      } else {
        alert(data.error || 'Failed to notify customer');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  // Initial load
  useEffect(() => {
    fetchCorrections();
  }, [fetchCorrections]);

  // Filter corrections
  const filteredCorrections = filterStatus === 'all'
    ? corrections
    : corrections.filter(c => c.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-center gap-3 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">오류 발생</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            한국 파트너 수정사항 관리
          </h2>
          <p className="text-gray-500 mt-1">
            총 {corrections.length}건의 수정사항
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchCorrections}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </Button>
      </div>

      {/* Filters */}
      {!readOnly && (
        <div className="flex items-center gap-4">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">전체 ({corrections.length})</option>
            <option value="pending">대기 중 ({corrections.filter(c => c.status === 'pending').length})</option>
            <option value="in_progress">진행 중 ({corrections.filter(c => c.status === 'in_progress').length})</option>
            <option value="completed">완료 ({corrections.filter(c => c.status === 'completed').length})</option>
            <option value="rejected">거부 ({corrections.filter(c => c.status === 'rejected').length})</option>
          </select>
        </div>
      )}

      {/* Corrections List */}
      {filteredCorrections.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>수정사항이 없습니다</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCorrections.map((correction) => (
            <CorrectionCard
              key={correction.id}
              correction={correction}
              expanded={expandedId === correction.id}
              onToggle={() => setExpandedId(expandedId === correction.id ? null : correction.id)}
              onUpdateStatus={(status) => updateStatus(correction.id, status)}
              onFileUpload={(files) => handleFileUpload(correction.id, files)}
              onNotifyCustomer={() => notifyCustomer(correction)}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Sub-component: Correction Card
// ============================================================

interface CorrectionCardProps {
  correction: KoreaCorrection;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (status: KoreaCorrection['status']) => void;
  onFileUpload: (files: FileList) => void;
  onNotifyCustomer: () => void;
  readOnly?: boolean;
}

function CorrectionCard({
  correction,
  expanded,
  onToggle,
  onUpdateStatus,
  onFileUpload,
  onNotifyCustomer,
  readOnly = false,
}: CorrectionCardProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      await onFileUpload(e.target.files);
      setUploading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Expand/Collapse Icon */}
            <div className="text-gray-400">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>

            {/* Order Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">
                  {correction.orders?.order_number || correction.order_id}
                </span>
                {getUrgencyBadge(correction.urgency)}
                {getStatusBadge(correction.status)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {correction.orders?.customer_name}
                {correction.orders?.customer_company && ` (${correction.orders?.customer_company})`}
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="text-sm text-gray-500">
            {formatDate(correction.created_at)}
          </div>
        </div>

        {/* Issue Description (Preview) */}
        {!expanded && (
          <div className="mt-3 text-sm text-gray-600 line-clamp-1">
            {correction.issue_description}
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Issue Details */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">수정사항</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">{correction.issue_description}</p>
            </div>
            {correction.issue_category && (
              <div className="mt-2 text-xs text-gray-500">
                카테고리: {correction.issue_category}
              </div>
            )}
          </div>

          {/* Correction Notes */}
          {correction.correction_notes && (
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2">한국 파트너 코멘트</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{correction.correction_notes}</p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">관리자 메모</h4>
            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              rows={2}
              placeholder={correction.admin_notes || '메모를 입력하세요...'}
              readOnly={readOnly}
            />
          </div>

          {/* Corrected Files */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">수정된 파일</h4>
            {correction.corrected_files && correction.corrected_files.length > 0 ? (
              <div className="space-y-2">
                {correction.corrected_files.map((fileUrl, index) => (
                  <a
                    key={index}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate">
                      {fileUrl.split('/').pop()}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">첨부된 파일이 없습니다</p>
            )}
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200">
              {/* File Upload */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  disabled={uploading}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? '업로드 중...' : '파일 첨부'}
                </Button>
              </label>

              {/* Status Update */}
              <select
                value={correction.status}
                onChange={(e) => onUpdateStatus(e.target.value as KoreaCorrection['status'])}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="pending">대기 중</option>
                <option value="in_progress">진행 중</option>
                <option value="completed">완료</option>
                <option value="rejected">거부</option>
              </select>

              {/* Notify Customer */}
              {correction.status === 'completed' && !correction.customer_notified && (
                <Button
                  variant="primary"
                  onClick={onNotifyCustomer}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  고객 알림
                </Button>
              )}

              {correction.customer_notified && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  알림 완료
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ============================================================
// Export
// ============================================================

export default KoreaCorrectionsManager;
