/**
 * API Authentication Middleware
 *
 * APIルートハンドラー用の認証ミドルウェア
 * - セッション認証の検証
 * - ロールベースのアクセス制御
 * - ステータス検証 (ACTIVE, PENDING, etc.)
 * - サービスロールキーの安全な使用
 *
 * @example
 * ```typescript
 * import { withAuth } from '@/lib/api-middleware';
 *
 * export const POST = withAuth(async (req, session, profile) => {
 *   // 認証済みのAPIロジック
 *   return NextResponse.json({ success: true });
 * }, {
 *   requireRole: 'ADMIN',  // オプション: 役割制限
 *   requireStatus: 'ACTIVE' // オプション: ステータス制限
 * });
 * ```
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/database';

// ============================================================
// Types
// ============================================================

export interface AuthResult {
  session: Session;
  profile: UserProfile;
}

export interface Session {
  user: {
    id: string;
    email: string;
    email_verified: boolean;
  };
  access_token: string;
}

export interface UserProfile {
  id: string;
  role: 'ADMIN' | 'MEMBER' | 'STAFF';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';
  company_name?: string;
  email: string;
}

export interface WithAuthOptions {
  /**
   * 必要な役割 (例: 'ADMIN', 'MEMBER')
   * 指定しない場合は、すべての認証済みユーザーを許可
   */
  requireRole?: 'ADMIN' | 'MEMBER' | 'STAFF';

  /**
   * 必要なステータス (例: 'ACTIVE')
   * 指定しない場合は、すべてのステータスを許可
   */
  requireStatus?: 'ACTIVE' | 'PENDING' | 'SUSPENDED';

  /**
   * サービスロールキーを使用するかどうか
   * true の場合、認証後にサービスロールクライアントを返す
   */
  useServiceRole?: boolean;
}

export type ApiHandler<T = NextResponse> = (
  req: NextRequest,
  session: Session,
  profile: UserProfile,
  supabase: any
) => Promise<T>;

// ============================================================
// Authentication Error Responses
// ============================================================

function createErrorResponse(message: string, status: number): NextResponse {
  return new NextResponse(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// ============================================================
// Authentication Verification
// ============================================================

/**
 * Verify user authentication and profile
 *
 * @returns {AuthResult | null} Authentication result or null if failed
 */
async function verifyAuthentication(): Promise<{
  success: boolean;
  result?: AuthResult;
  error?: { message: string; status: number };
}> {
  try {
    // STEP 1: Create route handler client for auth check
    const supabaseAuth = createRouteHandlerClient<Database>({ cookies });

    // STEP 2: Get user (SECURE: using getUser() instead of getSession())
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError) {
      return {
        success: false,
        error: {
          message: `認証エラー: ${authError.message}`,
          status: 401,
        },
      };
    }

    if (!user) {
      return {
        success: false,
        error: {
          message: '認証されていません。ログインしてください。',
          status: 401,
        },
      };
    }

    // STEP 3: Get user profile
    const { data: profile, error: profileError } = await supabaseAuth
      .from('profiles')
      .select('id, role, status, company_name, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: {
          message: 'ユーザープロファイルが見つかりません。',
          status: 404,
        },
      };
    }

    return {
      success: true,
      result: {
        session: {
          user: {
            id: user.id,
            email: user.email || '',
            email_verified: user.email_confirmed_at !== null,
          },
          access_token: '', // Not available when using getUser() (secure method)
        },
        profile: profile as UserProfile,
      },
    };
  } catch (error) {
    console.error('Authentication verification error:', error);
    return {
      success: false,
      error: {
        message: '認証の検証中にエラーが発生しました。',
        status: 500,
      },
    };
  }
}

/**
 * Verify role and status requirements
 */
function verifyAuthorization(
  profile: UserProfile,
  options: WithAuthOptions
): { authorized: boolean; error?: { message: string; status: number } } {
  // Check role requirement
  if (options.requireRole && profile.role !== options.requireRole) {
    return {
      authorized: false,
      error: {
        message: `この操作には ${options.requireRole} 役割が必要です。`,
        status: 403,
      },
    };
  }

  // Check status requirement
  if (options.requireStatus && profile.status !== options.requireStatus) {
    return {
      authorized: false,
      error: {
        message: `この操作には ${options.requireStatus} ステータスが必要です。`,
        status: 403,
      },
    };
  }

  // Check for deleted/suspended users (always blocked)
  if (profile.status === 'DELETED') {
    return {
      authorized: false,
      error: {
        message: 'このアカウントは削除されました。',
        status: 403,
      },
    };
  }

  if (profile.status === 'SUSPENDED') {
    return {
      authorized: false,
      error: {
        message: 'このアカウントは停止されています。',
        status: 403,
      },
    };
  }

  return { authorized: true };
}

// ============================================================
// withAuth Wrapper Function
// ============================================================

/**
 * Authentication wrapper for API route handlers
 *
 * @param handler - The API handler function
 * @param options - Authentication options
 * @returns Wrapped handler with authentication
 */
export function withAuth<T = NextResponse>(
  handler: ApiHandler<T>,
  options: WithAuthOptions = {}
): (req: NextRequest) => Promise<T | NextResponse> {
  return async (req: NextRequest) => {
    // STEP 1: Verify authentication
    const authResult = await verifyAuthentication();

    if (!authResult.success) {
      return createErrorResponse(
        authResult.error!.message,
        authResult.error!.status
      );
    }

    const { session, profile } = authResult.result!;

    // STEP 2: Verify authorization (role/status)
    const authzResult = verifyAuthorization(profile, options);

    if (!authzResult.authorized) {
      return createErrorResponse(
        authzResult.error!.message,
        authzResult.error!.status
      );
    }

    // STEP 3: Create appropriate Supabase client
    let supabase: any;

    if (options.useServiceRole) {
      // Use service role client (after authentication!)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      if (!supabaseUrl || !supabaseServiceRoleKey) {
        return createErrorResponse(
          'サーバー設定エラー: Supabase設定が見つかりません。',
          500
        );
      }

      supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      // Use regular route handler client
      supabase = createRouteHandlerClient<Database>({ cookies });
    }

    // STEP 4: Execute handler with authenticated context
    try {
      return await handler(req, session, profile, supabase);
    } catch (error) {
      console.error('API handler error:', error);
      return createErrorResponse(
        'APIハンドラーの実行中にエラーが発生しました。',
        500
      );
    }
  };
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Create a service role client (use after authentication!)
 *
 * ⚠️ WARNING: Only use this AFTER verifying authentication!
 * This client bypasses RLS, so must be protected by auth checks.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Check if user has specific role
 */
export function hasRole(profile: UserProfile, role: UserProfile['role']): boolean {
  return profile.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(
  profile: UserProfile,
  roles: UserProfile['role'][]
): boolean {
  return roles.includes(profile.role);
}

/**
 * Check if user has specific status
 */
export function hasStatus(
  profile: UserProfile,
  status: UserProfile['status']
): boolean {
  return profile.status === status;
}

/**
 * Check if user can access admin resources
 * Note: Normalizes role to lowercase for consistency with database
 */
export function isAdmin(profile: UserProfile): boolean {
  return profile.role?.toLowerCase() === 'admin';
}

/**
 * Check if user is active member
 */
export function isActiveMember(profile: UserProfile): boolean {
  return profile.status === 'ACTIVE';
}

// ============================================================
// Convenience Middleware Functions
// ============================================================

/**
 * Require ADMIN role
 */
export function withAdmin<T = NextResponse>(
  handler: ApiHandler<T>,
  useServiceRole = true
): (req: NextRequest) => Promise<T | NextResponse> {
  return withAuth(handler, {
    requireRole: 'ADMIN',
    requireStatus: 'ACTIVE',
    useServiceRole,
  });
}

/**
 * Require MEMBER role
 */
export function withMember<T = NextResponse>(
  handler: ApiHandler<T>
): (req: NextRequest) => Promise<T | NextResponse> {
  return withAuth(handler, {
    requireRole: 'MEMBER',
    requireStatus: 'ACTIVE',
  });
}

/**
 * Require any authenticated user (active or pending)
 */
export function withAuthAny<T = NextResponse>(
  handler: ApiHandler<T>
): (req: NextRequest) => Promise<T | NextResponse> {
  return withAuth(handler, {});
}

/**
 * Require active user (any role)
 */
export function withActiveUser<T = NextResponse>(
  handler: ApiHandler<T>
): (req: NextRequest) => Promise<T | NextResponse> {
  return withAuth(handler, {
    requireStatus: 'ACTIVE',
  });
}
