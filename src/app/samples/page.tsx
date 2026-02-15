import SampleRequestForm from '@/components/contact/SampleRequestForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パウチサンプルご依頼 | Epackage Lab',
  description: 'Epackage Labの6種類パウチ製品サンプルご依頼フォーム。ソフトパウチ、スタンドパウチなどの実際の製品をお手元でお試しいただけます。',
  keywords: ['パウチサンプル', 'サンプル依頼', 'パウチ請求', '連包裝材', 'Epackage Lab', 'ソフトパウチ', 'スタンドパウチ'],
  openGraph: {
    title: 'パウチサンプルご依頼 | Epackage Lab',
    description: 'Epackage Labのパウチ製品サンプルご依頼フォーム',
  },
}

export default function SamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SampleRequestForm />
    </div>
  )
}