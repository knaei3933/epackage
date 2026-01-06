/**
 * File Ingestion Workflow
 *
 * Handles file upload, validation, storage, and thumbnail generation
 * for design files in the B2B packaging system
 *
 * @module file-validator/file-ingestion
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

import type { ValidationResult } from './ai-validator';
import type { Database } from '@/types/database';

// ============================================================
// Type-safe Helper Functions
// ============================================================

/**
 * Type-safe insert helper for files table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertFile(
  supabase: ReturnType<typeof getSupabaseClient>,
  data: Database['public']['Tables']['files']['Insert']
) {
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
function updateFile(
  supabase: ReturnType<typeof getSupabaseClient>,
  fileId: string,
  data: Database['public']['Tables']['files']['Update']
) {
  return (supabase as any)
    .from('files')
    .update(data)
    .eq('id', fileId);
}

// ============================================================
// Type Definitions
// ============================================================

/**
 * File ingestion result
 */
export interface IngestionResult {
  success: boolean;
  fileId: string;
  storagePath: string;
  validationResults: ValidationResult;
  previewUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

/**
 * File ingestion options
 */
export interface IngestionOptions {
  bucket?: string;
  generatePreviews?: boolean;
  validateOnly?: boolean;
  userId: string;
  orderId?: string;
  quotationId?: string;
  workOrderId?: string;
}

/**
 * Stored file record
 */
export interface StoredFileRecord {
  id: string;
  order_id: string | null;
  quotation_id: string | null;
  work_order_id: string | null;
  uploaded_by: string;
  file_type: 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER';
  file_name: string;
  file_url: string;
  file_size: number;
  version: number;
  is_latest: boolean;
  validation_status: 'PENDING' | 'VALID' | 'INVALID';
  validation_errors: any;
  metadata: any;
}

// ============================================================
// Supabase Storage Integration
// ============================================================

/**
 * Get Supabase client
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Upload file to Supabase storage
 */
async function uploadToStorage(
  buffer: Buffer,
  fileName: string,
  bucket: string,
  path: string
): Promise<string> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: getMimeType(fileName),
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Upload thumbnail to storage
 */
async function uploadThumbnail(
  buffer: Buffer,
  fileId: string,
  bucket: string
): Promise<string> {
  const path = `thumbnails/${fileId}.jpg`;
  return uploadToStorage(buffer, `${fileId}.jpg`, bucket, path);
}

/**
 * Upload preview to storage
 */
async function uploadPreview(
  buffer: Buffer,
  fileId: string,
  bucket: string
): Promise<string> {
  const path = `previews/${fileId}.jpg`;
  return uploadToStorage(buffer, `${fileId}.jpg`, bucket, path);
}

/**
 * Get MIME type for file
 */
function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'ai':
      return 'application/postscript';
    case 'pdf':
      return 'application/pdf';
    case 'psd':
      return 'image/vnd.adobe.photoshop';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}

// ============================================================
// Database Integration
// ============================================================

/**
 * Save file record to database
 */
async function saveFileRecord(
  record: Omit<StoredFileRecord, 'id' | 'created_at'>
): Promise<StoredFileRecord> {
  const supabase = getSupabaseClient();

  const { data, error } = await insertFile(supabase, {
    id: uuidv4(),
    ...record,
    created_at: new Date().toISOString(),
    // Required fields missing from StoredFileRecord
    production_log_id: null,
    ai_extraction_status: null,
    ai_extraction_data: null,
    ai_confidence_score: null,
    ai_extraction_method: null,
    ai_extracted_at: null,
    ai_validation_errors: null,
  } as unknown as Database['public']['Tables']['files']['Insert']);

  if (error) {
    throw new Error(`Failed to save file record: ${error.message}`);
  }

  return data as StoredFileRecord;
}

/**
 * Update file validation status
 */
async function updateValidationStatus(
  fileId: string,
  status: 'PENDING' | 'VALID' | 'INVALID',
  validationErrors: any
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('files')
    // @ts-ignore - Supabase type inference issue
    .update({
      validation_status: status,
      validation_errors: validationErrors,
    })
    .eq('id', fileId);

  if (error) {
    throw new Error(`Failed to update validation status: ${error.message}`);
  }
}

// ============================================================
// Preview Generation
// ============================================================

/**
 * Generate previews for file
 */
async function generatePreviews(
  buffer: Buffer,
  fileType: 'AI' | 'PDF' | 'PSD',
  fileId: string,
  bucket: string
): Promise<{ thumbnailUrl?: string; previewUrl?: string }> {
  try {
    // Import server-side validator
    const { generateFilePreviews } = await import('./server-validator');

    const { thumbnail, preview } = await generateFilePreviews(buffer, fileType);

    const result: {
      thumbnailUrl?: string;
      previewUrl?: string;
    } = {};

    if (thumbnail) {
      result.thumbnailUrl = await uploadThumbnail(thumbnail, fileId, bucket);
    }

    if (preview) {
      result.previewUrl = await uploadPreview(preview, fileId, bucket);
    }

    return result;
  } catch (error) {
    console.error('Error generating previews:', error);
    return {};
  }
}

// ============================================================
// Main Ingestion Workflow
// ============================================================

/**
 * Ingest a design file (upload, validate, store)
 */
export async function ingestDesignFile(
  file: File | Buffer,
  fileName: string,
  options: IngestionOptions
): Promise<IngestionResult> {
  const {
    bucket = 'designs',
    generatePreviews: shouldGeneratePreviews = true,
    validateOnly = false,
    userId,
    orderId,
    quotationId,
    workOrderId,
  } = options;

  try {
    // Convert File to Buffer if necessary
    const buffer = file instanceof File
      ? Buffer.from(await file.arrayBuffer())
      : file;

    // Validate the file
    const { validateFileServer } = await import('./server-validator');
    const validationResults = await validateFileServer(buffer, fileName);

    // If validate only, return without storing
    if (validateOnly) {
      return {
        success: validationResults.valid,
        fileId: '',
        storagePath: '',
        validationResults,
      };
    }

    // Generate file ID
    const fileId = uuidv4();

    // Upload original file
    const storagePath = `${userId}/${fileId}/${fileName}`;
    const fileUrl = await uploadToStorage(buffer, fileName, bucket, storagePath);

    // Generate previews if requested
    let thumbnailUrl: string | undefined;
    let previewUrl: string | undefined;

    if (shouldGeneratePreviews) {
      const previews = await generatePreviews(
        buffer,
        validationResults.fileType,
        fileId,
        bucket
      );
      thumbnailUrl = previews.thumbnailUrl;
      previewUrl = previews.previewUrl;
    }

    // Save file record to database
    await saveFileRecord({
      order_id: orderId || null,
      quotation_id: quotationId || null,
      work_order_id: workOrderId || null,
      uploaded_by: userId,
      file_type: validationResults.fileType,
      file_name: fileName,
      file_url: fileUrl,
      file_size: buffer.length,
      version: 1,
      is_latest: true,
      validation_status: validationResults.valid ? 'VALID' : 'INVALID',
      validation_errors: {
        issues: validationResults.issues,
        warnings: validationResults.warnings,
      },
      metadata: validationResults.metadata,
    });

    return {
      success: true,
      fileId,
      storagePath: fileUrl,
      validationResults,
      previewUrl,
      thumbnailUrl,
    };
  } catch (error) {
    console.error('File ingestion error:', error);
    return {
      success: false,
      fileId: '',
      storagePath: '',
      validationResults: {
        valid: false,
        fileType: 'AI',
        fileName,
        fileSize: 0,
        issues: [],
        warnings: [],
        metadata: {},
        validatedAt: new Date().toISOString(),
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch ingest multiple files
 */
export async function ingestMultipleFiles(
  files: Array<{ file: File | Buffer; fileName: string }>,
  options: IngestionOptions
): Promise<IngestionResult[]> {
  const results: IngestionResult[] = [];

  for (const { file, fileName } of files) {
    const result = await ingestDesignFile(file, fileName, options);
    results.push(result);
  }

  return results;
}

/**
 * Re-validate an existing file
 */
export async function revalidateFile(
  fileId: string,
  userId: string
): Promise<ValidationResult> {
  const supabase = getSupabaseClient();

  // Get file record
  // @ts-ignore - Supabase type inference issue
  const { data: fileRecord, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (error || !fileRecord) {
    throw new Error('File not found');
  }

  // Download file from storage
  const bucket = 'designs';
  // @ts-ignore - fileRecord type issue
  const path = fileRecord.file_url.split('/').slice(-2).join('/');

  const { data: fileData } = await supabase.storage
    .from(bucket)
    .download(path);

  if (!fileData) {
    throw new Error('Failed to download file');
  }

  const buffer = Buffer.from(await fileData.arrayBuffer());

  // Re-validate
  const { validateFileServer } = await import('./server-validator');
  const validationResults = await validateFileServer(
    buffer,
    // @ts-ignore - fileRecord type issue
    fileRecord.file_name
  );

  // Update validation status
  await updateValidationStatus(
    fileId,
    validationResults.valid ? 'VALID' : 'INVALID',
    {
      issues: validationResults.issues,
      warnings: validationResults.warnings,
    }
  );

  return validationResults;
}

/**
 * Get file by ID
 */
export async function getFile(
  fileId: string,
  userId: string
): Promise<StoredFileRecord | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as StoredFileRecord;
}

/**
 * List files for order/quotation/work order
 */
export async function listFiles(filters: {
  orderId?: string;
  quotationId?: string;
  workOrderId?: string;
  userId?: string;
  fileType?: 'AI' | 'PDF' | 'PSD' | 'PNG' | 'JPG' | 'EXCEL' | 'OTHER';
}): Promise<StoredFileRecord[]> {
  const supabase = getSupabaseClient();

  let query = supabase
    .from('files')
    .select('*')
    .eq('is_latest', true)
    .order('created_at', { ascending: false });

  if (filters.orderId) {
    query = query.eq('order_id', filters.orderId);
  }
  if (filters.quotationId) {
    query = query.eq('quotation_id', filters.quotationId);
  }
  if (filters.workOrderId) {
    query = query.eq('work_order_id', filters.workOrderId);
  }
  if (filters.userId) {
    query = query.eq('uploaded_by', filters.userId);
  }
  if (filters.fileType) {
    query = query.eq('file_type', filters.fileType);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data as StoredFileRecord[];
}

/**
 * Delete file (soft delete by versioning)
 */
export async function deleteFile(
  fileId: string,
  userId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('files')
    // @ts-ignore - Supabase type inference issue
    .update({ is_latest: false })
    .eq('id', fileId)
    .eq('uploaded_by', userId);

  return !error;
}

// ============================================================
// Exports
// ============================================================

export default {
  ingestDesignFile,
  ingestMultipleFiles,
  revalidateFile,
  getFile,
  listFiles,
  deleteFile,
};
