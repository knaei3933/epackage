/**
 * B2B AI Extraction File Upload API
 *
 * Handles file uploads for AI extraction in B2B workflows.
 * Used by E2E tests in tests/security/file-upload-security.spec.ts
 *
 * Expected request format (multipart/form-data):
 * - file: File to upload (.ai files)
 * - order_id: Associated order ID
 *
 * Error responses:
 * - 400 with code: "INVALID_FILE_CONTENT" - Magic number mismatch
 * - 413 with code: "FILE_TOO_LARGE" - File exceeds 10MB
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { quickValidateFile } from '@/lib/file-validator/security-validator';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/b2b/ai-extraction/upload
 *
 * Uploads a file for AI extraction with security validation.
 */
export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const orderId = formData.get('order_id') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error: 'No file provided',
          code: 'NO_FILE',
        },
        { status: 400 }
      );
    }

    // Validate file using security validator
    const validationResult = await quickValidateFile(file, MAX_FILE_SIZE);

    // Check for file size error
    const sizeError = validationResult.errors.find(e => e.code === 'FILE_TOO_LARGE');
    if (sizeError) {
      return NextResponse.json(
        {
          error: sizeError.message_en,
          code: 'FILE_TOO_LARGE',
          maxSize: MAX_FILE_SIZE,
        },
        { status: 413 }
      );
    }

    // Check for magic number / content error
    // For .ai files, we expect the file to have valid AI/PDF magic number
    const contentError = validationResult.errors.find(
      e => e.code === 'INVALID_MAGIC_NUMBER' ||
           e.code === 'EXECUTABLE_FILE_DETECTED' ||
           e.code === 'MALICIOUS_CONTENT_DETECTED'
    );
    if (contentError) {
      return NextResponse.json(
        {
          error: contentError.message_en,
          code: 'INVALID_FILE_CONTENT',
          details: validationResult.errors.map(e => ({
            code: e.code,
            message: e.message_en,
          })),
        },
        { status: 400 }
      );
    }

    // Check if detected type matches expected AI/PDF format
    // AI files are typically PDF-based, so we check for that
    const detectedType = validationResult.fileInfo.detectedType;
    if (detectedType === 'unknown') {
      return NextResponse.json(
        {
          error: 'Invalid file content - could not detect valid file format',
          code: 'INVALID_FILE_CONTENT',
        },
        { status: 400 }
      );
    }

    // Check for other errors
    if (!validationResult.isValid && validationResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: validationResult.errors[0].message_en,
          code: validationResult.errors[0].code,
        },
        { status: 400 }
      );
    }

    // File is valid
    return NextResponse.json(
      {
        success: true,
        message: 'File validated successfully for AI extraction',
        orderId,
        fileInfo: validationResult.fileInfo,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('B2B AI extraction upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
