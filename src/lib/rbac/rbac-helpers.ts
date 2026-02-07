/**
 * RBACヘルパー関数
 *
 * ロールベースアクセス制御（RBAC）のためのユーティリティ関数
 */

import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { isDevMode } from '@/lib/dev-mode';

// =====================================================
// Types
// =====================================================

/**
 * Role Type (소문자 통합 - DB와 일치)
 * DB profiles.role 컬럼 값과 정확히 일치해야 합니다
 */
export type Role = 'admin' | 'operator' | 'sales' | 'accounting' | 'member' | 'guest';

/**
 * Role Type Alias (레거시 호환성)
 * @deprecated 소문자 Role 타입을 사용하세요
 */
export type RoleLegacy = 'ADMIN' | 'OPERATOR' | 'SALES' | 'ACCOUNTING' | 'MEMBER' | 'GUEST';
export type Permission =
  // User management
  | 'user:read' | 'user:write' | 'user:approve' | 'user:delete'
  // Order management
  | 'order:read' | 'order:create' | 'order:update' | 'order:delete' | 'order:approve'
  // Quotation management
  | 'quotation:read' | 'quotation:create' | 'quotation:update' | 'quotation:delete' | 'quotation:approve'
  // Production
  | 'production:read' | 'production:update' | 'production:manage'
  // Inventory
  | 'inventory:read' | 'inventory:update' | 'inventory:adjust'
  // Finance
  | 'finance:read' | 'finance:approve'
  // Shipment
  | 'shipment:read' | 'shipment:create' | 'shipment:update'
  // Contract
  | 'contract:read' | 'contract:sign' | 'contract:approve'
  // Sample
  | 'sample:read' | 'sample:create' | 'sample:approve'
  // Settings
  | 'settings:read' | 'settings:write'
  // Notification
  | 'notification:read' | 'notification:send'
  // Report
  | 'report:read' | 'report:export';

export interface RBACContext {
  userId: string;
  role: Role;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  permissions: Permission[];
  isDevMode: boolean;
}

export interface RBACCheckOptions {
  permissions?: Permission[];
  requireActive?: boolean;
  allowGuest?: boolean;
}

// =====================================================
// 認証・認可チェック
// =====================================================

/**
 * 統一認証・認可チェック
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<RBACContext | NextResponse> {
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

  // DEV_MODEチェック
  const isDevModeEnabled = isDevMode();
  if (isDevModeEnabled) {
    const devUserId = request.cookies.get('dev-mock-user-id')?.value;
    if (devUserId) {
      return {
        userId: devUserId,
        role: 'admin' as Role,
        status: 'ACTIVE',
        permissions: await getAllPermissions(),
        isDevMode: true,
      };
    }
  }

  // 本番認証
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // プロフィール取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Normalize role from uppercase (database) to lowercase (code)
  const normalizedRole = normalizeRole(profile.role);
  const permissions = await getPermissionsForRole(normalizedRole);

  return {
    userId: user.id,
    role: normalizedRole,
    status: profile.status,
    permissions,
    isDevMode: false,
  };
}

/**
 * 権限チェック
 */
export function requirePermission(
  context: RBACContext,
  permission: Permission
): NextResponse | null {
  if (context.role === 'admin') return null; // 管理者は全許可

  if (!context.permissions.includes(permission)) {
    return NextResponse.json(
      { error: 'Forbidden', message: `Missing permission: ${permission}` },
      { status: 403 }
    );
  }

  return null;
}

/**
 * 複数権限チェック
 */
export function requireAnyPermission(
  context: RBACContext,
  permissions: Permission[]
): NextResponse | null {
  if (context.role === 'admin') return null;

  const hasPermission = permissions.some(p => context.permissions.includes(p));
  if (!hasPermission) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: `Missing one of permissions: ${permissions.join(', ')}`
      },
      { status: 403 }
    );
  }

  return null;
}

/**
 * RBACミドルウェアラッパー
 */
export function withRBAC<T = any>(
  handler: (req: NextRequest, ctx: RBACContext) => Promise<NextResponse<T>>,
  options: RBACCheckOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // 認証
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;

    // 権限チェック
    for (const permission of options.permissions ?? []) {
      const error = requirePermission(authResult, permission);
      if (error) return error;
    }

    // ステータスチェック
    if (options.requireActive && authResult.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Account not active' },
        { status: 403 }
      );
    }

    // ゲストチェック
    if (!options.allowGuest && authResult.role === 'guest') {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Guest access not allowed' },
        { status: 403 }
      );
    }

    // ハンドラー実行
    return handler(request, authResult);
  };
}

// =====================================================
// ヘルパー関数
// =====================================================

/**
 * 全パーミッション取得
 */
async function getAllPermissions(): Promise<Permission[]> {
  const PERMISSION_LIST: Permission[] = [
    // User management
    'user:read', 'user:write', 'user:approve', 'user:delete',
    // Order management
    'order:read', 'order:create', 'order:update', 'order:delete', 'order:approve',
    // Quotation management
    'quotation:read', 'quotation:create', 'quotation:update', 'quotation:delete', 'quotation:approve',
    // Production
    'production:read', 'production:update', 'production:manage',
    // Inventory
    'inventory:read', 'inventory:update', 'inventory:adjust',
    // Finance
    'finance:read', 'finance:approve',
    // Shipment
    'shipment:read', 'shipment:create', 'shipment:update',
    // Contract
    'contract:read', 'contract:sign', 'contract:approve',
    // Sample
    'sample:read', 'sample:create', 'sample:approve',
    // Settings
    'settings:read', 'settings:write',
    // Notification
    'notification:read', 'notification:send',
    // Report
    'report:read', 'report:export',
  ];
  return PERMISSION_LIST;
}

/**
 * ロール別パーミッション取得
 */
async function getPermissionsForRole(role: string): Promise<Permission[]> {
  // DEV_MODE: 全パーミッション返却
  if (isDevMode()) {
    return await getAllPermissions();
  }

  // Server Component用: Service Clientを使用（RLSバイパス）
  const { createServiceClient } = await import('@/lib/supabase');
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('role_permissions')
    .select('permissions(name)')
    .eq('role', role);

  return (data || []).map((rp: any) => rp.permissions.name) as Permission[];
}

/**
 * Normalize role from database (uppercase) to lowercase
 * Database stores 'ADMIN', code uses 'admin'
 */
function normalizeRole(role: string): Role {
  return role?.toLowerCase() as Role;
}

/**
 * 現在のユーザーコンテキスト取得（Server Component用）
 */
export async function getRBACContext(): Promise<RBACContext | null> {
  // Next.js 15+対応: cookies()を使用してSupabase SSR clientを作成
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

  // DEV_MODEチェック
  const isDevModeEnabled = isDevMode();
  if (isDevModeEnabled) {
    const devUserId = cookieStore.get('dev-mock-user-id')?.value;
    if (devUserId) {
      return {
        userId: devUserId,
        role: 'admin' as Role,
        status: 'ACTIVE',
        permissions: await getAllPermissions(),
        isDevMode: true,
      };
    }
  }

  // 本番認証: getUser()を使用してユーザー情報を取得
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    console.log('[RBAC] No authenticated user found');
    return null;
  }

  // プロフィールを取得（Service Role clientを使用してRLS를 우회）
  const { createServiceClient } = await import('@/lib/supabase');
  const serviceClient = createServiceClient();

  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    console.log('[RBAC] Profile not found for user:', user.id);
    return null;
  }

  // Normalize role from uppercase (database) to lowercase (code)
  const normalizedRole = normalizeRole(profile.role);
  const permissions = await getPermissionsForRole(normalizedRole);

  console.log('[RBAC] User authenticated:', user.email, 'Role:', normalizedRole);

  return {
    userId: user.id,
    role: normalizedRole,
    status: profile.status,
    permissions,
    isDevMode: false,
  };
}

/**
 * Cookieヘッダーを解析してオブジェクトに変換
 */
function parseCookieHeader(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=');
    const value = valueParts.join('=');
    if (name && value !== undefined) {
      try {
        cookies[name] = decodeURIComponent(value);
      } catch {
        cookies[name] = value;
      }
    }
  });

  return cookies;
}

/**
 * 権限チェックヘルパー（Server Component用）
 */
export function hasPermission(context: RBACContext | null, permission: Permission): boolean {
  if (!context) return false;
  if (context.role === 'admin') return true;
  return context.permissions.includes(permission);
}

/**
 * 複数権限チェックヘルパー（Server Component用）
 */
export function hasAnyPermission(context: RBACContext | null, permissions: Permission[]): boolean {
  if (!context) return false;
  if (context.role === 'admin') return true;
  return permissions.some(p => context.permissions.includes(p));
}
