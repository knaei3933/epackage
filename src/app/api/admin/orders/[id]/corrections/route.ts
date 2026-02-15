/**
 * Order Correction Data Upload API (Admin Portal)
 *
 * Admin uploads corrected files back to customer
 * Files are linked to original data receipt and uploaded to Google Drive
 * File name format: 製品名_校正データ_会社名_日付
 *
 * @route /api/admin/orders/[id]/corrections
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase';
import { quickValidateFile } from '@/lib/file-validator/security-validator';
import { uploadCorrectionToDrive } from '@/lib/google-drive';

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
      set(_name: string, _value: string, _options: unknown) {
        // Cookie handling if needed
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

interface CorrectionUploadResponse {
  success: boolean;
  data?: {
    id: string;
    file_name: string;
    file_url: string;
    uploaded_at: string;
  };
  error?: string;
  errorEn?: string;
  code?: string;
}

// =====================================================
// Constants
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Admin roles
const ADMIN_ROLES = ['ADMIN', 'OPERATOR', 'SALES', 'ACCOUNTING'];

// =====================================================
// Helper Functions
// =====================================================

// File type mapping
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

function getFileType(mimeType: string): 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER' {
  return FILE_TYPE_MAP[mimeType] || 'OTHER';
}

// =====================================================
// POST Handler - Upload Correction File
// =====================================================

/**
 * POST /api/admin/orders/[id]/corrections
 * Upload corrected file to customer (links to original data receipt)
 *
 * Request FormData:
 * - file: File to upload
 * - source_file_id: Original data receipt file ID to link to
 * - product_name: Product name (for file naming)
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
    // 1. Authenticate user
    const supabase = await getSupabaseClient(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
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

    // 2. Check admin role
    const adminClient = createServiceClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const isAdmin = profile?.role && ADMIN_ROLES.includes(profile.role);

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: '管理者権限が必要です。',
          errorEn: 'Admin access required',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // 3. Verify order exists
    const { data: order } = await adminClient
      .from('orders')
      .select('id, order_number, customer_name')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        {
          error: '注文が見つかりません。',
          errorEn: 'Order not found',
          code: 'ORDER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 4. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sourceFileId = formData.get('source_file_id') as string | null;
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

    if (!sourceFileId) {
      return NextResponse.json(
        {
          error: '元のファイルIDが必要です。',
          errorEn: 'Source file ID is required',
          code: 'NO_SOURCE_FILE',
        },
        { status: 400 }
      );
    }

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

    // 5. Validate file
    const validationResult = await quickValidateFile(file, MAX_FILE_SIZE);

    if (!validationResult.isValid) {
      const firstError = validationResult.errors[0];
      return NextResponse.json(
        {
          error: firstError?.message_ja || 'ファイルの検証に失敗しました。',
          errorEn: firstError?.message_en || 'File validation failed',
          code: firstError?.code || 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // 6. Upload to Google Drive (using admin credentials)
    let driveFileData;
    try {
      driveFileData = await uploadCorrectionToDrive(
        file,
        sourceFileId,
        productName.trim(),
        order.customer_name || 'お客様'
      );
    } catch (driveError) {
      console.error('[Correction Upload] Google Drive upload error:', driveError);

      if (driveError instanceof Error && driveError.message.includes('auth')) {
        return NextResponse.json(
          {
            error: 'Google Driveの認証が期限切れです。',
            errorEn: 'Google Drive authentication expired',
            code: 'GOOGLE_AUTH_EXPIRED',
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

    // 8. Create correction file record in database
    const fileType = getFileType(file.type);
    const fileUrl = driveFileData.webViewLink;
    const filePath = `google_drive:${driveFileData.id}`;

    const { data: fileRecord, error: dbError } = await adminClient
      .from('files')
      .insert({
        order_id: orderId,
        file_type: fileType,
        original_filename: file.name,
        file_url: fileUrl,
        file_path: filePath,
        file_size_bytes: file.size,
        uploaded_by: userId,
        validation_status: 'APPROVED', // Correction files are pre-approved
        product_name: productName.trim(),
        drive_folder_id: driveFileData.folderId,
        source_file_id: sourceFileId, // Link to original data receipt
        is_correction: true, // Mark as correction file
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Correction Upload] Database insert error:', dbError);
      return NextResponse.json(
        {
          error: 'ファイルレコードの作成に失敗しました。',
          errorEn: 'Failed to create file record',
          code: 'DB_ERROR',
        },
        { status: 500 }
      );
    }

    // 9. Prepare response
    const response: CorrectionUploadResponse = {
      success: true,
      data: {
        id: fileRecord.id,
        file_name: fileRecord.original_filename,
        file_url: fileRecord.file_url,
        uploaded_at: fileRecord.uploaded_at,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Correction Upload] Unexpected error:', error);

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
