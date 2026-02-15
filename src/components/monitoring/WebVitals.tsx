'use client';

/**
 * Web Vitalsモニタリングコンポーネント
 * Core Web Vitals追跡及び報告
 */

import { useEffect } from 'react';

export default function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Web Vitalsライブラリ動的インポート
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      // CL (Cumulative Layout Shift)
      onCLS((metric) => reportMetric('CLS', metric));

      // FID (First Input Delay)
      onFID((metric) => reportMetric('FID', metric));

      // FCP (First Contentful Paint)
      onFCP((metric) => reportMetric('FCP', metric));

      // LCP (Largest Contentful Paint)
      onLCP((metric) => reportMetric('LCP', metric));

      // TTFB (Time to First Byte)
      onTTFB((metric) => reportMetric('TTFB', metric));
    });

    function reportMetric(name: string, metric: { value: number; rating: string; id: string }) {
      const value = metric.value;
      const rating = metric.rating;

      // コンソールに出力
      console.log(`[Web Vitals] ${name}:`, {
        value: `${value.toFixed(2)}${name === 'CLS' ? '' : 'ms'}`,
        rating,
        id: metric.id
      });

      // 評価基準
      const thresholds: Record<string, { good: number; needsImprovement: number }> = {
        CLS: { good: 0.1, needsImprovement: 0.25 },
        FID: { good: 100, needsImprovement: 300 },
        FCP: { good: 1800, needsImprovement: 3000 },
        LCP: { good: 2500, needsImprovement: 4000 },
        TTFB: { good: 800, needsImprovement: 1800 }
      };

      const threshold = thresholds[name];
      let status = 'good';

      if (threshold) {
        if (name === 'CLS') {
          if (value > threshold.needsImprovement) status = 'poor';
          else if (value > threshold.good) status = 'needs-improvement';
        } else {
          if (value > threshold.needsImprovement) status = 'poor';
          else if (value > threshold.good) status = 'needs-improvement';
        }
      }

      // Analyticsへ送信 (オプション)
      sendToAnalytics(name, value, rating, status);
    }

    function sendToAnalytics(name: string, value: number, rating: string, status: string) {
      // ここにGoogle Analytics、Vercel Analytics等へ送信するコード追加
      if (typeof window !== 'undefined' && 'gtag' in window && window.gtag) {
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          event_label: status,
          value: Math.round(name === 'CLS' ? value * 1000 : value),
          non_interaction: true
        });
      }

      // Supabaseにログ保存 (オプション)
      if (process.env.NEXT_PUBLIC_ENABLE_VITALS_LOGGING === 'true') {
        fetch('/api/analytics/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            value,
            rating,
            status,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
      }
    }
  }, []);

  return null;
}

/**
 * 開発用Web Vitals表示コンポーネント
 */
export function WebVitalsDisplay() {
  const [vitals, setVitals] = React.useState<Record<string, { value: number; rating: string }>>({});
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      const updateVitals = (name: string, metric: { value: number; rating: string }) => {
        setVitals(prev => ({
          ...prev,
          [name]: {
            value: metric.value,
            rating: metric.rating
          }
        }));
      };

      onCLS((metric) => updateVitals('CLS', metric));
      onFID((metric) => updateVitals('FID', metric));
      onFCP((metric) => updateVitals('FCP', metric));
      onLCP((metric) => updateVitals('LCP', metric));
      onTTFB((metric) => updateVitals('TTFB', metric));
    });
  }, []);

  // 開発モードのみ表示
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-sm hover:bg-gray-700 transition-colors"
      >
        {isVisible ? '📊 非表示' : '📊 Web Vitals'}
      </button>

      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white rounded-lg shadow-xl p-4 w-64 border">
          <h3 className="font-bold text-sm mb-3">Core Web Vitals</h3>
          <div className="space-y-2 text-xs">
            {Object.entries(vitals).map(([name, data]) => {
              const isGood = data.rating === 'good';
              const isNeedsImprovement = data.rating === 'needs-improvement';

              return (
                <div key={name} className="flex justify-between items-center">
                  <span className="font-medium">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className={
                      isGood ? 'text-green-600' : isNeedsImprovement ? 'text-orange-600' : 'text-red-600'
                    }>
                      {name === 'CLS' ? data.value.toFixed(3) : Math.round(data.value)}{name !== 'CLS' ? 'ms' : ''}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      isGood ? 'bg-green-500' : isNeedsImprovement ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

import React from 'react';
