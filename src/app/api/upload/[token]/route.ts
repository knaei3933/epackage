import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Translate Korean text to Japanese
 */
async function translateKoreanToJapanese(koreanText: string): Promise<string> {
  try {
    // Check if DeepL API key is available
    if (!process.env.DEEPL_API_KEY) {
      console.warn('DeepL API key not configured, returning original text');
      return koreanText;
    }

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [koreanText],
        target_lang: 'JA',
        source_lang: 'KO',
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.translations?.[0]?.text || koreanText;
  } catch (error) {
    console.error('Translation error:', error);
    return koreanText; // Return original text on error
  }
}

/**
 * Upload file to Google Drive
 */
async function uploadToGoogleDrive(
  file: File,
  orderId: string,
  fileType: 'preview' | 'original'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('orderId', orderId);
  formData.append('fileType', fileType);

  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload-to-drive`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to Google Drive');
  }

  const data = await response.json();
  return data.fileUrl;
}

/**
 * Send notification email to customer
 */
async function sendCustomerNotification(
  orderNumber: string,
  customerEmail: string,
  customerName: string,
  revisionNumber: number
): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: customerEmail,
        templateName: 'design_revision_uploaded',
        data: {
          customer_name: customerName,
          order_number: orderNumber,
          revision_number: revisionNumber,
          review_url: `${process.env.NEXT_PUBLIC_APP_URL}/customer/orders/${orderNumber}`,
        },
      }),
    });

    if (!response.ok) {
      console.error('Failed to send customer notification email');
    }
  } catch (error) {
    console.error('Error sending customer notification:', error);
  }
}

/**
 * POST /api/upload/[token]
 * Handles file upload with token authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Hash the token with SHA-256
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Validate token first
    const { data: tokenData, error: tokenError } = await supabase
      .from('designer_upload_tokens')
      .select(`
        *,
        orders (
          id,
          order_number,
          customer_name,
          customer_email,
          status
        )
      `)
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check token status and expiration
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);

    if (tokenData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: `Token is ${tokenData.status}` },
        { status: 401 }
      );
    }

    if (expiresAt < now) {
      await supabase
        .from('designer_upload_tokens')
        .update({ status: 'expired' })
        .eq('id', tokenData.id);

      return NextResponse.json(
        { success: false, error: 'Token has expired' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const preview_image = formData.get('preview_image') as File;
    const original_file = formData.get('original_file') as File;
    const comment_ko = formData.get('comment_ko') as string | null;
    const order_item_id = formData.get('order_item_id') as string | null;

    // Validate required files
    if (!preview_image || !original_file) {
      return NextResponse.json(
        { success: false, error: 'preview_image and original_file are required' },
        { status: 400 }
      );
    }

    // Get next revision number
    const { data: lastRevision } = await supabase
      .from('design_revisions')
      .select('revision_number')
      .eq('order_id', tokenData.order_id)
      .eq('uploaded_by_type', 'korea_designer')
      .order('revision_number', { ascending: false })
      .limit(1)
      .single();

    const nextRevisionNumber = (lastRevision?.revision_number || 0) + 1;

    // Upload files to Google Drive
    const [previewImageUrl, originalFileUrl] = await Promise.all([
      uploadToGoogleDrive(preview_image, tokenData.order_id, 'preview'),
      uploadToGoogleDrive(original_file, tokenData.order_id, 'original'),
    ]);

    // Translate Korean comment to Japanese if provided
    let commentJa = '';
    if (comment_ko && comment_ko.trim()) {
      commentJa = await translateKoreanToJapanese(comment_ko);
    }

    // Create design revision record
    const { data: revision, error: revisionError } = await supabase
      .from('design_revisions')
      .insert({
        order_id: tokenData.order_id,
        order_item_id: order_item_id || null,
        revision_number: nextRevisionNumber,
        preview_image_url: previewImageUrl,
        original_file_url: originalFileUrl,
        uploaded_by_type: 'korea_designer',
        korean_designer_comment: comment_ko || '',
        korean_designer_comment_ja: commentJa,
        approval_status: 'PENDING_CUSTOMER',
        created_at: now.toISOString(),
      })
      .select()
      .single();

    if (revisionError) {
      throw revisionError;
    }

    // Create comment record if provided
    if (comment_ko && comment_ko.trim()) {
      await supabase.from('design_review_comments').insert({
        order_id: tokenData.order_id,
        revision_id: revision.id,
        content: comment_ko,
        content_translated: commentJa,
        original_language: 'ko',
        author_name_display: 'Korean Designer',
        author_role: 'korea_designer',
        created_at: now.toISOString(),
      });
    }

    // Update order status to CUSTOMER_APPROVAL_PENDING
    await supabase
      .from('orders')
      .update({
        status: 'CUSTOMER_APPROVAL_PENDING',
        updated_at: now.toISOString(),
      })
      .eq('id', tokenData.order_id);

    // Update token upload_count
    await supabase
      .from('designer_upload_tokens')
      .update({
        upload_count: (tokenData.upload_count || 0) + 1,
        last_uploaded_at: now.toISOString(),
      })
      .eq('id', tokenData.id);

    // Send notification email to customer
    const order = tokenData.orders as any;
    if (order?.customer_email) {
      await sendCustomerNotification(
        order.order_number,
        order.customer_email,
        order.customer_name,
        nextRevisionNumber
      );
    }

    return NextResponse.json({
      success: true,
      revision: {
        id: revision.id,
        revision_number: revision.revision_number,
        preview_image_url: revision.preview_image_url,
        original_file_url: revision.original_file_url,
      },
      message: `Revision ${nextRevisionNumber} uploaded successfully`,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      },
      { status: 500 }
    );
  }
}
