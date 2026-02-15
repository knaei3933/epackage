/**
 * Sign In Page - Form POST method
 *
 * Uses traditional form POST to set cookies server-side
 * This bypasses Next.js 15's fetch-based cookie issues
 */

import { redirect } from 'next/navigation';

// =====================================================
// Page Component
// =====================================================

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.redirect || '/member/dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        {/* Card container - using div instead of Card component */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
          <p className="text-center text-gray-600 mb-6">アカウント情報を入力してください。</p>

          {/* Traditional form POST - server will handle cookies */}
          <form action="/api/auth/signin" method="POST">
            <input type="hidden" name="redirect" value={redirectUrl} />

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="example@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="•••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="remember"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  ログイン状態を保持
                </span>
              </label>

              <a
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                パスワードを忘れた方
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ログイン
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              まだアカウントをお持ちでない方{' '}
              <a
                href="/auth/register"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                会員登録
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
