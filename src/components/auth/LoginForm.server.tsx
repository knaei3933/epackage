/**
 * Login Form (Server Component) - Native Form POST
 *
 * サーバーコンポーネント版ログインフォーム
 * - ネイティブHTMLフォームPOSTを使用
 * - ブラウザが303リダイレクトとSet-Cookieを自動処理
 * - JavaScript不要で確実にクッキーが保存される
 */

import { Card } from '@/components/ui';

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
          <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
            メールアドレス<span className="text-error-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="example@company.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          />
        </div>

        {/* =====================================================
            パスワード
            ===================================================== */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
            パスワード<span className="text-error-500">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-500 focus:border-transparent"
          />
        </div>

        {/* =====================================================
            ログイン維持 & パスワード再設定
            ===================================================== */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              name="remember"
              type="checkbox"
              className="w-4 h-4 text-brixa-500"
            />
            <span className="text-sm text-text-primary">
              ログイン状態を保持
            </span>
          </label>

          <a
            href="/auth/forgot-password"
            className="text-sm text-brixa-500 hover:text-brixa-600"
          >
            パスワードを忘れた方
          </a>
        </div>

        {/* =====================================================
            送信ボタン
            ===================================================== */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-brixa-500 text-white rounded-lg hover:bg-brixa-600 transition-colors"
        >
          ログイン
        </button>

        {/* =====================================================
            会員登録リンク
            ===================================================== */}
        <div className="text-center">
          <p className="text-sm text-text-muted">
            まだアカウントをお持ちでない方{' '}
            <a
              href="/auth/register"
              className="text-brixa-500 hover:text-brixa-600 font-medium"
            >
              会員登録
            </a>
          </p>
        </div>
      </form>
    </Card>
  );
}
