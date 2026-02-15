/**
 * Not Found Page
 *
 * 404エラーページ
 * - 存在しないルートへのアクセス時のカスタムUI
 * - 日本語のユーザーフレンドリーなメッセージ
 * - ナビゲーションオプションを提供
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { HomeIcon, CatalogIcon, DocumentTextIcon } from '@/components/ui/icons';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          {/* 404 Badge */}
          <div className="mb-8">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
              <span className="text-white text-sm font-semibold tracking-wider">
                404 ERROR
              </span>
            </div>
          </div>

          {/* Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-7xl">🔍</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ページが見つかりません
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            お探しのページは移動または削除された可能性があります。
            <br />
            URLを再度ご確認ください。
          </p>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/"
              className="group p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  🏠
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  ホーム
                </span>
              </div>
            </Link>

            <Link
              href="/catalog"
              className="group p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  📦
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  製品カタログ
                </span>
              </div>
            </Link>

            <Link
              href="/quote-simulator"
              className="group p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  💰
                </span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                  見積もり
                </span>
              </div>
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              前のページに戻る
            </Button>

            <Link href="/" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full">
                トップページへ
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              引き続き問題が発生する場合は、
              <Link
                href="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                お問い合わせフォーム
              </Link>
              からご連絡ください
            </p>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-8 bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            よく閲覧されるページ
          </h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link
              href="/catalog"
              className="text-gray-600 hover:text-blue-700 transition-colors"
            >
              • 製品カタログ
            </Link>
            <Link
              href="/samples"
              className="text-gray-600 hover:text-blue-700 transition-colors"
            >
              • サンプル請求
            </Link>
            <Link
              href="/quote-simulator"
              className="text-gray-600 hover:text-blue-700 transition-colors"
            >
              • 見積もりシミュレーター
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-blue-700 transition-colors"
            >
              • 会社概要
            </Link>
            <Link
              href="/service"
              className="text-gray-600 hover:text-blue-700 transition-colors"
            >
              • サービス紹介
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 hover:text-blue-700 transition-colors"
            >
              • お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
