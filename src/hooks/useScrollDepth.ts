'use client';

import { useEffect, useRef } from 'react';
import { pushToDataLayer } from '@/lib/analytics/dataLayer';

const MILESTONES = [25, 50, 75, 100] as const;

/**
 * スクロール深度計測フック
 *
 * 記事ページで読者が 25 / 50 / 75 / 100% の位置に到達したタイミングで
 * GA4 イベント（scroll_depth）を発火する。requestAnimationFrame で
 * throttle し、各閾値は1セッション（マウント中）で1回のみ発火する。
 *
 * - GA4 Enhanced Measurement の page 単位 scroll（90%固定）とは別物。
 *   記事専用の読了率（4段階）を計測するためのカスタム計測。
 * - `percent_scrolled` は GA4 の予約パラメータ名に合わせている。
 */
export function useScrollDepth(articleId?: string) {
  const firedRef = useRef<Set<number>>(new Set());
  // articleId を ref で保持（依存配列に入れて再マウントさせない）
  const articleIdRef = useRef(articleId);
  articleIdRef.current = articleId;

  useEffect(() => {
    const handleScroll = () => {
      const docEl = document.documentElement;
      const scrollTop = window.scrollY || docEl.scrollTop;
      const maxScroll = docEl.scrollHeight - window.innerHeight;
      // コンテンツが画面に収まるほど短い場合は計測しない
      if (maxScroll <= 0) return;

      const percent = (scrollTop / maxScroll) * 100;

      for (const milestone of MILESTONES) {
        if (percent >= milestone && !firedRef.current.has(milestone)) {
          firedRef.current.add(milestone);
          pushToDataLayer('scroll_depth', {
            percent_scrolled: milestone,
            content_type: 'article',
            article_id: articleIdRef.current,
          });
        }
      }
    };

    // requestAnimationFrame で scroll イベントを throttle
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // 初期到達チェック（リロード直後に既に下までスクロールしている場合など）
    handleScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}
