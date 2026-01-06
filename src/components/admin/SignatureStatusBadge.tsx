/**
 * Signature Status Badge Component
 *
 * Displays the current status of a signature request with appropriate styling
 * Japanese localization included
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface SignatureStatusBadgeProps {
  status: 'pending' | 'viewed' | 'signed' | 'delivered' | 'cancelled' | 'expired' | 'declined';
  className?: string;
  showText?: boolean;
}

const statusConfig = {
  pending: {
    label: '署名待ち (Pending)',
    labelEn: 'Pending',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    dotColor: 'bg-yellow-500',
  },
  viewed: {
    label: '閲覧済み (Viewed)',
    labelEn: 'Viewed',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-800 dark:text-blue-200',
    borderColor: 'border-blue-300 dark:border-blue-700',
    dotColor: 'bg-blue-500',
  },
  signed: {
    label: '署名完了 (Signed)',
    labelEn: 'Signed',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-200',
    borderColor: 'border-green-300 dark:border-green-700',
    dotColor: 'bg-green-500',
  },
  delivered: {
    label: '送信済み (Delivered)',
    labelEn: 'Delivered',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-800 dark:text-purple-200',
    borderColor: 'border-purple-300 dark:border-purple-700',
    dotColor: 'bg-purple-500',
  },
  cancelled: {
    label: 'キャンセル (Cancelled)',
    labelEn: 'Cancelled',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    textColor: 'text-gray-800 dark:text-gray-200',
    borderColor: 'border-gray-300 dark:border-gray-700',
    dotColor: 'bg-gray-500',
  },
  expired: {
    label: '期限切れ (Expired)',
    labelEn: 'Expired',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-200',
    borderColor: 'border-red-300 dark:border-red-700',
    dotColor: 'bg-red-500',
  },
  declined: {
    label: '拒否 (Declined)',
    labelEn: 'Declined',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-200',
    borderColor: 'border-red-300 dark:border-red-700',
    dotColor: 'bg-red-500',
  },
};

export function SignatureStatusBadge({
  status,
  className,
  showText = true,
}: SignatureStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      {/* Status indicator dot */}
      <span className={cn('h-2 w-2 rounded-full animate-pulse', config.dotColor)} />

      {/* Status text */}
      {showText && (
        <span className="text-sm font-medium">
          {config.label}
        </span>
      )}
    </div>
  );
}

/**
 * Compact version of the status badge (smaller, icon only)
 */
export function SignatureStatusIcon({
  status,
  className,
}: {
  status: keyof typeof statusConfig;
  className?: string;
}) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'h-3 w-3 rounded-full',
        config.dotColor,
        className
      )}
      title={config.label}
    />
  );
}

/**
 * Detailed status card with signers list
 */
export function SignatureStatusCard({
  status,
  signers,
  createdAt,
  expiresAt,
  signedAt,
  className,
}: {
  status: keyof typeof statusConfig;
  signers?: Array<{ name: string; email: string; status: string; signedAt?: string }>;
  createdAt?: string;
  expiresAt?: string;
  signedAt?: string;
  className?: string;
}) {
  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', config.dotColor)} />
          <span className={cn('text-sm font-semibold', config.textColor)}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Timestamps */}
      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
        {createdAt && (
          <div>
            作成日時: {new Date(createdAt).toLocaleString('ja-JP')}
          </div>
        )}
        {expiresAt && (
          <div>
            有効期限: {new Date(expiresAt).toLocaleString('ja-JP')}
          </div>
        )}
        {signedAt && (
          <div className={cn('font-medium', config.textColor)}>
            署名日時: {new Date(signedAt).toLocaleString('ja-JP')}
          </div>
        )}
      </div>

      {/* Signers list */}
      {signers && signers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="text-xs font-medium mb-2">署名者:</div>
          <div className="space-y-1">
            {signers.map((signer, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium">{signer.name}</div>
                  <div className="text-gray-500">{signer.email}</div>
                </div>
                <SignatureStatusIcon status={signer.status as keyof typeof statusConfig} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
