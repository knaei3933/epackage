/**
 * Admin Authentication Helpers
 *
 * 管理者API用認証検証ヘルパー関数
 * Updated to use @supabase/ssr for proper cookie handling
 * Supports both Cookie and Authorization header authentication
 *
 * SECURITY: Proper JWT verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase';
import { Database } from '@/types/database';

/**
 * Result interface for admin authentication
 */
export interface AdminAuthResult {
  userId: string;
  role: 'ADMIN' | 'MEMBER' | 'KOREAN_MEMBER' | 'PRODUCTION' | 'OPERATOR' | 'SALES' | 'ACCOUNTING';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
}

/**
 * Adminユーザー認証及び権限確認
 *
 * SECURITY: This function performs proper JWT verification and admin role checking.
 * Only returns admin user data if authenticated with valid JWT and has ADMIN role.
 *
 * Supports two authentication methods:
 * 1. Authorization: Bearer <token> header (for client-side API calls)
 * 2. Cookie-based session (for server-side rendering)
 *
 * @param request NextRequestオブジェクト
 * @returns 認証されたユーザー情報またはnull (null if authentication fails)
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResult | null> {
  // DEV_MODE: Check for mock user via headers (set by middleware) or cookie
  const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

  if (isDevMode) {
    // Try headers first (set by middleware for SSR pages)
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');
    const userStatus = request.headers.get('x-user-status');

    if (userRole && userId) {
      console.log('[verifyAdminAuth] DEV_MODE: Using header-based auth:', { userId, userRole });

      // Check if user has admin role
      const adminRoles = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];
      if (adminRoles.includes(userRole)) {
        return {
          userId,
          role: userRole as AdminAuthResult['role'],
          status: (userStatus || 'ACTIVE') as AdminAuthResult['status'],
        };
      }
    }

    // Fall back to cookie-based DEV_MODE
    const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;
    if (devMockUserId) {
      console.log('[verifyAdminAuth] DEV_MODE: Using mock user cookie:', devMockUserId);
      return {
        userId: devMockUserId,
        role: 'ADMIN',
        status: 'ACTIVE',
      };
    }

    console.log('[verifyAdminAuth] DEV_MODE enabled but no mock user found');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[verifyAdminAuth] Missing Supabase configuration');
    return null;
  }

  // Try Authorization header first (for client-side API calls)
  let userId: string | null = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (!authError && user) {
        userId = user.id;
        console.log('[verifyAdminAuth] Authenticated via Authorization header:', userId);
      }
    } catch (error) {
      console.error('[verifyAdminAuth] Error verifying JWT:', error);
    }
  }

  // Fall back to Supabase httpOnly cookies
  if (!userId) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {
          // Not needed for verification
        },
        remove() {
          // Not needed for verification
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[verifyAdminAuth] No valid user session:', authError?.message);
      return null;
    }

    userId = user.id;
  }

  // Check ADMIN role in profiles using service client (bypasses RLS for admin checks)
  try {
    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.log('[verifyAdminAuth] Profile not found or error:', profileError?.message);
      return null;
    }

    const typedProfile = profile as Database['public']['Tables']['profiles']['Row'];

    if (typedProfile.role !== 'ADMIN' || typedProfile.status !== 'ACTIVE') {
      console.log('[verifyAdminAuth] User not admin or not active:', {
        userId,
        role: typedProfile.role,
        status: typedProfile.status,
      });
      return null;
    }

    return {
      userId,
      role: typedProfile.role,
      status: typedProfile.status,
    };
  } catch (error) {
    console.error('[verifyAdminAuth] Error checking admin role:', error);
    return null;
  }
}

/**
 * 認証失敗応答生成
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: '認証されていません。' },
    { status: 401 }
  );
}

/**
 * 権限なし応答生成
 */
export function forbiddenResponse() {
  return NextResponse.json(
    { error: '管理者権限が必要です。' },
    { status: 403 }
  );
}

/**
 * Memberユーザー認証及び権限確認
 *
 * 会員向けAPI用認証検証ヘルパー関数
 * MEMBERロール（および管理者）のユーザーを許可
 *
 * SECURITY: Uses Supabase httpOnly cookies only
 * 1. Authorization header (Bearer token)
 * 2. Cookie-based session (Supabase httpOnly cookies)
 *
 * @param request NextRequestオブジェクト
 * @returns 認証されたユーザー情報またはnull
 */
export async function verifyMemberAuth(request: NextRequest): Promise<AdminAuthResult | null> {
  // DEV_MODE: Check for mock user via headers (set by middleware) or cookie
  const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' && process.env.NODE_ENV === 'development';

  if (isDevMode) {
    // Try headers first (set by middleware for SSR pages)
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');
    const userStatus = request.headers.get('x-user-status');

    if (userRole && userId) {
      console.log('[verifyMemberAuth] DEV_MODE: Using header-based auth:', { userId, userRole });

      // All roles can access member APIs in DEV_MODE
      return {
        userId,
        role: userRole as AdminAuthResult['role'],
        status: (userStatus || 'ACTIVE') as AdminAuthResult['status'],
      };
    }

    // Fall back to cookie-based DEV_MODE
    const devMockUserId = request.cookies.get('dev-mock-user-id')?.value;
    if (devMockUserId) {
      console.log('[verifyMemberAuth] DEV_MODE: Using mock user cookie:', devMockUserId);
      return {
        userId: devMockUserId,
        role: 'ADMIN', // Admin has access to member APIs
        status: 'ACTIVE',
      };
    }

    console.log('[verifyMemberAuth] DEV_MODE enabled but no mock user found');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[verifyMemberAuth] Missing Supabase configuration');
    return null;
  }

  let userId: string | null = null;

  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (!authError && user) {
        userId = user.id;
        console.log('[verifyMemberAuth] Authenticated via Authorization header:', userId);
      }
    } catch (error) {
      console.error('[verifyMemberAuth] Error verifying JWT:', error);
    }
  }

  // Fall back to Supabase httpOnly cookies
  if (!userId) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[verifyMemberAuth] No valid user session:', authError?.message);
      return null;
    }

    userId = user.id;
  }

  // Check role in profiles using service client
  try {
    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.log('[verifyMemberAuth] Profile not found or error:', profileError?.message);
      return null;
    }

    const typedProfile = profile as Database['public']['Tables']['profiles']['Row'];

    // MEMBER, ADMIN, KOREAN_MEMBER, PRODUCTION すべて許可（会員向けAPI）
    const allowedRoles = ['MEMBER', 'ADMIN', 'KOREAN_MEMBER', 'PRODUCTION', 'OPERATOR', 'SALES', 'ACCOUNTING'];
    if (!allowedRoles.includes(typedProfile.role) || typedProfile.status !== 'ACTIVE') {
      console.log('[verifyMemberAuth] User not allowed or not active:', {
        userId,
        role: typedProfile.role,
        status: typedProfile.status,
      });
      return null;
    }

    return {
      userId,
      role: typedProfile.role,
      status: typedProfile.status,
    };
  } catch (error) {
    console.error('[verifyMemberAuth] Error checking member role:', error);
    return null;
  }
}
