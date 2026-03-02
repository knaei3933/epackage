import SampleRequestForm from '@/components/contact/SampleRequestForm'
import { Metadata } from 'next'
import { TrustSignals } from '@/components/lp/TrustSignals'
import { StrongCTA } from '@/components/lp/StrongCTA'
import { CertificationBadges } from '@/components/lp/TrustSignals'

export const metadata: Metadata = {
  title: 'パウチサンプルご依頼 | Epackage Lab',
  description: 'Epackage Labの6種類パウチ製品サンプルご依頼フォーム。ソフトパウチ、スタンドパウチなどの実際の製品をお手元でお試しいただけます。',
  keywords: ['パウチサンプル', 'サンプル依頼', 'パウチ請求', '連包裝材', 'Epackage Lab', 'ソフトパウチ', 'スタンドパウチ'],
  openGraph: {
    title: 'パウチサンプルご依頼 | Epackage Lab',
    description: 'Epackage Labのパウチ製品サンプルご依頼フォーム',
  },
}

const sampleProducts = [
  {
    name: 'スタンドパウチ',
    description: '底マチ付きで自立する人気のパウチ',
    image: '/images/products/stand-pouch.jpg',
    features: ['底マチで自立', '棚陳列に最適', 'デザイン性抜群']
  },
  {
    name: 'ソフトパウチ（平袋）',
    description: 'シンプルで汎用性の高い基本のパウチ',
    image: '/images/products/flat-pouch.jpg',
    features: ['コストパフォーマンス良好', '様々な製品に対応', '省スペース']
  },
  {
    name: 'ガゼットパウチ',
    description: 'サイドマチ付きで容量を確保',
    image: '/images/products/gusset-pouch.jpg',
    features: ['大容量対応', '厚みのある製品に最適', '開封時の拡がりやすい']
  },
  {
    name: 'チャック付きパウチ',
    description: '再封可能で便利な機能付き',
    image: '/images/products/zipper-pouch.jpg',
    features: ['繰り返し開閉可能', '鮮度保持', '利便性向上']
  },
  {
    name: '透明窓付きパウチ',
    description: '中身が見える窓付きデザイン',
    image: '/images/products/window-pouch.jpg',
    features: ['商品アピール効果', '品質確認可能', 'デザイン自由度高']
  },
  {
    name: 'アルミ蒸着パウチ',
    description: '高い遮光性とバリア性',
    image: '/images/products/foil-pouch.jpg',
    features: ['遮光性抜群', '酸素遮断', '長期保存対応']
  }
]

export default function SamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brixa-600 via-brixa-700 to-navy-800 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="text-green-400 font-semibold text-sm">完全無料</span>
            <span className="text-white/50">|</span>
            <span className="text-brixa-100 text-sm">全国発送</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            パウチサンプルをご依頼ください
          </h1>
          <p className="text-lg md:text-xl text-brixa-100 mb-6 max-w-3xl mx-auto">
            実際の製品をお手元でお試しいただけます。
            <br />
            6種類のパウチからお選びいただき、ご要望に合わせてカスタマイズも可能です。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-brixa-100">
            <span>完全無料</span>
            <span>・</span>
            <span>迅速発送</span>
            <span>・</span>
            <span>最大6種類まで</span>
          </div>
        </div>
      </section>

      {/* Trust Signals Compact */}
      <TrustSignals variant="compact" className="py-6 bg-white border-b shadow-sm" />

      {/* Sample Products Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              サンプル可能なパウチ製品
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              お客様の用途に合わせて、最適なパウチをお選びください
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sampleProducts.map((product, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-brixa-300 hover:shadow-lg transition-all group"
              >
                <div className="aspect-video bg-gradient-to-br from-brixa-100 to-blue-100 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-brixa-400">
                    <svg className="w-16 h-16 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white font-bold text-lg">{product.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <ul className="space-y-1">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-center">
                        <span className="w-1 h-1 bg-brixa-500 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Request Form */}
      <section className="py-12 bg-gray-50">
        <SampleRequestForm />
      </section>

      {/* Strong CTA */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <StrongCTA
            title="ご質問やご不明点がございましたら"
            description="お電話やメールでもお気軽にご相談ください"
            primaryText="お電話で相談"
            primaryHref="tel:050-1793-6500"
            secondaryText="お問い合わせフォーム"
            secondaryHref="/contact"
            variant="centered"
          />
        </div>
      </section>

      {/* Safety Certifications */}
      <section className="py-8 bg-green-50 border-t border-green-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            安全規格に完全対応した製品をご提供
          </h3>
          <CertificationBadges />
          <p className="text-sm text-green-700 mt-4">
            ※ 食品衛生法、各種安全規格に準拠した製品のみをご提供しております
          </p>
        </div>
      </section>
    </div>
  )
}
