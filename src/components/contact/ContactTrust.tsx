import { CLIENT_COUNT_LABEL, REPLY_TIME_LABEL } from '@/lib/site-facts'
import { Building2, Users, Shield, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { FactList } from '@/components/layout'

/**
 * お問い合わせページ用の「信頼の行」。
 * 文言は `@/components/lp/TrustSignals` のデータと同じ（数字は変えていない）。
 */
const trustSignals = [
  { icon: Users, value: CLIENT_COUNT_LABEL, label: '導入実績', description: '多くの企業様にご愛用いただいています' },
  { icon: Building2, value: '30年以上', label: '業界経験', description: '長年の実績と信頼' },
  { icon: Shield, value: '厳格な品質管理', label: '品質保証', description: '全工程で品質を担保' },
  { icon: CheckCircle, value: '迅速対応', label: 'サポート体制', description: `${REPLY_TIME_LABEL}にご回答します` },
] as const

/** ページの頭（PageHeader）の中に置く、数字と事実の行 */
export function ContactFacts() {
  return <FactList items={trustSignals.map(({ value, label }) => ({ value, label }))} />
}

/** ページ末尾の、説明つきの信頼カード */
export function ContactTrustCards() {
  return (
    <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {trustSignals.map(({ icon: Icon, value, label, description }) => (
          <li key={label}>
            <Card className="h-full p-6">
              <Icon className="mb-3 h-6 w-6 text-brand" aria-hidden="true" />
              <div className="text-lg font-bold leading-[1.5] text-text-primary [word-break:keep-all] [overflow-wrap:anywhere]">{value}</div>
              <div className="text-sm font-medium text-text-secondary">{label}</div>
              <p className="mt-2 text-[13px] leading-[1.6] text-text-muted">{description}</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
