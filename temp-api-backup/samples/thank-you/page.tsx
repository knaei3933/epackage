import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Package, Truck, Clock, Phone, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'サンプルリクエストありがとうございます | Epackage Lab',
  description: 'サンプルリクエストありがとうございます。在庫確認後、発送のご連絡をいたします。',
}

export default function SamplesThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              サンプルリクエストありがとうございます
            </h1>
            <p className="text-green-100">
              Epackage Lab製品サンプルのご請求いただき、誠にありがとうございます
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-4">
                サンプルリクエスト内容を確認いたしました。
                現在、在庫状況を確認しておりまして、確認次第、担当者より詳細な発送日程のご連絡をいたします。
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-green-900 mb-4">
                  発送スケジュール
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">在庫確認</p>
                    <p className="font-semibold">2時間以内</p>
                  </div>
                  <div className="text-center">
                    <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">発送準備</p>
                    <p className="font-semibold">2-3営業日</p>
                  </div>
                  <div className="text-center">
                    <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">お届け</p>
                    <p className="font-semibold">発送後1-2日</p>
                  </div>
                </div>
              </div>
            </div>

            {/* サンプル情報 */}
            <div className="bg-navy-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-navy-600 mb-4">
                サンプルに関する重要事項
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-navy-700 mr-2">•</span>
                  <span className="text-gray-700">送料は弊社負担といたします</span>
                </div>
                <div className="flex items-start">
                  <span className="text-navy-700 mr-2">•</span>
                  <span className="text-gray-700">発送後は追跡番号をメールにてお知らせいたします</span>
                </div>
                <div className="flex items-start">
                  <span className="text-navy-700 mr-2">•</span>
                  <span className="text-gray-700">サンプル評価のご感想をお聞かせいただけますと幸いです</span>
                </div>
                <div className="flex items-start">
                  <span className="text-navy-700 mr-2">•</span>
                  <span className="text-gray-700">技術的なご質問がございましたら、いつでもお気軽にお問い合わせください</span>
                </div>
              </div>
            </div>

            {/* お問い合わせ先情報 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                サンプル担当ご連絡先
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">メールでのお問い合わせ</h4>
                  <a
                    href="mailto:samples@epackage-lab.com"
                    className="text-navy-700 hover:text-navy-600 flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    samples@epackage-lab.com
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">お電話でのお問い合わせ</h4>
                  <a
                    href="tel:03-1234-5679"
                    className="text-navy-700 hover:text-navy-600 flex items-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    03-1234-5679
                  </a>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>営業時間:</strong> 平日 9:00-18:00（土日祝日を除く）
                </p>
              </div>
            </div>

            {/* よくある質問 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                サンプルに関するよくある質問
              </h3>
              <div className="space-y-4">
                <details className="bg-white border border-gray-200 rounded-lg p-4">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    サンプルは無料ですか？
                  </summary>
                  <p className="mt-2 text-gray-600">
                    はい、サンプルは無料です。送料も弊社負担といたします。
                  </p>
                </details>
                <details className="bg-white border border-gray-200 rounded-lg p-4">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    何個までリクエストできますか？
                  </summary>
                  <p className="mt-2 text-gray-600">
                    1回のリクエストで最大5個までサンプルをご請求いただけます。製品ごとの数量制限は10個までです。
                  </p>
                </details>
                <details className="bg-white border border-gray-200 rounded-lg p-4">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    海外への発送は可能ですか？
                  </summary>
                  <p className="mt-2 text-gray-600">
                    はい、海外への発送も可能です。その場合は別途輸送費と手続きが必要となりますので、お問い合わせください。
                  </p>
                </details>
                <details className="bg-white border border-gray-200 rounded-lg p-4">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    サンプルの評価期間について
                  </summary>
                  <p className="mt-2 text-gray-600">
                    通常2週間程度の評価期間をお勧めしております。評価結果についてご感想をお聞かせいただけますと、今後の製品改善に役立てさせていただきます。
                  </p>
                </details>
              </div>
            </div>

            {/* 次のステップ */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                次にすすめること
              </h3>
              <ol className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="font-semibold text-yellow-700 mr-2">1.</span>
                  <span>担当者からのご連絡をお待ちください（24時間以内）</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-yellow-700 mr-2">2.</span>
                  <span>発送日程のご確認と配送先住所の最終確認</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-yellow-700 mr-2">3.</span>
                  <span>サンプルの受け取りと製品評価</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold text-yellow-700 mr-2">4.</span>
                  <span>評価結果のご共有と今後の導入検討</span>
                </li>
              </ol>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                トップページに戻る
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                他の製品を見る
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-600 transition-colors"
              >
                お問い合わせ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}