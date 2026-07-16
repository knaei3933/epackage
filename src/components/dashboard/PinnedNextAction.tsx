'use client';

/**
 * Pinned Next Action Component
 *
 * ヘッダー下に最優先アクション1件を強調カードで固定表示（ダッシュボード用）
 * - CTA ボタン付きで該当ページへ遷移
 * - pinnedNextAction === undefined のときは親で非表示
 *   （{pinnedNextAction && <PinnedNextAction action={pinnedNextAction} />}）
 * - Card ベース・ブランド色（bg-blue-50 / border-primary / text-primary）アクセント
 */

import { Card } from '@/components/ui';
import type { NextAction } from '@/lib/dashboard';

// =====================================================
// Types
// =====================================================

export interface PinnedNextActionProps {
  action: NextAction;
}

// =====================================================
// Type Metadata (アイコン / ラベル)
// =====================================================

const TYPE_META: Record<NextAction['type'], { icon: string; label: string }> = {
  quotation: { icon: '📄', label: '見積もり' },
  order: { icon: '📦', label: '注文' },
  contract: { icon: '📝', label: '契約' },
  notification: { icon: '🔔', label: '通知' },
  sample: { icon: '🧪', label: 'サンプル' },
};

// =====================================================
// Component
// =====================================================

export function PinnedNextAction({ action }: PinnedNextActionProps) {
  const meta = TYPE_META[action.type];

  return (
    <Card className="p-5 bg-blue-50 dark:bg-blue-900/20 border-primary">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">{meta.icon}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary text-white">
              最優先・{meta.label}
            </span>
          </div>
          <h3 className="text-base font-semibold text-text-primary">
            {action.title}
          </h3>
          {action.description && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">
              {action.description}
            </p>
          )}
        </div>
        <a
          href={action.href}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = action.href;
          }}
          className="shrink-0 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          確認する
        </a>
      </div>
    </Card>
  );
}
