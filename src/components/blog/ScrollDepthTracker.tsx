'use client';

import type { ReactNode } from 'react';
import { useScrollDepth } from '@/hooks/useScrollDepth';

/**
 * 記事ページのスクロール深度計測トラッカー
 *
 * visible な UI は持たない。server component（blog/[slug]/page.tsx）から
 * useScrollDepth フックを呼ぶための client bridge。
 * ScrollToAnchor と同じパターンで配置する。
 */
export function ScrollDepthTracker({ articleId }: { articleId: string }): ReactNode {
  useScrollDepth(articleId);
  return null;
}
