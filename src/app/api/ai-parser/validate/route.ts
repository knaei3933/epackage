/**
 * AI Parser Validation API
 *
 * POST /api/ai-parser/validate - Validate extracted data with manual corrections
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { createExtractionEngine } from '@/lib/ai-parser/core';
import type { Database } from '@/types/database';
import {
  ValidationRequest,
  ValidationResponse,
  ExtractedProductData,
} from '@/types/ai-extraction';

// ============================================================
// Type-safe Helper Functions
// ============================================================

/**
 * Type-safe update helper for files table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function updateFile(supabase: ReturnType<typeof createSupabaseClient>, fileId: string, data: Database['public']['Tables']['files']['Update']) {
  return (supabase as any)
    .from('files')
    .update(data)
    .eq('id', fileId);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json() as ValidationRequest;

    const { file_id, manual_data, corrections } = body;

    // Validate inputs
    if (!file_id) {
      return NextResponse.json<ValidationResponse>({
        success: false,
        error: {
          code: 'MISSING_FILE_ID',
          message: '파일 ID가 필요합니다.',
        },
      }, { status: 400 });
    }

    // Fetch file record
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', file_id)
      .single();

    if (error || !file) {
      return NextResponse.json<ValidationResponse>({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: '파일을 찾을 수 없습니다.',
        },
      }, { status: 404 });
    }

    // Get extracted data
    const fileTyped = file as Database['public']['Tables']['files']['Row'];
    const extractedData = fileTyped.ai_extraction_data as unknown as ExtractedProductData | null;

    if (!extractedData) {
      return NextResponse.json<ValidationResponse>({
        success: false,
        error: {
          code: 'NO_EXTRACTION_DATA',
          message: '추출된 데이터가 없습니다.',
        },
      }, { status: 400 });
    }

    // Create engine and validate with manual input
    const engine = createExtractionEngine();
    const validationResult = await engine.validateWithManualInput(
      extractedData,
      manual_data || {}
    );

    // Apply corrections if provided
    if (corrections && corrections.length > 0) {
      for (const correction of corrections) {
        const field = correction.field;
        const newValue = correction.corrected_value;

        // Update extracted data with correction
        setNestedValue(extractedData, field, newValue);
      }
    }

    // Update file record with corrected data
    await updateFile(supabase, file_id, {
      ai_extraction_data: extractedData as unknown as Database['public']['Tables']['files']['Update']['ai_extraction_data'],
      ai_validation_errors: validationResult.errors as unknown as Database['public']['Tables']['files']['Update']['ai_validation_errors'],
    });

    // Calculate final confidence score
    const confidenceScore = validationResult.confidence?.overall || 0.8;

    // Determine validation status
    let validationStatus: 'valid' | 'invalid' | 'needs_revision' = 'valid';
    if (validationResult.errors.some(e => e.severity === 'critical')) {
      validationStatus = 'invalid';
    } else if (validationResult.errors.length > 0 || validationResult.warnings.length > 3) {
      validationStatus = 'needs_revision';
    }

    return NextResponse.json<ValidationResponse>({
      success: true,
      data: {
        validation_status: validationStatus,
        confidence_score: confidenceScore,
        missing_fields: validationResult.missing_fields,
        suggestions: validationResult.suggestions,
      },
    });

  } catch (error) {
    console.error('Validation API error:', error);
    return NextResponse.json<ValidationResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
      },
    }, { status: 500 });
  }
}

/**
 * Helper function to set nested object values by path
 */
function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}
