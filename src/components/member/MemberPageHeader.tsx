/**
 * MemberPageHeader Component
 *
 * メンバーページ用の共通ヘッダーコンポーネント
 * - ページタイトル
 * - 説明文
 * - ダッシュボードへ戻るボタン
 */

import React from 'react';
import { Button } from '@/components/ui';

export interface MemberPageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
}

export function MemberPageHeader({
  title,
  description,
  showBackButton = true,
  backHref = '/member/dashboard',
  actions,
}: MemberPageHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
              {title}
            </h1>
            {description && (
              <p className="mt-1 text-sm text-text-muted">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showBackButton && (
              <a
                href={backHref}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = backHref;
                }}
              >
                <Button variant="outline" size="sm">
                  ダッシュボードへ戻る
                </Button>
              </a>
            )}
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}
