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
import { quickValidateFile } from '@/lib/file-validator/security-validator';
import { notifyDataReceipt } from '@/lib/admin-notifications';

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
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_name: string, _value: string, _options: unknown) {
          // We'll use the response object later if needed
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(_name: string, _options: unknown) {
          // Cookie removal if needed
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
    const storagePath = generateStoragePath(userId, orderId, file.name);

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

    // 8. Create file record in database (files table)
    const fileType = getFileType(file.type);

    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        order_id: orderId,
        file_type: fileType,
        original_filename: file.name,
        file_url: urlData.publicUrl,
        file_path: storagePath,
        file_size_bytes: file.size,
        uploaded_by: userId,
        validation_status: 'PENDING',
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
          // Forward headers for authentication
          headers: {
            'x-user-id': request.headers.get('x-user-id') || '',
            'x-dev-mode': request.headers.get('x-dev-mode') || 'false',
          },
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
      const { data: order } = await supabase
        .from('orders')
        .select('order_number, customer_name')
        .eq('id', orderId)
        .single();

      if (order) {
        await notifyDataReceipt(
          orderId,
          order.order_number,
          order.customer_name || 'お客様',
          file.name,
          fileType
        );
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
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        set(_name: string, _value: string, _options: unknown) {
          // Response handling if needed
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        remove(_name: string, _options: unknown) {
          // Cookie removal if needed
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
        console.error('[Data Receipt GET] Auth error:', userError?.message);
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

    // 3. Get files for this order from files table
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('order_id', orderId)
      .order('uploaded_at', { ascending: false });

    if (filesError) {
      console.error('[Data Receipt Upload] Get files error:', filesError);
    }

    // 4. Transform to expected format
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
