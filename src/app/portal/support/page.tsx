/**
 * Customer Support Page
 * お問い合わせページ
 *
 * Provides customer support options and contact form
 */

import React from 'react';
import Link from 'next/link';

// Force dynamic rendering - authentication is handled by the layout
export const dynamic = 'force-dynamic';

// This page doesn't require user data - it's a static support page
// Authentication is handled by the layout

export default async function CustomerSupportPage() {

  const supportCategories = [
    {
      id: 'order',
      icon: '📦',
      title: '注文に関するお問い合わせ',
      titleEn: 'Order Inquiries',
      description: '注文状況、変更、キャンセルなど',
      email: 'orders@epackage-lab.com',
    },
    {
      id: 'technical',
      icon: '🔧',
      title: '技術サポート',
      titleEn: 'Technical Support',
      description: '仕様書、データ入稿、ファイル形式など',
      email: 'technical@epackage-lab.com',
    },
    {
      id: 'billing',
      icon: '💰',
      title: '請求・支払いに関するお問い合わせ',
      titleEn: 'Billing & Payment',
      description: '請求書、支払い方法、請求内容など',
      email: 'billing@epackage-lab.com',
    },
    {
      id: 'general',
      icon: '💬',
      title: 'その他のお問い合わせ',
      titleEn: 'General Inquiries',
      description: 'アカウント、パスワード、その他のご質問',
      email: 'support@epackage-lab.com',
    },
  ];

  const faqItems = [
    {
      question: '見積書の有効期限はどのくらいですか？',
      answer: '見積書の有効期限は発行日から30日間です。期限が切れた場合は、再度お見積依頼をお願いいたします。',
    },
    {
      question: '注文をキャンセルすることはできますか？',
      answer: '製作開始前であればキャンセル可能です。お早めに orders@epackage-lab.com までご連絡ください。',
    },
    {
      question: 'デザインデータの形式に指定はありますか？',
      answer: 'Adobe Illustrator (.ai) 形式を推奨しております。詳細は「制作ガイドライン」をご参照ください。',
    },
    {
      question: '納期はどのくらいかかりますか？',
      answer: '製品や数量によりますが、通常、お客様確認後2〜4週間程度です。急ぎの場合はご相談ください。',
    },
    {
      question: 'サンプルは注文できますか？',
      answer: 'はい、サンプル注文が可能です。1注文につき最大5点まで承っております。',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          お問い合わせ
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          お困りのことはございませんか？お気軽にお問い合わせください
        </p>
      </div>

      {/* Quick Contact */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              お急ぎの場合はお電話ください
            </h2>
            <p className="text-blue-100">
              営業時間: 平日 9:00〜18:00（土日祝日を除く）
            </p>
          </div>
          <a
            href="tel:03-1234-5678"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors self-start"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            03-1234-5678
          </a>
        </div>
      </div>

      {/* Support Categories */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          お問い合わせカテゴリ
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {supportCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{category.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {category.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {category.description}
                  </p>
                  <a
                    href={`mailto:${category.email}`}
                    className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {category.email}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          よくご利用いただくサービス
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/portal/orders"
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">注文一覧</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">注文を確認する</p>
              </div>
            </div>
          </Link>

          <Link
            href="/portal/documents"
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">ドキュメント</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">書類をダウンロード</p>
              </div>
            </div>
          </Link>

          <Link
            href="/samples"
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">サンプル注文</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">サンプルを依頼</p>
              </div>
            </div>
          </Link>

          <Link
            href="/quote-simulator"
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">見積シミュレーター</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">概算見積もり</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          よくある質問（FAQ）
        </h2>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group"
            >
              <summary className="flex cursor-pointer items-center justify-between p-4 text-left font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span>{item.question}</span>
                <svg
                  className="w-5 h-5 text-slate-500 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          お役立ちリソース
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/guide/size"
            className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>サイズ・規格ガイド</span>
          </Link>
          <Link
            href="/guide/color"
            className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>印刷色見本</span>
          </Link>
          <Link
            href="/guide/environmentaldisplay"
            className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>環境対応表示について</span>
          </Link>
          <Link
            href="/guide/image"
            className="flex items-center gap-3 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>画像・イラスト使用ガイド</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
