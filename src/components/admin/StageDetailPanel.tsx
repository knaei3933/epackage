/**
 * Stage Detail Panel Component
 *
 * ステージ詳細パネルコンポーネント
 *
 * Detailed view of a single production stage with:
 * - Stage information and status
 * - Notes display/add
 * - Photo gallery
 * - Staff assignment
 * - Action buttons
 * - Date information
 */

'use client';

import React, { useState, useRef } from 'react';
import useSWR, { mutate } from 'swr';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import type { ProductionStage, ProductionStageData } from '@/types/production';
import { PRODUCTION_STAGE_LABELS, STAGE_STATUS_LABELS } from '@/types/production';

// =====================================================
// Props Interface
// =====================================================

interface StageDetailPanelProps {
  orderId: string;
  productionOrderId: string;
  stage: ProductionStage;
  stageData: ProductionStageData;
  isCurrentStage: boolean;
  onAdvance?: () => void;
  onRollback?: () => void;
  locale?: 'ja' | 'ko' | 'en';
}

// =====================================================
// Main Component
// =====================================================

export function StageDetailPanel({
  orderId,
  productionOrderId,
  stage,
  stageData,
  isCurrentStage,
  onAdvance,
  onRollback,
  locale = 'ja',
}: StageDetailPanelProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stageLabel = PRODUCTION_STAGE_LABELS[stage];
  const statusLabel = STAGE_STATUS_LABELS[stageData.status];

  // Fetch action history for this stage
  const { data: actionHistory } = useSWR(
    `/api/admin/production/${orderId}`,
    async (url) => {
      const res = await fetch(url);
      const data = await res.json();
      return data.actionHistory?.filter((action: any) => action.stage === stage) || [];
    }
  );

  // =====================================================
  // Handlers
  // =====================================================

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    try {
      const res = await fetch(`/api/admin/production/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_note',
          stage,
          notes: noteText,
        }),
      });

      if (res.ok) {
        setNoteText('');
        setIsAddingNote(false);
        mutate(`/api/admin/production/${orderId}`);
      }
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('stage', stage);

      const res = await fetch(`/api/admin/production/${orderId}`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        mutate(`/api/admin/production/${orderId}`);
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      const res = await fetch(`/api/admin/production/${orderId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, photoUrl }),
      });

      if (res.ok) {
        mutate(`/api/admin/production/${orderId}`);
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <Card>
      <div className="p-6">
        {/* Stage Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{stageLabel.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {stageLabel[locale]}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-block px-3 py-1 text-sm rounded-full ${statusLabel.bgColor} ${statusLabel.color}`}>
                  {statusLabel[locale]}
                </span>
                {stageData.assigned_to && (
                  <span className="text-sm text-gray-600">
                    {locale === 'ja' ? '担当者' : locale === 'ko' ? '담당자' : 'Assigned'}: {stageData.assigned_to}
                  </span>
                )}
              </div>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-400">
            {stageLabel.stepNumber}
          </span>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500">
              {locale === 'ja' ? '予定日' : locale === 'ko' ? '예정일' : 'Estimated'}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {stageData.estimated_date
                ? new Date(stageData.estimated_date).toLocaleDateString()
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">
              {locale === 'ja' ? '実績日' : locale === 'ko' ? '실적일' : 'Actual'}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {stageData.actual_date
                ? new Date(stageData.actual_date).toLocaleDateString()
                : '-'}
            </p>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">
              {locale === 'ja' ? 'メモ' : locale === 'ko' ? '메모' : 'Notes'}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingNote(!isAddingNote)}
            >
              {isAddingNote
                ? (locale === 'ja' ? 'キャンセル' : locale === 'ko' ? '취소' : 'Cancel')
                : (locale === 'ja' ? '追加' : locale === 'ko' ? '추가' : 'Add')
              }
            </Button>
          </div>

          {isAddingNote && (
            <div className="mb-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={
                  locale === 'ja'
                    ? 'メモを入力...'
                    : locale === 'ko'
                    ? '메모 입력...'
                    : 'Enter notes...'
                }
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={handleAddNote}>
                  {locale === 'ja' ? '保存' : locale === 'ko' ? '저장' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNote(false);
                    setNoteText('');
                  }}
                >
                  {locale === 'ja' ? 'キャンセル' : locale === 'ko' ? '취소' : 'Cancel'}
                </Button>
              </div>
            </div>
          )}

          {stageData.notes ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">{stageData.notes}</p>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">
              {locale === 'ja'
                ? 'メモはありません'
                : locale === 'ko'
                ? '메모가 없습니다'
                : 'No notes'}
            </div>
          )}
        </div>

        {/* Photos Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">
              {locale === 'ja' ? '写真' : locale === 'ko' ? '사진' : 'Photos'}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {locale === 'ja' ? 'アップロード' : locale === 'ko' ? '업로드' : 'Upload'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />
          </div>

          {stageData.photos && stageData.photos.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {stageData.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-75"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo}
                    alt={`Stage photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg">
              {locale === 'ja'
                ? '写真はありません'
                : locale === 'ko'
                ? '사진이 없습니다'
                : 'No photos'}
            </div>
          )}
        </div>

        {/* Action History */}
        {actionHistory && actionHistory.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              {locale === 'ja' ? '履歴' : locale === 'ko' ? '기록' : 'History'}
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {actionHistory.map((action: any) => (
                <div key={action.id} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{action.action}</span>
                    <span className="text-gray-500">
                      {new Date(action.performed_at).toLocaleString()}
                    </span>
                  </div>
                  {action.notes && (
                    <p className="text-gray-600 mt-1">{action.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isCurrentStage && (
          <div className="flex gap-2 pt-4 border-t">
            {stageData.status !== 'completed' && onAdvance && (
              <Button
                className="flex-1"
                onClick={onAdvance}
              >
                {locale === 'ja' ? '次へ進む' : locale === 'ko' ? '다음 단계' : 'Advance'}
              </Button>
            )}
            {stageData.status === 'in_progress' && onRollback && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={onRollback}
              >
                {locale === 'ja' ? '前に戻る' : locale === 'ko' ? '이전 단계' : 'Rollback'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photoUrl={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </Card>
  );
}

// =====================================================
// Photo Modal Component
// =====================================================

interface PhotoModalProps {
  photoUrl: string;
  onClose: () => void;
}

function PhotoModal({ photoUrl, onClose }: PhotoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <img
          src={photoUrl}
          alt="Full size"
          className="max-w-full max-h-[90vh] object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default StageDetailPanel;
