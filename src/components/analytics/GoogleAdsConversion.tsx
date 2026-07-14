'use client';

import { useEffect, type JSX } from 'react';
import { GOOGLE_ADS_ID, GOOGLE_ADS_CONVERSION_LABEL } from '@/lib/analytics/dataLayer';

interface GoogleAdsConversionProps {
  sendTo?: string;
  value?: number;
  currency?: string;
}

/**
 * Google Ads Conversion Tracking Component
 *
 * Tracks conversion events for Google Ads.
 * Phase 3 (SEO Phase 3 PR1): sendTo デフォルト値を env 変数参照の定数に変更（SSOT）。
 * ※ 直接 window.gtag 呼び出しは PR2 (Step 2) で処理
 *   （Case A: dataLayer push 化 / Case B: 維持）。
 */
export function GoogleAdsConversion({
  sendTo = `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
  value = 1.0,
  currency = 'JPY',
}: GoogleAdsConversionProps): JSX.Element | null {
  useEffect(() => {
    // Send conversion event to Google Ads
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: sendTo,
        value: value,
        currency: currency,
      });
    }
  }, [sendTo, value, currency]);

  return null;
}
