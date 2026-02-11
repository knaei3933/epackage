/**
 * File Validation API Endpoint
 *
 * POST /api/files/validate
 *
 * Validates uploaded design files (AI, PDF, PSD) for production readiness
 *
 * Request:
 * - multipart/form-data with file field
 * - Optional: orderId, quotationId, workOrderId, generatePreviews, validateOnly
 *
 * Response:
 * - JSON with validation results, file metadata, and URLs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';

import {
  ingestDesignFile,
  listFiles,
  getFile,
  revalidateFile,
  type ValidationResult,
} from '@/lib/file-validator';
import type { Database } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface ValidationRequest {
  file?: File;
  fileId?: string;
  orderId?: string;
  quotationId?: string;
  workOrderId?: string;
  generatePreviews?: boolean;
  validateOnly?: boolean;
}

interface ValidationResponse {
  success: boolean;
  data?: {
    fileId: string;
    fileName: string;
    fileType: 'AI' | 'PDF' | 'PSD';
    fileSize: number;
    valid: boolean;
    issues: Array<{
      type: 'error' | 'warning';
      category: string;
      message_ja: string;
      message_en: string;
      severity: 'critical' | 'major' | 'minor';
    }>;
    warnings: Array<{
      type: 'error' | 'warning';
      category: string;
      message_ja: string;
      message_en: string;
      severity: 'critical' | 'major' | 'minor';
    }>;
    metadata: any;
    fileUrl?: string;
    thumbnailUrl?: string;
    previewUrl?: string;
  };
  error?: string;
  message?: string;
}

interface ListFilesResponse {
  success: boolean;
  files?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    validationStatus: string;
    uploadedAt: string;
    fileUrl: string;
  }>;
  error?: string;
}

// ============================================================
// POST: Validate/Ingest File
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ValidationResponse>({
        success: false,
        error: 'Authentication required',
        message: 'ログインが必要です',
      }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileId = formData.get('fileId') as string | null;
    const orderId = formData.get('orderId') as string | null;
    const quotationId = formData.get('quotationId') as string | null;
    const workOrderId = formData.get('workOrderId') as string | null;
    const generatePreviews = formData.get('generatePreviews') === 'true';
    const validateOnly = formData.get('validateOnly') === 'true';

    // Re-validation mode
    if (fileId && !file) {
      const validationResults = await revalidateFile(fileId, user.id);

      return NextResponse.json<ValidationResponse>({
        success: true,
        data: {
          fileId,
          fileName: validationResults.fileName,
          fileType: validationResults.fileType,
          fileSize: validationResults.fileSize,
          valid: validationResults.valid,
          issues: validationResults.issues,
          warnings: validationResults.warnings,
          metadata: validationResults.metadata,
        },
      });
    }

    // File upload validation mode
    if (!file) {
      return NextResponse.json<ValidationResponse>({
        success: false,
        error: 'No file provided',
        message: 'ファイルが添付されていません',
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/postscript', 'image/vnd.adobe.photoshop'];
    const allowedExtensions = ['.ai', '.pdf', '.psd'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json<ValidationResponse>({
        success: false,
        error: 'Invalid file type',
        message: '対応していないファイル形式です（AI, PDF, PSDのみ対応）',
      }, { status: 400 });
    }

    // Ingest file
    const result = await ingestDesignFile(file, file.name, {
      userId: user.id,
      orderId: orderId || undefined,
      quotationId: quotationId || undefined,
      workOrderId: workOrderId || undefined,
      generatePreviews,
      validateOnly,
    });

    if (!result.success) {
      return NextResponse.json<ValidationResponse>({
        success: false,
        error: result.error || 'File validation failed',
        message: 'ファイルの検証に失敗しました',
      }, { status: 500 });
    }

    // Return validation results
    return NextResponse.json<ValidationResponse>({
      success: true,
      data: {
        fileId: result.fileId,
        fileName: result.validationResults.fileName,
        fileType: result.validationResults.fileType,
        fileSize: result.validationResults.fileSize,
        valid: result.validationResults.valid,
        issues: result.validationResults.issues,
        warnings: result.validationResults.warnings,
        metadata: result.validationResults.metadata,
        fileUrl: result.storagePath || undefined,
        thumbnailUrl: result.thumbnailUrl,
        previewUrl: result.previewUrl,
      },
    });

  } catch (error) {
    console.error('File validation API error:', error);
    return NextResponse.json<ValidationResponse>({
      success: false,
      error: 'Internal server error',
      message: 'サーバーエラーが発生しました',
    }, { status: 500 });
  }
}

// ============================================================
// GET: List Files
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
const { client: supabase } = await createSupabaseSSRClient($$$ARGS);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<ListFilesResponse>({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId') || undefined;
    const quotationId = searchParams.get('quotationId') || undefined;
    const workOrderId = searchParams.get('workOrderId') || undefined;
    const fileType = searchParams.get('fileType') as 'AI' | 'PDF' | 'PSD' | null;

    // List files
    const files = await listFiles({
      userId: user.id,
      orderId,
      quotationId,
      workOrderId,
      fileType: fileType || undefined,
    });

    return NextResponse.json<ListFilesResponse>({
      success: true,
      files: files.map((f: any) => ({
        id: f.id,
        fileName: f.file_name,
        fileType: f.file_type,
        fileSize: f.file_size,
        validationStatus: f.validation_status,
        uploadedAt: f.created_at,
        fileUrl: f.file_url,
      })),
    });

  } catch (error) {
    console.error('List files API error:', error);
    return NextResponse.json<ListFilesResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
