import { Metadata } from "next";
import ArchivePage from "@/components/archives/ArchivePage";

// Disable static generation for this page due to client-side interactivity
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "パウチ導入実績 | Epackage Lab",
  description: "Epackage Labのパウチ包装導入実績と成功事例。化粧品、食品、健康食品など様々な業界のパウチ包装ソリューションをご紹介します。ソフトパウチ、スタンドパウチ、ガゼットパウチなど豊富な導入実績。小ロットから大ロットまで対応した包装資材で、お客様のビジネスを支援。実際の導入事例と効果を詳しくご紹介。",
  keywords: [
    "Epackage Lab",
    "パウチ導入実績",
    "パウチ成功事例",
    "軟包裝材",
    "ソフトパウチ",
    "スタンディングパウチ",
    "化粧品包装",
    "食品包装",
    "パウチ製造",
    "包装導入事例",
    "パッケージ事例"
  ],
  openGraph: {
    title: "パウチ導入実績 | Epackage Lab",
    description: "Epackage Labのパウチ包装導入実績と成功事例をご紹介。化粧品、食品、健康食品など様々な業界の導入事例。",
    type: 'website',
    url: 'https://www.package-lab.com/archives',
    images: [
      {
        url: 'https://www.package-lab.com/images/archives/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Epackage Lab パウチ導入実績',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "パウチ導入実績 | Epackage Lab",
    description: "Epackage Labのパウチ包装導入実績と成功事例をご紹介。",
    images: ['https://www.package-lab.com/images/archives/og-image.jpg'],
  },
  alternates: {
    canonical: '/archives',
  },
};

export default function ArchivesPage() {
  return <ArchivePage />;
}