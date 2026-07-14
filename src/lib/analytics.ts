// Google Analytics 4 event helpers
//
// Phase 3 (SEO Phase 3 PR1): デッドコード削除。
// - onFID import 削除（web-vitals v4 で完全削除済み・ビルドエラー要因）
// - trackWebVitals / performanceTracker / setupScrollTracking /
//   setupTimeOnPageTracking / trackError / initAnalytics / useAnalytics /
//   analyticsEvents / sendPageView を削除（全件デッドコード・0 import）
// - sendEvent / trackPhoneClick のみ残す（4 コンポーネントで活性 import）。
//   PR2 (Step 2) で trackPhoneClick を dataLayer.ts に移行後、本ファイルを削除。
// - WebVitals 計測は PR3 で next/web-vitals (useReportWebVitals) に統一。

// Google Analytics 4 Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Send event to GA4
export const sendEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, parameters);
  }
};

// Phone click tracking for Conversion optimization
export const trackPhoneClick = (phoneNumber: string, location: string) => {
  sendEvent('phone_click', {
    phone_number: phoneNumber,
    location: location,
    page_url: window.location.href,
  });
};

// Type declarations
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: Record<string, any>) => void;
  }
}
