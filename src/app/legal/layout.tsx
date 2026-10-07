import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '特定商取引法に基づく表示',
  description:
    'Epackage Labの特定商取引法に基づく表示。販売業者、連絡先、価格、支払方法、商品引渡時期などの法定表記事項を確認できます。',
  alternates: {
    canonical: '/legal',
  },
  openGraph: {
    title: '特定商取引法に基づく表示 | Epackage Lab',
    description:
      'Epackage Labの特定商取引法に基づく表示。販売業者、連絡先、価格、支払方法、商品引渡時期などの法定表記事項を確認できます。',
    url: '/legal',
    type: 'website',
  },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
