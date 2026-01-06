/**
 * Admin Authentication Helpers
 *
 * 관리자 API용 인증 검증 헬퍼 함수들
 * Updated to use @supabase/ssr for proper cookie handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database';

/**
 * Admin 사용자 인증 및 권한 확인
 *
 * @param request NextRequest 객체
 * @returns 인증된 사용자 정보 또는 null
 */
export async function verifyAdminAuth(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[verifyAdminAuth] Missing Supabase configuration');
    return null;
  }

  // TEMPORARY TEST: Always return admin user
  console.log('[verifyAdminAuth] TEMPORARY TEST: Returning mock admin');
  return {
    userId: 'test-admin-user',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    isDevMode: true,
  };

  // Create SSR client with cookie support
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

  // DEV MODE: Bypass for testing
  const isDevMode = process.env.NODE_ENV === 'development' &&
                    process.env.ENABLE_DEV_MOCK_AUTH === 'true';

  if (isDevMode) {
    console.log('[verifyAdminAuth] DEV MODE: Using mock admin user');
    const mockUserId = request.cookies.get('dev-mock-user-id')?.value;
    return {
      userId: mockUserId || 'dev-admin-user-123',
      role: 'ADMIN' as const,
      status: 'ACTIVE' as const,
      isDevMode: true,
    };
  }

  // Get user from session
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log('[verifyAdminAuth] No valid user session:', authError?.message);
    return null;
  }

  // Check ADMIN role in profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.log('[verifyAdminAuth] Profile not found or error:', profileError?.message);
    return null;
  }

  const typedProfile = profile as Database['public']['Tables']['profiles']['Row'];

  if (typedProfile.role !== 'ADMIN' || typedProfile.status !== 'ACTIVE') {
    console.log('[verifyAdminAuth] User not admin or not active:', {
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
}

/**
 * 인증 실패 응답 생성
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { error: '認証されていません。' },
    { status: 401 }
  );
}

/**
 * 권한 없음 응답 생성
 */
export function forbiddenResponse() {
  return NextResponse.json(
    { error: '管理者権限が必要です。' },
    { status: 403 }
  );
}
