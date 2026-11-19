/**
 * Login Form (Server Component) - Native Form POST
 *
 * サーバーコンポーネント版ログインフォーム
 * - ネイティブHTMLフォームPOSTを使用
 * - ブラウザが303リダイレクトとSet-Cookieを自動処理
 * - JavaScript不要で確実にクッキーが保存される
 */

import { Card, buttonVariants } from '@/components/ui';

// 素の <input> は、共通の Input と同じ見た目になるクラスにそろえる（フォームの処理は変えない）
const FIELD_CLASS =
  'h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11';
const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-inner text-sm text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

interface LoginFormServerProps {
  redirectUrl?: string;
}

export default function LoginFormServer({ redirectUrl = '/member/dashboard' }: LoginFormServerProps) {
  return (
    <Card className="p-6 md:p-8">
      <form
        action="/api/auth/signin"
        method="POST"
        className="space-y-4"
      >
        {/* Hidden field for redirect URL */}
        <input type="hidden" name="redirect" value={redirectUrl} />

        {/* =====================================================
            メールアドレス
            ===================================================== */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-primary">
            メールアドレス<span className="ml-1 text-error">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="example@company.com"
            className={FIELD_CLASS}
          />
        </div>

        {/* =====================================================
            パスワード
            ===================================================== */}
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-primary">
            パスワード<span className="ml-1 text-error">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className={FIELD_CLASS}
          />
        </div>

        {/* =====================================================
            ログイン維持 & パスワード再設定
            ===================================================== */}
        <div className="flex items-center justify-between">
          <label className="flex min-h-11 cursor-pointer items-center space-x-2">
            <input
              name="remember"
              type="checkbox"
              className="h-4 w-4 rounded-inner border-border-strong accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            />
            <span className="text-sm text-text-primary">
              ログイン状態を保持
            </span>
          </label>

          <a
            href="/auth/forgot-password"
            className={LINK_CLASS}
          >
            パスワードを忘れた方
          </a>
        </div>

        {/* =====================================================
            送信ボタン
            ===================================================== */}
        <button
          type="submit"
          className={buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true })}
        >
          ログイン
        </button>

        {/* =====================================================
            会員登録リンク
            ===================================================== */}
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            まだアカウントをお持ちでない方{' '}
            <a
              href="/auth/register"
              className={`${LINK_CLASS} font-medium`}
            >
              会員登録
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}
