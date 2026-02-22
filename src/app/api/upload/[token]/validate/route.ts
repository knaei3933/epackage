import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// Create Supabase client lazily to avoid build-time environment variable check
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/upload/[token]/validate
 * Validates a designer upload token and returns order details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token is required', error_code: 'TOKEN_INVALID' },
        { status: 400 }
      );
    }

    // Hash the token with SHA-256
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Query the designer_upload_tokens table
    const supabase = getSupabaseClient();
    const { data: tokenData, error: tokenError } = await supabase
      .from('designer_upload_tokens')
      .select(`
        *,
        orders (
          id,
          order_number,
          customer_name,
          status,
          order_items (
            id,
            product_name,
            quantity
          )
        )
      `)
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token', error_code: 'TOKEN_INVALID' },
        { status: 404 }
      );
    }

    // Validate token status and expiration
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (tokenData.status !== 'active') {
      const errorMap = {
        expired: 'TOKEN_EXPIRED',
        used: 'TOKEN_USED',
        revoked: 'TOKEN_REVOKED'
      };
      return NextResponse.json(
        {
          valid: false,
          error: `Token is ${tokenData.status}`,
          error_code: errorMap[tokenData.status as keyof typeof errorMap] || 'TOKEN_INVALID'
        },
        { status: 400 }
      );
    }

    if (expiresAt < now) {
      // Mark token as expired
      await supabase
        .from('designer_upload_tokens')
        .update({ status: 'expired' })
        .eq('id', tokenData.id);

      return NextResponse.json(
        { valid: false, error: 'Token has expired', error_code: 'TOKEN_EXPIRED' },
        { status: 400 }
      );
    }

    // Update access_count and last_accessed_at
    await supabase
      .from('designer_upload_tokens')
      .update({
        access_count: (tokenData.access_count || 0) + 1,
        last_accessed_at: now.toISOString()
      })
      .eq('id', tokenData.id);

    // Fetch existing revisions for this order
    const { data: revisions, error: revisionsError } = await supabase
      .from('design_revisions')
      .select(`
        id,
        revision_number,
        created_at,
        approval_status,
        preview_image_url,
        design_review_comments (
          id,
          content,
          content_translated,
          original_language,
          author_name_display,
          author_role,
          created_at
        )
      `)
      .eq('order_id', tokenData.order_id)
      .eq('uploaded_by_type', 'korea_designer')
      .order('revision_number', { ascending: false });

    // Fetch comments for this order
    const { data: comments, error: commentsError } = await supabase
      .from('design_review_comments')
      .select('*')
      .eq('order_id', tokenData.order_id)
      .order('created_at', { ascending: true });

    // Format response
    const order = tokenData.orders;
    const existingRevisions = (revisions || []).map(rev => ({
      revision_number: rev.revision_number,
      created_at: rev.created_at,
      approval_status: rev.approval_status,
      preview_image_url: rev.preview_image_url
    }));

    return NextResponse.json({
      valid: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        items: order.order_items || [],
        status: order.status
      },
      expires_at: tokenData.expires_at,
      existing_revisions: existingRevisions,
      comments: comments || []
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error', error_code: 'TOKEN_INVALID' },
      { status: 500 }
    );
  }
}
