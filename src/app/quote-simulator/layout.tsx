import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '見積もりシミュレーター',
  description:
    'パッケージの形状・素材・サイズ・数量を入力して、Epackage LabのAI見積もりシミュレーターで概算価格を確認できます。',
  alternates: {
    canonical: '/quote-simulator',
  },
  openGraph: {
    title: '見積もりシミュレーター | Epackage Lab',
    description:
      '形状・素材・サイズ・数量を入力して、小ロットから大ロットまでのパッケージ概算価格を確認できます。',
    url: '/quote-simulator',
    type: 'website',
  },
};

export default function QuoteSimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
