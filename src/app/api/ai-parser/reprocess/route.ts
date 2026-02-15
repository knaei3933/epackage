/**
 * AI Parser Reprocess API
 *
 * POST /api/ai-parser/reprocess - Batch reprocess files with updated models
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { createExtractionEngine } from '@/lib/ai-parser/core';
import {
  ReprocessRequest,
  BatchProcessingResponse,
} from '@/types/ai-extraction';
import type { Database } from '@/types/database';

type FileRecord = Database['public']['Tables']['files']['Row'];

interface BatchError {
  file_id: string;
  error: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json() as ReprocessRequest;

    const { file_ids, reason, force_reextract = false } = body;

    // Validate inputs
    if (!file_ids || !Array.isArray(file_ids) || file_ids.length === 0) {
      return NextResponse.json<BatchProcessingResponse>({
        success: false,
        error: {
          code: 'INVALID_FILE_IDS',
          message: '有効なファイルIDリストが必要です。',
        },
      }, { status: 400 });
    }

    if (file_ids.length > 50) {
      return NextResponse.json<BatchProcessingResponse>({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: '最大50件まで一括処理できます。',
        },
      }, { status: 400 });
    }

    // Generate batch ID
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Fetch file records
    const { data: files, error } = await supabase
      .from('files')
      .select('*')
      .in('id', file_ids);

    if (error || !files || files.length === 0) {
      return NextResponse.json<BatchProcessingResponse>({
        success: false,
        error: {
          code: 'FILES_NOT_FOUND',
          message: 'ファイルが見つかりません。',
        },
      }, { status: 404 });
    }

    // Start background processing
    processBatch(batchId, files, reason, force_reextract).catch(err => {
      console.error('Batch processing error:', err);
    });

    // Estimate completion time (30 seconds per file)
    const estimatedCompletion = new Date(Date.now() + files.length * 30 * 1000);

    return NextResponse.json<BatchProcessingResponse>({
      success: true,
      data: {
        batch_id: batchId,
        status: 'processing',
        total_files: files.length,
        estimated_completion: estimatedCompletion.toISOString(),
      },
    });

  } catch (error) {
    console.error('Reprocess API error:', error);
    return NextResponse.json<BatchProcessingResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'サーバーエラーが発生しました。',
      },
    }, { status: 500 });
  }
}

/**
 * Background batch processing
 */
async function processBatch(
  batchId: string,
  files: FileRecord[],
  reason: string,
  forceReextract: boolean
) {
  const supabase = createSupabaseClient();
  const engine = createExtractionEngine();

  const results = {
    batch_id: batchId,
    total_files: files.length,
    processed_files: 0,
    successful: 0,
    failed: 0,
    errors: [] as BatchError[],
  };

  for (const file of files) {
    try {
      // Skip if not forced and already completed with high confidence
      if (!forceReextract &&
          file.ai_extraction_status === 'completed' &&
          (file.ai_confidence_score ?? 0) >= 0.9) {
        results.processed_files++;
        results.successful++;
        continue;
      }

      // Update status to processing
      await supabase
        .from('files')
        // @ts-expect-error - Supabase JSONB columns need explicit type handling
        .update({
          ai_extraction_status: 'processing',
          metadata: {
            ...(file.metadata as { [key: string]: unknown } || {}),
            batchId,
            reprocess_reason: reason,
          } as { [key: string]: unknown },
        })
        .eq('id', file.id);

      // Fetch the actual file from storage
      const { data: fileData } = await supabase.storage
        .from('design-files')
        .download(file.file_url);

      if (!fileData) {
        throw new Error('Failed to download file from storage');
      }

      // Create File object
      const blob = new Blob([fileData]);
      const processedFile = new File([blob], file.file_name, {
        type: blob.type || 'application/octet-stream',
      });

      // Re-extract (order_id can be null, handle that case)
      if (!file.order_id) {
        throw new Error('File must be associated with an order');
      }

      const result = await engine.reextract(
        processedFile,
        file.order_id,
        file.id,
        { useFallback: true, forceReextract }
      );

      // Update file record
      await supabase
        .from('files')
        // @ts-expect-error - Supabase JSONB columns need explicit type handling
        .update({
          ai_extraction_status: result.status,
          ai_extraction_data: result.data as unknown as { [key: string]: unknown },
          ai_confidence_score: result.validation.confidence.overall,
          ai_extraction_method: result.metadata.extraction_method,
          ai_extracted_at: result.metadata.extracted_at,
          ai_validation_errors: result.validation.errors as unknown as { [key: string]: unknown }[],
          metadata: {
            ...(file.metadata as { [key: string]: unknown } || {}),
            batchId,
            reprocess_reason: reason,
            reprocess_result: result.status,
          } as { [key: string]: unknown },
        })
        .eq('id', file.id);

      results.processed_files++;
      if (result.status === 'completed') {
        results.successful++;
      } else {
        results.failed++;
      }

    } catch (error) {
      console.error(`Error processing file ${file.id}:`, error);
      results.processed_files++;
      results.failed++;
      results.errors.push({
        file_id: file.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Log batch completion
  console.log('Batch processing completed:', results);

  // Optionally store batch results
  // await supabase.from('batch_processing_logs').insert(results);
}
