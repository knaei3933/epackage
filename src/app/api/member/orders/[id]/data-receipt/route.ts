/**
 * Order Data Receipt File Upload API (Member Portal)
 *
 * Task P2-12: Order data receipt file upload
 * - POST: Upload production data files (AI, EPS, PDF) to Google Drive
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
import {
  getAdminAccessTokenForUpload,
  uploadFileToDrive,
  getUploadFolderId
} from '@/lib/google-drive';

export const dynamic = 'force-dynamic';

// =====================================================
// Helper: Get Supabase client
// =====================================================

async function getSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(_name: string, _value: string, _options: unknown) {
        // We'll use response object later if needed
      },
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
    extraction_job_id?: string;
  };
  error?: string;
  errorEn?: string;
  code?: string;
}

// =====================================================
// Constants
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  'image/webp': 'PNG',
  'application/vnd.ms-excel': 'EXCEL',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'EXCEL',
};

/**
 * Get file type enum from MIME type
 */
function getFileType(mimeType: string): 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER' {
  return FILE_TYPE_MAP[mimeType] || 'OTHER';
}

// ============================================================
// POST Handler - Upload Data Receipt File to Google Drive
// ============================================================

/**
 * POST /api/member/orders/[id]/data-receipt
 * Upload production data files for an order to Google Drive
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
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    // 1. Authenticate user using SSR client
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
    const dataClient = isAdmin ? adminClient : supabase;

    // 2. Verify order exists
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

    // 4. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string | null;
    const productName = formData.get('product_name') as string | null;

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

    // Validate product name is required
    if (!productName || !productName.trim()) {
      return NextResponse.json(
        {
          error: '製品名を入力してください。',
          errorEn: 'Product name is required',
          code: 'NO_PRODUCT_NAME',
        },
        { status: 400 }
      );
    }

    // 5. Validate file security using security-validator
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

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      console.warn('[Data Receipt Upload] File validation warnings:', validationResult.warnings);
    }

    // ============================================================
    // 6. Upload to Google Drive
    // ============================================================
    let googleDriveFile: { id: string; webViewLink: string; webContentLink: string; name: string };
    try {
      // Get admin's access token for Google Drive
      const accessToken = await getAdminAccessTokenForUpload();

      // Get upload folder ID
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

      // Generate file name: {製品名}_入稿データ_{注文番号}_{日付}
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const sanitizedProductName = productName.trim().replace(/[^a-zA-Z0-9-_가-힣]/g, '_');
      const driveFileName = `${sanitizedProductName}_入稿データ_${order.order_number}_${dateStr}${file.name.substring(file.name.lastIndexOf('.'))}`;

      console.log('[Data Receipt Upload] Generated file name:', driveFileName);

      // Upload to Google Drive
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

      console.log('[Data Receipt Upload] File uploaded to Google Drive:', googleDriveFile.id);
    } catch (driveError) {
      console.error('[Data Receipt Upload] Google Drive upload error:', driveError);
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
    // 7. Create file record in database (files table)
    // ============================================================
    const fileType = getFileType(file.type);

    // Always use adminClient for file record insertion (bypasses RLS)
    const { data: fileRecord, error: dbError } = await adminClient
      .from('files')
      .insert({
        order_id: orderId,
        file_type: fileType,
        original_filename: driveFileName, // Use Google Drive file name
        file_url: googleDriveFile.webViewLink,
        file_path: googleDriveFile.id, // Store Google Drive file ID
        file_size_bytes: file.size,
        uploaded_by: userId,
        validation_status: 'PENDING',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Data Receipt Upload] Database insert error:', dbError);
      console.error('[Data Receipt Upload] Error details:', JSON.stringify(dbError, null, 2));
      console.error('[Data Receipt Upload] Insert data:', {
        order_id: orderId,
        file_type: fileType,
        original_filename: driveFileName,
        uploaded_by: userId,
      });
      return NextResponse.json(
        {
          error: 'ファイルレコードの作成に失敗しました。',
          errorEn: 'Failed to create file record',
          code: 'DB_ERROR',
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // ============================================================
    // 8. Log upload to order_file_uploads table
    // ============================================================
    try {
      await adminClient
        .from('order_file_uploads')
        .insert({
          order_id: orderId,
          file_name: file.name,
          file_type: 'upload',
          drive_file_id: googleDriveFile.id,
          drive_view_link: googleDriveFile.webViewLink,
          drive_content_link: googleDriveFile.webContentLink,
          uploaded_at: new Date().toISOString(),
        });
    } catch (logError) {
      console.error('[Data Receipt Upload] Failed to log file upload:', logError);
      // Don't fail the upload if logging fails
    }

    // ============================================================
    // 9. Trigger AI extraction for eligible file types
    // ============================================================
    let extractionJobId: string | null = null;
    const eligibleFileTypes = ['AI', 'PDF', 'PSD'];

    if (eligibleFileTypes.includes(fileType)) {
      try {
        console.log('[Data Receipt Upload] Triggering AI extraction for file:', fileRecord.id);

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
        }
      } catch (extractionError) {
        console.error('[Data Receipt Upload] Failed to trigger AI extraction:', extractionError);
      }
    }

    // ============================================================
    // 10. Create admin notification and send email
    // ============================================================
    try {
      // 管理者への通知
      await notifyDataReceipt(
        orderId,
        order.order_number,
        order.customer_name || 'お客様',
        file.name,
        fileType
      );

      // 顧客へ受領確認メールを送信
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
        console.error('[Data Receipt Upload] Customer email notification failed:', emailError);
      }

      // ============================================================
      // Auto-transition: DATA_UPLOADED → CORRECTION_IN_PROGRESS
      // ============================================================
      if (order.status === 'DATA_UPLOAD_PENDING') {
        console.log('[Data Receipt Upload] Auto-transition: DATA_UPLOAD_PENDING → CORRECTION_IN_PROGRESS');

        const currentStatus = order.status;

        const { error: updateError } = await adminClient
          .from('orders')
          .update({
            status: 'CORRECTION_IN_PROGRESS',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        if (updateError) {
          console.error('[Data Receipt Upload] Status update error (CORRECTION_IN_PROGRESS):', updateError);
        } else {
          console.log('[Data Receipt Upload] Auto-transition completed to CORRECTION_IN_PROGRESS');

          // 履歴を記録
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
    } catch (notifyError) {
      console.error('[Data Receipt Upload] Notification error:', notifyError);
    }

    // ============================================================
    // 11. Prepare response
    // ============================================================
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

    if (extractionJobId) {
      response.data.extraction_job_id = extractionJobId;
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
    // 1. Authenticate user using SSR client
    const supabase = await getSupabaseClient(request);

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
      console.error('[Data Receipt GET] Get files error:', filesError);
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
    console.error('[Data Receipt GET] Unexpected error:', error);

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
