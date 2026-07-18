'use client';

/**
 * Next Action List Component
 *
 * 「次の行動」リスト表示コンポーネント（ダッシュボード用）
 * - NextAction[] を優先度順リスト表示（受信時は既にソート済み・上限10件）
 * - 各項目は href リンク・タイプ別アイコン・statusLabel バッジ
 * - Card ベース・ブランド色（text-primary）アクセント
 */

import { Card } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { NextAction } from '@/lib/dashboard';

// =====================================================
// Types
// =====================================================

export interface NextActionListProps {
  actions: NextAction[];
  title?: string;
}

// =====================================================
// Type Metadata (アイコン / ラベル / アクセント色)
// =====================================================

const TYPE_META: Record<NextAction['type'], { icon: string; label: string; accent: string }> = {
  quotation: { icon: '📄', label: '見積もり', accent: 'text-blue-600 dark:text-blue-400' },
  order: { icon: '📦', label: '注文', accent: 'text-orange-600 dark:text-orange-400' },
  contract: { icon: '📝', label: '契約', accent: 'text-indigo-600 dark:text-indigo-400' },
  notification: { icon: '🔔', label: '通知', accent: 'text-purple-600 dark:text-purple-400' },
  sample: { icon: '🧪', label: 'サンプル', accent: 'text-green-600 dark:text-green-400' },
};

// =====================================================
// Component
// =====================================================

/**
 * NextAction リスト表示
 * 受信時は優先度順・同優先度内は createdAt 昇順でソート済み。
 * 本体でも最大10件に制限（二重防御）。
 */
export function NextActionList({ actions, title = '次の行動' }: NextActionListProps) {
  const router = useRouter();
  const list = actions.slice(0, 10);

  if (list.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-primary">
            {list.length}件
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {list.map((action, idx) => {
          const meta = TYPE_META[action.type];
          // 先頭（最優先）を強調表示・PinnedNextAction 廃止に伴いリスト内に集約
          const isPinned = idx === 0;
          return (
            <a
              key={action.id}
              href={action.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(action.href);
              }}
              className={
                isPinned
                  ? 'block p-4 rounded-lg border border-primary bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer'
                  : 'block p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary hover:border-primary transition-colors cursor-pointer'
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={isPinned ? 'text-lg' : 'text-base'} aria-hidden="true">{meta.icon}</span>
                    {isPinned ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary text-white">
                        最優先・{meta.label}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">{meta.label}</span>
                    )}
                    {action.statusLabel && (
                      <span className="text-xs px-2 py-0.5 rounded bg-bg-secondary text-text-muted">
                        {action.statusLabel}
                      </span>
                    )}
                  </div>
                  <p className={`font-medium truncate ${isPinned ? 'text-base' : 'text-sm'} ${meta.accent}`}>
                    {action.title}
                  </p>
                  {action.description && (
                    <p className={`text-sm text-text-muted mt-0.5 ${isPinned ? 'line-clamp-2' : 'line-clamp-1'}`}>
                      {action.description}
                    </p>
                  )}
                </div>
                {isPinned ? (
                  <span className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium">
                    確認する
                  </span>
                ) : (
                  <span className="text-xs text-text-muted whitespace-nowrap shrink-0">
                    {formatDistanceToNow(new Date(action.createdAt), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </span>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </Card>
  );
}
