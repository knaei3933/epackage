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

// =====================================================
// Types
// =====================================================

export interface AdminAuthContext {
  userId: string;
  role: 'admin' | 'operator' | 'sales' | 'accounting';
  userName: string;
  isDevMode: boolean;
}

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
    .select('kanji_last_name, name_kanji, email')
    .eq('id', userId)
    .single();

  return data?.kanji_last_name || data?.name_kanji || data?.email || '管理者';
}

// =====================================================
// Data Fetching Helpers
// =====================================================

/**
 * 注文統計取得
 */
export async function fetchOrderStats(period: number = 30) {
  const supabase = createServiceClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  const { data, error } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Loader] Order stats fetch error:', error);
    return null;
  }

  // 統計集計
  const stats = {
    total: data?.length || 0,
    pending: data?.filter(o => o.status === 'PENDING').length || 0,
    processing: data?.filter(o => o.status === 'PROCESSING').length || 0,
    completed: data?.filter(o => o.status === 'COMPLETED').length || 0,
    totalRevenue: data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
    ordersByStatus: [] as any[],
    monthlyRevenue: [] as any[],
  };

  return stats;
}

/**
 * 見積統計取得
 */
export async function fetchQuotationStats() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('quotations')
    .select('status, total_amount')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Loader] Quotation stats fetch error:', error);
    return null;
  }

  return {
    total: data?.length || 0,
    draft: data?.filter(q => q.status === 'draft').length || 0,
    sent: data?.filter(q => q.status === 'sent').length || 0,
    approved: data?.filter(q => q.status === 'approved').length || 0,
    rejected: data?.filter(q => q.status === 'rejected').length || 0,
    totalAmount: data?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0,
  };
}
