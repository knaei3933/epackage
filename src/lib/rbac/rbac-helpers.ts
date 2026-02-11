/**
 * RBACヘルパー関数
 *
 * ロールベースアクセス制御（RBAC）のためのユーティリティ関数
 *
 * CRITICAL FIX FOR NEXT.JS 16 + TURBOPACK:
 * - cookies() and headers() are dynamic APIs that MUST be imported lazily
 * - Top-level imports of these APIs cause build hangs during static analysis
 * - All imports of next/headers are now dynamic (await import())
 */

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

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
  // CRITICAL: Dynamic import to avoid build-time hang
  const { cookies } = await import('next/headers');
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
 * 常にデフォルト権限を返す（データベース依存を排除）
 *
 * NOTE: 本番環境ではrole_permissionsテーブルを使用せず、
 * コード内で定義されたデフォルト権限を使用します。
 * これによりビルド時のデータベース接続問題を回避します。
 */
async function getPermissionsForRole(role: string): Promise<Permission[]> {
  // デフォルト権限を即座に返す（DB呼び出しを完全にスキップ）
  console.log('[RBAC] Using default permissions for role:', role);
  return getDefaultPermissionsForRole(role);
}

/**
 * ロール別デフォルトパーミッション（フォールバック用）
 */
function getDefaultPermissionsForRole(role: string): Permission[] {
  const adminPermissions: Permission[] = [
    'user:read', 'user:write', 'user:approve', 'user:delete',
    'order:read', 'order:create', 'order:update', 'order:delete', 'order:approve',
    'quotation:read', 'quotation:create', 'quotation:update', 'quotation:delete', 'quotation:approve',
    'production:read', 'production:update', 'production:manage',
    'inventory:read', 'inventory:update', 'inventory:adjust',
    'finance:read', 'finance:approve',
    'shipment:read', 'shipment:create', 'shipment:update',
    'contract:read', 'contract:sign', 'contract:approve',
    'sample:read', 'sample:create', 'sample:approve',
    'settings:read', 'settings:write',
    'notification:read', 'notification:send',
    'report:read', 'report:export',
  ];

  const memberPermissions: Permission[] = [
    'order:read',
    'quotation:read',
    'shipment:read',
    'contract:read',
    'sample:read',
  ];

  switch (role) {
    case 'admin':
    case 'operator':
    case 'sales':
    case 'accounting':
      return adminPermissions;
    case 'member':
      return memberPermissions;
    default:
      return [];
  }
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
 *
 * SECURITY: Uses Supabase httpOnly cookies only, with middleware headers fallback
 *
 * CRITICAL: This function MUST NOT be called at module level during build time.
 * Next.js 16 + Turbopack will hang if cookies() or headers() are called during static analysis.
 * Always call this function from within a Server Component's render function or async handler.
 */
export async function getRBACContext(): Promise<RBACContext | null> {
  console.log('[RBAC] getRBACContext() called');

  // =====================================================
  // BUILD-TIME GUARD: Skip ALL async operations during build
  // =====================================================
  // Multiple checks to detect build context and fail fast without calling cookies()/headers()
  //
  // Check 1: Next.js build phase environment variable
  if (process.env.NEXT_PHASE === 'phase-build') {
    console.log('[RBAC] Build phase detected (NEXT_PHASE), returning null context');
    return null;
  }

  // Check 2: Standalone mode indicates build time
  if (process.env.NEXT_STANDALONE_MODE === 'true') {
    console.log('[RBAC] Standalone mode detected, returning null context');
    return null;
  }

  // Check 3: If running in CI/CD without request context, return null
  // This is a safety check for build servers
  if (process.env.CI === 'true' && typeof window === 'undefined') {
    // In CI, check if we have a request context by trying to access a safe API
    // We use a try-catch with a synchronous check first
    try {
      // This will throw during build time in Turbopack
      // We use it as a canary to detect build context
      const { headers } = await import('next/headers');
      // The import alone doesn't trigger the hang
      // But calling headers() will, so we check another way
    } catch {
      console.log('[RBAC] Import failed during build, returning null context');
      return null;
    }
  }

  // Check 4: Production build without explicit request context
  // During `next build`, there's no actual HTTP request
  // We detect this by checking if critical environment variables for runtime are missing
  const hasRuntimeContext =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasRuntimeContext) {
    console.log('[RBAC] No runtime context (missing env vars), returning null context');
    return null;
  }

  // =====================================================
  // First try: Check middleware headers (fastest path)
  // =====================================================
  // Middleware sets x-user-id, x-user-role, x-user-status headers
  // This is the most reliable way to get auth info in Server Components
  try {
    // CRITICAL: Dynamic import to avoid build-time hang
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userRole = headersList.get('x-user-role');
    const userStatus = headersList.get('x-user-status');

    if (userId && userRole && userStatus) {
      console.log('[RBAC] Found auth in middleware headers:', { userId, userRole, userStatus });

      const normalizedRole = normalizeRole(userRole);
      const permissions = await getPermissionsForRole(normalizedRole);

      return {
        userId,
        role: normalizedRole,
        status: userStatus as RBACContext['status'],
        permissions,
        isDevMode: false,
      };
    }
  } catch (error) {
    // headers() might fail in some contexts, continue to cookie check
    console.log('[RBAC] Could not read headers, trying cookies...');
  }

  // =====================================================
  // Second try: Read cookies directly (for edge cases)
  // =====================================================
  // CRITICAL: Dynamic import to avoid build-time hang
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  // Debug: Log all available cookies
  const allCookies = cookieStore.getAll();
  const sbCookies = allCookies.filter(c => c.name.startsWith('sb-'));
  console.log('[RBAC] Supabase cookies found:', sbCookies.map(c => ({ name: c.name, hasValue: !!c.value })));

  // DEV_MODE: Check for mock user cookie first
  const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

  if (isDevMode) {
    const devMockUserId = cookieStore.get('dev-mock-user-id')?.value;

    if (devMockUserId) {
      console.log('[RBAC] DEV_MODE: Using mock user:', devMockUserId);

      // Determine role based on user ID (admin if contains specific pattern)
      const role = 'admin'; // Default to admin for dev mode

      return {
        userId: devMockUserId,
        role: role as Role,
        status: 'ACTIVE',
        permissions: await getPermissionsForRole(role as Role),
        isDevMode: true,
      };
    }
    console.log('[RBAC] DEV_MODE enabled but no mock user cookie found');
  }

  console.log('[RBAC] Creating Supabase server client...');
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => {
          const value = cookieStore.get(name)?.value;
          if (name.startsWith('sb-')) {
            console.log('[RBAC] Getting cookie:', name, 'found:', !!value);
          }
          return value;
        },
        set: () => {},
        remove: () => {},
      },
    }
  );

  // 本番認証: getUser()を使用してユーザー情報を取得
  console.log('[RBAC] Calling supabase.auth.getUser()...');
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('[RBAC] Supabase auth error:', error.message, error.status);
    return null;
  }

  if (!user) {
    console.log('[RBAC] No user found from supabase.auth.getUser()');
    return null;
  }

  console.log('[RBAC] User found from Supabase:', user.id, user.email);
  const userId = user.id;

  // プロフィールを取得（Service Role clientを使用してRLS를 우회）
  console.log('[RBAC] Fetching profile from database...');
  const { createServiceClient } = await import('@/lib/supabase');
  const serviceClient = createServiceClient();

  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('role, status')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('[RBAC] Profile query error:', profileError.message, profileError.code);
    return null;
  }

  if (!profile) {
    console.log('[RBAC] Profile not found for user:', userId);
    return null;
  }

  console.log('[RBAC] Profile found:', profile.role, profile.status);

  // Normalize role from uppercase (database) to lowercase (code)
  const normalizedRole = normalizeRole(profile.role);
  const permissions = await getPermissionsForRole(normalizedRole);

  console.log('[RBAC] User authenticated successfully:', userId, 'Role:', normalizedRole, 'Status:', profile.status);

  return {
    userId,
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
