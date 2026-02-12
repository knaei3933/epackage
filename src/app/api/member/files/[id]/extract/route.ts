/**
 * Member File Extraction API
 *
 * メンバーファイルAI抽出API
 * - POST: AI/PDFファイルから製品仕様抽出
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database';
import { z } from 'zod';
import { AIExtractionEngine } from '@/lib/ai-parser/core';
import type { ExtractionResult, ExtractedProductData } from '@/lib/ai-parser/types';

// ============================================================
// Types
// ============================================================

interface ExtractRequestBody {
  provider?: 'openai' | 'anthropic';
  force?: boolean;  // Force re-extraction even if already extracted
}

interface ExtractResponse {
  success: boolean;
  data?: {
    extractionId: string;
    file: {
      id: string;
      name: string;
      type: string;
    };
    extracted: ExtractedProductData;
    confidence: {
      overall: number;
      details: Record<string, number>;
    };
    validationStatus: string;
    extractedAt: string;
  };
  error?: string;
  code?: string;
}

// ============================================================
// Validation Schema
// ============================================================

const extractSchema = z.object({
  provider: z.enum(['openai', 'anthropic']).optional(),
  force: z.boolean().optional(),
});

// ============================================================
// Helper Functions
// ============================================================

/**
 * Check if file was already extracted
 */
async function checkExistingExtraction(
  supabase: ReturnType<typeof createServerClient>,
  fileId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('production_data')
    .select('id')
    .eq('file_id', fileId)
    .eq('data_type', 'specification')
    .single();

  return !!data;
}

/**
 * Save extraction results to production_data table
 */
async function saveExtractionResults(
  supabase: ReturnType<typeof createServerClient>,
  orderId: string,
  fileId: string,
  result: ExtractionResult,
  userId: string
): Promise<{ id: string; error?: string }> {
  // Build validation status based on confidence
  let validationStatus: 'pending' | 'valid' | 'invalid' | 'needs_revision' = 'pending';
  if (result.validation.confidence.overall >= 0.9) {
    validationStatus = 'valid';
  } else if (result.validation.confidence.overall >= 0.7) {
    validationStatus = 'needs_revision';
  } else if (result.validation.confidence.overall < 0.5) {
    validationStatus = 'invalid';
  }

  const { data, error } = await supabase
    .from('production_data')
    .insert({
      order_id: orderId,
      data_type: 'specification',
      title: `AI抽出: ${result.data ? '製品仕様' : 'Unknown'}`,
      description: `AIで抽出された製品仕様 (信頼度: ${(result.validation.confidence.overall * 100).toFixed(1)}%)`,
      version: '1.0',
      file_id: fileId,
      file_url: null, // Will be linked from files table
      validation_status: validationStatus,
      validated_by: null,
      validated_at: null,
      validation_notes: result.validation.confidence.overall < 0.9 ? '要確認' : null,
      validation_errors: result.validation.confidence.overall < 0.5 ? { lowConfidence: true } : null,
      approved_for_production: result.validation.confidence.overall >= 0.9,
      approved_by: result.validation.confidence.overall >= 0.9 ? userId : null,
      approved_at: result.validation.confidence.overall >= 0.9 ? new Date().toISOString() : null,
      submitted_by_customer: false,
      customer_contact_info: null,
      received_at: new Date().toISOString(),
      // Store extracted data as JSON
      extracted_data: result.data as unknown as Record<string, unknown>,
      confidence_score: result.validation.confidence.overall,
      extraction_metadata: {
        extraction_method: result.metadata.extraction_method,
        ai_model: result.metadata.ai_model,
        processing_time_ms: result.metadata.processing_time_ms,
        extracted_at: result.metadata.extracted_at,
      } as Record<string, unknown>,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { id: '', error: error.message };
  }

  return { id: data.id };
}

// ============================================================
// POST Handler - Extract Product Specifications
// ============================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;

    // Parse and validate request body
    const body: ExtractRequestBody = await request.json().catch(() => ({}));
    const validatedData = extractSchema.parse(body);

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

    // Get authenticated user ID
    let userId: string;

    // Try to get user from middleware header first (more reliable)
    const userIdFromMiddleware = request.headers.get('x-user-id');
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware;
      console.log('[Files Extract] Using user ID from middleware:', userId);
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
      console.log('[Files Extract] Authenticated user:', userId);
    }

    // Get file record
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !file) {
      return NextResponse.json(
        { error: 'File not found', code: 'FILE_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if file belongs to user's order (or user is admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'ADMIN';
    if (!isAdmin) {
      // TODO: Add order ownership check
      return NextResponse.json(
        { error: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Check if already extracted (unless force=true)
    if (!validatedData.force) {
      const existing = await checkExistingExtraction(supabase, fileId);
      if (existing) {
        return NextResponse.json(
          {
            error: 'File already extracted. Use force=true to re-extract.',
            code: 'ALREADY_EXTRACTED',
          },
          { status: 400 }
        );
      }
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('production-files')
      .download(file.file_url.split('/').pop() || '');

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to download file', code: 'DOWNLOAD_ERROR' },
        { status: 500 }
      );
    }

    // Convert Blob to File
    const fileBlob = new Blob([await fileData.arrayBuffer()], {
      type: fileData.type || 'application/pdf',
    });
    const extractedFile = new File([fileBlob], file.file_name, {
      type: fileData.type || 'application/pdf',
    });

    // Initialize AI extraction engine
    const provider = validatedData.provider || 'openai';
    const engine = new AIExtractionEngine({
      ai_models: {
        primary: {
          provider,
          model: provider === 'openai' ? 'gpt-4-vision-preview' : 'claude-3-5-sonnet-20241022',
          api_key: provider === 'openai' ? process.env.OPENAI_API_KEY || '' : process.env.ANTHROPIC_API_KEY || '',
          max_tokens: 4096,
          temperature: 0.1,
          timeout_ms: 60000,
        },
      },
    } as any);

    // Extract product specifications
    const orderId = file.order_id || 'temp-order-id';
    const extractionResult: ExtractionResult = await engine.extractFromFile(
      extractedFile,
      orderId,
      fileId
    );

    if (extractionResult.status === 'failed') {
      return NextResponse.json(
        {
          error: extractionResult.error?.message || 'Extraction failed',
          code: 'EXTRACTION_ERROR',
        },
        { status: 500 }
      );
    }

    // Save extraction results to database
    const saveResult = await saveExtractionResults(
      supabase,
      orderId,
      fileId,
      extractionResult,
      userId
    );

    if (saveResult.error) {
      console.error('Failed to save extraction results:', saveResult.error);
      return NextResponse.json(
        { error: 'Failed to save extraction results', code: 'SAVE_ERROR' },
        { status: 500 }
      );
    }

    const extractResponse: ExtractResponse = {
      success: true,
      data: {
        extractionId: saveResult.id,
        file: {
          id: file.id,
          name: file.file_name,
          type: file.file_type,
        },
        extracted: extractionResult.data as any,
        confidence: {
          overall: extractionResult.validation.confidence.overall,
          details: extractionResult.validation.confidence.fields as any,
        },
        validationStatus: extractionResult.validation.confidence.overall >= 0.9 ? 'valid' :
                          extractionResult.validation.confidence.overall >= 0.7 ? 'needs_revision' : 'invalid',
        extractedAt: extractionResult.metadata.extracted_at,
      },
    };

    return NextResponse.json(extractResponse);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: error.errors,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    console.error('File extraction error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET Handler - Get Extraction Results
// ============================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params;

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

    // Get authenticated user ID
    let userId: string;

    // Try to get user from middleware header first (more reliable)
    const userIdFromMiddleware = request.headers.get('x-user-id');
    const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

    if (userIdFromMiddleware && isFromMiddleware) {
      userId = userIdFromMiddleware;
      console.log('[Files Extract GET] Using user ID from middleware:', userId);
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
      console.log('[Files Extract GET] Authenticated user:', userId);
    }

    // Get extraction results
    const { data: extraction, error } = await supabase
      .from('production_data')
      .select('*')
      .eq('file_id', fileId)
      .eq('data_type', 'specification')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !extraction) {
      return NextResponse.json(
        { error: 'Extraction not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: extraction.id,
        title: extraction.title,
        description: extraction.description,
        validationStatus: extraction.validation_status,
        validationNotes: extraction.validation_notes,
        approvedForProduction: extraction.approved_for_production,
        extractedData: extraction.extracted_data,
        confidenceScore: extraction.confidence_score,
        extractionMetadata: extraction.extraction_metadata,
        createdAt: extraction.created_at,
        updatedAt: extraction.updated_at,
      },
    });

  } catch (error) {
    console.error('Get extraction error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
