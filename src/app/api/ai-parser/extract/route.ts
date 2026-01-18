/**
 * AI Extraction API Routes
 *
 * API endpoints for AI-powered product specification extraction
 * from Adobe Illustrator .ai files
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { createExtractionEngine } from '@/lib/ai-parser/core';
import { notifyAIExtractionComplete } from '@/lib/admin-notifications';
import type { Database } from '@/types/database';
import {
  ExtractionStatus,
  ExtractionMethod,
  FileUploadRequest,
  FileUploadResponse,
  ExtractionStatusResponse,
  ValidationRequest,
  ValidationResponse,
  AIExtractionApprovalRequest,
  ApprovalResponse,
  ReprocessRequest,
  BatchProcessingResponse,
} from '@/types/ai-extraction';

// ============================================================
// Type-safe Helper Functions
// ============================================================

/**
 * Type-safe insert helper for files table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertFile(supabase: ReturnType<typeof createSupabaseClient>, data: Database['public']['Tables']['files']['Insert']) {
  return (supabase as any)
    .from('files')
    .insert(data)
    .select()
    .single();
}

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

/**
 * Type-safe insert helper for production_data table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertProductionData(supabase: ReturnType<typeof createSupabaseClient>, data: Database['public']['Tables']['production_data']['Insert']) {
  return (supabase as any)
    .from('production_data')
    .insert(data);
}

// ============================================================================
// POST /api/ai-parser/upload - Upload file and start extraction
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('order_id') as string;
    const dataType = (formData.get('data_type') as string) || 'design_file';

    // Validate inputs
    if (!file) {
      return NextResponse.json<FileUploadResponse>({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: 'ファイルがアップロードされていません。',
        },
      }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json<FileUploadResponse>({
        success: false,
        error: {
          code: 'MISSING_ORDER_ID',
          message: '注文IDが必要です。',
        },
      }, { status: 400 });
    }

    // Validate file type
    const validExtensions = ['.ai', '.pdf', '.psd'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return NextResponse.json<FileUploadResponse>({
        success: false,
        error: {
          code: 'INVALID_FILE_FORMAT',
          message: `サポートされていないファイル形式です。${validExtensions.join(', ')}ファイルのみアップロード可能です。`,
        },
      }, { status: 400 });
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json<FileUploadResponse>({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'ファイルサイズが50MBを超えています。',
        },
      }, { status: 400 });
    }

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json<FileUploadResponse>({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: '注文が見つかりません。',
        },
      }, { status: 404 });
    }

    // Upload file to Supabase Storage
    const fileName = `${orderId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('design-files')
      .upload(fileName, file);

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json<FileUploadResponse>({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: 'ファイルのアップロードに失敗しました。',
        },
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('design-files')
      .getPublicUrl(fileName);

    // Use type-safe helper for files insert
    const { data: fileRecord, error: fileError } = await insertFile(supabase, {
      order_id: orderId,
      file_type: fileExtension.replace('.', '').toUpperCase() as Database['public']['Tables']['files']['Row']['file_type'],
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_size: file.size,
      version: 1,
      is_latest: true,
      validation_status: 'PENDING' as Database['public']['Tables']['files']['Row']['validation_status'],
      validation_errors: null,
      metadata: null,
      uploaded_by: (await supabase.auth.getUser()).data.user?.id || '',
      ai_extraction_status: 'pending' as ExtractionStatus,
      ai_extraction_data: null,
      ai_confidence_score: null,
      ai_extraction_method: null,
      ai_extracted_at: null,
      ai_validation_errors: null,
      quotation_id: null,
      work_order_id: null,
      production_log_id: null,
    });

    if (fileError) {
      console.error('File record creation error:', fileError);
      return NextResponse.json<FileUploadResponse>({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'ファイル情報の保存に失敗しました。',
        },
      }, { status: 500 });
    }

    const fileRecordTyped = fileRecord as Database['public']['Tables']['files']['Row'];
    // Start extraction in background
    startExtraction(fileRecordTyped.id, orderId, file).catch(error => {
      console.error('Background extraction error:', error);
    });

    // Return success response
    return NextResponse.json<FileUploadResponse>({
      success: true,
      data: {
        file_id: fileRecordTyped.id,
        status: 'processing',
        uploaded_at: fileRecordTyped.created_at,
        estimated_completion: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 minutes
      },
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json<FileUploadResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました。',
      },
    }, { status: 500 });
  }
}

/**
 * Background extraction process
 */
async function startExtraction(fileId: string, orderId: string, file: File) {
  const supabase = createSupabaseClient();
  const engine = createExtractionEngine();

  try {
    // Update status to processing
    await updateFile(supabase, fileId, {
      ai_extraction_status: 'processing' as ExtractionStatus,
    });

    // Perform extraction
    const result = await engine.extractFromFile(file, orderId, fileId);

    // Update file record with extraction results
    await updateFile(supabase, fileId, {
      ai_extraction_status: result.status,
      ai_extraction_data: result.data as unknown as Database['public']['Tables']['files']['Update']['ai_extraction_data'],
      ai_confidence_score: result.validation.confidence.overall,
      ai_extraction_method: result.metadata.extraction_method as ExtractionMethod,
      ai_extracted_at: result.metadata.extracted_at,
      ai_validation_errors: result.validation.errors as unknown as Database['public']['Tables']['files']['Update']['ai_validation_errors'],
    });

    // If extraction successful and confidence is high, create production_data record
    if (result.status === 'completed' && result.data) {
      await insertProductionData(supabase, {
        order_id: orderId,
        data_type: 'design_file',
        title: `Design File: ${file.name}`,
        description: null,
        version: '1.0',
        file_id: fileId,
        file_url: JSON.stringify(result.data),
        validation_status: 'pending',
        validated_by: null,
        validated_at: null,
        validation_notes: null,
        validation_errors: null,
        approved_for_production: false,
        approved_by: null,
        approved_at: null,
        submitted_by_customer: false,
        customer_contact_info: null,
        received_at: new Date().toISOString(),
        extracted_data: result.data as unknown as Database['public']['Tables']['production_data']['Insert']['extracted_data'],
        confidence_score: result.validation.confidence.overall,
        extraction_metadata: {
          method: result.metadata.extraction_method,
          extracted_at: result.metadata.extracted_at,
        } as Database['public']['Tables']['production_data']['Insert']['extraction_metadata'],
      });
    }

    // If extraction successful, create notification
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number')
        .eq('id', orderId)
        .single();

      if (order) {
        await notifyAIExtractionComplete(
          orderId,
          order.order_number,
          fileId,
          file.name,
          result.validation.confidence.overall
        );
      }
    } catch (notifyError) {
      console.error('[AI Extraction] Notification error:', notifyError);
    }

  } catch (error) {
    console.error('Extraction failed:', error);

    // Update status to failed
    await updateFile(supabase, fileId, {
      ai_extraction_status: 'failed' as ExtractionStatus,
      ai_validation_errors: [{
        field: 'extraction',
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
      }] as unknown as Database['public']['Tables']['files']['Update']['ai_validation_errors'],
    });
  }
}

// ============================================================================
