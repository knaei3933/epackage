import { Metadata } from 'next'
import { FileText, Layers, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export const metadata: Metadata = {
  title: '白版ガイド - 白版（しろはん）制作と用途 | Epackage Lab',
  description: '白版（しろはん）の役割、制作方法、用途、注意点について詳しく説明します。パッケージ印刷品質を確保するための重要な工程です。',
  keywords: ['白版', 'しろはん', '校正刷', '印刷テスト', '品質確認', '校正', '印刷試作', '色確認'],
  openGraph: {
    title: '白版ガイド - 白版（しろはん）制作と用途 | Epackage Lab',
    description: '白版（しろはん）の役割、制作方法、用途、注意点について詳しく説明します。',
    type: 'website',
    images: [
      {
        url: '/images/guide/shirohan-og.jpg',
        width: 1200,
        height: 630,
        alt: '白版ガイド',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '白版ガイド - 白版（しろはん）制作と用途 | Epackage Lab',
    description: '白版（しろはん）の役割、制作方法、用途、注意点について詳しく説明します。',
    images: ['/images/guide/shirohan-og.jpg'],
  },
  alternates: {
    canonical: '/guide/shirohan',
    languages: {
      ja: '/guide/shirohan',
      en: '/en/guide/shirohan',
    },
  },
}

export default function ShirohanGuide() {
  return (
    <div className="prose prose-gray max-w-none">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
          <FileText className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            白版ガイド
          </h1>
          <p className="text-text-secondary">
            白版（しろはん）の制作と用途
          </p>
        </div>
      </div>

      {/* What is Shirohan */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          白版（しろはん）とは
        </h2>

        <div className="bg-bg-secondary rounded-lg p-6 mb-8">
          <p className="text-text-secondary leading-relaxed mb-4">
            白版（しろはん）とは、本印刷の前に行う<strong>印刷テスト・校正刷</strong>のことです。
            実際に使用する素材とインクで小ロットの印刷を行い、色、デザイン、仕上がりを確認する重要な工程です。
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-4 mb-2">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">色確認</h3>
              <p className="text-xs text-text-secondary">CMYKや特色の色を実際に確認</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-4 mb-2">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">仕上がり確認</h3>
              <p className="text-xs text-text-secondary">実際の素材での質感と見え方</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-lg p-4 mb-2">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-medium text-text-primary mb-1">品質保証</h3>
              <p className="text-xs text-text-secondary">本印刷前の問題発見と修正</p>
            </div>
          </div>
        </div>
      </section>

      {/* When to Use Shirohan */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          白版が必要なケース
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              推奨ケース
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>初めてのデザイン印刷</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    新規デザインの場合は色と仕上がりの確認が重要
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>特色色を使用する場合</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    特色印刷の色を正確に確認したい場合
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>大量生産の場合</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    大ロット印刷前の品質保証として重要
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>重要商材</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    ブランドイメージに関わる重要なパッケージ
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              省略可能なケース
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>再注文・既存デザイン</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    過去に実績のある同じデザインと仕様
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>シンプルなCMYKのみ</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    特色を使用しない標準的な4色印刷
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>少量・緊急案件</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    コストや納期を優先する場合
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>試作品・サンプル</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    本番ではないテスト用途の場合
                  </p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Shirohan Process */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          白版制作の流れ
        </h2>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              制作ステップ
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brixa-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">仕様確認</h4>
                  <p className="text-sm text-text-secondary">
                    素材、インク、サイズ、数量などの仕様を最終確認
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brixa-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">データ準備</h4>
                  <p className="text-sm text-text-secondary">
                    印刷データを白版用に準備、必要に応じて調整
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brixa-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">試験印刷</h4>
                  <p className="text-sm text-text-secondary">
                    実際の素材と工程で小ロット（通常5-10枚）を印刷
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brixa-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">確認・検証</h4>
                  <p className="text-sm text-text-secondary">
                    色、仕上がり、品質を詳細に確認
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brixa-600 text-white rounded-full flex items-center justify-center font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-text-primary">承認・本番</h4>
                  <p className="text-sm text-text-secondary">
                    白版を承認後、本番印刷に移行
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Check Points */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          白版での確認ポイント
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              色の確認項目
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• ブランドカラーの再現性</li>
              <li>• 特色の色の濃さと鮮やかさ</li>
              <li>• 写真の色調とコントラスト</li>
              <li>• 背景とテキストのコントラスト</li>
              <li>• グラデーションの滑らかさ</li>
              <li>• 素材による色の見え方の違い</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              仕上がりの確認項目
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• デザインの配置とバランス</li>
              <li>• 文字の読みやすさと鮮明さ</li>
              <li>• 画像の解像度と鮮明さ</li>
              <li>• 素材の質感と手触り</li>
              <li>• カットや折り曲げの精度</li>
              <li>• 全体的な品質レベル</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Cost and Timeline */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          コストと納期
        </h2>

        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-medium">
                  <th className="text-left py-3">項目</th>
                  <th className="text-left py-3">通常費用</th>
                  <th className="text-left py-3">追加日数</th>
                  <th className="text-left py-3">備考</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-light">
                  <td className="py-3">白版作成費用</td>
                  <td className="py-3">10,000〜30,000円</td>
                  <td className="py-3">+3〜5日</td>
                  <td className="py-3">サイズ・数量による</td>
                </tr>
                <tr className="border-b border-border-light">
                  <td className="py-3">色修正</td>
                  <td className="py-3">5,000〜15,000円/回</td>
                  <td className="py-3">+2〜3日</td>
                  <td className="py-3">修正範囲による</td>
                </tr>
                <tr className="border-b border-border-light">
                  <td className="py-3">再白版</td>
                  <td className="py-3">8,000〜20,000円</td>
                  <td className="py-3">+2〜4日</td>
                  <td className="py-3">1回目より割安</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>注意:</strong> 白版費用は本番費用とは別途発生します。ただし、白版で問題が発見・解決されることで、
              大ロットでの大きな損失を防ぐことができます。
            </p>
          </div>
        </Card>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          白版活用のベストプラクティス
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              効果的な活用方法
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 複数の素材で比較検討する</li>
              <li>• 実際の使用環境で確認する</li>
              <li>• 第三者にも意見を求める</li>
              <li>• 写真に記録を残す</li>
              <li>• 本番との比較を行う</li>
              <li>• フィードバックを次回に活かす</li>
            </ul>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              よくある問題と対策
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <strong>色が期待と違う:</strong>
                <br />事前にカラーチャートを作成
              </li>
              <li>
                <strong>文字が読みにくい:</strong>
                <br />フォントサイズやコントラストを調整
              </li>
              <li>
                <strong>画像が粗い:</strong>
                <br />解像度を上げて再作成
              </li>
              <li>
                <strong>レイアウトが崩れる:</strong>
                <br />トリムマージンを再確認
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-bg-secondary rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          白版に関するご相談
        </h3>
        <p className="text-text-secondary mb-4">
          白版の必要性、費用、スケジュールなどについて、専門のスタッフがご説明いたします。
          お気軽にお問い合わせください。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-brixa-600 text-white rounded-lg hover:bg-brixa-700 transition-colors duration-200"
          >
            白版について相談
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
  )
}