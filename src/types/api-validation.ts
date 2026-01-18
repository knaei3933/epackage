/**
 * API Validation Schemas
 *
 * API入力検証用Zodスキーマ
 * - Request body validation
 * - Response type safety
 * - Japanese error messages
 *
 * @module types/api-validation
 */

import { z } from 'zod';

// ============================================================
// Helper Types
// ============================================================

/**
 * UUID v4 validation regex
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * URL validation with protocol requirement
 */
const URL_SCHEMA = z.string().url({ message: '有効なURLを入力してください。' });

// ============================================================
// Order Comments API Schemas
// ============================================================

/**
 * Valid comment types for order comments
 */
export const COMMENT_TYPES = [
  'general',
  'production',
  'shipping',
  'billing',
  'correction',
  'internal',
] as const;

/**
 * Create Comment Request Schema
 * POST /api/member/orders/[id]/comments
 */
export const createCommentSchema = z.object({
  content: z.string({
    required_error: 'コメントを入力してください。',
    invalid_type_error: 'コメントは文字列である必要があります。',
  })
    .min(1, { message: 'コメントを入力してください。' })
    .max(5000, { message: 'コメントは5000文字以内で入力してください。' })
    .trim()
    .refine(
      (val) => val.length > 0,
      { message: 'コメントを入力してください。' }
    ),

  comment_type: z.enum(COMMENT_TYPES, {
    errorMap: () => ({ message: '無効なコメントタイプです。' }),
  }).optional().default('general'),

  parent_comment_id: z.string({
    invalid_type_error: '親コメントIDは文字列である必要があります。',
  })
    .regex(UUID_REGEX, { message: '無効な親コメントIDです。' })
    .optional(),

  attachments: z.array(
    URL_SCHEMA,
    { errorMap: () => ({ message: '添付ファイルは有効なURLである必要があります。' }) }
  )
    .max(10, { message: '添付ファイルは最大10個までです。' })
    .optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// ============================================================
// Customer Approval API Schemas
// ============================================================

/**
 * Valid approval statuses
 */
export const APPROVAL_STATUSES = [
  'approved',
  'rejected',
] as const;

/**
 * Update Approval Request Schema
 * PATCH /api/customer/orders/[id]/approvals/[requestId]
 */
export const updateApprovalSchema = z.object({
  status: z.enum(APPROVAL_STATUSES, {
    errorMap: () => ({ message: '無効なステータスです。' }),
  }),

  response_notes: z.string({
    invalid_type_error: 'レスポンスノートは文字列である必要があります。',
  })
    .max(2000, { message: 'レスポンスノートは2000文字以内で入力してください。' })
    .trim()
    .optional(),
});

export type UpdateApprovalInput = z.infer<typeof updateApprovalSchema>;

// ============================================================
// Error Response Types
// ============================================================

/**
 * Validation error response format
 */
export interface ValidationErrorResponse {
  success: false;
  error: string;
  errorEn: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

/**
 * Create a validation error response from Zod errors
 */
export function createValidationErrorResponse(
  zodError: z.ZodError
): ValidationErrorResponse {
  const errors = zodError.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message || '無効な値です。',
  }));

  return {
    success: false,
    error: '入力値の検証に失敗しました。',
    errorEn: 'Validation failed',
    errors,
  };
}

// ============================================================
// Validation Helpers
// ============================================================

/**
 * Safely parse and validate request body
 * Returns { data, error } - data is valid if error is null
 */
export function safeParseRequestBody<T extends z.ZodType>(
  schema: T,
  body: unknown
): {
  data?: z.infer<T>;
  error?: ValidationErrorResponse;
} {
  const result = schema.safeParse(body);

  if (result.success) {
    return { data: result.data };
  }

  return {
    error: createValidationErrorResponse(result.error),
  };
}

// ============================================================
// File Upload Validation Schemas
// ============================================================

/**
 * Valid file upload categories
 */
export const FILE_CATEGORIES = [
  'design',
  'specification',
  'contract',
  'invoice',
  'other',
] as const;

/**
 * File metadata validation schema
 */
export const fileMetadataSchema = z.object({
  file_name: z.string()
    .min(1, { message: 'ファイル名を入力してください。' })
    .max(255, { message: 'ファイル名は255文字以内で入力してください。' })
    .trim(),

  file_type: z.string()
    .min(1, { message: 'ファイルタイプを入力してください。' })
    .max(100, { message: 'ファイルタイプは100文字以内で入力してください。' }),

  file_size_bytes: z.number()
    .int({ message: 'ファイルサイズは整数である必要があります。' })
    .positive({ message: 'ファイルサイズは正の数である必要があります。' })
    .max(10 * 1024 * 1024, { message: 'ファイルサイズは10MB以下である必要があります。' }),

  file_category: z.enum(FILE_CATEGORIES, {
    errorMap: () => ({ message: '無効なファイルカテゴリです。' }),
  }).optional().default('other'),
});

export type FileMetadataInput = z.infer<typeof fileMetadataSchema>;

// ============================================================
// Pagination Schemas
// ============================================================

/**
 * Pagination parameters schema
 */
export const paginationParamsSchema = z.object({
  page: z.coerce.number()
    .int({ message: 'ページ番号は整数である必要があります。' })
    .positive({ message: 'ページ番号は正の数である必要があります。' })
    .optional().default(1),

  limit: z.coerce.number()
    .int({ message: '制限数は整数である必要があります。' })
    .positive({ message: '制限数は正の数である必要があります。' })
    .max(100, { message: '制限数は最大100です。' })
    .optional().default(20),

  sort_by: z.string()
    .max(50, { message: 'ソート項目は50文字以内で入力してください。' })
    .optional(),

  sort_order: z.enum(['asc', 'desc'], {
    errorMap: () => ({ message: '無効なソート順序です。' }),
  }).optional().default('desc'),
});

export type PaginationParams = z.infer<typeof paginationParamsSchema>;

// ============================================================
// Search Schemas
// ============================================================

/**
 * Search query parameters schema
 */
export const searchParamsSchema = z.object({
  q: z.string()
    .min(1, { message: '検索キーワードを入力してください。' })
    .max(200, { message: '検索キーワードは200文字以内で入力してください。' })
    .trim(),

  filters: z.record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),

  ...paginationParamsSchema.shape,
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// ============================================================
// Exports
// ============================================================

export default {
  // Comments
  createCommentSchema,

  // Approvals
  updateApprovalSchema,

  // Files
  fileMetadataSchema,

  // Pagination
  paginationParamsSchema,

  // Search
  searchParamsSchema,

  // Helpers
  createValidationErrorResponse,
  safeParseRequestBody,
};
