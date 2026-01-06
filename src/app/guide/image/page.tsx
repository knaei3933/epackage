import { Metadata } from 'next'
import { Image, FileText, Download, CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { HowToSchema } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: '画像ガイド - パッケージ印刷画像仕様 | Epackage Lab',
  description: 'パッケージ印刷における画像データの仕様、解像度、ファイル形式、カラーモード、制作時の注意点について詳しく説明します。',
  keywords: ['画像', '解像度', 'DPI', 'ファイル形式', 'CMYK', 'RGB', 'ベクター', 'ラスター', '印刷データ', '印刷データ 350dpi', 'AI データ 印刷', 'PDF 印刷用', '画像 アウトライン 方法', 'CMYK RGB 変換', '印刷用画像 作成 ソフト', 'パッケージ印刷 解像度'],
  openGraph: {
    title: '画像ガイド - パッケージ印刷画像仕様 | Epackage Lab',
    description: 'パッケージ印刷における画像データの仕様、解像度、ファイル形式、カラーモードについて詳しく説明します。',
    type: 'website',
    images: [
      {
        url: '/images/guide/image-og.jpg',
        width: 1200,
        height: 630,
        alt: '画像ガイド',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '画像ガイド - パッケージ印刷画像仕様 | Epackage Lab',
    description: 'パッケージ印刷における画像データの仕様、解像度、ファイル形式、カラーモードについて詳しく説明します。',
    images: ['/images/guide/image-og.jpg'],
  },
  alternates: {
    canonical: '/guide/image',
    languages: {
      ja: '/guide/image',
      en: '/en/guide/image',
    },
  },
}

export default function ImageGuide() {
  const imageHowToData = {
    name: '印刷用画像データの作成方法',
    description: 'パッケージ印刷における画像データの仕様、解像度、ファイル形式、カラーモード、制作時の注意点について詳しく説明します。',
    image: 'https://epackage-lab.com/images/guide/image-howto.jpg',
    supplies: [
      'Adobe Illustrator',
      'Adobe Photoshop',
      '画像データ',
      'DICカラーガイド'
    ],
    steps: [
      {
        name: '解像度を設定',
        text: '印刷品質を確保するため350dpi以上でデータを作成します。'
      },
      {
        name: 'カラーモードをCMYKに設定',
        text: 'RGBではなくCMYKモードでデータを作成します。変換時は色の変化に注意が必要です。'
      },
      {
        name: 'ファイル形式を選択',
        text: 'ベクター形式（AI, EPS, SVG）を推奨。ラスター画像は350dpi以上で保存します。'
      },
      {
        name: 'フォントをアウトライン化',
        text: 'テキストはすべてアウトライン化してフォントデータを埋め込みます。'
      },
      {
        name: 'カラープルーフで確認',
        text: '完成したデータでカラープルーフを作成し、色や画質を確認します。'
      }
    ]
  }

  return (
    <>
      <HowToSchema {...imageHowToData} />
      <div className="prose prose-gray max-w-none">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-green-100 rounded-lg text-green-600">
          <Image className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            画像ガイド
          </h1>
          <p className="text-text-secondary">
            印刷用画像データの仕様と注意事項
          </p>
        </div>
      </div>

      {/* Image Specifications Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          画像データの基本仕様
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">推奨仕様</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>解像度: 350dpi</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    印刷品質を確保するためには350dpi以上を推奨
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>カラーモード: CMYK</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    印刷用はCMYKモードで作成
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>ファイル形式: AI, EPS, PDF</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    ベクターデータを推奨、高解像度PNG/JPEGも可
                  </p>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">最小要件</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>解像度: 300dpi以上</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    300dpi未満は画質低下の原因に
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>ファイルサイズ: 最大50MB</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    大きすぎるファイルは分割を推奨
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>フォント: アウトライン化</strong>
                  <p className="text-sm text-text-secondary mt-1">
                    テキストはアウトライン化してデータを含める
                  </p>
                </div>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* File Format Guide */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          ファイル形式ガイド
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">ベクター形式</h3>
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <div>
                <strong className="text-green-600">Adobe Illustrator (.ai)</strong>
                <p className="text-sm text-text-secondary">最も推奨される形式</p>
              </div>
              <div>
                <strong className="text-green-600">Encapsulated PostScript (.eps)</strong>
                <p className="text-sm text-text-secondary">他のソフトとの互換性が高い</p>
              </div>
              <div>
                <strong className="text-green-600">Scalable Vector Graphics (.svg)</strong>
                <p className="text-sm text-text-secondary">Webと印刷の両方で使用可能</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-800">
                <strong>メリット:</strong> 拡大しても画質が劣化しない、ファイルサイズが小さい
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">ラスター形式</h3>
              <Image className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              <div>
                <strong className="text-blue-600">Portable Document Format (.pdf)</strong>
                <p className="text-sm text-text-secondary">完成データとして最適</p>
              </div>
              <div>
                <strong className="text-blue-600">Tagged Image File Format (.tiff)</strong>
                <p className="text-sm text-text-secondary">高品質な印刷用画像</p>
              </div>
              <div>
                <strong className="text-blue-600">Portable Network Graphics (.png)</strong>
                <p className="text-sm text-text-secondary">透明背景をサポート</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>注意:</strong> 必ず350dpi以上でCMYKモードで保存
              </p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-red-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">非推奨形式</h3>
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="space-y-3">
              <div>
                <strong className="text-red-600">Microsoft Office</strong>
                <p className="text-sm text-text-secondary">Word, PowerPoint, Excel</p>
              </div>
              <div>
                <strong className="text-red-600">JPEG (低品質)</strong>
                <p className="text-sm text-text-secondary">圧縮率が高すぎるもの</p>
              </div>
              <div>
                <strong className="text-red-600">GIF</strong>
                <p className="text-sm text-text-secondary">256色限定で印刷に不向き</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-800">
                <strong>理由:</strong> 印刷品質を確保できない、フォント問題の可能性
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Resolution Guide */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          解像度と画質ガイド
        </h2>

        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            解像度早見表
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-medium">
                  <th className="text-left py-3">用途</th>
                  <th className="text-left py-3">最小解像度</th>
                  <th className="text-left py-3">推奨解像度</th>
                  <th className="text-left py-3">注意事項</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-light">
                  <td className="py-3">ロゴ・ブランドマーク</td>
                  <td className="py-3">300dpi</td>
                  <td className="py-3">600dpi</td>
                  <td className="py-3">ベクター形式を推奨</td>
                </tr>
                <tr className="border-b border-border-light">
                  <td className="py-3">写真画像</td>
                  <td className="py-3">300dpi</td>
                  <td className="py-3">350dpi</td>
                  <td className="py-3">CMYKモードで保存</td>
                </tr>
                <tr className="border-b border-border-light">
                  <td className="py-3">イラスト</td>
                  <td className="py-3">300dpi</td>
                  <td className="py-3">350dpi</td>
                  <td className="py-3">ベクターが理想</td>
                </tr>
                <tr className="border-b border-border-light">
                  <td className="py-3">テキスト</td>
                  <td className="py-3">600dpi</td>
                  <td className="py-3">1200dpi</td>
                  <td className="py-3">アウトライン化を推奨</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 text-green-600">
              解像度チェック方法
            </h3>
            <ol className="space-y-3 text-sm text-text-secondary">
              <li>
                <strong>Adobe Illustrator:</strong>
                <p>「効果」→「ドキュメントのラスタライズ設定」で確認</p>
              </li>
              <li>
                <strong>Adobe Photoshop:</strong>
                <p>「画像」→「画像解像度」でDPIを確認</p>
              </li>
              <li>
                <strong>簡易チェック:</strong>
                <p>実寸で印刷した際に文字が読めるか確認</p>
              </li>
            </ol>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4 text-blue-600">
              画質維持のコツ
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• 何度も保存・再圧縮を繰り返さない</li>
              <li>• 元データは常に高解像度で保管</li>
              <li>• 必要以上に圧縮しない</li>
              <li>• 適切なファイル形式を選択する</li>
              <li>• 定期的にバックアップを作成</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Color Mode Guide */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          カラーモードガイド
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">CMYKモード</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                <strong>印刷用の標準カラーモード</strong>
              </p>
              <ul className="space-y-1 ml-4">
                <li>• Cyan, Magenta, Yellow, Blackの4色構成</li>
                <li>• 印刷機のインク構成と一致</li>
                <li>• 色の再現性が予測可能</li>
                <li>• 特色との組み合わせも可能</li>
              </ul>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800">
                  <strong>推奨:</strong> 最終データは必ずCMYKモードで作成
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">RGBからCMYKへの変換</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <p>
                <strong>変換時の注意点</strong>
              </p>
              <ul className="space-y-1 ml-4">
                <li>• 明るい色がくすむことがある</li>
                <li>• 蛍光色は再現できない</li>
                <li>• 色の範囲が狭くなる</li>
                <li>• 事前にカラープルーフを確認</li>
              </ul>
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-orange-800">
                  <strong>注意:</strong> 変換後は必ず色の確認を
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Production Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-text-primary mb-6">
          データ制作時の注意事項
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              推奨プラクティス
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• フォントはすべてアウトライン化する</li>
              <li>• トリムマークとトンボを含める</li>
              <li>• 特色を使用する場合は色指定明記</li>
              <li>• レイヤーは整理して統合する</li>
              <li>• 不要なオブジェクトは削除</li>
              <li>• 画像は実寸で配置</li>
              <li>• プロファイルはJapan Color 2001を推奨</li>
            </ul>
          </Card>

          <Card className="p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              よくある問題と解決策
            </h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <strong>フォントが化ける:</strong>
                <br />アウトライン化で解決
              </li>
              <li>
                <strong>色が変わる:</strong>
                <br />CMYK変換とカラープルーフで確認
              </li>
              <li>
                <strong>画像が粗い:</strong>
                <br />解像度を350dpi以上に設定
              </li>
              <li>
                <strong>ファイルが開けない:</strong>
                <br />バージョンを下げて保存
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="bg-bg-secondary rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2 text-brixa-600" />
          データ作成サポート
        </h3>
        <p className="text-text-secondary mb-4">
          印刷用データの作成や変換に関して、専門のスタッフがサポートいたします。
          お気軽にご相談ください。
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-brixa-600 text-white rounded-lg hover:bg-brixa-700 transition-colors duration-200"
          >
            データ作成相談
          </a>
          <a
            href="/catalog"
            className="inline-flex items-center justify-center px-6 py-3 border border-border-medium rounded-lg hover:bg-bg-primary transition-colors duration-200"
          >
            テンプレートダウンロード
          </a>
        </div>
      </section>
    </div>
    </>
  )
}