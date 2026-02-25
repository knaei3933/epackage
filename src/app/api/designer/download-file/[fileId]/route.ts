/**
 * Designer File Download API
 *
 * デザイナー向けファイルダウンロードAPI
 * - トークン認証
 * - Google Driveファイルのプロキシダウンロード
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { google } from 'googleapis';
import { getAdminAccessTokenForUpload } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

interface DriveFileInfo {
  id: string;
  drive_file_id: string;
  drive_file_name: string;
  file_name: string;
  order_id: string;
}

// ============================================================
// GET: Download file from Google Drive
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;

    // Get token from query parameter
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'トークンが必要です。' },
        { status: 401 }
      );
    }

    // Hash token for comparison
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Verify token and get file info
    const supabase = createServiceClient();

    // Get file upload record with token verification
    const { data: fileData, error: fileError } = await supabase
      .from('order_file_uploads')
      .select(`
        id,
        drive_file_id,
        drive_file_name,
        file_name,
        order_id,
        orders (
          id,
          designer_task_assignments (
            id,
            access_token_hash,
            access_token_expires_at
          )
        )
      `)
      .eq('id', fileId)
      .maybeSingle();

    if (fileError || !fileData) {
      return NextResponse.json(
        { success: false, error: 'ファイルが見つかりません。' },
        { status: 404 }
      );
    }

    // Verify token matches assignment
    const assignment = (fileData as any).orders?.designer_task_assignments;
    if (!assignment || assignment.access_token_hash !== tokenHash) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Check token expiration
    if (assignment.access_token_expires_at) {
      const expired = new Date(assignment.access_token_expires_at) < new Date();
      if (expired) {
        return NextResponse.json(
          { success: false, error: 'トークンが有効期限切れです。' },
          { status: 401 }
        );
      }
    }

    // Get Google Drive access token
    let accessToken: string;
    try {
      accessToken = await getAdminAccessTokenForUpload();
    } catch (error) {
      console.error('Failed to get access token:', error);
      return NextResponse.json(
        { success: false, error: 'Google Drive連携エラー。' },
        { status: 500 }
      );
    }

    // Download file from Google Drive
    const drive = google.drive({ version: 'v3', auth: accessToken });
    const response = await drive.files.get(
      {
        fileId: fileData.drive_file_id,
        alt: 'media',
      },
      { responseType: 'arraybuffer' }
    );

    // Get file extension for content type
    const fileName = fileData.drive_file_name || fileData.file_name;
    const ext = fileName.split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'ai': 'application/postscript',
      'eps': 'application/postscript',
      'psd': 'image/vnd.adobe.photoshop',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'svg': 'image/svg+xml',
    };

    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    // Return file as response
    return new NextResponse(Buffer.from(response.data as ArrayBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Cache-Control': 'private, max-age=86400',
      },
    });

  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ファイルダウンロードに失敗しました。'
      },
      { status: 500 }
    );
  }
}
