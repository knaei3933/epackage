/**
 * Debug Auth API
 *
 * 現在の認証状態をデバッグします
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    message: 'Debug auth info',
  });

  // Create Supabase client with cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // Check user (SECURE: using getUser() instead of getSession())
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Check cookies
  const accessToken = request.cookies.get('sb-access-token')?.value;
  const refreshToken = request.cookies.get('sb-refresh-token')?.value;

  return NextResponse.json({
    cookies: {
      'sb-access-token': accessToken ? 'exists' : 'missing',
      'sb-refresh-token': refreshToken ? 'exists' : 'missing',
      allCookies: Array.from(request.cookies.getAll()).map(c => ({
        name: c.name,
        value: c.value ? 'set' : 'empty',
      })),
    },
    user: user ? {
      exists: true,
      userId: user.id,
      email: user.email,
    } : {
      exists: false,
      error: userError?.message,
    },
  });
}
