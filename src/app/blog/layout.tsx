import type { Metadata } from "next";

// ブログ系の title template（1-C' nested template）
// ルート layout の "%s | Epackage Lab" を上書きし、ブログ配下は "%s | Epackage Lab ブログ" になる。
// Next.js 仕様: title.template 設定時は title.default が必須（default がないとビルドエラー or template 適用外）。
export const metadata: Metadata = {
  title: {
    default: "Epackage Lab ブログ",
    template: "%s | Epackage Lab ブログ",
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
