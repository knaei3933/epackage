/**
 * Admin Authentication Helpers
 *
 * 管理者API用認証検証ヘルパー関数
 * Updated to use @supabase/ssr for proper cookie handling
 * Supports both Cookie and Authorization header authentication
 *
 * SECURITY: Proper JWT verification with DEV_MODE support
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
  isDevMode: boolean;
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
 * DEV_MODE: When ENABLE_DEV_MOCK_AUTH=true and x-dev-mode=true header is present,
 * accepts x-user-id header for testing purposes.
 *
 * @param request NextRequestオブジェクト
 * @returns 認証されたユーザー情報またはnull (null if authentication fails)
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthResult | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[verifyAdminAuth] Missing Supabase configuration');
    return null;
  }

  // DEV MODE: Check for development mock authentication
  const isDevModeEnabled = process.env.NODE_ENV === 'development' &&
                           process.env.ENABLE_DEV_MOCK_AUTH === 'true';
  const devModeHeader = request.headers.get('x-dev-mode');
  const devAdminUserId = process.env.DEV_ADMIN_USER_ID;

  // If dev mode is enabled and DEV_ADMIN_USER_ID is set, use it automatically
  if (isDevModeEnabled && devAdminUserId) {
    // Check for explicit dev mode header first
    const headerUserId = request.headers.get('x-user-id');
    const userIdToUse = headerUserId || devAdminUserId;

    console.log('[verifyAdminAuth] DEV MODE: Using mock authentication for user:', userIdToUse);

    // Verify the dev user exists in profiles table
    try {
      const serviceClient = createServiceClient();
      const { data: profile, error } = await serviceClient
        .from('profiles')
        .select('role, status')
        .eq('id', userIdToUse)
        .maybeSingle();

      if (error) {
        console.error('[verifyAdminAuth] DEV MODE: Database error:', error);
        return null;
      }

      if (!profile) {
        console.warn('[verifyAdminAuth] DEV MODE: User not found in database:', userIdToUse);
        return null;
      }

      const typedProfile = profile as Database['public']['Tables']['profiles']['Row'];

      if (typedProfile.role !== 'ADMIN' || typedProfile.status !== 'ACTIVE') {
        console.warn('[verifyAdminAuth] DEV MODE: User not admin or not active:', {
          userId: userIdToUse,
          role: typedProfile.role,
          status: typedProfile.status,
        });
        return null;
      }

      return {
        userId: userIdToUse,
        role: typedProfile.role,
        status: typedProfile.status,
        isDevMode: true,
      };
    } catch (error) {
      console.error('[verifyAdminAuth] DEV MODE: Error verifying user:', error);
      return null;
    }
  }

  // Legacy dev mode support with explicit headers (for backward compatibility)
  if (isDevModeEnabled && devModeHeader === 'true') {
    const devUserId = request.headers.get('x-user-id');
    if (devUserId) {
      console.log('[verifyAdminAuth] DEV MODE: Using mock authentication for user:', devUserId);

      // Verify the dev user exists in profiles table
      try {
        const serviceClient = createServiceClient();
        const { data: profile, error } = await serviceClient
          .from('profiles')
          .select('role, status')
          .eq('id', devUserId)
          .maybeSingle();

        if (error) {
          console.error('[verifyAdminAuth] DEV MODE: Database error:', error);
          return null;
        }

        if (!profile) {
          console.warn('[verifyAdminAuth] DEV MODE: User not found in database:', devUserId);
          return null;
        }

        const typedProfile = profile as Database['public']['Tables']['profiles']['Row'];

        if (typedProfile.role !== 'ADMIN' || typedProfile.status !== 'ACTIVE') {
          console.warn('[verifyAdminAuth] DEV MODE: User not admin or not active:', {
            userId: devUserId,
            role: typedProfile.role,
            status: typedProfile.status,
          });
          return null;
        }

        return {
          userId: devUserId,
          role: typedProfile.role,
          status: typedProfile.status,
          isDevMode: true,
        };
      } catch (error) {
        console.error('[verifyAdminAuth] DEV MODE: Error verifying user:', error);
        return null;
      }
    }
  }

  // Try Authorization header first (for client-side API calls)
  const authHeader = request.headers.get('authorization');
  let userId: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Verify JWT from Authorization header
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

  // Fall back to cookie-based auth
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

    // Get user from session using JWT verification
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
      isDevMode: false,
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
 * @param request NextRequestオブジェクト
 * @returns 認証されたユーザー情報またはnull
 */
export async function verifyMemberAuth(request: NextRequest): Promise<AdminAuthResult | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[verifyMemberAuth] Missing Supabase configuration');
    return null;
  }

  // DEV MODE: Check for development mock authentication
  const isDevModeEnabled = process.env.NODE_ENV === 'development' &&
                           process.env.ENABLE_DEV_MOCK_AUTH === 'true';
  const devModeHeader = request.headers.get('x-dev-mode');

  if (isDevModeEnabled && devModeHeader === 'true') {
    const devUserId = request.headers.get('x-user-id');
    if (devUserId) {
      console.log('[verifyMemberAuth] DEV MODE: Using mock authentication for user:', devUserId);

      try {
        const serviceClient = createServiceClient();
        const { data: profile, error } = await serviceClient
          .from('profiles')
          .select('role, status')
          .eq('id', devUserId)
          .maybeSingle();

        if (error) {
          console.error('[verifyMemberAuth] DEV MODE: Database error:', error);
          return null;
        }

        if (!profile) {
          console.warn('[verifyMemberAuth] DEV MODE: User not found in database:', devUserId);
          return null;
        }

        const typedProfile = profile as Database['public']['Tables']['profiles']['Row'];

        // MEMBER, ADMIN, KOREAN_MEMBER, PRODUCTION すべて許可
        const allowedRoles = ['MEMBER', 'ADMIN', 'KOREAN_MEMBER', 'PRODUCTION', 'OPERATOR', 'SALES', 'ACCOUNTING'];
        if (!allowedRoles.includes(typedProfile.role) || typedProfile.status !== 'ACTIVE') {
          console.warn('[verifyMemberAuth] DEV MODE: User not allowed or not active:', {
            userId: devUserId,
            role: typedProfile.role,
            status: typedProfile.status,
          });
          return null;
        }

        return {
          userId: devUserId,
          role: typedProfile.role,
          status: typedProfile.status,
          isDevMode: true,
        };
      } catch (error) {
        console.error('[verifyMemberAuth] DEV MODE: Error verifying user:', error);
        return null;
      }
    }
  }

  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  let userId: string | null = null;

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

  // Fall back to cookie-based auth
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
      isDevMode: false,
    };
  } catch (error) {
    console.error('[verifyMemberAuth] Error checking member role:', error);
    return null;
  }
}
