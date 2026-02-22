/**
 * Debug API: Check Google Token Status
 *
 * デバッグ用 - 認証なしでトークン状態を確認
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const adminClient = createServiceClient();
    const adminUserId = process.env.GOOGLE_DRIVE_ADMIN_USER_ID;

    // Check admin's Google token
    let tokenStatus = {
      adminUserId: adminUserId || null,
      hasTokenInDb: false,
      refreshToken: null,
    };

    if (adminUserId) {
      const { data: tokenData, error } = await adminClient
        .from('user_google_tokens')
        .select('refresh_token')
        .eq('user_id', adminUserId)
        .maybeSingle();

      if (error) {
        console.error('[Debug Token Status] Error:', error);
      } else if (tokenData) {
        tokenStatus.hasTokenInDb = true;
        tokenStatus.refreshToken = tokenData.refresh_token?.substring(0, 30) + '...';
      }
    }

    return NextResponse.json({
      success: true,
      data: tokenStatus,
    });
  } catch (error: any) {
    console.error('[Debug Token Status] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
