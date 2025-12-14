import { Metadata } from 'next'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import { ComparisonClient } from './ComparisonClient'

// SEO Metadata
export const metadata: Metadata = {
  title: '製品比較 | Epackage Lab',
  description: '包装材料の詳細比較。価格、納期、機能、用途から最適な製品を見つけましょう。',
  keywords: ['製品比較', '包装材料', 'パッケージング比較', '仕様比較', 'Epackage Lab'],
  openGraph: {
    title: '製品比較 | Epackage Lab',
    description: '包装材料の詳細比較。価格、納期、機能、用途から最適な製品を見つけましょう。',
    type: 'website',
  }
}

export default function ComparePage() {
  return (
    <ComparisonProvider>
      <ComparisonClient />
    </ComparisonProvider>
  )
}