/**
 * Member File Upload API
 *
 * メンバーファイルアップロードAPI
 * - POST: AI/PDFファイルアップロードおよび保存
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database';
import { z } from 'zod';
import { getPerformanceMonitor } from '@/lib/performance-monitor';

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
        metadata = uploadSchema.parse(parsed);
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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options });
        },
      },
    });

    // Check for DEV_MODE header from middleware (DEV_MODE has priority)
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Files Upload] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
      // Try to get user from middleware header first (more reliable)
      const userIdFromMiddleware = request.headers.get('x-user-id');
      const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

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
    const { data: uploadData, error: uploadError } = await supabase.storage
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('production-files')
      .getPublicUrl(storagePath);

    // Create file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert({
        order_id: metadata.order_id || null,
        file_type: metadata.file_type === 'ai' ? 'AI' : 'PDF',
        file_name: file.name,
        file_url: urlData.publicUrl,
        version: 1,
        is_latest: true,
        validation_status: 'PENDING',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('File record creation error:', dbError);
      // Cleanup uploaded file
      await supabase.storage.from('production-files').remove([storagePath]);

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
        downloadUrl: urlData.publicUrl,
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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options });
        },
      },
    });

    // Check for DEV_MODE header from middleware (DEV_MODE has priority)
    const devModeUserId = request.headers.get('x-user-id');
    const isDevMode = request.headers.get('x-dev-mode') === 'true';

    let userId: string;

    if (isDevMode && devModeUserId) {
      // DEV_MODE: Use header from middleware
      console.log('[Files List] DEV_MODE: Using x-user-id header:', devModeUserId);
      userId = devModeUserId;
    } else {
      // Normal auth: Use cookie-based auth
      // Try to get user from middleware header first (more reliable)
      const userIdFromMiddleware = request.headers.get('x-user-id');
      const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

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
    }

    // Build query
    let query = supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false });

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
