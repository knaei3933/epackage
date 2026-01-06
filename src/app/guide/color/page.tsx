import { Metadata } from 'next'
import { Palette, Droplets, Eye, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { HowToSchema } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'カラーガイド - パッケージ印刷色指定 | Epackage Lab',
  description: 'パッケージ印刷における色指定の方法、特色印刷、カラーマッチング、CMYKと特色の違いについて詳しく説明します。',
  keywords: [
    'カラー', '特色印刷', 'CMYK', 'カラーマッチング', 'DICカラーガイド', 'パッケージ印刷色', '色指定',
    // 롱테일 키워드 추가
    'DICカラーガイド 使い方', '特色印刷 費用', 'DIC色指定', 'パッケージ ブランドカラー 再現',
    '特色とCMYK 違い', '印刷色合わせ 方法', 'パッケージ印刷 色合わせ', 'DIC色番号 指定',
    'CMYK 特色 混合印刷', 'ブランドカラー 印刷 再現'
  ],
  openGraph: {
    title: 'カラーガイド - パッケージ印刷色指定 | Epackage Lab',
    description: 'パッケージ印刷における色指定の方法、特色印刷、カラーマッチングについて詳しく説明します。',
    type: 'website',
    images: [
      {
        url: '/images/guide/color-og.jpg',
        width: 1200,
        height: 630,
        alt: 'カラーガイド',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'カラーガイド - パッケージ印刷色指定 | Epackage Lab',
    description: 'パッケージ印刷における色指定の方法、特色印刷、カラーマッチングについて詳しく説明します。',
    images: ['/images/guide/color-og.jpg'],
  },
  alternates: {
    canonical: '/guide/color',
    languages: {
      ja: '/guide/color',
      en: '/en/guide/color',
    },
  },
}

export default function ColorGuide() {
  // HowTo 스키마 데이터
  const colorHowToData = {
    name: 'パッケージ印刷の色指定方法',
    description: 'パッケージ印刷における色指定の方法、特色印刷、カラーマッチング、CMYKと特色の違いについて詳しく説明します。',
    image: 'https://epackage-lab.com/images/guide/color-howto.jpg',
    supplies: [
      'DICカラーガイド',
      'デザインデータ',
      'カラープルーフ',
      '特色見本'
    ],
    steps: [
      {
        name: '色指定方法を選択',
        text: 'CMYKカラーまたは特色印刷のどちらかを選択します。写真やグラデーションにはCMYK、ブランドカラーの正確な再現には特色印刷が適しています。'
      },
      {
        name: 'DICカラーガイドで色を選択',
        text: 'DICカラーガイドを使用して色番号を指定します。日本国内で最も広く使用されているカラーシステムで、再現性が高いのが特徴です。'
      },
      {
        name: 'CMYK値を設定',
        text: 'CMYKカラーを使用する場合、各色の濃度をパーセンテージで指定します（例: C100 M80 Y0 K0）。'
      },
      {
        name: 'カラープルーフを確認',
        text: '実際の印刷で色を確認するために、白版（しろはん）を作成して色の仕上がりを確認します。'
      },
      {
        name: '本番印刷',
        text: '色を確認した後、本番印刷に移行します。'
      }
    ]
  }

  return (
    <>
      <HowToSchema {...colorHowToData} />
      <div className="prose prose-gray max-w-none">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-red-100 rounded-lg text-red-600">
          <Palette className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            カラーガイド
          </h1>
          <p className="text-text-secondary">
            パッケージ印刷における色指定と特色印刷
          </p>
        </div>
      </div>

      {/* Color Printing Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6 flex items-center">
          <Droplets className="h-6 w-6 mr-2 text-brixa-600" />
          色指定の基本
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">CMYKカラー</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong> Cyan, Magenta, Yellow, Black</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    4色のプロセスインクを使用した標準的な印刷方法
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>写真やグラデーションに最適</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    複雑な色表現や写真の再現に優れています
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>コスト効率が良い</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    少量から大量までコストパフォーマンスに優れています
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">特色印刷</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>特定の色を単独で使用</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    DIC、PANTONEなどの指定色を直接印刷します
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>鮮やかで一貫性のある色再現</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    ブランドカラーの正確な再現に適しています
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>金属光沢や蛍光色も可能</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    通常のCMYKでは表現できない特殊色を使用できます
                  </p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Color Specification Methods */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">色指定の方法</h2>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              1. DICカラーガイドでの指定
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-text-secondary mb-2">
                推奨: DICカラーガイドを使用した色指定
              </p>
              <ul className="text-sm space-y-1 text-text-primary">
                <li>• DIC 123 (レッド系)</li>
                <li>• DIC 256 (ブルー系)</li>
                <li>• DIC 358 (グリーン系)</li>
              </ul>
            </div>
            <p className="text-text-secondary">
              DICカラーガイドは日本国内で最も広く使用されているカラーシステムです。
              プリンターとの色合わせが容易で、再現性が高いのが特徴です。
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              2. CMYK値での指定
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-medium">
                    <th className="text-left py-2">色名</th>
                    <th className="text-left py-2">C</th>
                    <th className="text-left py-2">M</th>
                    <th className="text-left py-2">Y</th>
                    <th className="text-left py-2">K</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-light">
                    <td className="py-2">レッド</td>
                    <td className="py-2">0</td>
                    <td className="py-2">100</td>
                    <td className="py-2">100</td>
                    <td className="py-2">0</td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="py-2">ブルー</td>
                    <td className="py-2">100</td>
                    <td className="py-2">80</td>
                    <td className="py-2">0</td>
                    <td className="py-2">0</td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="py-2">グリーン</td>
                    <td className="py-2">100</td>
                    <td className="py-2">0</td>
                    <td className="py-2">100</td>
                    <td className="py-2">0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6 flex items-center">
          <Eye className="h-6 w-6 mr-2 text-brixa-600" />
          デザインのベストプラクティス
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 text-green-600">
              推奨事項
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>RGBではなくCMYKでデザインを作成する</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>特色は4色以内に抑える</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>濃度4%以下の薄い色は避ける</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
                <span>カラープルーフを必ず確認する</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 text-red-600">
              注意事項
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                <span>画面と印刷では色が異なる場合がある</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                <span>素材によって色の見え方が変わる</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                <span>特色数が多いとコストが増加する</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                <span>グラデーションは特色で表現できない</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-bg-secondary rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          色指定に関するご相談
        </h3>
        <p className="text-text-secondary mb-4">
          色指定や特色印刷に関するご質問がございましたら、専門のスタッフがご対応いたします。
          お気軽にお問い合わせください。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-brixa-600 text-white rounded-lg hover:bg-brixa-700 transition-colors duration-200"
          >
            お問い合わせフォーム
          </a>
          <a
            href="tel:080-6942-7235"
            className="inline-flex items-center justify-center px-6 py-3 border border-border-medium rounded-lg hover:bg-bg-primary transition-colors duration-200"
          >
            電話で相談
          </a>
        </div>
      </section>
    </div>
    </>
  )
}