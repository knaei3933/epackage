/**
 * API Route: Upload file to Google Drive
 *
 * 구글 드라이브 파일 업로드 API
 * - 토큰 기반 업로드에서 사용
 * - FormData로 파일 수신
 * - Google Drive에 업로드 후 URL 반환
 *
 * /api/upload-to-drive
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToDrive, getAdminAccessTokenForUpload, getCorrectionFolderId } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

// ============================================================
// POST: Upload file to Google Drive
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const fileType = formData.get('fileType') as 'preview' | 'original';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File is required' },
        { status: 400 }
      );
    }

    // Get admin access token for Google Drive
    const accessToken = await getAdminAccessTokenForUpload();

    // Get folder ID
    const folderId = getCorrectionFolderId();
    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'Google Drive folder ID not configured' },
        { status: 500 }
      );
    }

    // Generate file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${orderId}_${fileType}_${timestamp}.${fileExtension}`;

    // Upload to Google Drive
    const uploadedFile = await uploadFileToDrive(
      file,
      fileName,
      file.type || 'image/jpeg',
      folderId,
      accessToken
    );

    return NextResponse.json({
      success: true,
      fileUrl: uploadedFile.webViewLink || uploadedFile.webContentLink || '',
      fileId: uploadedFile.id,
      fileName: uploadedFile.name,
    });
  } catch (error: any) {
    console.error('[UploadToDrive] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload file to Google Drive'
      },
      { status: 500 }
    );
  }
}
