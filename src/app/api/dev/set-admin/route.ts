/**
 * Development-only API endpoint
 * Sets a user to ADMIN/ACTIVE status for testing
 *
 * SECURITY: Requires authenticated ADMIN user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

export async function POST(request: NextRequest) {
  try {
    // ✅ STEP 1: Check authentication (SECURE: using getUser() instead of getSession())
    // Initialize Supabase client using modern @supabase/ssr pattern
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。ログインしてください。' },
        { status: 401 }
      );
    }

    // ✅ STEP 2: Verify requester is already ADMIN
    const { data: requesterProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !requesterProfile) {
      return NextResponse.json(
        { error: 'プロフィールが見つかりません。' },
        { status: 404 }
      );
    }

    if (requesterProfile.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '権限がありません。管理者のみアクセス可能です。' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // ✅ STEP 3: Use service role to bypass RLS (only after auth check)
    const adminSupabase = createAuthenticatedServiceClient({
      operation: 'dev_set_admin',
      userId: user.id,
      route: '/api/dev/set-admin',
    });

    // Update user to ADMIN/ACTIVE
    const { data, error } = await adminSupabase
      .from('profiles')
      .update({ role: 'ADMIN', status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('email', email)
      .select();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User updated to ADMIN',
      user: data,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
