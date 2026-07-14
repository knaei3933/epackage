'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { pushToDataLayer } from '@/lib/analytics/dataLayer';

/**
 * WebVitals 計測コンポーネント（Phase 3 Step 3 — CWV改善・1系統化）
 *
 * Phase 3 で WebVitals 計測を1系統（next/web-vitals useReportWebVitals）に統一。
 * - 旧実装（3重化・全デッドコード）:
 *   - src/lib/analytics.ts trackWebVitals（PR1 で削除済み）
 *   - src/components/performance/WebVitalsMonitor.tsx（本 PR で削除）
 *   - src/components/monitoring/WebVitals.tsx（本 PR で削除）
 * - 新実装: useReportWebVitals → pushToDataLayer('web_vital', ...) の単一経路
 *
 * CWV 改善根拠:
 * - CLS: return null で視覚的影響なし（旧 WebVitalsMonitor のトグル UI 廃止）
 * - LCP/INP: next/web-vitals は Next.js ランタイム最適化済み・追加スクリプト注入なし
 * - 計測ID は dataLayer push のみ（GTM 経由で GA4 へ送信・二重計測なし）
 *
 * 報告対象メトリック: CLS, INP, FCP, LCP, TTFB（FID は非推奨・INP に置換済み）
 */
export function WebVitals(): null {
  useReportWebVitals((metric) => {
    const payload = {
      metric_name: metric.name,
      metric_value: Math.round(metric.value),
      metric_id: metric.id,
      metric_rating: metric.rating,
      metric_delta: metric.delta?.toFixed(2),
      metric_navigation_type: metric.navigationType,
    };
    pushToDataLayer('web_vital', payload);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating);
    }
  });
  return null;
}
