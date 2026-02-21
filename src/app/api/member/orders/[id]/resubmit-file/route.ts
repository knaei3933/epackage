/**
 * Customer File Re-submission API (Member Portal)
 *
 * Phase 3: Customer File Re-submission
 * - POST: Upload replacement file for customer submission
 * - Handles file upload to Google Drive
 * - Creates records in both files and customer_file_submissions tables
 * - Marks old submission as non-current when replacing
 * - Uses generateCorrectionFilename() for standardized naming
 *
 * @route /api/member/orders/[id]/resubmit-file
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase';
import { quickValidateFile } from '@/lib/file-validator/security-validator';
import {
  getAdminAccessTokenForUpload,
  uploadFileToDrive,
  getUploadFolderId
} from '@/lib/google-drive';
import { generateCorrectionFilename } from '@/lib/file-naming';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface ResubmitFileResponse {
  success: boolean;
  submission?: {
    id: string;
    original_filename: string;
    file_url: string;
    submission_number: number;
  };
  error?: string;
  errorEn?: string;
  code?: string;
}

interface CustomerFileSubmission {
  id: string;
  order_id: string;
  file_id: string;
  original_filename: string;
  submission_number: number;
  is_current: boolean;
  uploaded_by: string;
  uploaded_at: string;
}

// =====================================================
// Constants
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ADMIN_ROLES = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get current submission for an order
 */
async function getCurrentSubmission(
  adminClient: any,
  orderId: string
): Promise<CustomerFileSubmission | null> {
  const { data, error } = await adminClient
    .from('customer_file_submissions')
    .select('*')
    .eq('order_id', orderId)
    .eq('is_current', true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CustomerFileSubmission;
}

/**
 * Mark previous submission as non-current
 */
async function markPreviousSubmissionAsReplaced(
  adminClient: any,
  previousSubmissionId: string,
  userId: string
): Promise<void> {
  const { error } = await adminClient
    .from('customer_file_submissions')
    .update({
      is_current: false,
      replaced_at: new Date().toISOString(),
      replaced_by: userId,
    })
    .eq('id', previousSubmissionId);

  if (error) {
    console.error('[markPreviousSubmissionAsReplaced] Error:', error);
    throw new Error('Failed to mark previous submission as replaced');
  }
}

/**
 * Get next submission number for an order
 */
async function getNextSubmissionNumber(
  adminClient: any,
  orderId: string
): Promise<number> {
  const { data } = await adminClient
    .from('customer_file_submissions')
    .select('submission_number')
    .eq('order_id', orderId)
    .order('submission_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.submission_number || 0) + 1;
}

/**
 * Get order details for filename generation
 */
async function getOrderDetails(
  adminClient: any,
  orderId: string
): Promise<{ order_number: string } | null> {
  const { data, error } = await adminClient
    .from('orders')
    .select('order_number')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as { order_number: string };
}

// =====================================================
// POST Handler - Re-submit Customer File
// =====================================================

/**
 * POST /api/member/orders/[id]/resubmit-file
 * Upload replacement file for customer submission
 *
 * Request FormData:
 * - file: File to upload
 * - originalSubmissionId: Optional ID of submission being replaced
 * - reason: Optional reason for re-submission
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "submission": { ... }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('[Resubmit File] ===== POST handler started =====');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // 1. Authenticate user
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(_name: string, _value: string, _options: unknown) {},
        remove(_name: string, _options: unknown) {},
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      console.error('[Resubmit File] Auth error:', userError?.message);
      return NextResponse.json(
        {
          error: '認証されていません。',
          errorEn: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { id: orderId } = await params;

    // Check admin role
    const adminClient = createServiceClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin = profile?.role && ADMIN_ROLES.includes(profile.role);
    const dataClient = isAdmin ? adminClient : supabase;

    // 2. Verify order exists
    const { data: order, error: orderError } = await dataClient
      .from('orders')
      .select('id, user_id, status, order_number')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          error: '注文が見つかりません。',
          errorEn: 'Order not found',
          code: 'ORDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 3. Check user permissions
    if (order.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        {
          error: 'この注文にアクセスする権限がありません。',
          errorEn: 'Access denied',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // 4. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const originalSubmissionId = formData.get('originalSubmissionId') as string | null;
    const reason = formData.get('reason') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error: 'ファイルが選択されていません。',
          errorEn: 'No file provided',
          code: 'NO_FILE',
        },
        { status: 400 }
      );
    }

    // 5. Validate file security
    const validationResult = await quickValidateFile(file, MAX_FILE_SIZE);

    if (!validationResult.isValid) {
      const firstError = validationResult.errors[0];
      return NextResponse.json(
        {
          error: firstError?.message_ja || 'ファイルの検証に失敗しました。',
          errorEn: firstError?.message_en || 'File validation failed',
          code: firstError?.code || 'VALIDATION_ERROR',
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    // Log warnings
    if (validationResult.warnings.length > 0) {
      console.warn('[Resubmit File] File validation warnings:', validationResult.warnings);
    }

    // ============================================================
    // 6. Get current submission and calculate next submission number
    // ============================================================
    let currentSubmission: CustomerFileSubmission | null = null;
    let submissionNumber: number;
    let previousFilename: string | null = null;

    if (originalSubmissionId) {
      // Replacing specific submission
      const { data: specifiedSubmission } = await adminClient
        .from('customer_file_submissions')
        .select('*')
        .eq('id', originalSubmissionId)
        .maybeSingle();

      if (specifiedSubmission) {
        currentSubmission = specifiedSubmission as CustomerFileSubmission;
        previousFilename = currentSubmission.original_filename;
      }

      // Get next submission number
      submissionNumber = await getNextSubmissionNumber(adminClient, orderId);
    } else {
      // Get current submission automatically
      currentSubmission = await getCurrentSubmission(adminClient, orderId);

      if (currentSubmission) {
        previousFilename = currentSubmission.original_filename;
        submissionNumber = await getNextSubmissionNumber(adminClient, orderId);
      } else {
        // First submission
        submissionNumber = 1;
      }
    }

    console.log('[Resubmit File] Submission number:', submissionNumber);
    console.log('[Resubmit File] Previous filename:', previousFilename);

    // ============================================================
    // 7. Upload to Google Drive
    // ============================================================
    let driveFileName: string;
    let googleDriveFile: { id: string; webViewLink: string; webContentLink: string; name: string };

    try {
      const accessToken = await getAdminAccessTokenForUpload();
      const uploadFolderId = getUploadFolderId();

      if (!uploadFolderId) {
        return NextResponse.json(
          {
            error: 'Google Driveフォルダが設定されていません。',
            errorEn: 'Google Drive folder not configured',
            code: 'NO_DRIVE_FOLDER',
          },
          { status: 500 }
        );
      }

      // Generate filename using generateCorrectionFilename
      if (previousFilename) {
        // Use previous filename to generate correction filename
        driveFileName = generateCorrectionFilename(
          previousFilename,
          submissionNumber,
          order.order_number
        );
      } else {
        // First submission - generate standard filename
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        driveFileName = `入稿データ_${order.order_number}_${dateStr}_R${submissionNumber}`;
      }

      // Add file extension
      const ext = file.name.substring(file.name.lastIndexOf('.'));
      driveFileName = driveFileName + ext;

      console.log('[Resubmit File] Generated filename:', driveFileName);

      const uploadedFile = await uploadFileToDrive(
        file,
        driveFileName,
        file.type || 'application/octet-stream',
        uploadFolderId,
        accessToken
      );

      googleDriveFile = {
        id: uploadedFile.id,
        webViewLink: uploadedFile.webViewLink,
        webContentLink: uploadedFile.webContentLink,
        name: uploadedFile.name,
      };

      console.log('[Resubmit File] File uploaded to Google Drive:', googleDriveFile.id);
    } catch (driveError) {
      console.error('[Resubmit File] Google Drive upload error:', driveError);
      return NextResponse.json(
        {
          error: 'Google Driveへのアップロードに失敗しました。',
          errorEn: 'Failed to upload to Google Drive',
          code: 'DRIVE_UPLOAD_ERROR',
          details: driveError instanceof Error ? driveError.message : String(driveError),
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 8. Create file record in database (files table)
    // ============================================================
    const fileTypes: Record<string, string> = {
      'application/pdf': 'PDF',
      'application/postscript': 'OTHER',
      'image/x-eps': 'OTHER',
      'application/illustrator': 'AI',
      'application/photoshop': 'PSD',
      'image/vnd.adobe.photoshop': 'PSD',
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
    };

    const fileType = (fileTypes[file.type] || 'OTHER') as 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'OTHER';

    const { data: fileRecord, error: fileError } = await adminClient
      .from('files')
      .insert({
        order_id: orderId,
        file_type: fileType,
        original_filename: driveFileName,
        file_url: googleDriveFile.webViewLink,
        file_path: googleDriveFile.id,
        file_size_bytes: file.size,
        uploaded_by: userId,
        validation_status: 'PENDING',
      })
      .select()
      .single();

    if (fileError) {
      console.error('[Resubmit File] File record creation error:', fileError);
      return NextResponse.json(
        {
          error: 'ファイルレコードの作成に失敗しました。',
          errorEn: 'Failed to create file record',
          code: 'DB_ERROR',
          details: fileError.message,
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 9. Mark previous submission as non-current (if replacing)
    // ============================================================
    if (currentSubmission && currentSubmission.is_current) {
      try {
        await markPreviousSubmissionAsReplaced(adminClient, currentSubmission.id, userId);
        console.log('[Resubmit File] Previous submission marked as replaced');
      } catch (error) {
        console.error('[Resubmit File] Failed to mark previous submission:', error);
        // Continue anyway - the new submission is more important
      }
    }

    // ============================================================
    // 10. Create customer_file_submissions record
    // ============================================================
    const { data: submissionRecord, error: submissionError } = await adminClient
      .from('customer_file_submissions')
      .insert({
        order_id: orderId,
        file_id: fileRecord.id,
        original_filename: driveFileName,
        file_url: googleDriveFile.webViewLink,
        file_type: file.type,
        file_size_bytes: file.size,
        submission_number: submissionNumber,
        is_current: true,
        previous_submission_id: currentSubmission?.id || null,
        uploaded_by: userId,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (submissionError) {
      console.error('[Resubmit File] Submission record creation error:', submissionError);
      return NextResponse.json(
        {
          error: '送信記録の作成に失敗しました。',
          errorEn: 'Failed to create submission record',
          code: 'DB_ERROR',
          details: submissionError.message,
        },
        { status: 500 }
      );
    }

    console.log('[Resubmit File] Submission record created:', submissionRecord.id);

    // ============================================================
    // 11. Create notification (optional reason logged)
    // ============================================================
    if (reason && reason.trim()) {
      try {
        await adminClient
          .from('order_comments')
          .insert({
            order_id: orderId,
            author_id: userId,
            comment: `ファイル再提出: ${reason.trim()}`,
            comment_type: 'file_resubmission',
            is_internal: false,
            created_at: new Date().toISOString(),
          });
        console.log('[Resubmit File] Reason logged as comment');
      } catch (commentError) {
        console.error('[Resubmit File] Failed to log reason:', commentError);
        // Non-critical, continue
      }
    }

    // ============================================================
    // 12. Prepare response
    // ============================================================
    const response: ResubmitFileResponse = {
      success: true,
      submission: {
        id: submissionRecord.id,
        original_filename: submissionRecord.original_filename,
        file_url: submissionRecord.file_url,
        submission_number: submissionRecord.submission_number,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Resubmit File] Unexpected error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// GET Handler - List Customer File Submissions
// =====================================================

/**
 * GET /api/member/orders/[id]/resubmit-file
 * Get list of customer file submissions for an order
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "submissions": [...]
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // 1. Authenticate user
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(_name: string, _value: string, _options: unknown) {},
        remove(_name: string, _options: unknown) {},
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        {
          error: '認証されていません。',
          errorEn: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const userId = user.id;
    const { id: orderId } = await params;

    // Check admin role
    const adminClient = createServiceClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin = profile?.role && ADMIN_ROLES.includes(profile.role);
    const dataClient = isAdmin ? adminClient : supabase;

    // 2. Verify order exists
    const { data: order } = await dataClient
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        {
          error: '注文が見つかりません。',
          errorEn: 'Order not found',
        },
        { status: 404 }
      );
    }

    // 3. Check user permissions
    if (order.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        {
          error: 'アクセス権限がありません。',
          errorEn: 'Access denied',
        },
        { status: 403 }
      );
    }

    // 4. Get submissions
    const { data: submissions, error } = await dataClient
      .from('customer_file_submissions')
      .select('*')
      .eq('order_id', orderId)
      .order('submission_number', { ascending: false });

    if (error) {
      console.error('[Resubmit File GET] Error:', error);
    }

    return NextResponse.json(
      {
        success: true,
        submissions: submissions || [],
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Resubmit File GET] Unexpected error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
