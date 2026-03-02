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
// Google Ads ID: AW-17981675917
// コンバージョンラベル: iBi-CJv-44EcEI2zqv5C

export const trackGoogleAdsConversion = (value: number = 1.0, currency: string = 'JPY') => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      'send_to': 'AW-17981675917/iBi-CJv-44EcEI2zqv5C',
      'value': value,
      'currency': currency
    });
  }
};

export const trackGoogleAdsPageView = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      'send_to': 'AW-17981675917'
    });
  }
};
