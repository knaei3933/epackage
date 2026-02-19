/**
 * Member Order File Upload to Google Drive API
 *
 * 会員注文ファイルアップロードAPI
 * - Google Driveにファイルをアップロード
 * - 入稿データと校正データに対応
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/dashboard';
import {
  getValidAccessToken,
  uploadFileToDrive,
  getUploadFolderId,
  getCorrectionFolderId
} from '@/lib/google-drive';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '認証されていません。' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string; // 'upload' or 'correction'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが選択されていません。' },
        { status: 400 }
      );
    }

    if (!fileType || !['upload', 'correction'].includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'ファイルタイプが正しくありません。' },
        { status: 400 }
      );
    }

    // Verify order ownership
    const { createServiceClient } = await import('@/lib/supabase');
    const serviceClient = createServiceClient();

    const { data: order } = await serviceClient
      .from('orders')
      .select('id, user_id, order_number')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    if (order.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Get Google Drive access token
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken(userId);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return NextResponse.json(
        { success: false, error: 'Google Drive連携が設定されていません。管理者にお問い合わせください。' },
        { status: 500 }
      );
    }

    // Determine folder based on file type
    const folderId = fileType === 'correction'
      ? getCorrectionFolderId()
      : getUploadFolderId();

    if (!folderId) {
      return NextResponse.json(
        { success: false, error: 'Google Driveフォルダが設定されていません。' },
        { status: 500 }
      );
    }

    // Create folder name with order number and date
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const folderName = `${order.order_number}_${date}`;
    const folderMimeType = 'application/vnd.google-apps.folder';

    // Create order-specific folder (optional, for organization)
    // For now, upload directly to the main folder

    // Upload file
    const uploadedFile = await uploadFileToDrive(
      file,
      file.name,
      file.type || 'application/octet-stream',
      folderId,
      accessToken
    );

    // Log upload to database
    const { error: logError } = await serviceClient
      .from('order_file_uploads')
      .insert({
        order_id: orderId,
        file_name: file.name,
        file_type: fileType,
        drive_file_id: uploadedFile.id,
        drive_view_link: uploadedFile.webViewLink,
        drive_content_link: uploadedFile.webContentLink,
        uploaded_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Failed to log file upload:', logError);
      // Don't fail the upload if logging fails
    }

    return NextResponse.json({
      success: true,
      data: {
        fileId: uploadedFile.id,
        fileName: uploadedFile.name,
        viewLink: uploadedFile.webViewLink,
        downloadLink: uploadedFile.webContentLink
      },
      message: 'ファイルが正常にアップロードされました。'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ファイルアップロードに失敗しました。'
      },
      { status: 500 }
    );
  }
}

// GET: Check if Google Drive is configured
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '認証されていません。' },
        { status: 401 }
      );
    }

    // Check if Google Drive is configured
    const { getRefreshToken } = await import('@/lib/google-drive');
    const refreshToken = await getRefreshToken(userId);

    const isConfigured = !!refreshToken;
    const uploadFolderId = getUploadFolderId();
    const correctionFolderId = getCorrectionFolderId();

    return NextResponse.json({
      success: true,
      data: {
        isConfigured,
        hasUploadFolder: !!uploadFolderId,
        hasCorrectionFolder: !!correctionFolderId
      }
    });

  } catch (error) {
    console.error('Failed to check Google Drive config:', error);
    return NextResponse.json(
      { success: false, error: '設定確認に失敗しました。' },
      { status: 500 }
    );
  }
}
