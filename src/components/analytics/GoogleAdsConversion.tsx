'use client';

import { useEffect } from 'react';

interface GoogleAdsConversionProps {
  sendTo?: string;
  value?: number;
  currency?: string;
}

/**
 * Google Ads Conversion Tracking Component
 *
 * Tracks conversion events for Google Ads.
 * Default conversion: AW-17981675917/iBi-CJv-44EcEI2zqv5C (Page View)
 */
export function GoogleAdsConversion({
  sendTo = 'AW-17981675917/iBi-CJv-44EcEI2zqv5C',
  value = 1.0,
  currency = 'JPY',
}: GoogleAdsConversionProps) {
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
