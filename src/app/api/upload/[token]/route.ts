import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import { generateCorrectionFilename } from '@/lib/file-naming';

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
  fileType: 'preview' | 'original',
  request: NextRequest
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('orderId', orderId);
  formData.append('fileType', fileType);

  // Use the request's origin for internal API calls
  const origin = request.headers.get('x-forwarded-host') ||
                 request.headers.get('host') ||
                 process.env.NEXT_PUBLIC_APP_URL ||
                 'http://localhost:3006';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${origin}`;

  const response = await fetch(`${baseUrl}/api/upload-to-drive`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[uploadToGoogleDrive] Error:', response.status, errorText);
    throw new Error(`Failed to upload file to Google Drive: ${errorText}`);
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

    // Query customer submission to get original filename for file naming
    const { data: customerSubmission } = await supabase
      .from('customer_file_submissions')
      .select('id, original_filename')
      .eq('order_id', tokenData.order_id)
      .eq('is_current', true)
      .maybeSingle();

    // Generate correction filename
    const originalFilename = customerSubmission?.original_filename || 'file';
    const orderForFilename = tokenData.orders as any;
    const generatedFilename = generateCorrectionFilename(
      originalFilename,
      nextRevisionNumber,
      orderForFilename?.order_number
    );

    // Upload files to Google Drive
    const [previewImageUrl, originalFileUrl] = await Promise.all([
      uploadToGoogleDrive(preview_image, tokenData.order_id, 'preview', request),
      uploadToGoogleDrive(original_file, tokenData.order_id, 'original', request),
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
        revision_number: nextRevisionNumber,
        revision_name: `Revision ${nextRevisionNumber}`, // Add revision_name
        preview_image_url: previewImageUrl,
        original_file_url: originalFileUrl,
        partner_comment: comment_ko || '', // Use partner_comment for Korean designer comments
        customer_comment: commentJa || '', // Use customer_comment for Japanese translation
        approval_status: 'pending', // Use 'pending' (allowed values: pending, approved, rejected)
        created_at: now.toISOString(),
        // File naming fields for design revision workflow v2
        original_customer_filename: originalFilename,
        generated_correction_filename: generatedFilename,
        customer_submission_id: customerSubmission?.id,
      })
      .select()
      .single();

    if (revisionError) {
      throw revisionError;
    }

    // Create comment record if provided
    if (comment_ko && comment_ko.trim()) {
      // Use admin user as author (since we need a valid user_id)
      // In production, you would create a korean_designer user
      const { data: adminUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (adminUser) {
        await supabase.from('order_comments').insert({
          order_id: tokenData.order_id,
          content: comment_ko,
          comment_type: 'correction',
          author_id: adminUser.id,
          author_role: 'admin', // Using admin for now (TODO: add korea_designer role)
          is_internal: false,
          metadata: {
            original_language: 'ko',
            content_translated: commentJa,
            revision_id: revision.id,
            author_name_display: 'Korean Designer',
          } as any,
          created_at: now.toISOString(),
        });
      }
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
        original_customer_filename: revision.original_customer_filename,
        generated_correction_filename: revision.generated_correction_filename,
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
