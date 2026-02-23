/**
 * Designer Correction Preview Image Proxy API
 *
 * デザイナー教正プレビュー画像プロキシAPI
 * - Google Drive画像を取得してCORS問題を回避
 * - 適切なContent-Typeで返却
 *
 * @route /api/designer/orders/[id]/correction/[revisionId]/preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// =====================================================
// GET Handler - Proxy Preview Image
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  try {
    const { id: orderId, revisionId } = await params;

    // Service client for database operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Fetch revision record
    const { data: revision, error: revisionError } = await supabase
      .from('design_revisions')
      .select('preview_image_url, order_id')
      .eq('id', revisionId)
      .single();

    if (revisionError || !revision) {
      return NextResponse.json(
        { error: 'Revision not found' },
        { status: 404 }
      );
    }

    // Verify order ID matches
    if (revision.order_id !== orderId) {
      return NextResponse.json(
        { error: 'Order ID mismatch' },
        { status: 403 }
      );
    }

    if (!revision.preview_image_url) {
      return NextResponse.json(
        { error: 'Preview image URL not found' },
        { status: 404 }
      );
    }

    // Fetch image from Google Drive URL
    const imageUrl = revision.preview_image_url;
    const response = await fetch(imageUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error('[Preview Proxy] Failed to fetch image:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch preview image' },
        { status: response.status }
      );
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    // Return image with proper headers
    return new NextResponse(Buffer.from(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
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
