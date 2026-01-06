/**
 * B2B Contracts Layout
 * B2B契約管理レイアウト
 */

export const metadata = {
  title: '契約管理 | B2B会員メニュー | Epackage Lab',
  description: 'Epackage Lab B2B契約管理ページ - 契約書の閲覧、署名、ダウンロードができます。',
};

export default function ContractsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
