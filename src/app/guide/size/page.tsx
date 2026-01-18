import { Metadata } from 'next'
import { Ruler, Package, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { HowToSchema } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'サイズガイド - パッケージ寸法仕様 | Epackage Lab',
  description: 'パッケージサイズの指定方法、展開図の作成、製造工程を考慮した寸法設定、一般的なパッケージサイズについて詳しく説明します。',
  keywords: [
    'サイズ', '寸法', '展開図', 'パッケージサイズ', '製造仕様', 'パッケージ設計', '寸法指定',
    // ロングテールキーワード追加
    'スタンドパウチ 寸法 計算', '三方シール袋 サイズ', 'マチ 有るパウチ 寸法', 'パッケージ 容量 計算',
    '展開図 作成 ソフト', 'パッケージ寸法 決め方', '袋 寸法 見本', 'パウチ サイズ 規積',
    '包装袋 寸法 規積表', 'パッケージ 厚み 計算', '袋 マチ 幅 計算'
  ],
  openGraph: {
    title: 'サイズガイド - パッケージ寸法仕様 | Epackage Lab',
    description: 'パッケージサイズの指定方法、展開図の作成、製造工程を考慮した寸法設定について詳しく説明します。',
    type: 'website',
    images: [
      {
        url: '/images/guide/size-og.jpg',
        width: 1200,
        height: 630,
        alt: 'サイズガイド',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サイズガイド - パッケージ寸法仕様 | Epackage Lab',
    description: 'パッケージサイズの指定方法、展開図の作成、製造工程を考慮した寸法設定について詳しく説明します。',
    images: ['/images/guide/size-og.jpg'],
  },
  alternates: {
    canonical: '/guide/size',
    languages: {
      ja: '/guide/size',
      en: '/en/guide/size',
    },
  },
}

export default function SizeGuide() {
  // HowTo スキーマデータ
  const sizeHowToData = {
    name: 'パッケージサイズの決定方法',
    description: 'パッケージサイズの指定方法、展開図の作成、製造工程を考慮した寸法設定について詳しく説明します。',
    image: 'https://epackage-lab.com/images/guide/size-howto.jpg',
    supplies: [
      '内容物のサンプル',
      '定規やメジャー',
      '展開図用紙',
      '製造仕様書'
    ],
    steps: [
      {
        name: '内容物を実際に測定',
        text: '最も大きな寸法で、内容物の体積を考慮して測定します。'
      },
      {
        name: '余裕率を考慮してサイズ決定',
        text: '内容物の体積の120-150%のサイズを確保します。これにより開封性と輸送時の安全性が確保されます。'
      },
      {
        name: 'パッケージタイプを選択',
        text: '三方シール袋、スタンドパウチ、BOX型パウチなどから用途に合わせて選択します。'
      },
      {
        name: '展開図を作成',
        text: 'シール幅は10-15mm、トリムマージンは3-5mmを確保し、折り曲げ部にはR1.5以上の半径を設けます。'
      },
      {
        name: '製造可能範囲を確認',
        text: '各パッケージタイプの最小・最大寸法を確認し、製造可能な範囲内であることを確認します。'
      }
    ]
  }

  return (
    <>
      <HowToSchema {...sizeHowToData} />
      <div className="prose prose-gray max-w-none">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
          <Ruler className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            サイズガイド
          </h1>
          <p className="text-text-secondary">
            パッケージ寸法と製造仕様
          </p>
        </div>
      </div>

      {/* Size Specification Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6 flex items-center">
          <Package className="h-6 w-6 mr-2 text-brixa-600" />
          サイズ指定の基本
        </h2>

        <div className="bg-bg-secondary rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            パッケージサイズの構成要素
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-bg-primary rounded-lg p-4 mb-2">
                <span className="text-2xl font-bold text-brixa-600">W</span>
              </div>
              <p className="text-sm font-medium text-text-primary">Width (幅)</p>
              <p className="text-xs text-text-secondary">パッケージの横幅</p>
            </div>
            <div className="text-center">
              <div className="bg-bg-primary rounded-lg p-4 mb-2">
                <span className="text-2xl font-bold text-brixa-600">H</span>
              </div>
              <p className="text-sm font-medium text-text-primary">Height (高さ)</p>
              <p className="text-xs text-text-secondary">パッケージの高さ</p>
            </div>
            <div className="text-center">
              <div className="bg-bg-primary rounded-lg p-4 mb-2">
                <span className="text-2xl font-bold text-brixa-600">D</span>
              </div>
              <p className="text-sm font-medium text-text-primary">Depth (奥行)</p>
              <p className="text-xs text-text-secondary">パッケージの奥行き</p>
            </div>
            <div className="text-center">
              <div className="bg-bg-primary rounded-lg p-4 mb-2">
                <span className="text-2xl font-bold text-brixa-600">G</span>
              </div>
              <p className="text-sm font-medium text-text-primary">Gusset (マチ)</p>
              <p className="text-xs text-text-secondary">底部の拡張部分</p>
            </div>
          </div>
        </div>
      </section>

      {/* Standard Package Sizes */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          標準パッケージサイズ
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">小型パッケージ</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>サンプル・試供品: W50-100 × H80-150mm</li>
              <li>化粧品小物: W60-120 × H100-180mm</li>
              <li>食品小分け: W80-150 × H120-200mm</li>
              <li>アクセサリー: W70-130 × H90-160mm</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">中型パッケージ</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>食品一般: W120-200 × H180-300mm</li>
              <li>健康食品: W100-180 × H150-250mm</li>
              <li>ペットフード: W150-220 × H200-350mm</li>
              <li>日用品: W130-200 × H200-320mm</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-3">大型パッケージ</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>業務用食品: W200-300 × H300-500mm</li>
              <li>大型ペットフード: W180-250 × H250-400mm</li>
              <li>工業用品: W220-300 × H350-500mm</li>
              <li>コーヒー豆: W150-250 × H200-400mm</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Manufacturing Considerations */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          製造工程を考慮した設計
        </h2>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              推奨寸法と制約
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-medium">
                    <th className="text-left py-3">項目</th>
                    <th className="text-left py-3">最小寸法</th>
                    <th className="text-left py-3">最大寸法</th>
                    <th className="text-left py-3">注意事項</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-light">
                    <td className="py-3">三方シール袋</td>
                    <td className="py-3">50 × 80mm</td>
                    <td className="py-3">300 × 500mm</td>
                    <td className="py-3">シール部分: 10-15mm</td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="py-3">スタンドパウチ</td>
                    <td className="py-3">80 × 120mm</td>
                    <td className="py-3">250 × 350mm</td>
                    <td className="py-3">底部マチ: 30-50mm</td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="py-3">BOX型パウチ</td>
                    <td className="py-3">100 × 150mm</td>
                    <td className="py-3">250 × 300mm</td>
                    <td className="py-3">側面マチ: 40-80mm</td>
                  </tr>
                  <tr className="border-b border-border-light">
                    <td className="py-3">スパウトパウチ</td>
                    <td className="py-3">120 × 200mm</td>
                    <td className="py-3">300 × 400mm</td>
                    <td className="py-3">キャップ径: 8-22mm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              展開図の作成ポイント
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-text-primary mb-3">設計時の考慮事項</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• シール幅は10-15mm確保する</li>
                  <li>• トリムマージンは3-5mm設ける</li>
                  <li>• 折り曲げ部にはR1.5以上の半径を設ける</li>
                  <li>• 内容物の体積より20%大きく設計する</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-text-primary mb-3">素材による制約</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• PEフィルム: 熱溶着に適している</li>
                  <li>• PETフィルム: 印刷適性に優れている</li>
                  <li>• アルミ蒸着: バリア性が高い</li>
                  <li>• ナイロン: 引張強度が高い</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Size Determination Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          適切なサイズの決め方
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              適切なサイズ決定のポイント
            </h3>
            <ol className="space-y-3 text-sm text-text-secondary">
              <li>
                <strong>1. 内容物を実際に測定</strong>
                <p>最も大きな寸法で、内容物の体積を考慮する</p>
              </li>
              <li>
                <strong>2. 余裕率を考慮</strong>
                <p>内容物の体積の120-150%のサイズを確保する</p>
              </li>
              <li>
                <strong>3. 開封性を確認</strong>
                <p>ユーザーが開封しやすい寸法になっているか</p>
              </li>
              <li>
                <strong>4. 輸送コストを考慮</strong>
                <p>サイズが大きくなるほど輸送コストが増加</p>
              </li>
            </ol>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              よくある間違い
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 内容物に合わせすぎて開封しづらい</li>
              <li>• シール部分が小さすぎて強度不足</li>
              <li>• 容器の形状を考慮せず設計</li>
              <li>• 製造可能範囲外の寸法を指定</li>
              <li>• 展開図の折り線が矛盾している</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-bg-secondary rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          サイズ設計に関するサポート
        </h3>
        <p className="text-text-secondary mb-4">
          適切なパッケージサイズの決定や展開図の作成に関して、専門のスタッフがご支援いたします。
          お気軽にご相談ください。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-brixa-600 text-white rounded-lg hover:bg-brixa-700 transition-colors duration-200"
          >
            デザイン相談
          </a>
          <a
            href="/catalog"
            className="inline-flex items-center justify-center px-6 py-3 border border-border-medium rounded-lg hover:bg-bg-primary transition-colors duration-200"
          >
            製品カタログ
          </a>
        </div>
      </section>
    </div>
    </>
  )
}