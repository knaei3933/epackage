/**
 * Preview Image Proxy API
 *
 * Google Driveのプレビュー画像を表示するためのプロキシ
 * - 認証付きでGoogle Driveから画像を取得
 * - クライアントに画像を返す
 *
 * @route /api/admin/orders/[id]/correction/[revisionId]/preview
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminAccessTokenForUpload } from '@/lib/google-drive';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    const { revisionId } = await params;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get revision record
    const { data: revision, error: revisionError } = await supabase
      .from('design_revisions')
      .select('preview_image_url')
      .eq('id', revisionId)
      .single();

    if (revisionError || !revision) {
      return NextResponse.json(
        { error: 'Revision not found' },
        { status: 404 }
      );
    }

    let imageUrl = revision.preview_image_url;

    // Check if imageUrl is already our proxy URL (causes redirect loop)
    if (imageUrl.includes('/api/admin/orders/') && imageUrl.includes('/preview')) {
      return NextResponse.json(
        { error: 'Invalid preview URL - redirect loop detected' },
        { status: 500 }
      );
    }

    // Check if it's a Google Drive URL
    const googleDriveFileIdMatch = imageUrl.match(/\/d\/([^/]+)/);
    if (!googleDriveFileIdMatch) {
      // Not a Google Drive URL, redirect to original
      return NextResponse.redirect(imageUrl);
    }

    const driveFileId = googleDriveFileIdMatch[1];

    // Get the file from Google Drive
    const accessToken = await getAdminAccessTokenForUpload();

    // Use webContentLink for direct download
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${driveFileId}?fields=webContentLink`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      console.error('[Preview Proxy] Google Drive metadata error:', await metadataResponse.text());
      return NextResponse.json(
        { error: 'Failed to fetch preview' },
        { status: 500 }
      );
    }

    const metadata = await metadataResponse.json();
    const downloadUrl = metadata.webContentLink;

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'No download URL available' },
        { status: 500 }
      );
    }

    // Fetch the image
    const imageResponse = await fetch(downloadUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 500 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // Return image with cache headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('[Preview Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
