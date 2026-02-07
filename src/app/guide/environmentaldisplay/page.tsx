import { Metadata } from 'next'
import { Leaf, Recycle, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { HowToSchema } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: '環境表示ガイド - サステナビリティ表示 | Epackage Lab',
  description: 'パッケージにおける環境表示の方法、リサイクルマーク、素材表示、サステナビリティ対応について詳しく説明します。',
  keywords: ['環境表示', 'リサイクルマーク', 'サステナビリティ', '素材表示', '環境ラベル', 'エコマーク', '包装廃棄物法', '包装廃棄物法 表示義務', 'プラスチック識別表示', 'リサイクルマーク 種類', 'エコマーク 取得', 'FSC認証 包装', '環境表示 義務 化粧品'],
  openGraph: {
    title: '環境表示ガイド - サステナビリティ表示 | Epackage Lab',
    description: 'パッケージにおける環境表示の方法、リサイクルマーク、素材表示、サステナビリティ対応について詳しく説明します。',
    type: 'website',
    images: [
      {
        url: '/images/guide/environmentaldisplay-og.jpg',
        width: 1200,
        height: 630,
        alt: '環境表示ガイド',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '環境表示ガイド - サステナビリティ表示 | Epackage Lab',
    description: 'パッケージにおける環境表示の方法、リサイクルマーク、素材表示、サステナビリティ対応について詳しく説明します。',
    images: ['/images/guide/environmentaldisplay-og.jpg'],
  },
  alternates: {
    canonical: '/guide/environmentaldisplay',
    languages: {
      ja: '/guide/environmentaldisplay',
      en: '/en/guide/environmentaldisplay',
    },
  },
}

export default function EnvironmentalDisplayGuide() {
  const environmentalHowToData = {
    name: 'パッケージの環境表示実装方法',
    description: 'パッケージにおける環境表示の方法、リサイクルマーク、素材表示、サステナビリティ対応について詳しく説明します。',
    image: 'https://epackage-lab.com/images/guide/environmental-howto.jpg',
    supplies: [
      '包装廃棄物法ガイドライン',
      'リサイクルマークデータ',
      '素材表示テキスト',
      '認証マーク'
    ],
    steps: [
      {
        name: '法規制要件を確認',
        text: '包装廃棄物法に基づき、表示義務のある項目を確認します（事業者名、素材識別表示など）。'
      },
      {
        name: '素材識別表示を追加',
        text: 'プラスチック（PET1-7）、紙、金属などの素材マークを適切に表示します。'
      },
      {
        name: 'リサイクルマークを配置',
        text: '国際リサイクルマークや日本のプラスチック容器包装マーク、紙マークを配置します。'
      },
      {
        name: '環境認証マークを追加',
        text: 'エコマーク、FSC認証、カーボンニュートラルなどの認証マークを必要に応じて追加します。'
      },
      {
        name: '表示内容を検証',
        text: '表示が法規制に準拠していることを確認し、誤解を招く表現がないかチェックします。'
      }
    ]
  }

  return (
    <>
      <HowToSchema {...environmentalHowToData} />
      <div className="prose prose-gray max-w-none">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
          <Leaf className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            環境表示ガイド
          </h1>
          <p className="text-text-secondary">
            サステナビリティ表示と環境対応
          </p>
        </div>
      </div>

      {/* Environmental Display Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          環境表示の重要性
        </h2>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-8">
          <p className="text-text-secondary leading-relaxed mb-4">
            環境表示は、パッケージの環境配慮を消費者に伝えるための重要な要素です。
            <strong>包装廃棄物法</strong>や国際的な環境基準に基づき、適切な表示を行うことが求められています。
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="bg-emerald-100 rounded-lg p-4 mb-2">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">環境配慮</h3>
              <p className="text-xs text-text-secondary">環境への影響を明確に表示</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 rounded-lg p-4 mb-2">
                <span className="text-2xl">♻️</span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">リサイクル性</h3>
              <p className="text-xs text-text-secondary">リサイクル可能な素材を表示</p>
            </div>
            <div className="text-center">
              <div className="bg-emerald-100 rounded-lg p-4 mb-2">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">法規制対応</h3>
              <p className="text-xs text-text-secondary">関連法規を遵守</p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Requirements */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          法規制と表示要件
        </h2>

        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            包装廃棄物法による表示義務
          </h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-text-primary">対象事業者</h4>
              <ul className="text-sm text-text-secondary mt-2 ml-4">
                <li>• 容器包装の利用事業者</li>
                <li>• 特定容器包装利用事業者（年間使用量50t以上）</li>
                <li>• 容器包装製造事業者など</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-text-primary">表示義務</h4>
              <ul className="text-sm text-text-secondary mt-2 ml-4">
                <li>• 事業者名と住所</li>
                <li>• 容器包装の種類（容器/包装）</li>
                <li>• 素材の識別表示</li>
                <li>• 「その他プラスチック」の使用量表示</li>
              </ul>
            </div>
          </div>
        </Card>
      </section>

      {/* Material Identification */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          素材識別表示
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">プラスチック表示</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>PET</span>
                <span className="font-mono bg-gray-100 px-2 py-1">1</span>
              </div>
              <div className="flex justify-between items-center">
                <span>HDPE</span>
                <span className="font-mono bg-gray-100 px-2 py-1">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span>PVC</span>
                <span className="font-mono bg-gray-100 px-2 py-1">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span>LDPE</span>
                <span className="font-mono bg-gray-100 px-2 py-1">4</span>
              </div>
              <div className="flex justify-between items-center">
                <span>PP</span>
                <span className="font-mono bg-gray-100 px-2 py-1">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span>PS</span>
                <span className="font-mono bg-gray-100 px-2 py-1">6</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">紙表示</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>段ボール</span>
                <span className="font-mono bg-gray-100 px-2 py-1">紙</span>
              </div>
              <div className="flex justify-between items-center">
                <span>紙容器</span>
                <span className="font-mono bg-gray-100 px-2 py-1">紙</span>
              </div>
              <div className="flex justify-between items-center">
                <span>ラベル用紙</span>
                <span className="font-mono bg-gray-100 px-2 py-1">紙</span>
              </div>
              <div className="flex justify-between items-center">
                <span>古紙配合率</span>
                <span className="font-mono bg-gray-100 px-2 py-1">70%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">金属表示</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>アルミニウム</span>
                <span className="font-mono bg-gray-100 px-2 py-1">Al</span>
              </div>
              <div className="flex justify-between items-center">
                <span>スチール</span>
                <span className="font-mono bg-gray-100 px-2 py-1">Fe</span>
              </div>
              <div className="flex justify-between items-center">
                <span>金属キャップ</span>
                <span className="font-mono bg-gray-100 px-2 py-1">金属</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Recycle Marks */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6 flex items-center">
          <Recycle className="h-6 w-6 mr-2 text-brixa-600" />
          リサイクルマーク
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">国際リサイクルマーク</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  ♻
                </div>
                <div>
                  <strong>リサイクル可能マーク</strong>
                  <p className="text-sm text-text-secondary">リサイクル可能であることを示す</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  ♻
                </div>
                <div>
                  <strong>リサイクル推奨マーク</strong>
                  <p className="text-sm text-text-secondary">リサイクルを推奨することを示す</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">日本のリサイクルマーク</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center text-white font-bold">
                  資
                </div>
                <div>
                  <strong>プラスチック容器包装マーク</strong>
                  <p className="text-sm text-text-secondary">プラスチック製容器包装を示す</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center text-white font-bold">
                  紙
                </div>
                <div>
                  <strong>紙マーク</strong>
                  <p className="text-sm text-text-secondary">紙製容器包装を示す</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Eco Labels */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          環境ラベルと認証マーク
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">エコマーク</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• 環境への負荷が少ない製品</li>
              <li>• 第三者認証が必要</li>
              <li>• ISO 14021に準拠</li>
              <li>• 製品のライフサイクル評価</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">FSC認証</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• 森林の適正な管理</li>
              <li>• 持続可能な木材調達</li>
              <li>• サプライチェーンの追跡</li>
              <li>• 紙製品の環境認証</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">カーボンニュートラル</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>• 炭素排出量の相殺</li>
              <li>• 温室効果ガス削減</li>
              <li>• 再エネルギー利用</li>
              <li>• 第三者検証</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          環境表示のベストプラクティス
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              推奨事項
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 表示は分かりやすく目立つ場所に配置</li>
              <li>• 国際標準と国内基準の両方に対応</li>
              <li>• 素材の比率を正確に表示する</li>
              <li>• リサイクル方法を具体的に示す</li>
              <li>• 環境配慮の取り組みを伝える</li>
              <li>• 消費者向けの分別ガイドを提供</li>
            </ul>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              注意事項
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 誤解を招く表示は避ける</li>
              <li>• 実際のリサイクル可能性を考慮</li>
              <li>• 法規制の最新情報を確認</li>
              <li>• 認証マークは公式使用ルール遵守</li>
              <li>• グリーンウォッシングに注意</li>
              <li>• 表示内容の裏付けを確保</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Implementation Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          環境表示の実装例
        </h2>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            パッケージへの表示例
          </h3>
          <div className="space-y-6">
            <div className="border border-border-medium rounded-lg p-4">
              <h4 className="font-medium text-text-primary mb-2">スタンドパウチの例</h4>
              <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                <div>株式会社Epackage Lab 兵庫県明石市上ノ丸2-11-21</div>
                <div>容器 包装 紙・プラスチック(PP)・金属</div>
                <div>プラスチック使用割合 85%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs">♻</span>
                  <span className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">紙</span>
                  <span className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-xs">5</span>
                </div>
              </div>
            </div>

            <div className="border border-border-medium rounded-lg p-4">
              <h4 className="font-medium text-text-primary mb-2">三方シール袋の例</h4>
              <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                <div>株式会社Epackage Lab</div>
                <div>プラスチック製容器包装(PE)</div>
                <div>再生プラスチック含有割合 70%</div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white text-xs">プ</span>
                  <span className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">4</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Contact Information */}
      <section className="bg-emerald-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          環境表示に関するご相談
        </h3>
        <p className="text-text-secondary mb-4">
          環境表示の設計、法規制対応、認証取得について、専門のスタッフがサポートいたします。
          サステナビリティ対応を強化されたい企業様は、お気軽にご相談ください。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            環境表示について相談
          </a>
          <a
            href="/catalog"
            className="inline-flex items-center justify-center px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors duration-200"
          >
            エコフレンドリー製品
          </a>
        </div>
      </section>
    </div>
    </>
  )
}