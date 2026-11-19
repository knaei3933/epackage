/**
 * Sign In Page - Form POST method
 *
 * Uses traditional form POST to set cookies server-side
 * This bypasses Next.js 15's fetch-based cookie issues
 */

import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { Card, buttonVariants } from '@/components/ui';

// 素の <input> は、共通の Input と同じ見た目になるクラスにそろえる（フォームの処理は変えない）
const FIELD_CLASS =
  'h-10 w-full rounded-md border border-border-strong bg-bg-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand disabled:bg-bg-muted max-sm:h-11';
const LINK_CLASS =
  'inline-flex min-h-11 items-center rounded-inner text-sm text-brand underline underline-offset-4 hover:text-brand-pressed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

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
    <AuthShell title="ログイン" description="アカウント情報を入力してください。" brand={false}>
      <Card className="p-6 md:p-8">
        {/* Traditional form POST - server will handle cookies */}
        <form action="/api/auth/signin" method="POST">
          <input type="hidden" name="redirect" value={redirectUrl} />

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-text-primary">
              メールアドレス
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

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-text-primary">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="•••••••••"
              className={FIELD_CLASS}
            />
          </div>

          {/* Remember me */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4">
            <label className="flex min-h-11 items-center">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded-inner border-border-strong accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              />
              <span className="ml-2 text-sm text-text-primary">
                ログイン状態を保持
              </span>
            </label>

            <a href="/auth/forgot-password" className={LINK_CLASS}>
              パスワードを忘れた方
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className={buttonVariants({ variant: 'primary', size: 'lg', fullWidth: true })}
          >
            ログイン
          </button>

          {/* Register link */}
          <p className="mt-4 text-center text-sm text-text-secondary">
            まだアカウントをお持ちでない方{' '}
            <a href="/auth/register" className={`${LINK_CLASS} font-medium`}>
              会員登録
            </a>
          </p>
        </form>
      </Card>
    </AuthShell>
  );
}
