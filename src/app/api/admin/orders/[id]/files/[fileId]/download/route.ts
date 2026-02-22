/**
 * Admin File Download API
 *
 * ファイルダウンロードAPI
 * - Google DriveファイルとSupabase Storageファイルの両方に対応
 * - AIファイルのダウンロード問題を解決
 *
 * @route /api/admin/orders/[id]/files/[fileId]/download
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminAccessTokenForUpload } from '@/lib/google-drive';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// =====================================================
// GET Handler - Download File (Google Drive or Supabase Storage)
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('[File Download] Starting download...');

    const { fileId } = await params;

    // Get file information from database
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('id, original_filename, file_path, file_url')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      console.error('[File Download] File not found:', fileId);
      return NextResponse.json(
        { success: false, error: 'ファイルが見つかりません。' },
        { status: 404 }
      );
    }

    console.log('[File Download] File info:', { id: file.id, path: file.file_path, url: file.file_url });

    // Check if file is from Google Drive (file_url contains drive.google.com)
    const isGoogleDriveFile = file.file_url?.includes('drive.google.com');

    if (isGoogleDriveFile) {
      console.log('[File Download] Downloading from Google Drive...');

      // Download from Google Drive
      return await downloadFromGoogleDrive(file.file_path, file.original_filename);
    } else {
      console.log('[File Download] Downloading from Supabase Storage...');

      // Download from Supabase Storage
      return await downloadFromSupabaseStorage(file);
    }

  } catch (error) {
    console.error('[File Download] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Extract storage path from Supabase Storage URL
 */
function extractPathFromUrl(url: string): string | null {
  if (!url) return null;

  // Handle Supabase Storage public URL format
  // https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
  const publicUrlPattern = /\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/;
  const match = url.match(publicUrlPattern);
  if (match) {
    return match[1];
  }

  return null;
}

/**
 * Download file from Google Drive
 */
async function downloadFromGoogleDrive(driveFileId: string, fileName: string): Promise<NextResponse> {
  try {
    const accessToken = await getAdminAccessTokenForUpload();

    // Use webContentLink for downloading (direct download link)
    // First, get the file metadata to find the download URL
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${driveFileId}?fields=webContentLink`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      console.error('[File Download] Failed to get Google Drive metadata:', await metadataResponse.text());
      throw new Error('Google Drive metadata fetch failed');
    }

    const metadata = await metadataResponse.json();
    const downloadUrl = metadata.webContentLink;

    if (!downloadUrl) {
      console.error('[File Download] No download URL in Google Drive response');
      throw new Error('No download URL available');
    }

    console.log('[File Download] Fetching from Google Drive URL:', downloadUrl);

    // Fetch the file content
    const fileResponse = await fetch(downloadUrl);
    if (!fileResponse.ok) {
      console.error('[File Download] Google Drive fetch failed:', fileResponse.status);
      throw new Error('Failed to download from Google Drive');
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';

    console.log('[File Download] Returning file from Google Drive:', fileBuffer.byteLength, 'bytes');

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('[File Download] Google Drive download error:', error);
    throw error;
  }
}

/**
 * Download file from Supabase Storage
 */
async function downloadFromSupabaseStorage(file: any): Promise<NextResponse> {
  const filePath = file.file_path || extractPathFromUrl(file.file_url);

  if (!filePath) {
    console.error('[File Download] No valid file path found');
    return NextResponse.json(
      { success: false, error: 'ファイルパスが見つかりません。' },
      { status: 400 }
    );
  }

  // Determine storage bucket
  let bucket = 'production-files';
  let storagePath = filePath;

  if (filePath.startsWith('production-files/')) {
    storagePath = filePath.replace('production-files/', '');
  }

  console.log('[File Download] Bucket:', bucket, 'Path:', storagePath);

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Download directly from Supabase Storage using the SDK
  const { data: fileData, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(storagePath);

  if (downloadError || !fileData) {
    console.error('[File Download] Download error:', downloadError);
    return NextResponse.json(
      { success: false, error: 'ファイルの取得に失敗しました。' },
      { status: 500 }
    );
  }

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await fileData.arrayBuffer();
  const contentType = fileData.type || 'application/octet-stream';

  console.log('[File Download] Returning file from Supabase Storage:', arrayBuffer.byteLength, 'bytes');

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${file.original_filename}"`,
      'Cache-Control': 'no-cache',
    },
  });
}
