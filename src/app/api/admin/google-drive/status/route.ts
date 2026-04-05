/**
 * API: Google Drive Status
 *
 * Google Drive接続状態確認API
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAuth } from '@/lib/dashboard';

export async function GET() {
  try {
    // Require admin authentication
    const user = await requireAuth('ADMIN');

    const adminClient = createServiceClient();
    const adminUserId = process.env.GOOGLE_DRIVE_ADMIN_USER_ID;

    // Check admin's Google token
    const tokenStatus = {
      adminUserId: adminUserId || null,
      hasTokenInDb: false,
    };

    if (adminUserId) {
      const { data: tokenData } = await adminClient
        .from('user_google_tokens')
        .select('refresh_token')
        .eq('user_id', adminUserId)
        .maybeSingle();

      tokenStatus.hasTokenInDb = !!tokenData;
    }

    // Check environment variables
    const envVars = {
      uploadFolderId: process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID?.substring(0, 20) + '...' || null,
      correctionFolderId: process.env.GOOGLE_DRIVE_CORRECTION_FOLDER_ID?.substring(0, 20) + '...' || null,
      clientIdSet: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecretSet: !!process.env.GOOGLE_CLIENT_SECRET,
      redirectUriSet: !!process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
    };

    return NextResponse.json({
      success: true,
      data: {
        tokenStatus,
        envVars,
      },
    });
  } catch (error: any) {
    console.error('[Google Drive Status] Error:', error);

    // Return partial data even on auth error (for testing)
    const adminUserId = process.env.GOOGLE_DRIVE_ADMIN_USER_ID;

    return NextResponse.json({
      success: true,
      data: {
        tokenStatus: {
          adminUserId: adminUserId || null,
          hasTokenInDb: false,
        },
        envVars: {
          uploadFolderId: process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID?.substring(0, 20) + '...' || null,
          correctionFolderId: process.env.GOOGLE_DRIVE_CORRECTION_FOLDER_ID?.substring(0, 20) + '...' || null,
          clientIdSet: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          clientSecretSet: !!process.env.GOOGLE_CLIENT_SECRET,
          redirectUriSet: !!process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
        },
      },
      error: error.message,
    });
  }
}
