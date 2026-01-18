import { Metadata } from "next";
import { ArchivePage } from "@/components/archives/ArchivePage";

// Disable static generation for this page due to client-side interactivity
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "パウチ導入実績 | Epackage Lab",
  description: "Epackage Labのパウチ包装導入実績と成功事例。化粧品、食品、健康食品など様々な業界のパウチ包装ソリューションをご紹介します。",
  keywords: [
    "Epackage Lab",
    "パウチ導入実績",
    "パウチ成功事例",
    "連包裝材",
    "ソフトパウチ",
    "スタンディングパウチ",
    "化粧品包装",
    "食品包装",
    "パウチ製造"
  ],
  openGraph: {
    title: "パウチ導入実績 | Epackage Lab",
    description: "Epackage Labのパウチ包装導入実績と成功事例をご紹介",
    images: ["/images/archives/og-image.jpg"],
  },
};

export default function ArchivesPage() {
  return <ArchivePage />;
}