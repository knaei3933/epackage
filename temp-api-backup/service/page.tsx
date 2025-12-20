import { Metadata } from "next";
import { ServicePageContent } from "@/components/service/ServicePage";
import { PageTransition } from "@/components/ui/PageTransition";

export const metadata: Metadata = {
  title: "サービス内容 | Epackage Lab",
  description: "Epackage Labのパウチ包装サービス。6種類のパウチ製品製造、カスタマイズ、品質管理、短期納期対応など、お客様のニーズに最適な包装ソリューションを提供します。",
  keywords: [
    "Epackage Lab",
    "パウチ包装サービス",
    "包装材製造",
    "カスタムパッケージ",
    "品質管理",
    "短期納期",
    "小ロット対応",
    "6種類パウチ"
  ],
  openGraph: {
    title: "サービス内容 | Epackage Lab",
    description: "6種類のパウチ製品で、お客様のニーズに最適な包装ソリューションを提供",
    images: ["/images/og/service.jpg"],
  },
};

export default function ServicePage() {
  return (
    <PageTransition>
      <ServicePageContent />
    </PageTransition>
  );
}