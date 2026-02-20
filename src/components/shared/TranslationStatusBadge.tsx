'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * TranslationStatusBadge - Visual badge component for translation status
 *
 * Displays translation status with distinct visual styles:
 * - pending: Yellow/amber - awaiting translation
 * - translated: Green - successfully translated
 * - failed: Red - translation error
 * - manual: Blue - manually translated
 *
 * @component
 */

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-300',
  {
    variants: {
      status: {
        pending: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200 dark:from-amber-950/30 dark:to-amber-900/30 dark:text-amber-300 dark:border-amber-700/50',
        translated: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200 dark:from-emerald-950/30 dark:to-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50',
        failed: 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-800 border border-rose-200 dark:from-rose-950/30 dark:to-rose-900/30 dark:text-rose-300 dark:border-rose-700/50',
        manual: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 dark:from-blue-950/30 dark:to-blue-900/30 dark:text-blue-300 dark:border-blue-700/50',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px] gap-1',
        md: 'px-3 py-1 text-xs gap-1.5',
        lg: 'px-4 py-1.5 text-sm gap-2',
      },
      animated: {
        true: 'hover:scale-105 active:scale-95',
        false: '',
      },
    },
    defaultVariants: {
      status: 'pending',
      size: 'md',
      animated: true,
    },
  }
);

export interface TranslationStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status: 'pending' | 'translated' | 'failed' | 'manual';
  showLabel?: boolean;
  customLabel?: string;
}

const statusIcons = {
  pending: (
    <svg className="w-3 h-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  translated: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
  ),
  failed: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  manual: (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
};

const statusLabels = {
  pending: { ja: '翻訳待ち', ko: '번역 대기', en: 'Pending' },
  translated: { ja: '翻訳済み', ko: '번역 완료', en: 'Translated' },
  failed: { ja: '翻訳失敗', ko: '번역 실패', en: 'Failed' },
  manual: { ja: '手動翻訳', ko: '수동 번역', en: 'Manual' },
};

const TranslationStatusBadge = React.forwardRef<HTMLDivElement, TranslationStatusBadgeProps>(
  ({ className, status, size, animated = true, showLabel = true, customLabel, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ status, size, animated }), className)}
        {...props}
      >
        {statusIcons[status]}
        {showLabel && (
          <span className="font-medium">{customLabel || statusLabels[status].ja}</span>
        )}
      </div>
    );
  }
);

TranslationStatusBadge.displayName = 'TranslationStatusBadge';

export { TranslationStatusBadge, badgeVariants };

/**
 * Translation status constants for type safety
 */
export const TranslationStatus = {
  PENDING: 'pending' as const,
  TRANSLATED: 'translated' as const,
  FAILED: 'failed' as const,
  MANUAL: 'manual' as const,
} as const;

export type TranslationStatusType = typeof TranslationStatus[keyof typeof TranslationStatus];
