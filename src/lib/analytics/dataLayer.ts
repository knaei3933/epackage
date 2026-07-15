declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export const pushToDataLayer = (event: string, data: Record<string, unknown> = {}) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({ event, ...data });
  }
};

// コンバージョンイベント関数
export const trackQuoteComplete = (quoteAmount: number, quoteId: string) => {
  pushToDataLayer('quote_complete', {
    currency: 'JPY',
    value: quoteAmount,
    quote_id: quoteId,
  });
};

export const trackContactSubmit = () => {
  pushToDataLayer('contact_submit', {
    form_type: 'contact',
    timestamp: new Date().toISOString(),
  });
};

export const trackSampleRequest = () => {
  pushToDataLayer('sample_request', {
    form_type: 'sample',
    timestamp: new Date().toISOString(),
  });
};

export const trackPhoneClick = (phoneNumber: string) => {
  pushToDataLayer('phone_click', {
    phone_number: phoneNumber,
    click_type: 'tel_link',
  });
};

export const trackLineAdd = () => {
  pushToDataLayer('line_add', {
    click_type: 'line_friend_add',
  });
};

// Google Adsコンバージョン追跡
// ※ trackGoogleAdsConversion / trackGoogleAdsPageView は現在 0 import（参考実装）。
//   PR2 (Step 2 Case A) で GoogleAdsConversion.tsx を dataLayer push 化する際の参考。
//   PR2 完了後に使用されなければ削除（原則: デッドコード即時削除）。
export const trackGoogleAdsConversion = (value: number = 1.0, currency: string = 'JPY') => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      'send_to': `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
      'value': value,
      'currency': currency
    });
  }
};

export const trackGoogleAdsPageView = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      'send_to': GOOGLE_ADS_ID
    });
  }
};

// ===== Analytics 設定定数（env 変数参照・SSOT）=====
// Phase 3 (SEO Phase 3 PR1): ハードコードを env 変数参照に変更。
// Phase 3 PR2 (Case B): GTM 完全削除に伴い GTM_ID 定数を削除（gtag.js 直接ロード）。
// フォールバック値は既存ハードコード値（後方互換性）。

// GA4測定ID
export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-VBCB77P21T';

// Google Ads ID
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-17981675917';
export const GOOGLE_ADS_CONVERSION_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL || 'iBi-CJv-44EcEI2zqv5C';
