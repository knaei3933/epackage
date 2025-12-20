import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'お問い合わせありがとうございます | Epackage Lab',
  description: 'お問い合わせありがとうございます。担当者よりご連絡いたします。',
}

export default function ContactThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-navy-700 to-navy-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-navy-700" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              お問い合わせありがとうございます
            </h1>
            <p className="text-navy-600">
              Epackage Labへお問い合わせいただき、誠にありがとうございます
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-700 mb-4">
                お問い合わせ内容を確認次第、担当者よりご登録いただいたメールアドレスにてご連絡いたします。
              </p>
              <div className="bg-navy-50 border border-navy-600 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-navy-600 mb-4">
                  今後の対応について
                </h2>
                <div className="flex items-center justify-center space-x-8">
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-navy-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">対応時間</p>
                    <p className="font-semibold">24時間以内</p>
                  </div>
                  <div className="text-center">
                    <Mail className="w-8 h-8 text-navy-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">連絡方法</p>
                    <p className="font-semibold">メール</p>
                  </div>
                  <div className="text-center">
                    <Phone className="w-8 h-8 text-navy-700 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">お急ぎの場合</p>
                    <p className="font-semibold">お電話ください</p>
                  </div>
                </div>
              </div>
            </div>

            {/* お問い合わせ先情報 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                お問い合わせ先
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">メールでのお問い合わせ</h4>
                  <a
                    href="mailto:info@epackage-lab.com"
                    className="text-navy-700 hover:text-navy-600 flex items-center"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    info@epackage-lab.com
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">お電話でのお問い合わせ</h4>
                  <a
                    href="tel:03-1234-5678"
                    className="text-navy-700 hover:text-navy-600 flex items-center"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    03-1234-5678
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
                よくある質問
              </h3>
              <div className="space-y-4">
                <details className="bg-white border border-gray-200 rounded-lg p-4">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    どのくらいで返信がありますか？
                  </summary>
                  <p className="mt-2 text-gray-600">
                    通常、24時間以内に担当者よりご連絡いたします。お急ぎの場合はお電話にてお問い合わせください。
                  </p>
                </details>
                <details className="bg-white border border-gray-200 rounded-lg p-4">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    営業時間外のお問い合わせはどうなりますか？
                  </summary>
                  <p className="mt-2 text-gray-600">
                    営業時間外のお問い合わせは、翌営業日に対応させていただきます。緊急のお問い合わせの場合は、メールにてその旨をお知らせください。
                  </p>
                </details>
                <details className="bg-white border border-gray-200 rounded-lg p-4">
                  <summary className="font-medium text-gray-700 cursor-pointer">
                    技術的な問い合わせについて
                  </summary>
                  <p className="mt-2 text-gray-600">
                    技術的なご質問については、専門の技術担当者が丁寧に対応いたします。製品の仕様や導入方法など、詳しいご相談も可能です。
                  </p>
                </details>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-navy-700 text-white font-medium rounded-lg hover:bg-navy-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                トップページに戻る
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                製品情報を見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}