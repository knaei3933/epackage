/**
 * Admin Page Loader
 *
 * 管理者ページ用データローダー
 * - RBAC認証チェック
 * - Server Component用データフェッチ
 */

import { createServiceClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { getRBACContext, hasPermission } from '@/lib/rbac/rbac-helpers';
import type { Permission } from '@/lib/rbac/rbac-helpers';
import type { AdminAuthContext } from '@/types/admin';

// Re-export canonical type for convenience
export type { AdminAuthContext } from '@/types/admin';

// =====================================================
// Authentication
// =====================================================

/**
 * 管理者ページ認証チェック
 *
 * @param requiredPermissions - 必要な権限リスト（いずれか1つがあればOK）
 * @returns 認証コンテキスト
 * @throws 認証エラー時はリダイレクト
 */
export async function requireAdminAuth(
  requiredPermissions?: Permission[]
): Promise<AdminAuthContext> {
  // RBACコンテキスト取得
  const context = await getRBACContext();

  if (!context) {
    // 未認証 → ログインページへ
    redirect('/auth/signin?redirect=/admin/dashboard');
  }

  // admin/operator/sales/accountingのみアクセス可能 (RBAC contextは小文字を返す)
  const adminRoles = ['admin', 'operator', 'sales', 'accounting'] as const;
  if (!adminRoles.includes(context.role as any)) {
    // 権限なし → 会員ダッシュボードへ
    redirect('/member/dashboard?error=admin_required');
  }

  // ステータスチェック
  if (context.status !== 'ACTIVE') {
    redirect('/?error=account_inactive');
  }

  // 権限チェック（指定がある場合）
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(p =>
      hasPermission(context, p)
    );
    if (!hasRequiredPermission) {
      redirect('/admin/dashboard?error=insufficient_permissions');
    }
  }

  // ユーザー名取得
  const userName = await getUserName(context.userId);

  return {
    userId: context.userId,
    role: context.role as 'admin' | 'operator' | 'sales' | 'accounting',
    userName,
    permissions: context.permissions,
    isDevMode: context.isDevMode,
  };
}

/**
 * ユーザー名取得
 */
async function getUserName(userId: string): Promise<string> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('profiles')
    .select('kanji_last_name, kanji_first_name, email')
    .eq('id', userId)
    .single();

  // kanji_first_name は profiles 実カラム（name_kanji は存在しない派生値）
  // 誤って name_kanji を select すると Supabase は列エラーを返すため実カラムのみ使用
  const lastName = data?.kanji_last_name || '';
  const firstName = data?.kanji_first_name || '';
  const fullName = (lastName || firstName) ? `${lastName} ${firstName}`.trim() : '';
  return fullName || data?.email || '管理者';
}

// =====================================================
// Convenience Helper
// =====================================================

/**
 * 管理者認証チェック（try/catch/redirectボイラープレート省略用）
 *
 * requireAdminAuthをラップし、Next.js redirectエラーは透過的にスロー、
 * その他エラーは指定リダイレクト先へ遷移させます。
 *
 * @param permissions - 必要な権限リスト
 * @param redirectPath - 認証失敗時のリダイレクト先（デフォルト: /auth/signin）
 * @returns 認証コンテキスト
 */
export async function getAdminAuth(
  permissions: Permission[] = [],
  redirectPath = '/auth/signin'
): Promise<AdminAuthContext> {
  try {
    return await requireAdminAuth(permissions);
  } catch (error) {
    if (error instanceof Error && 'digest' in error) {
      throw error; // Next.js redirect - 透過的にスロー
    }
    redirect(redirectPath);
  }
}

