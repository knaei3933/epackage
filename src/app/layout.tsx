import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { HeaderWrapper } from "@/components/layout/HeaderWrapper";
import { BreadcrumbList } from "@/components/seo/BreadcrumbList";
import { Footer } from "@/components/layout/Footer";

// Force dynamic rendering to avoid useSearchParams bailout during build
export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://package-lab.com'),
  title: {
    default: "Epackage Lab | デジタル印刷・小ロット・短納期 | パッケージングソリューション",
    template: "%s | Epackage Lab"
  },
  description: "韓国品質の包装材料と日本規制完全準拠で日本のものづくりを支援するEpackage Lab。ISO 9001、JIS規格取得済み。500社以上の日本企業実績。平均30%コスト削減、最短10日納期。食品包装、医薬品包装、化粧品包装に対応。今すぐ無料見積もりで最適な包装ソリューションをご提案。",
  keywords: [
    // 基本キーワード
    "パッケージング", "包装", "梱包", "包装資材", "包装会社",
    // 製品関連キーワード
    "パウチ", "スタンドパウチ", "ガゼットパウチ", "三方シール袋", "チャック付き袋",
    "食品包装", "医薬品包装", "化粧品包装", "電子機器包装",
    // 品質・規格関連
    "ISO 9001", "ISO 14001", "JIS規格", "JIS Z 1707", "JIS S 3011",
    "食品衛生法", "薬機法", "PL法", "品質管理",
    // コスト・納期関連
    "コスト削減", "コストダウン", "納期短縮", "即納", "短納期",
    // B2B関連
    "B2B", "法人向け", "工場", "製造業", "メーカー",
    // 地域・言語関連
    "日本", "韓国", "アジア", "日本市場", "輸入",
    // 地域別キーワード (追加)
    "東京 パッケージング", "大阪 包装資材", "名古屋 パウチ",
    "福岡 包装会社", "北海道 食品包装", "仙台 包装印刷",
    "広島 パッケージ", "北陸 医薬品包装",
    "愛知県 製造業 包装", "静岡県 食品包装", "滋賀県 工業包装",
    // 季節別キーワード (追加)
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
    url: 'https://epackage-lab.com',
    siteName: 'Epackage Lab',
    title: 'Epackage Lab | パッケージングソリューション',
    description: 'パッケージングの専門会社。革新的な包装ソリューション、自動見積もり、豊富な製品カタログを提供。',
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
    title: 'Epackage Lab | パッケージングソリューション',
    description: 'パッケージングの専門会社。革新的な包装ソリューション、自動見積もり、豊富な製品カタログを提供。',
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
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
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
                {/* Performance optimization: preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//api.supabase.io" />
        <link rel="dns-prefetch" href="//sendgrid.api.com" />

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
          <AuthProvider>
            <LanguageProvider>
              <HeaderWrapper />
              <BreadcrumbList />
              <main>{children}</main>
              <Footer />
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
