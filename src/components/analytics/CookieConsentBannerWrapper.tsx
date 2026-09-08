'use client';

import dynamic from 'next/dynamic';

const CookieConsentBanner = dynamic(
  () =>
    import('./CookieConsentBanner').then((mod) => ({
      default: mod.CookieConsentBanner,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

export function CookieConsentBannerWrapper() {
  return <CookieConsentBanner />;
}
