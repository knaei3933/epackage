/**
 * Member File Upload API
 *
 * メンバーファイルアップロードAPI
 * - POST: AI/PDFファイルアップロードおよび保存
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database';
import { z } from 'zod';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { DEV_MODE_USER_ID } from '@/lib/dev-mode';
import { createServiceClient } from '@/lib/supabase';

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor({
  slowQueryThreshold: 1000, // Log queries slower than 1 second
  enableLogging: true,
});

// ============================================================
// Types
// ============================================================

interface UploadRequestBody {
  file_name: string;
  file_type: 'ai' | 'pdf' | 'psd' | 'other';
  order_id?: string;
  quotation_id?: string;
  data_type?: 'design' | 'specification' | 'other';
}

interface UploadResponse {
  success: boolean;
  data?: {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    storagePath: string;
    downloadUrl: string;
    uploadedAt: string;
  };
  error?: string;
  code?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const uploadSchema = z.object({
  file_name: z.string().min(1, 'File name is required'),
  file_type: z.enum(['ai', 'pdf', 'psd', 'other']),
  order_id: z.string().optional(),
  quotation_id: z.string().optional(),
  data_type: z.enum(['design', 'specification', 'other']).optional(),
});

// ============================================================
// Constants
// ============================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (reduced from 50MB for security)
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/postscript',
  'image/vnd.adobe.illustrator',
  'application/x-adobe-illustrator',
  'image/x-adobe-illustrator',
];

// Magic numbers (file signatures) for common file types
const FILE_MAGIC_NUMBERS: Record<string, RegExp> = {
  // PDF: %PDF (25 50 44 46)
  pdf: /^%PDF-/,
  // AI: Encapsulated PostScript with Adobe Illustrator header
  ai: /%(AI|Adobe)/,
  // PSD: 8BPS (38 42 50 53)
  psd: /^8BPS/,
};

// ============================================================
// Helper Functions
// ============================================================

/**
 * Validate file type
 */
function validateFileType(fileName: string, fileType: string): boolean {
  const ext = fileName.toLowerCase().split('.').pop();
  const validExtensions: Record<string, string[]> = {
    ai: ['.ai'],
    pdf: ['.pdf'],
    psd: ['.psd'],
    other: ['.ai', '.pdf', '.psd', '.eps', '.svg'],
  };

  const validExts = validExtensions[fileType] || validExtensions.other;
  return ext ? validExts.includes(`.${ext}`) : false;
}

/**
 * Validate file by magic number (file signature)
 * This prevents files with misleading extensions from being uploaded
 */
function validateFileByMagicNumber(buffer: Buffer, expectedType: string): boolean {
  // Read first 1024 bytes for magic number detection
  const header = buffer.slice(0, 1024).toString('ascii');

  switch (expectedType) {
    case 'pdf':
      return FILE_MAGIC_NUMBERS.pdf.test(header);
    case 'ai':
      return FILE_MAGIC_NUMBERS.ai.test(header);
    case 'psd':
      return FILE_MAGIC_NUMBERS.psd.test(header);
    case 'other':
      // For 'other', accept any valid type
      return (
        FILE_MAGIC_NUMBERS.pdf.test(header) ||
        FILE_MAGIC_NUMBERS.ai.test(header) ||
        FILE_MAGIC_NUMBERS.psd.test(header)
      );
    default:
      return false;
  }
}

/**
 * Generate storage path
 */
function generateStoragePath(
  userId: string,
  orderId: string | undefined,
  fileType: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const ext = fileName.toLowerCase().split('.').pop();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `production_data/${userId}/${orderId || 'general'}/${timestamp}_${sanitizedFileName}.${ext}`;
}

// ============================================================
// POST Handler - Upload File
// ============================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataJson = formData.get('metadata') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'NO_FILE' },
        { status: 400 }
      );
    }

    // Parse metadata
    let metadata: UploadRequestBody = {
      file_name: file.name,
      file_type: 'other',
    };

    if (metadataJson) {
      try {
        const parsed = JSON.parse(metadataJson);
        metadata = uploadSchema.parse(parsed) as any;
      } catch {
        return NextResponse.json(
          { error: 'Invalid metadata format', code: 'INVALID_METADATA' },
          { status: 400 }
        );
      }
    } else {
      // Auto-detect file type from extension
      const ext = file.name.toLowerCase().split('.').pop();
      if (ext === 'ai') metadata.file_type = 'ai';
      else if (ext === 'pdf') metadata.file_type = 'pdf';
      else if (ext === 'psd') metadata.file_type = 'psd';
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds limit (${MAX_FILE_SIZE / 1024 / 1024}MB)`,
          code: 'FILE_TOO_LARGE',
          maxSize: MAX_FILE_SIZE,
        },
        { status: 413 }
      );
    }

    // Validate file type
    if (!validateFileType(file.name, metadata.file_type)) {
      return NextResponse.json(
        {
          error: `Invalid file type for ${metadata.file_type}`,
          code: 'INVALID_FILE_TYPE',
        },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = NextResponse.json({ success: false });
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        // getAll/setAll（@supabase/ssr 推奨）: chunked session 対応。
        // 従来の get/set/remove は PostgREST(DB) に session が伝播せず anon 扱いになり
        // files INSERT が RLS 拒否(42501)されるため変更。
        getAll() {
          return request.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set({ name, value, ...options })
            );
          } catch {
            // read-only コンテキスト（Server Component）では無視
          }
        },
      },
    });

    // storage 操作（upload / getPublicUrl / remove）は service client で RLS を bypass。
    // 理由: cookie client で storage を操作すると storage.objects の RLS 評価過程で
    // auth.users を参照し、GRANT 不足（permission denied for table users）で失敗するため。
    // DB 操作（auth.getUser / profiles / files / orders）は cookie client のまま（多層防御を維持）。
    const serviceClient = createServiceClient();

    // Try to get user from middleware header first (more reliable)
    const userIdFromMiddleware = request.headers.get('x-user-id');
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

    let userId: string;

    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware;
      console.log('[Files Upload] Using user ID from middleware:', userId);
    } else {
      // Fallback to SSR client auth
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
      userId = user.id;
      console.log('[Files Upload] Authenticated user:', userId);
    }

    // files テーブルの exactly_one_reference 制約: order_id か quotation_id の
    // ちょうど1つが必須。両方 null / 両方指定は 400（DB 側でも拒否されるが早期応答）。
    if (!metadata.order_id && !metadata.quotation_id) {
      return NextResponse.json(
        { error: 'Either order_id or quotation_id is required', code: 'MISSING_REFERENCE' },
        { status: 400 }
      );
    }
    if (metadata.order_id && metadata.quotation_id) {
      return NextResponse.json(
        { error: 'Cannot specify both order_id and quotation_id', code: 'CONFLICT_REFERENCE' },
        { status: 400 }
      );
    }

    // IDOR prevention: order_id が指定された場合、所有権を検証（admin 以外）
    // WS-2 checkFileOwnership と対称。他人の order_id への file 紐付けを拒否する。
    // profiles SELECT も service client: cookie client は @supabase/ssr server context で
    // PostgREST(DB) に session が伝播せず anon 扱いになり RLS で 0 rows になるため。
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'ADMIN';

    if (!isAdmin && metadata.order_id) {
      // UUID 形式チェック（WS-3 対称・22P02 予防）
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_RE.test(metadata.order_id)) {
        return NextResponse.json(
          { error: 'Forbidden', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }

      const isDevMode =
        process.env.NODE_ENV === 'development' &&
        process.env.ENABLE_DEV_MOCK_AUTH === 'true';
      const userIdForDb = isDevMode ? DEV_MODE_USER_ID : userId;

      // service client（引き上げ済み）で RLS を bypass し、確実に orders.user_id を取得して比較
      const { data: order } = await serviceClient
        .from('orders')
        .select('user_id')
        .eq('id', metadata.order_id)
        .single();

      if (!order || order.user_id !== userIdForDb) {
        return NextResponse.json(
          { error: 'Forbidden', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    // IDOR prevention: quotation_id が指定された場合、所有権を検証（admin 以外）
    // order_id 検証と対称。他人の quotation への file 紐付けを拒否。
    if (!isAdmin && metadata.quotation_id) {
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_RE.test(metadata.quotation_id)) {
        return NextResponse.json(
          { error: 'Forbidden', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }

      const isDevMode =
        process.env.NODE_ENV === 'development' &&
        process.env.ENABLE_DEV_MOCK_AUTH === 'true';
      const userIdForDb = isDevMode ? DEV_MODE_USER_ID : userId;

      const { data: quotation } = await serviceClient
        .from('quotations')
        .select('user_id')
        .eq('id', metadata.quotation_id)
        .single();

      if (!quotation || quotation.user_id !== userIdForDb) {
        return NextResponse.json(
          { error: 'Forbidden', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file by magic number (file signature)
    // This prevents files with misleading extensions from being uploaded
    if (!validateFileByMagicNumber(buffer, metadata.file_type)) {
      return NextResponse.json(
        {
          error: `File content does not match expected type (${metadata.file_type}). File may be corrupted or has a misleading extension.`,
          code: 'INVALID_FILE_CONTENT',
        },
        { status: 400 }
      );
    }

    // Generate storage path
    const storagePath = generateStoragePath(
      userId,
      metadata.order_id,
      metadata.file_type,
      file.name
    );

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('production-files')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('File upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file', code: 'UPLOAD_ERROR' },
        { status: 500 }
      );
    }

    // Get public URL（DB の file_url は publicUrl を維持・保存方法の抜本的修正は別 Issue）
    const { data: urlData } = serviceClient.storage
      .from('production-files')
      .getPublicUrl(storagePath);

    // production-files は private bucket。response 表示用に signed URL（24h 有効）を生成。
    // getPublicUrl の結果は private bucket では実際アクセス不可のため、即時ダウンロード用に
    // signed URL を発行する。production-logs / hanko route と同一パターン。
    const { data: signedData, error: signedError } = await serviceClient.storage
      .from('production-files')
      .createSignedUrl(storagePath, 86400);
    if (signedError) {
      console.error('[Files Upload] Signed URL error:', signedError);
    }
    const downloadSignedUrl = signedData?.signedUrl ?? urlData.publicUrl;

    // Create file record in database
    // files INSERT も service client: cookie client は PostgREST が anon になり
    // files INSERT policy(WITH CHECK auth.uid() IS NOT NULL) で RLS 拒否(42501)されるため。
    // IDOR 予防は order_id 所有権検証(L295) + uploaded_by: userId のアプリ層強制で担保。
    const { data: fileRecord, error: dbError } = await serviceClient
      .from('files')
      .insert({
        order_id: metadata.order_id || null,
        quotation_id: metadata.quotation_id || null,
        uploaded_by: userId,
        file_type: metadata.file_type === 'ai' ? 'AI' : 'PDF',
        original_filename: file.name,
        file_url: urlData.publicUrl,
        // file_path: storage object path（実DB NOT NULL・service 化で storage 成功後に
        // files.insert が到達するようになったため必須）。file_size_bytes は実DBカラム。
        // created_at は実DBに不存在（uploaded_at が default now()）のため渡さない。
        file_path: storagePath,
        file_size_bytes: file.size,
        version: 1,
        is_latest: true,
        validation_status: 'PENDING',
      })
      .select()
      .single();

    if (dbError) {
      console.error('File record creation error:', dbError);
      // Cleanup uploaded file
      await serviceClient.storage.from('production-files').remove([storagePath]);

      return NextResponse.json(
        { error: 'Failed to create file record', code: 'DB_ERROR' },
        { status: 500 }
      );
    }

    const uploadResponse: UploadResponse = {
      success: true,
      data: {
        fileId: fileRecord.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: metadata.file_type,
        storagePath,
        // response の downloadUrl は private bucket でアクセス可能な signed URL（24h 有効）。
        // DB の file_url は publicUrl のままだが実アクセス不可のため signed URL で上書きして返す。
        downloadUrl: downloadSignedUrl,
        uploadedAt: fileRecord.created_at,
      },
    };

    return NextResponse.json(uploadResponse);

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    // Track file upload API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`POST /api/member/files/upload`, duration);
  }
}

// ============================================================
// GET Handler - List Files
// ============================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');
    const fileType = searchParams.get('file_type');

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = NextResponse.json({ success: false });
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        // getAll/setAll（@supabase/ssr 推奨）: POST handler と同様。
        getAll() {
          return request.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set({ name, value, ...options })
            );
          } catch {
            // read-only コンテキストでは無視
          }
        },
      },
    });

    // Try to get user from middleware header first (more reliable)
    const userIdFromMiddleware = request.headers.get('x-user-id');
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

    let userId: string;

    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware;
      console.log('[Files List] Using user ID from middleware:', userId);
    } else {
      // Fallback to SSR client auth
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'UNAUTHORIZED' },
          { status: 401 }
        );
      }
      userId = user.id;
      console.log('[Files List] Authenticated user:', userId);
    }

    // files SELECT は service client: cookie client は PostgREST(DB) に session が
    // 伝播せず anon 扱いになり RLS で 0 rows になるため。service client は RLS bypass
    // なので全件見える → アプリ層で所有権フィルタ（uploaded_by / order_id 所有権）。
    const serviceClient = createServiceClient();

    // profiles SELECT も service client（role 取得）
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    const isAdmin = profile?.role === 'ADMIN';

    // order_id 指定時は所有権検証（非 admin・IDOR 予防・POST の order_id 検証と対称）
    if (orderId && !isAdmin) {
      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!UUID_RE.test(orderId)) {
        return NextResponse.json(
          { error: 'Forbidden', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
      const isDevMode =
        process.env.NODE_ENV === 'development' &&
        process.env.ENABLE_DEV_MOCK_AUTH === 'true';
      const userIdForDb = isDevMode ? DEV_MODE_USER_ID : userId;
      const { data: order } = await serviceClient
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();
      if (!order || order.user_id !== userIdForDb) {
        return NextResponse.json(
          { error: 'Forbidden', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    // Build query（service client・所有権フィルタ付き）
    let query = serviceClient
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

    // 非 admin は自分がアップロードしたファイルのみ（IDOR 予防）
    if (!isAdmin) {
      query = query.eq('uploaded_by', userId);
    }

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    if (fileType) {
      query = query.eq('file_type', fileType.toUpperCase());
    }

    const { data: files, error } = await query;

    if (error) {
      console.error('File list error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch files', code: 'QUERY_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        files: files || [],
      },
    });

  } catch (error) {
    console.error('File list error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    // Track file list API execution time
    const duration = Date.now() - startTime;
    perfMonitor.trackQuery(`GET /api/member/files/upload`, duration);
  }
}
