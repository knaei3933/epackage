import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.package-lab.com'),
  title: {
    default: "Epackage Lab - 小ロットから大ロットまで経済的 | 最小500枚・最短28日納品のパッケージ製造",
    template: "%s | Epackage Lab"
  },
  description: "小ロット（500枚〜）から大ロット（大量生産）まで、あらゆるロットサイズに対応するパッケージ製造プラットフォームEpackage Lab。最小500枚から最短28日納品、大ロットはスケールメリットで経済的に。高品質な印刷技術とデジタル技術を融合させた新しいものづくりを提供します。年間300万円の在庫廃棄コストを70%削減。500社以上の日本企業実績、食品安全規格完全対応。",
  keywords: [
    // 基本キーワード
    "パッケージング", "包装", "梱包", "包装資材", "包装会社",
    // 印刷関連キーワード（競合分析に基づき追加）
    "パッケージ印刷", "小ロット印刷", "デジタル印刷", "オフセット印刷",
    "印刷技術", "印刷ノウハウ", "印刷について", "商業印刷",
    // ロット対応（競合差別化: 小ロット〜大ロットまで）
    "小ロット対応", "大ロット対応", "大量生産", "大量注文", "ロット別対応",
    "小ロットから大ロットまで", "あらゆるロットサイズに対応",
    // 経済性・コスト（競合差別化: 大ロット経済）
    "経済的", "コストパフォーマンス", "価格競争力", "大ロット経済",
    "スケールメリット", "量産効果", "コスト削減", "コストダウン",
    // 製品関連キーワード
    "パウチ", "スタンドパウチ", "ガゼットパウチ", "三方シール袋", "チャック付き袋",
    "食品包装", "医薬品包装", "化粧品包装", "電子機器包装",
    // 品質・規格関連
    "食品安全規格", "食品衛生法", "薬機法", "PL法", "品質管理",
    // 納期関連（数値強調）
    "納期短縮", "即納", "短納期", "500枚から", "28日納品", "最小500枚", "最短28日",
    // ものづくり・革新（競合分析に基づき追加: 教育コンテンツ戦略）
    "ものづくり", "革新するものづくり", "パッケージづくり", "パッケージづくりのヒント",
    "知見", "アイデア", "製造実績", "パッケージ事例",
    // ブランド認知（Brixa戦略採用）
    "PACKAGE LAB とは", "PACKAGE LAB 印刷", "PACKAGE LAB サービス",
    "Epackage Lab とは", "Epackage Lab 印刷", "Epackage Lab サービス",
    // B2B関連
    "B2B", "法人向け", "工場", "製造業", "メーカー",
    // 地域・言語関連
    "日本", "韓国", "アジア", "日本市場", "輸入",
    // 地域別キーワード
    "東京 パッケージング", "大阪 包装資材", "名古屋 パウチ",
    "福岡 包装会社", "北海道 食品包装", "仙台 包装印刷",
    "広島 パッケージ", "北陸 医薬品包装",
    "愛知県 製造業 包装", "静岡県 食品包装", "滋賀県 工業包装",
    // 季節別キーワード
    "お中元 包装", "お歳暮 包装", "お年賀 包装",
    "夏季ギフト 包装", "年末年始 包装",
    "ギフト包装", "季節の包装", "贈答品 包装",
    // サービス関連
    "カスタマイズ", "OEM", "ODM", "小ロット", "試作",
    "自動見積もり", "オンライン見積", "無料サンプル", "技術相談"
  ],
  authors: [{ name: "Epackage Lab" }],
  creator: "Epackage Lab",
  publisher: "Epackage Lab",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.package-lab.com',
    siteName: 'Epackage Lab',
    title: 'Epackage Lab | 小ロットから大ロットまで経済的なパッケージ製造',
    description: '小ロット（500枚〜）から大ロット（大量生産）まで、あらゆるロットサイズに対応するパッケージ製造プラットフォーム。大ロットはスケールメリットで経済的に。',
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
    title: 'Epackage Lab | 小ロットから大ロットまで経済的なパッケージ製造',
    description: '小ロット（500枚〜）から大ロット（大量生産）まで、あらゆるロットサイズに対応するパッケージ製造プラットフォーム。大ロットはスケールメリットで経済的に。',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* GTM Head */}
        <Script id="gtm-head" strategy="beforeInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-T4PL5XMC');`}
        </Script>

        {/* GA4 gtag.js */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VBCB77P21T"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-VBCB77P21T');`}
        </Script>

        {/* Google Ads gtag.js */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17981675917"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`gtag('config', 'AW-17981675917');`}
        </Script>

        {/* Performance optimization: preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//api.supabase.io" />

        {/* Security headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />

        {/* Viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          defaultTheme="light"
          enableSystem={true}
          attribute="class"
        >
          <CustomCursor />
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
            <AuthProvider>
              <CatalogProvider>
                <LanguageProvider>
                  <ModalWrapper />
                  <HeaderWrapper />
                  <BreadcrumbList />
                  <main>{children}</main>
                  <Footer />
                  <ChatWidget />
                  <InactivityWarningModal />
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
