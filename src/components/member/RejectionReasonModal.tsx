/**
 * Rejection Reason Modal Component
 *
 * 却下理由モーダルコンポーネント
 * - Allows customers to provide detailed rejection reasons
 * - Preset reason buttons for quick selection
 * - Korean translation preview for designer communication
 *
 * @module components/member/RejectionReasonModal
 */

'use client';

import { useState, useEffect } from 'react';
import { XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// =====================================================
// Types
// =====================================================

interface RejectionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, translatedReason: string) => Promise<void>;
  submitting?: boolean;
  revisionName?: string;
}

interface PresetReason {
  id: string;
  labelJa: string;
  labelKo: string;
  icon?: string;
}

// =====================================================
// Preset Rejection Reasons
// =====================================================

const PRESET_REASONS: PresetReason[] = [
  {
    id: 'design_mismatch',
    labelJa: 'デザインがイメージと違う',
    labelKo: '디자인이 이미지와 다름',
    icon: '🎨',
  },
  {
    id: 'text_errors',
    labelJa: 'テキストの誤字・脱字',
    labelKo: '텍스트 오타/누락',
    icon: '📝',
  },
  {
    id: 'color_mismatch',
    labelJa: '色が違う',
    labelKo: '색상이 다름',
    icon: '🎨',
  },
  {
    id: 'layout_issues',
    labelJa: 'レイアウトの問題',
    labelKo: '레이아웃 문제',
    icon: '📐',
  },
  {
    id: 'size_issues',
    labelJa: 'サイズが合わない',
    labelKo: '크기가 맞지 않음',
    icon: '📏',
  },
  {
    id: 'other',
    labelJa: 'その他',
    labelKo: '기타',
    icon: '💬',
  },
];

// Simple translation map for preset reasons
const TRANSLATION_MAP: Record<string, string> = {
  'デザインがイメージと違う': '디자인이 이미지와 다릅니다',
  'テキストの誤字・脱字': '텍스트에 오탈자가 있습니다',
  '色が違う': '색상이 다릅니다',
  'レイアウトの問題': '레이아웃에 문제가 있습니다',
  'サイズが合わない': '크기가 맞지 않습니다',
  'その他': '기타',
};

// =====================================================
// Component
// =====================================================

export function RejectionReasonModal({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  revisionName = '',
}: RejectionReasonModalProps) {
  const [reason, setReason] = useState('');
  const [translatedReason, setTranslatedReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setTranslatedReason('');
      setSelectedPreset(null);
    }
  }, [isOpen]);

  // Handle preset selection
  const handlePresetSelect = (preset: PresetReason) => {
    setSelectedPreset(preset.id);
    setReason(preset.labelJa);
    // Auto-translate preset
    setTranslatedReason(TRANSLATION_MAP[preset.labelJa] || preset.labelKo);
  };

  // Handle text area change
  const handleReasonChange = (value: string) => {
    setReason(value);
    setSelectedPreset(null); // Clear preset when manually editing

    // Simple auto-translation for common phrases
    // In production, this would call a translation API
    let translated = value;
    Object.entries(TRANSLATION_MAP).forEach(([ja, ko]) => {
      if (value.includes(ja)) {
        translated = translated.replace(ja, ko);
      }
    });
    setTranslatedReason(translated);
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }
    await onSubmit(reason.trim(), translatedReason.trim());
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const isValid = reason.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                校正データを却下
              </h2>
              {revisionName && (
                <p className="text-sm text-gray-500">{revisionName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors p-1"
            aria-label="閉じる"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Notice */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">却下理由を入力してください</p>
              <p className="text-xs">
                入力された理由は韓国語に翻訳され、デザイナーに送信されます。
              </p>
            </div>
          </div>

          {/* Preset Reasons */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              よくある理由から選択
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_REASONS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  disabled={submitting}
                  className={`px-3 py-2 rounded-lg border text-sm text-left transition-all ${
                    selectedPreset === preset.id
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="mr-1">{preset.icon}</span>
                  <span className="text-xs">{preset.labelJa}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason Input */}
          <div>
            <label htmlFor="rejection-reason" className="text-sm font-medium text-gray-700 mb-2 block">
              却下理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="却下の詳細な理由を入力してください..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {reason.length} 文字
            </p>
          </div>

          {/* Korean Translation Preview */}
          {translatedReason && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                韓国語翻訳プレビュー
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Korean Preview)
                </span>
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {translatedReason}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ※ この内容がデザイナーに送信されます
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                送信中...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                却下する
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
