/**
 * Admin File Download API
 *
 * ファイルダウンロードAPI
 * - Signed URLを生成して安全にダウンロード
 * - AIファイルのダウンロード問題を解決
 *
 * @route /api/admin/orders/[id]/files/[fileId]/download
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// =====================================================
// GET Handler - Generate Download URL
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

    // Determine the file path
    // file_path or file_url should contain the storage path
    const filePath = file.file_path || extractPathFromUrl(file.file_url);

    if (!filePath) {
      console.error('[File Download] No valid file path found');
      return NextResponse.json(
        { success: false, error: 'ファイルパスが見つかりません。' },
        { status: 400 }
      );
    }

    // Determine storage bucket (all data receipt files are in 'production-files' bucket)
    // The file_path does NOT include the bucket name, just the path within the bucket
    let bucket = 'production-files';
    let storagePath = filePath;

    // Only extract bucket if path explicitly starts with a known bucket prefix
    if (filePath.startsWith('production-files/')) {
      storagePath = filePath.replace('production-files/', '');
    }
    // Otherwise, use the file_path as-is within production-files bucket
    // (file_path format: order_data_receipt/${userId}/${orderId}/${timestamp}_${filename})

    console.log('[File Download] Bucket:', bucket, 'Path:', storagePath);

    // Create signed URL (valid for 5 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, 300);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('[File Download] Signed URL error:', signedUrlError);

      // Fallback: try public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      if (publicUrlData?.publicUrl) {
        // Redirect to public URL
        return NextResponse.redirect(publicUrlData.publicUrl);
      }

      return NextResponse.json(
        { success: false, error: 'ダウンロードURLの生成に失敗しました。' },
        { status: 500 }
      );
    }

    console.log('[File Download] Fetching file from signed URL...');

    // Fetch the file from signed URL and return it
    const fileResponse = await fetch(signedUrlData.signedUrl);
    if (!fileResponse.ok) {
      console.error('[File Download] Failed to fetch file:', fileResponse.status);
      return NextResponse.json(
        { success: false, error: 'ファイルの取得に失敗しました。' },
        { status: 500 }
      );
    }

    // Get file content
    const fileBuffer = await fileResponse.arrayBuffer();
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';

    console.log('[File Download] Returning file:', fileBuffer.byteLength, 'bytes');

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${file.original_filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

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
 * Extract storage path from URL
 */
function extractPathFromUrl(url: string | null): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    // Supabase storage URLs usually have format: https://.../storage/v1/object/public/bucket/path/to/file
    // or: https://.../storage/v1/object/sign/bucket/path/to/file/token

    const pathMatch = urlObj.pathname.match(/\/(?:public|sign)\/([^\/]+)\/(.+)$/);
    if (pathMatch) {
      const bucket = pathMatch[1];
      const path = pathMatch[2];
      return `${bucket}/${path}`;
    }
  } catch {
    return null;
  }

  return null;
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
