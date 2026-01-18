/**
 * Admin Pending Users API
 *
 * 管理者 - 保留中の会員リストAPI
 * - GET: PENDING状態の会員リスト取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface PendingUsersResponse {
  success: boolean;
  data?: Array<{
    id: string;
    email: string;
    user_type: string;
    business_type: string;
    company_name: string;
    corporate_number?: string;
    founded_year?: string;
    capital?: string;
    representative_name?: string;
    kanji_last_name: string;
    kanji_first_name: string;
    kana_last_name: string;
    kana_first_name: string;
    corporate_phone: string;
    prefecture: string;
    city: string;
    street: string;
    building?: string;
    business_document_path?: string;
    created_at: string;
  }>;
  error?: string;
}

// ============================================================
// GET Handler - List Pending Users
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client with Admin pattern
    const supabase = createRouteHandlerClient({ cookies });

    // DEV_MODE support
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' } as PendingUsersResponse,
        { status: 401 }
      );
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Admin access required' } as PendingUsersResponse,
        { status: 403 }
      );
    }

    // Get pending B2B users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'B2B')
      .eq('status', 'PENDING')
      .is('verification_token', null) // Only verified users
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Pending users query error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch pending users' } as PendingUsersResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: users || [],
    } as PendingUsersResponse);

  } catch (error) {
    console.error('Pending users error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as PendingUsersResponse,
      { status: 500 }
    );
  }
}
