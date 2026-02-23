/**
 * Preview Image Proxy API for Designers
 *
 * デザイナー用プレビュー画像プロキシAPI
 * - TOKEN認証（クエリパラメータまたはヘッダー）
 * - Google Driveからプレビュー画像を取得
 * - トークンをdesigner_task_assignmentsテーブルで検証
 *
 * @route /api/designer/orders/[id]/correction/[revisionId]/preview
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminAccessTokenForUpload } from '@/lib/google-drive';
import { hashToken, isTokenExpired } from '@/lib/designer-tokens';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// =====================================================
// Helper Functions
// =====================================================

/**
 * Extract token from query parameter or header
 * クエリパラメータまたはヘッダーからトークンを抽出
 */
function extractToken(request: NextRequest): string | null {
  // Try query parameter first: ?token=xxx
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get('token');
  if (tokenFromQuery) {
    return tokenFromQuery;
  }

  // Try x-designer-token header
  const tokenFromHeader = request.headers.get('x-designer-token');
  if (tokenFromHeader) {
    return tokenFromHeader;
  }

  return null;
}

/**
 * Validate token against designer_task_assignments
 * designer_task_assignmentsテーブルでトークンを検証
 */
async function validateToken(
  token: string,
  orderId: string
): Promise<{ valid: boolean; error?: string }> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const tokenHash = hashToken(token);

  // Look up assignment by token hash and order
  const { data: assignment, error } = await supabase
    .from('designer_task_assignments')
    .select('id, access_token_expires_at')
    .eq('access_token_hash', tokenHash)
    .eq('order_id', orderId)
    .maybeSingle();

  if (error || !assignment) {
    console.error('[Designer Preview] Token not found:', error);
    return { valid: false, error: 'Invalid token' };
  }

  // Check expiration using imported utility
  if (isTokenExpired(new Date(assignment.access_token_expires_at))) {
    console.warn('[Designer Preview] Token expired');
    return { valid: false, error: 'Token expired' };
  }

  // Update last_accessed_at
  await supabase
    .from('designer_task_assignments')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', assignment.id);

  return { valid: true };
}

// =====================================================
// GET Handler - Preview Image
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    const { id: orderId, revisionId } = await params;

    // Extract and validate token
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Token required' },
        { status: 401 }
      );
    }

    const tokenValidation = await validateToken(token, orderId);
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { error: tokenValidation.error },
        { status: 401 }
      );
    }

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
    if (imageUrl.includes('/api/designer/orders/') && imageUrl.includes('/preview')) {
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
      console.error('[Designer Preview] Google Drive metadata error:', await metadataResponse.text());
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
    console.error('[Designer Preview] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
