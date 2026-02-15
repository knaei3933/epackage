/**
 * Order Access Helper
 *
 * 注文アクセス権限チェック用ヘルパー関数
 * - 管理者: 全注文アクセス可能
 * - 一般会員: 自分の注文のみアクセス可能
 * - ゲスト: アクセス不可
 *
 * @module rbac/order-access
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Role } from './rbac-helpers';

// =====================================================
// Types
// =====================================================

export interface OrderAccessResult {
  allowed: boolean;
  reason?: 'unauthenticated' | 'forbidden' | 'not_found' | 'archived';
  order?: OrderAccessInfo;
}

export interface OrderAccessInfo {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  archived_at: string | null;
  is_owner: boolean;
}

export interface OrderAccessContext {
  userId: string | null;
  role: Role | null;
  isAuthenticated: boolean;
}

// =====================================================
// Context取得
// =====================================================

/**
 * 現在のユーザーコンテキスト取得（Server Component用）
 */
export async function getOrderAccessContext(): Promise<OrderAccessContext> {
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

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      userId: null,
      role: null,
      isAuthenticated: false,
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    userId: user.id,
    role: (profile?.role as Role) || null,
    isAuthenticated: true,
  };
}

// =====================================================
// アクセスチェック
// =====================================================

/**
 * 注文アクセス権限チェック
 *
 * @param orderId - 注文ID
 * @param context - ユーザーコンテキスト（省略時は自動取得）
 * @returns アクセス権限チェック結果
 */
export async function checkOrderAccess(
  orderId: string,
  context?: OrderAccessContext
): Promise<OrderAccessResult> {
  // コンテキスト取得（省略時）
  const ctx = context || await getOrderAccessContext();

  // 未認証チェック
  if (!ctx.isAuthenticated || !ctx.userId) {
    return {
      allowed: false,
      reason: 'unauthenticated',
    };
  }

  // 注文データ取得（Service RoleでRLSバイパス）
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, user_id, status, archived_at')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return {
      allowed: false,
      reason: 'not_found',
    };
  }

  // 管理者チェック（全注文アクセス可能）
  if (ctx.role === 'admin') {
    return {
      allowed: true,
      order: {
        ...order,
        is_owner: order.user_id === ctx.userId,
      } as OrderAccessInfo,
    };
  }

  // 所有者チェック（自分の注文のみアクセス可能）
  if (order.user_id !== ctx.userId) {
    return {
      allowed: false,
      reason: 'forbidden',
    };
  }

  // アーカイブチェック（アーカイブ済み注文はアクセス不可）
  if (order.archived_at) {
    return {
      allowed: false,
      reason: 'archived',
      order: {
        ...order,
        is_owner: true,
      } as OrderAccessInfo,
    };
  }

  return {
    allowed: true,
    order: {
      ...order,
      is_owner: true,
    } as OrderAccessInfo,
  };
}

/**
 * 複数注文アクセス権限チェック
 *
 * @param orderIds - 注文IDリスト
 * @param context - ユーザーコンテキスト（省略時は自動取得）
 * @returns アクセス可能な注文IDリスト
 */
export async function checkMultipleOrderAccess(
  orderIds: string[],
  context?: OrderAccessContext
): Promise<{ accessible: string[]; forbidden: string[] }> {
  const ctx = context || await getOrderAccessContext();

  if (!ctx.isAuthenticated || !ctx.userId) {
    return { accessible: [], forbidden: orderIds };
  }

  // 管理者は全注文アクセス可能
  if (ctx.role === 'admin') {
    return { accessible: orderIds, forbidden: [] };
  }

  // 一般会員は自分の注文のみ取得
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

  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .in('id', orderIds)
    .eq('user_id', ctx.userId)
    .is('archived_at', null);

  const accessible = (orders || []).map((o) => o.id);
  const forbidden = orderIds.filter((id) => !accessible.includes(id));

  return { accessible, forbidden };
}

// =====================================================
// API Route用ヘルパー
// =====================================================

/**
 * API Route用注文アクセスチェックミドルウェア
 *
 * @param orderId - 注文ID
 * @param allowAdmin - 管理者アクセスを許可するか（デフォルト: true）
 * @returns エラーレスポンス（アクセス拒否時）または null（アクセス許可時）
 */
export async function requireOrderAccess(
  orderId: string,
  allowAdmin: boolean = true
): Promise<{ error?: string; status?: number; order?: OrderAccessInfo } | null> {
  const result = await checkOrderAccess(orderId);

  if (!result.allowed) {
    switch (result.reason) {
      case 'unauthenticated':
        return { error: 'Unauthorized', status: 401 };
      case 'forbidden':
        return { error: 'Forbidden', status: 403 };
      case 'not_found':
        return { error: 'Order not found', status: 404 };
      case 'archived':
        return { error: 'Order is archived', status: 403 };
      default:
        return { error: 'Access denied', status: 403 };
    }
  }

  return { order: result.order };
}

/**
 * 注文所有者チェック（簡易版）
 *
 * @param orderId - 注文ID
 * @param userId - ユーザーID
 * @returns 所有権限
 */
export async function isOrderOwner(orderId: string, userId: string): Promise<boolean> {
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

  const { data, error } = await supabase
    .from('orders')
    .select('user_id')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  return !error && data !== null;
}

// =====================================================
// クライアントコンポーネント用ヘルパー
// =====================================================

/**
 * 注文所有権チェック（クライアントコンポーネント用）
 *
 * 注意: この関数はクライアントサイドでのみ使用してください
 *
 * @param order - 注文オブジェクト（user_idフィールド必須）
 * @param userId - 現在のユーザーID
 * @returns 所有権限
 */
export function checkOrderOwnershipClient(order: { user_id?: string }, userId: string | null): boolean {
  if (!userId || !order.user_id) return false;
  return order.user_id === userId;
}
