/**
 * Custom Confirmation Modal Component
 *
 * カスタム確認モーダルコンポーネント
 * - ネイティブconfirm()の代替
 * - アクセシビリティ対応
 * - ESCキーで閉じる
 * - フォーカストラップ
 * - バックドロップクリックで閉じる
 *
 * @component
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

// =====================================================
// Types
// =====================================================

export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmModalProps {
  /** 모달 표시 여부 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 확인 버튼 핸들러 */
  onConfirm: () => void;
  /** 제목 */
  title: string;
  /** 메시지 */
  message: string;
  /** 확인 버튼 라벨 (기본: "確認") */
  confirmLabel?: string;
  /** 취소 버튼 라벨 (기본: "キャンセル") */
  cancelLabel?: string;
  /** 변형 (danger: 빨강, warning: 노랑, info: 파랑) */
  variant?: ConfirmVariant;
  /** 확인 버튼만 표시 */
  confirmOnly?: boolean;
}

// =====================================================
// Variant Styles
// =====================================================

const VARIANT_STYLES = {
  danger: {
    container: 'border-red-200 bg-red-50',
    icon: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    container: 'border-yellow-200 bg-yellow-50',
    icon: 'text-yellow-600',
    button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  },
  info: {
    container: 'border-blue-200 bg-blue-50',
    icon: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
} as const;

const VARIANT_ICONS = {
  danger: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
} as const;

// =====================================================
// Main Component
// =====================================================

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  variant = 'info',
  confirmOnly = false,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // 스타일
  const styles = VARIANT_STYLES[variant];
  const Icon = VARIANT_ICONS[variant];

  // 모달 열릴 때 이전 활성 요소 저장
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      // 포커스를 확인 버튼으로 이동
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    } else {
      // 모달 닫을 때 포커스 복원
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // 포커스 트랩 (모달 내부에 포커스 유지)
  useEffect(() => {
    if (!isOpen) return;

    const trapFocus = (e: KeyboardEvent) => {
      if (!modalRef.current) return;

      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab: 처음 요소에서 마지막으로 이동
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab: 마지막 요소에서 처음으로 이동
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [isOpen]);

  // 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-md rounded-lg border-2 shadow-xl ${styles.container} p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="モーダルを閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full bg-white mx-auto mb-4`}>
          <Icon className={`w-6 h-6 ${styles.icon}`} aria-hidden="true" />
        </div>

        {/* Title */}
        <h2
          id="confirm-modal-title"
          className="text-xl font-semibold text-center text-gray-900 mb-2"
        >
          {title}
        </h2>

        {/* Message */}
        <p
          id="confirm-modal-message"
          className="text-center text-gray-700 mb-6 whitespace-pre-wrap"
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          {!confirmOnly && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.button}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Hook for Modal State
// =====================================================

export interface UseConfirmModalResult {
  isOpen: boolean;
  openConfirmModal: (props: Omit<ConfirmModalProps, 'isOpen' | 'onClose'>) => void;
  closeConfirmModal: () => void;
  modalProps: Omit<ConfirmModalProps, 'isOpen' | 'onClose'> | null;
}

export function useConfirmModal(): UseConfirmModalResult {
  const [state, setState] = useState<{
    isOpen: boolean;
    props: Omit<ConfirmModalProps, 'isOpen' | 'onClose'> | null;
  }>({
    isOpen: false,
    props: null,
  });

  const openConfirmModal = (props: Omit<ConfirmModalProps, 'isOpen' | 'onClose'>) => {
    setState({
      isOpen: true,
      props,
    });
  };

  const closeConfirmModal = () => {
    setState({
      isOpen: false,
      props: null,
    });
  };

  return {
    isOpen: state.isOpen,
    openConfirmModal,
    closeConfirmModal,
    modalProps: state.props,
  };
}
