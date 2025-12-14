import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'スマート見積もり | Epackage Lab',
  description: 'AI搭載のスマート見積もりシステム。簡単なステップで専門的なパッケージ見積もりを取得。',
};

export default function SmartQuoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}