import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'パウチサンプルご依頼 | Epackage Lab',
  description: 'Epackage Labのパウチ製品サンプルを無料でお送りします。パウチセットサンプルでお手元でお試しいただけます。全国送料無料。',
  keywords: ['パウチサンプル', 'サンプル依頼', 'パウチ請求', '連包裝材', 'Epackage Lab', '無料サンプル'],
  alternates: {
    canonical: 'https://www.package-lab.com/samples',
  },
  openGraph: {
    title: 'パウチサンプルご依頼 | Epackage Lab',
    description: 'Epackage Labのパッキージ製品サンプルを無料でお送りします',
  },
}

export default function SamplesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brixa-600 via-brixa-700 to-navy-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            パウチサンプルご依頼
          </h1>
          <p className="text-lg text-brixa-100 mb-6">
            無料でパウチセットサンプルをお送りいたします
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-green-400 font-semibold">完全無料</span>
            <span className="text-white/50 mx-2">|</span>
            <span className="text-brixa-100">全国送料無料</span>
          </div>
        </div>
      </section>

      {/* Sample Info */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-brixa-50 to-blue-50 rounded-xl p-8 border border-brixa-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              パウチセットサンプルについて
            </h2>
            <p className="text-gray-700 text-center mb-6">
              当社のパウチ製品セットを無料でお送りします。<br />
              実際の品質や素材をお手元でご確認いただけます。
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-2">📦</div>
                <p className="font-semibold text-gray-900">セットサンプル</p>
                <p className="text-sm text-gray-600">複数種類のパウチ</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-2">🎁</div>
                <p className="font-semibold text-gray-900">完全無料</p>
                <p className="text-sm text-gray-600">料金は一切かかりません</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-3xl mb-2">🚚</div>
                <p className="font-semibold text-gray-900">全国発送</p>
                <p className="text-sm text-gray-600">2〜3営業日でお届け</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Form */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              お申し込みフォーム
            </h2>

            <form
              action="/api/contact"
              method="POST"
              className="space-y-6"
            >
              <input type="hidden" name="inquiryType" value="sample" />

              {/* お名前 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  お名前 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  placeholder="山田 太郎"
                />
              </div>

              {/* 会社名 */}
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  会社名
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  placeholder="株式会社〇〇"
                />
              </div>

              {/* メールアドレス */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  placeholder="example@company.com"
                />
              </div>

              {/* 電話番号 */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  電話番号 <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  placeholder="03-1234-5678"
                />
              </div>

              {/* 郵便番号 */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  郵便番号 <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  placeholder="100-0001"
                />
              </div>

              {/* 住所 */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  住所 <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  placeholder="東京都〇〇区〇〇1-2-3"
                />
              </div>

              {/* ご要望・ご質問 */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  ご要望・ご質問
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
                  placeholder="ご要望やご質問がございましたらご記入ください"
                />
              </div>

              {/* プライバシーポリシー同意 */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  name="privacy"
                  required
                  className="mt-1 w-4 h-4 text-brixa-600 border-gray-300 rounded focus:ring-brixa-500"
                />
                <label htmlFor="privacy" className="ml-2 text-sm text-gray-600">
                  <a href="/privacy" className="text-brixa-600 hover:underline">個人情報保護方針</a>に同意して送信します
                </label>
              </div>

              {/* 送信ボタン */}
              <button
                type="submit"
                className="w-full py-4 bg-brixa-600 text-white font-semibold rounded-lg hover:bg-brixa-700 focus:ring-4 focus:ring-brixa-300 transition-all"
              >
                サンプルを依頼する
              </button>

              <p className="text-xs text-gray-500 text-center">
                ※ 2営業日以内にご連絡いたします
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
