/**
 * Not Found Page
 *
 * 404エラーページ
 * - 存在しないルートへのアクセス時のカスタムUI
 * - 日本語のユーザーフレンドリーなメッセージ
 * - ナビゲーションオプションを提供
 * - Server Component（metadata で noindex・nofollow を出力）
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Home, Package, Calculator } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout';
import { NotFoundBackButton } from './components/NotFoundBackButton';

// 404 ページはインデックスさせない（Soft 404 回避）
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const TILE =
  'flex flex-col items-center gap-2 rounded-container border border-border-medium bg-bg-primary p-4 transition-colors hover:border-border-strong hover:bg-bg-secondary hover:shadow-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';
const TILE_LABEL = 'text-sm font-medium text-text-primary';
const TEXT_LINK =
  'inline-flex min-h-11 items-center text-text-secondary transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <PageHeader
        title="ページが見つかりません"
        lead={
          <>
            お探しのページは移動または削除された可能性があります。
            <br />
            URLを再度ご確認ください。
          </>
        }
        actions={
          <>
            <Link href="/" className={buttonVariants({ variant: 'primary', size: 'md' })}>
              トップページへ
            </Link>
            <NotFoundBackButton />
          </>
        }
      />

      <div className="mx-auto max-w-[1120px] px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          {/* Quick Links */}
          <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/" className={TILE}>
              <Home className="h-8 w-8 text-brand" aria-hidden="true" />
              <span className={TILE_LABEL}>ホーム</span>
            </Link>

            <Link href="/catalog" className={TILE}>
              <Package className="h-8 w-8 text-brand" aria-hidden="true" />
              <span className={TILE_LABEL}>製品カタログ</span>
            </Link>

            <Link href="/quote-simulator" className={TILE}>
              <Calculator className="h-8 w-8 text-brand" aria-hidden="true" />
              <span className={TILE_LABEL}>見積もり</span>
            </Link>
          </div>

          {/* Additional Help Section */}
          <h2 className="mb-3 text-lg font-bold text-text-primary">
            よく閲覧されるページ
          </h2>
          <div className="grid grid-cols-1 gap-x-4 text-sm sm:grid-cols-2">
            <Link href="/catalog" className={TEXT_LINK}>
              • 製品カタログ
            </Link>
            <Link href="/samples" className={TEXT_LINK}>
              • サンプル請求
            </Link>
            <Link href="/quote-simulator" className={TEXT_LINK}>
              • 見積もりシミュレーター
            </Link>
            <Link href="/about" className={TEXT_LINK}>
              • 会社概要
            </Link>
            <Link href="/service" className={TEXT_LINK}>
              • サービス紹介
            </Link>
            <Link href="/contact" className={TEXT_LINK}>
              • お問い合わせ
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-8 border-t border-border-medium pt-6">
            <p className="text-sm text-text-muted">
              引き続き問題が発生する場合は、
              <Link
                href="/contact"
                className="font-medium text-brand underline hover:text-brand-pressed"
              >
                お問い合わせフォーム
              </Link>
              からご連絡ください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
