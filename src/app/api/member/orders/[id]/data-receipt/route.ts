/**
 * Order Data Receipt File Upload API (Member Portal)
 *
 * Task P2-12: Order data receipt file upload
 * - POST: Upload production data files (AI, EPS, PDF)
 * - GET: List uploaded files for an order
 * - Uses security-validator for comprehensive file validation
 * - Saves file metadata to database (files table)
 * - Supports files up to 10MB
 *
 * @route /api/member/orders/[id]/data-receipt
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase';
import { quickValidateFile } from '@/lib/file-validator/security-validator';
import { notifyDataReceipt } from '@/lib/admin-notifications';
import { notifyDataReceived as notifyDataReceivedEmail } from '@/lib/email/order-status-emails';
import { uploadDataReceiptToDrive, uploadCorrectionToDrive } from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

// =====================================================
// Helper: Get Supabase client
// =====================================================

async function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set(_name: string, _value: string, _options: unknown) {
        // We'll use response object later if needed
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      remove(_name: string, _options: unknown) {
        // Cookie removal if needed
      },
    },
  });
}

// =====================================================
// Types
// =====================================================

interface DataReceiptUploadResponse {
  success: boolean;
  data?: {
    id: string;
    file_name: string;
    file_type: string;
    file_url: string;
    uploaded_at: string;
    validation_status: string;
    extraction_job_id?: string; // AI extraction job ID if applicable
  };
  error?: string;
  errorEn?: string;
  code?: string;
}

// =====================================================
// Constants
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (using security-validator default)

// Admin roles that can access any order
const ADMIN_ROLES = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];

// =====================================================
// Helper Functions
// =====================================================

/**
 * Check if user has admin role
 */
async function checkAdminRole(
  supabase: any,
  userId: string
): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    return profile?.role && ADMIN_ROLES.includes(profile.role);
  } catch (error) {
    console.error('[checkAdminRole] Error:', error);
    return false;
  }
}

// File type mapping for database enum
const FILE_TYPE_MAP: Record<string, 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER'> = {
  'application/pdf': 'PDF',
  'application/postscript': 'OTHER',
  'image/x-eps': 'OTHER',
  'application/illustrator': 'AI',
  'application/photoshop': 'PSD',
  'image/vnd.adobe.photoshop': 'PSD',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'PNG', // Map webp to PNG
  'application/vnd.ms-excel': 'EXCEL',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'EXCEL',
};

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate storage path for order data receipt files
 */
function generateStoragePath(
  userId: string,
  orderId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `order_data_receipt/${userId}/${orderId}/${timestamp}_${sanitizedFileName}`;
}

/**
 * Get file type enum from MIME type
 */
function getFileType(mimeType: string): 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER' {
  return FILE_TYPE_MAP[mimeType] || 'OTHER';
}

// =====================================================
// POST Handler - Upload Data Receipt File
// =====================================================

/**
 * POST /api/member/orders/[id]/data-receipt
 * Upload production data files for an order
 *
 * Request FormData:
 * - file: File to upload
 * - description: Optional description
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": { ...fileInfo }
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user using SSR client (proper cookie handling)
    const supabase = await getSupabaseClient(request);

    // Normal auth: Use cookie-based auth with getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      console.error('[Data Receipt Upload] Auth error:', userError?.message);
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

    // For admins, use service role client to bypass RLS
    const adminClient = createServiceClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin = profile?.role && ADMIN_ROLES.includes(profile.role);

    // Use appropriate client for data access
    const dataClient = isAdmin ? adminClient : supabase;

    // 2. Verify order exists and get details
    const { data: order, error: orderError } = await dataClient
      .from('orders')
      .select('id, user_id, status, order_number, customer_name')
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

    // 3. Check user permissions (owner or admin)
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

    // 3. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const productName = formData.get('product_name') as string | null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const description = formData.get('description') as string | null;

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

    // Validate product name (required)
    if (!productName || productName.trim() === '') {
      return NextResponse.json(
        {
          error: '製品名を入力してください。',
          errorEn: 'Product name is required',
          code: 'NO_PRODUCT_NAME',
        },
        { status: 400 }
      );
    }

    // 4. Validate file security using security-validator
    const validationResult = await quickValidateFile(file, MAX_FILE_SIZE);

    if (!validationResult.isValid) {
      // Get first error message in Japanese
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

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      console.warn('[Data Receipt Upload] File validation warnings:', validationResult.warnings);
    }

    // 5. Upload to Google Drive (using admin credentials)
    let driveFileData;
    try {
      driveFileData = await uploadDataReceiptToDrive(
        file,
        orderId,
        productName.trim(),
        order.customer_name || 'お客様',
        order.order_number
      );
    } catch (driveError) {
      console.error('[Data Receipt Upload] Google Drive upload error:', driveError);

      // Check if it's an auth error
      if (driveError instanceof Error && driveError.message.includes('auth')) {
        return NextResponse.json(
          {
            error: 'Google Driveの認証が期限切れです。再認証してください。',
            errorEn: 'Google Drive authentication expired',
            code: 'GOOGLE_AUTH_EXPIRED',
            authUrl: '/api/auth/google/url?redirect=' + encodeURIComponent(`/member/orders/${orderId}/data-receipt`),
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          error: 'Google Driveへのアップロードに失敗しました。',
          errorEn: 'Failed to upload to Google Drive',
          code: 'DRIVE_UPLOAD_ERROR',
        },
        { status: 500 }
      );
    }

    // 6. Prepare file URL and path from Drive response
    const fileUrl = driveFileData.webViewLink;
    const filePath = `google_drive:${driveFileData.id}`; // Prefix to identify Drive files

    // 7. Create file record in database (files table)
    const fileType = getFileType(file.type);

    const { data: fileRecord, error: dbError } = await dataClient
      .from('files')
      .insert({
        order_id: orderId,
        file_type: fileType,
        original_filename: file.name,
        file_url: fileUrl,
        file_path: filePath,
        file_size_bytes: file.size,
        uploaded_by: userId,
        validation_status: 'PENDING',
        product_name: productName.trim(),
        drive_folder_id: driveFileData.folderId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Data Receipt Upload] Database insert error:', dbError);
      // Note: Can't cleanup Drive files easily, so we just log the error

      return NextResponse.json(
        {
          error: 'ファイルレコードの作成に失敗しました。',
          errorEn: 'Failed to create file record',
          code: 'DB_ERROR',
        },
        { status: 500 }
      );
    }

    // 9. Trigger AI extraction for eligible file types
    let extractionJobId: string | null = null;
    const eligibleFileTypes = ['AI', 'PDF', 'PSD'];

    if (eligibleFileTypes.includes(fileType)) {
      try {
        console.log('[Data Receipt Upload] Triggering AI extraction for file:', fileRecord.id);

        // Determine data_type based on file type
        const dataType = fileType === 'AI' ? 'design_file' : 'production_data';

        // Call AI extraction API internally
        const extractionApiUrl = new URL('/api/ai-parser/extract', request.url);
        const extractionFormData = new FormData();
        extractionFormData.append('file', file);
        extractionFormData.append('order_id', orderId);
        extractionFormData.append('data_type', dataType);

        const extractionResponse = await fetch(extractionApiUrl.toString(), {
          method: 'POST',
          body: extractionFormData,
        });

        if (extractionResponse.ok) {
          const extractionResult = await extractionResponse.json();
          extractionJobId = extractionResult.data?.file_id || fileRecord.id;
          console.log('[Data Receipt Upload] AI extraction started successfully:', extractionJobId);
        } else {
          console.error('[Data Receipt Upload] AI extraction API returned error:', extractionResponse.status);
          // Don't fail the upload - extraction failure is non-critical
        }
      } catch (extractionError) {
        console.error('[Data Receipt Upload] Failed to trigger AI extraction:', extractionError);
        // Don't fail the upload - extraction failure is non-critical
      }
    }

    // 9.5. Create admin notification for data receipt
    try {
      const { data: order } = await dataClient
        .from('orders')
        .select('order_number, customer_name, status')
        .eq('id', orderId)
        .single();

      if (order) {
        // 管理者への通知
        await notifyDataReceipt(
          orderId,
          order.order_number,
          order.customer_name || 'お客様',
          file.name,
          fileType
        );

        // ============================================================
        // 顧客へ受領確認メールを送信
        // Customer email notification for data receipt
        // ============================================================
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://epackage-lab.com';
          const customerEmail = user.email;

          if (customerEmail) {
            await notifyDataReceivedEmail(
              {
                orderId,
                orderNumber: order.order_number,
                customerEmail,
                customerName: order.customer_name || 'お客様',
                viewUrl: `${baseUrl}/member/orders/${orderId}`,
              },
              file.name
            );

            console.log('[Data Receipt Upload] Customer notification email sent:', {
              orderId: order.order_number,
              email: customerEmail,
              fileName: file.name,
            });
          } else {
            console.warn('[Data Receipt Upload] No customer email found, skipping email notification');
          }
        } catch (emailError) {
          // メール送信失敗時も処理を継続（エラーログのみ記録）
          console.error('[Data Receipt Upload] Customer email notification failed:', emailError);
          // Don't fail the upload if email notification fails
        }

        // ============================================================
        // Auto-transition: DATA_UPLOADED → CORRECTION_IN_PROGRESS
        // 新しいワークフロー: 顧客がデータをアップロードすると自動的に教正作業中へ
        // ============================================================
        if (order.status === 'DATA_UPLOAD_PENDING') {
          console.log('[Data Receipt Upload] Auto-transition: DATA_UPLOAD_PENDING → CORRECTION_IN_PROGRESS');

          // 現在のステータスを記録
          const currentStatus = order.status;

          // 直接 CORRECTION_IN_PROGRESS に遷移（サービスロール使用でRLS回避）
          const { error: updateError } = await adminClient
            .from('orders')
            .update({
              status: 'CORRECTION_IN_PROGRESS',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          if (updateError) {
            console.error('[Data Receipt Upload] Status update error (CORRECTION_IN_PROGRESS):', updateError);
            console.warn('[Data Receipt Upload] Status update failed, but file was uploaded. Manual update required.');
          } else {
            console.log('[Data Receipt Upload] Auto-transition completed to CORRECTION_IN_PROGRESS');

            // 履歴を記録（サービスロール使用）
            await adminClient
              .from('order_status_history')
              .insert({
                order_id: orderId,
                from_status: currentStatus,
                to_status: 'CORRECTION_IN_PROGRESS',
                changed_by: 'SYSTEM',
                changed_at: new Date().toISOString(),
                reason: 'データ入稿完了による自動遷移',
              })
              .then(() => console.log('[Data Receipt Upload] Status history logged'))
              .catch((err) => console.error('[Data Receipt Upload] History logging error:', err));
          }
        }
      }
    } catch (notifyError) {
      console.error('[Data Receipt Upload] Notification error:', notifyError);
      // Don't fail the upload if notification fails
    }

    // 10. Prepare response (match expected format from OrderFileUploadSection)
    const response: DataReceiptUploadResponse = {
      success: true,
      data: {
        id: fileRecord.id,
        file_name: fileRecord.original_filename,
        file_type: fileRecord.file_type.toLowerCase(),
        file_url: fileRecord.file_url,
        uploaded_at: fileRecord.uploaded_at,
        validation_status: fileRecord.validation_status,
      },
    };

    // Include extraction job ID if available
    if (extractionJobId) {
      response.data.extraction_job_id = extractionJobId;
      console.log('[Data Receipt Upload] Returning extraction job ID:', extractionJobId);
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Data Receipt Upload] Unexpected error:', error);

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
// GET Handler - List Data Receipt Files
// =====================================================

/**
 * GET /api/member/orders/[id]/data-receipt
 * Get list of uploaded data receipt files for an order
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "data": { files: [...] }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user using SSR client (proper cookie handling)
    const supabase = await getSupabaseClient(request);

    // Normal auth: Use cookie-based auth with getUser()
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      console.error('[Data Receipt GET] Auth error:', userError?.message);
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

    // For admins, use service role client to bypass RLS
    const adminClient = createServiceClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin = profile?.role && ADMIN_ROLES.includes(profile.role);

    // Use appropriate client for data access
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

    // 3. Check user permissions (owner or admin)
    if (order.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        {
          error: 'アクセス権限がありません。',
          errorEn: 'Access denied',
        },
        { status: 403 }
      );
    }

    // 4. Get files for this order from files table
    const { data: files, error: filesError } = await dataClient
      .from('files')
      .select('*')
      .eq('order_id', orderId)
      .order('uploaded_at', { ascending: false });

    if (filesError) {
      console.error('[Data Receipt Upload] Get files error:', filesError);
    }

    // 5. Transform to expected format
    const transformedFiles = (files || []).map(file => ({
      id: file.id,
      file_name: file.original_filename,
      file_type: file.file_type.toLowerCase(),
      file_url: file.file_url,
      uploaded_at: file.uploaded_at,
      validation_status: file.validation_status,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          files: transformedFiles,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Data Receipt Upload] GET error:', error);

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
