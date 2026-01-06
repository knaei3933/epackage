/**
 * Order Data Receipt File Upload API (Member Portal)
 *
 * Task P2-12: Order data receipt file upload
 * - POST: Upload production data files (PDF, Excel, images)
 * - Uses security-validator for comprehensive file validation
 * - Saves file metadata to database
 * - Supports files up to 10MB
 *
 * @route /api/member/orders/[id]/data-receipt
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { quickValidateFile } from '@/lib/file-validator/security-validator';

// =====================================================
// Environment Variables
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// =====================================================
// Types
// =====================================================

interface DataReceiptUploadRequest {
  data_type: 'production_data' | 'design_file' | 'specification' | 'other';
  description?: string;
  version?: number;
}

interface DataReceiptUploadResponse {
  success: boolean;
  data?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    storagePath: string;
    downloadUrl: string;
    dataType: string;
    uploadedAt: string;
  };
  error?: string;
  errorEn?: string;
  code?: string;
}

// =====================================================
// Constants
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (using security-validator default)

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/postscript',
  'image/x-eps',
  'application/illustrator',
  'application/photoshop',
  'image/vnd.adobe.photoshop',
];

const DATA_TYPE_LABELS: Record<string, string> = {
  production_data: '生産データ',
  design_file: 'デザインファイル',
  specification: '仕様書',
  other: 'その他',
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
  dataType: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const ext = fileName.toLowerCase().split('.').pop();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `order_data_receipt/${userId}/${orderId}/${timestamp}_${sanitizedFileName}.${ext}`;
}

/**
 * Validate data type
 */
function isValidDataType(dataType: string): boolean {
  return ['production_data', 'design_file', 'specification', 'other'].includes(dataType);
}

// =====================================================
// POST Handler - Upload Data Receipt File
// =====================================================

/**
 * POST /api/member/orders/[id]/data-receipt
 * Upload production data or design files for an order
 *
 * Request FormData:
 * - file: File to upload
 * - data_type: Type of data being uploaded
 * - description: Optional description
 * - version: Optional version number
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
    // 1. Authenticate user (support both cookie auth and DEV_MODE header)
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // Check for DEV_MODE header from middleware
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Data Receipt Upload] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
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
      userId = user.id;
    }

    const { id: orderId } = await params;

    // 2. Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status')
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

    if (order.user_id !== userId) {
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
    const dataType = formData.get('data_type') as string;
    const description = formData.get('description') as string | null;
    const versionStr = formData.get('version') as string | null;

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

    if (!dataType || !isValidDataType(dataType)) {
      return NextResponse.json(
        {
          error: '無効なデータタイプです。',
          errorEn: 'Invalid data type',
          code: 'INVALID_DATA_TYPE',
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

    // 5. Generate storage path
    const storagePath = generateStoragePath(userId, orderId, dataType, file.name);

    // 6. Upload file to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('production-files')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('[Data Receipt Upload] Storage upload error:', uploadError);
      return NextResponse.json(
        {
          error: 'ファイルのアップロードに失敗しました。',
          errorEn: 'Failed to upload file',
          code: 'UPLOAD_ERROR',
        },
        { status: 500 }
      );
    }

    // 7. Get public URL
    const { data: urlData } = supabase.storage
      .from('production-files')
      .getPublicUrl(storagePath);

    // 8. Create file record in database
    const version = versionStr ? parseInt(versionStr, 10) : 1;

    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        order_id: orderId,
        file_type: dataType.toUpperCase(),
        file_name: file.name,
        file_url: urlData.publicUrl,
        version: version,
        is_latest: true,
        validation_status: 'PENDING',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Data Receipt Upload] Database insert error:', dbError);
      // Cleanup uploaded file
      await supabase.storage.from('production-files').remove([storagePath]);

      return NextResponse.json(
        {
          error: 'ファイルレコードの作成に失敗しました。',
          errorEn: 'Failed to create file record',
          code: 'DB_ERROR',
        },
        { status: 500 }
      );
    }

    // 9. Create production_data record if applicable
    if (dataType === 'production_data' || dataType === 'design_file') {
      const { error: prodDataError } = await supabase
        .from('production_data')
        .insert({
          order_id: orderId,
          title: DATA_TYPE_LABELS[dataType] || dataType,
          description: description || `${DATA_TYPE_LABELS[dataType]}: ${file.name}`,
          data_type: dataType,
          file_url: urlData.publicUrl,
          validation_status: 'PENDING',
          received_at: new Date().toISOString(),
        });

      if (prodDataError) {
        console.warn('[Data Receipt Upload] Production data record creation warning:', prodDataError);
        // Don't fail the request, just log the warning
      }
    }

    // 10. Prepare response
    const response: DataReceiptUploadResponse = {
      success: true,
      data: {
        fileId: fileRecord.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        storagePath,
        downloadUrl: urlData.publicUrl,
        dataType,
        uploadedAt: fileRecord.created_at,
      },
    };

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
    // 1. Authenticate user
    const cookieStore = await cookies();
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: {
          getItem: (key: string) => {
            const cookie = cookieStore.get(key);
            return cookie?.value ?? null;
          },
          setItem: (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          removeItem: (key: string) => {
            cookieStore.delete(key);
          },
        },
      },
    });

    // Check for DEV_MODE header
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      userId = devModeUserId;
    } else {
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
      userId = user.id;
    }

    const { id: orderId } = await params;

    // 2. Verify order belongs to user
    const { data: order } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== userId) {
      return NextResponse.json(
        {
          error: 'アクセス権限がありません。',
          errorEn: 'Access denied',
        },
        { status: 403 }
      );
    }

    // 3. Get files for this order
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (filesError) {
      console.error('[Data Receipt Upload] Get files error:', filesError);
    }

    // 4. Get production data records
    const { data: productionData, error: prodError } = await supabase
      .from('production_data')
      .select('*')
      .eq('order_id', orderId)
      .order('received_at', { ascending: false });

    if (prodError) {
      console.error('[Data Receipt Upload] Get production data error:', prodError);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          files: files || [],
          productionData: productionData || [],
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
