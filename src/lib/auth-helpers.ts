/**
 * Admin Authentication Helpers
 *
 * 管理者API用認証検証ヘルパー関数
 * Updated to use @supabase/ssr for proper cookie handling
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
  role: 'ADMIN' | 'MEMBER';
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  isDevMode: boolean;
}

/**
 * Adminユーザー認証及び権限確認
 *
 * SECURITY: This function performs proper JWT verification and admin role checking.
 * Only returns admin user data if authenticated with valid JWT and has ADMIN role.
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

  // Create SSR client with cookie support for production JWT verification
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

  // Check ADMIN role in profiles using service client (bypasses RLS for admin checks)
  try {
    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.log('[verifyAdminAuth] Profile not found or error:', profileError?.message);
      return null;
    }

    const typedProfile = profile as Database['public']['Tables']['profiles']['Row'];

    if (typedProfile.role !== 'ADMIN' || typedProfile.status !== 'ACTIVE') {
      console.log('[verifyAdminAuth] User not admin or not active:', {
        userId: user.id,
        role: typedProfile.role,
        status: typedProfile.status,
      });
      return null;
    }

    return {
      userId: user.id,
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
