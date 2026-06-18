import { redirect } from 'next/navigation'

// /pricing は見積もりシミュレーターへサーバー側で即時リダイレクトする。
// 旧実装(useEffect + window.location のクライアントリダイレクト)は
// リダイレクト前のフラッシュ・パフォーマンス劣化・SEO 不利があったため、
// App Router のサーバーリダイレクトに変更。
export default function PricingRedirectPage() {
  redirect('/quote-simulator')
}
