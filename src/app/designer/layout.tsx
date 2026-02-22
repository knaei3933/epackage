/**
 * Designer Portal Layout
 *
 * デザイナーポータル共通レイアウト
 * - ナビゲーションヘッダー
 * - デザイナー情報表示
 * - ログアウト機能
 *
 * @module app/designer
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { LayoutDashboard, LogOut, User, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface DesignerProfile {
  id: string;
  email: string;
  name?: string;
  company?: string;
}

// =====================================================
// Authentication Helper
// =====================================================

/**
 * デザイナー認証チェック
 * - notification_settingsから韓国デザイナーメールアドレスを取得
 * - 認証済みユーザーのメールがリストに含まれるか確認
 */
async function requireDesignerAuth(): Promise<DesignerProfile | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return null;
  }

  // 韓国デザイナーメールアドレスリストを取得
  const { data: setting } = await supabase
    .from('notification_settings')
    .select('value')
    .eq('key', 'korea_designer_emails')
    .maybeSingle();

  const designerEmails = setting?.value as string[] || [];

  // ユーザーのメールがデザイナーリストに含まれるか確認
  if (!designerEmails.includes(user.email)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name,
    company: user.user_metadata?.company,
  };
}

// =====================================================
// Layout Component
// =====================================================

export default async function DesignerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const designer = await requireDesignerAuth();

  if (!designer) {
    redirect('/auth/signin?redirect=/designer&error=designer_required');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Designer Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <Link href="/designer" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  EPackage Lab
                </h1>
                <p className="text-xs text-slate-500 font-medium">デザイナーポータル</p>
              </div>
            </Link>

            {/* Designer Info & Actions */}
            <div className="flex items-center gap-4">
              {/* Designer Profile */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800">
                    {designer.name || 'デザイナー'}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {designer.email}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm"
                  aria-label="ログアウト"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">ログアウト</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} EPackage Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
