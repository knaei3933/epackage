import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { CatalogProvider } from "@/contexts/CatalogContext";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { Suspense } from 'react';
import { BreadcrumbList } from "@/components/seo/BreadcrumbList";
import { Footer } from "@/components/layout/Footer";
import { ModalWrapper } from "./components/ModalWrapper";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { ChatWidget } from "@/components/chat/ChatWidgetWrapper";
import { InactivityWarningModal } from "@/components/auth/InactivityWarningModal";
import { SWRConfig } from "swr";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["monospace"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.package-lab.com'),
  title: {
    default: "Epackage Lab - 小ロットから大ロットまで経済的 | 最小500枚・最短28日納品のパッケージ製造",
    template: "%s | Epackage Lab"
  },
  description: "小ロット500枚〜大ロット対応、最短28日納品のパッケージ専門製造。化粧品・食品・医薬品向け包装材を無料見積もりでご提案。",
  authors: [{ name: "Epackage Lab" }],
  creator: "Epackage Lab",
  publisher: "Epackage Lab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://www.package-lab.com',
    languages: {
      'x-default': 'https://www.package-lab.com',
    },
  },
  other: {
    'rss': '/rss.xml',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.package-lab.com',
    siteName: 'Epackage Lab',
    title: 'Epackage Lab | 小ロット500枚〜大ロット対応のパッケージ製造',
    description: '小ロット500枚〜大ロット対応、最短28日納品のパッケージ専門製造。化粧品・食品・医薬品向け包装材を無料見積もりでご提案。',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Epackage Lab - パッケージングソリューション',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Epackage Lab | 小ロット500枚〜大ロット対応のパッケージ製造',
    description: '小ロット500枚〜大ロット対応、最短28日納品のパッケージ専門製造。化粧品・食品・医薬品向け包装材を無料見積もりでご提案。',
    images: ['/images/og-image.jpg'],
    creator: '@epackage_lab',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'F0MGJt4bRFH71oNsaalw0yVyTZn5FTLScKHxI1bihHw',
  },
};

// Viewport configuration: device-width + initialScale:1 preserves desktop rendering,
// maximumScale:5 permits pinch-zoom for accessibility (WCAG 1.4.4) without forcing
// mobile scaling. viewportFit:'cover' enables safe-area insets (iOS notch/Dynamic Island).
// Fix for Safari/mobile layout collapse (bare HTML) caused by missing viewport export.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if current page is a static page (terms, privacy)
  const isStaticPage = false; // Will be determined from pathname

  return (
    <html lang="ja" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* GTM Head - lazyOnload to prioritize LCP over analytics */}
        <Script
          id="gtm-head"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-T4PL5XMC');
    gtag('js', new Date());
    gtag('config', 'G-VBCB77P21T');
    gtag('config', 'AW-17981675917');
  `
          }}
        />

        {/* Performance optimization: preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//api.supabase.co" />

        {/* Security headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Color scheme for browser UI consistency */}
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />

        {/* Theme color */}
        <meta name="theme-color" content="#1A365D" />
        <meta name="msapplication-TileColor" content="#1A365D" />

        {/* Apple touch icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          defaultTheme="light"
          enableSystem={true}
          attribute="class"
        >
          {/* CustomCursor only for interactive pages */}
          {/* <CustomCursor /> */}
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
            <AuthProvider>
              <CatalogProvider>
                <LanguageProvider>
                  <ModalWrapper />
                  <HeaderWrapper />
                  <BreadcrumbList />
                  <SWRConfig value={{ revalidateOnFocus: false, dedupingInterval: 2000, shouldRetryOnError: true, errorRetryCount: 3 }}><ToastProvider><main>{children}</main></ToastProvider></SWRConfig>
                  <Footer />
                  <ChatWidget />
                  {/* InactivityWarningModal only for logged-in users */}
                  {/* <InactivityWarningModal /> */}
                </LanguageProvider>
              </CatalogProvider>
            </AuthProvider>
          </Suspense>
        </ThemeProvider>
        {/* GTM Noscript */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T4PL5XMC"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
      </body>
    </html>
  );
}
