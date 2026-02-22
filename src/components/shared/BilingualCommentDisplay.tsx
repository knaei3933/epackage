'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TranslationStatusBadge, type TranslationStatusType } from './TranslationStatusBadge';

/**
 * BilingualCommentDisplay - Display component for Korean/Japanese bilingual comments
 *
 * Features:
 * - Language toggle (KO/JA) with smooth transitions
 * - Translation status badge
 * - Admin notice for failed translations
 * - Responsive design with animated state changes
 *
 * @component
 */

export interface BilingualCommentDisplayProps {
  commentKo: string;
  commentJa: string;
  translationStatus?: TranslationStatusType;
  showStatus?: boolean;
  defaultLanguage?: 'ko' | 'ja';
  variant?: 'default' | 'compact' | 'elevated' | 'bordered';
  isAdmin?: boolean;
  onLanguageChange?: (lang: 'ko' | 'ja') => void;
  className?: string;
}

const variantStyles = {
  default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
  compact: 'bg-transparent border-b border-gray-200 dark:border-gray-700 pb-4',
  elevated: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg',
  bordered: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
};

const BilingualCommentDisplay = React.forwardRef<HTMLDivElement, BilingualCommentDisplayProps>(
  (
    {
      commentKo,
      commentJa,
      translationStatus = 'translated',
      showStatus = true,
      defaultLanguage = 'ja',
      variant = 'default',
      isAdmin = false,
      onLanguageChange,
      className,
      ...props
    },
    ref
  ) => {
    const [currentLanguage, setCurrentLanguage] = useState<'ko' | 'ja'>(defaultLanguage);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLanguageToggle = useCallback(() => {
      const newLanguage = currentLanguage === 'ko' ? 'ja' : 'ko';
      setCurrentLanguage(newLanguage);
      onLanguageChange?.(newLanguage);
    }, [currentLanguage, onLanguageChange]);

    const currentComment = currentLanguage === 'ko' ? commentKo : commentJa;
    const hasTranslation = Boolean(commentKo && commentJa);
    const showFailedNotice = translationStatus === 'failed' && isAdmin;

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl overflow-hidden transition-all duration-300',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {/* Header with language toggle and status */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              onClick={handleLanguageToggle}
              disabled={!hasTranslation}
              className={cn(
                'relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                hasTranslation
                  ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow active:scale-95 cursor-pointer'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
              aria-label={`Switch to ${currentLanguage === 'ko' ? 'Japanese' : 'Korean'}`}
            >
              <span
                className={cn(
                  'transition-opacity duration-200',
                  currentLanguage === 'ko' ? 'opacity-100 font-bold' : 'opacity-50'
                )}
              >
                KO
              </span>
              <span className="text-gray-300 dark:text-gray-600">/</span>
              <span
                className={cn(
                  'transition-opacity duration-200',
                  currentLanguage === 'ja' ? 'opacity-100 font-bold' : 'opacity-50'
                )}
              >
                JA
              </span>

              {/* Animated switch indicator */}
              {hasTranslation && (
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"
                  initial={false}
                  animate={{
                    width: '100%',
                    left: currentLanguage === 'ko' ? '0%' : '50%',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Translation Status Badge */}
            {showStatus && translationStatus && (
              <TranslationStatusBadge
                status={translationStatus}
                size="sm"
                animated={false}
              />
            )}
          </div>

          {/* Expand/Collapse Button (for long content) */}
          {currentComment.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          )}
        </div>

        {/* Comment Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentLanguage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {/* Language indicator */}
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full opacity-50" />

              <p
                className={cn(
                  'text-gray-800 dark:text-gray-200 leading-relaxed',
                  'pl-4',
                  !isExpanded && currentComment.length > 200 && 'line-clamp-3'
                )}
              >
                {currentComment || (
                  <span className="text-gray-400 italic">
                    {currentLanguage === 'ko' ? '한국어 번역 없음' : '日本語訳なし'}
                  </span>
                )}
              </p>

              {/* Character count indicator */}
              {currentComment && (
                <span className="text-xs text-gray-400 mt-2 block pl-4">
                  {currentComment.length} {currentLanguage === 'ko' ? '자' : '文字'}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Failed Translation Notice (Admin Only) */}
        <AnimatePresence>
          {showFailedNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4"
            >
              <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-lg">
                <svg
                  className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                    翻訳エラー / 번역 오류
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                    自動翻訳に失敗しました。手動で翻訳を確認してください。
                    <br />
                    자동 번역에 실패했습니다. 수동으로 번역을 확인하세요.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

BilingualCommentDisplay.displayName = 'BilingualCommentDisplay';

export { BilingualCommentDisplay };

/**
 * Preset configurations for common use cases
 */
export const BilingualCommentPresets = {
  blogComment: {
    variant: 'default' as const,
    showStatus: true,
    defaultLanguage: 'ja' as const,
  },
  adminReview: {
    variant: 'elevated' as const,
    showStatus: true,
    isAdmin: true,
    defaultLanguage: 'ja' as const,
  },
  compact: {
    variant: 'compact' as const,
    showStatus: false,
    defaultLanguage: 'ja' as const,
  },
  bordered: {
    variant: 'bordered' as const,
    showStatus: true,
    defaultLanguage: 'ko' as const,
  },
};
