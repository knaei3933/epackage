/**
 * Debug API: Check Google Drive token status and recent uploads
 *
 * デバッグ用: Googleトークン状態と最近のアップロードを確認
 */

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  const adminClient = createServiceClient();

  // 1. Check admin's Google token
  const adminUserId = process.env.GOOGLE_DRIVE_ADMIN_USER_ID;

  const tokenStatus = {
    adminUserId,
    hasTokenInDb: false,
    refreshToken: null as string | null,
  };

  if (adminUserId) {
    const { data: tokenData } = await adminClient
      .from('user_google_tokens')
      .select('refresh_token')
      .eq('user_id', adminUserId)
      .maybeSingle();

    tokenStatus.hasTokenInDb = !!tokenData;
    tokenStatus.refreshToken = tokenData?.refresh_token ? '***SET***' : null;
  }

  // 2. Check recent correction uploads
  const { data: corrections, error: correctionsError } = await adminClient
    .from('korea_corrections')
    .select('id, order_id, corrected_files, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);

  // 3. Check recent files
  const { data: files, error: filesError } = await adminClient
    .from('files')
    .select('id, order_id, original_filename, file_url, file_path, uploaded_at')
    .order('uploaded_at', { ascending: false })
    .limit(5);

  // 4. Check environment variables
  const envVars = {
    uploadFolderId: process.env.GOOGLE_DRIVE_UPLOAD_FOLDER_ID?.substring(0, 20) + '...',
    correctionFolderId: process.env.GOOGLE_DRIVE_CORRECTION_FOLDER_ID?.substring(0, 20) + '...',
    clientIdSet: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    clientSecretSet: !!process.env.GOOGLE_CLIENT_SECRET,
    redirectUriSet: !!process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
  };

  return NextResponse.json({
    tokenStatus,
    corrections: corrections || [],
    files: files || [],
    envVars,
    errors: {
      corrections: correctionsError?.message,
      files: filesError?.message,
    },
  });
}
