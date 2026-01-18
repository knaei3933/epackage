/**
 * Validation Schemas
 *
 * Zodを使用した共通検証スキーマ
 * 全APIルートで一貫した入力検証を提供
 *
 * @module lib/validation-schemas
 */

import { z } from 'zod';

// =====================================================
// Primitive Schemas
// =====================================================

/**
 * UUID v4スキーマ
 */
export const uuidSchema = z.string().uuid({
  message: 'Invalid UUID format',
});

/**
 * メールアドレススキーマ
 */
export const emailSchema = z.string().email({
  message: 'Invalid email address',
});

/**
 * 日本の電話番号スキーマ
 *
 * 携帯: 090-1234-5678, 09012345678
 * 固定: 03-1234-5678, 0312345678
 */
export const phoneSchema = z
  .string()
  .regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})$/, {
    message: 'Invalid phone number format (e.g., 090-1234-5678 or 03-1234-5678)',
  });

/**
 * 郵便番号スキーマ（日本）
 *
 * フォーマット: 123-4567 または 1234567
 */
export const postalCodeSchema = z
  .string()
  .regex(/^\d{3}-\d{4}$|^\d{7}$/, {
    message: 'Invalid postal code format (e.g., 123-4567)',
  });

/**
 * URLスキーマ
 */
export const urlSchema = z.string().url({
  message: 'Invalid URL format',
});

/**
 * 日付スキーマ（ISO 8601）
 */
export const dateSchema = z.string().datetime({
  message: 'Invalid datetime format (ISO 8601 required)',
});

/**
 * ブール値スキーマ（文字列から変換）
 */
export const booleanSchema = z
  .union([z.boolean(), z.string()])
  .transform((val) => {
    if (typeof val === 'boolean') return val;
    return val === 'true' || val === '1';
  });

/**
 * 数値スキーマ（文字列から変換）
 */
export const numberSchema = z
  .union([z.number(), z.string()])
  .transform((val) => {
    if (typeof val === 'number') return val;
    const num = parseFloat(val);
    if (isNaN(num)) {
      throw new Error('Invalid number format');
    }
    return num;
  });

// =====================================================
// Pagination Schemas
// =====================================================

/**
 * ページネーションパラメータスキーマ
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * ページネーション結果型
 */
export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * ページネーションメタデータスキーマ
 */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

/**
 * ページネーションメタデータ生成
 */
export function createPaginationMeta(params: PaginationParams, total: number) {
  const totalPages = Math.ceil(total / params.limit);

  return paginationMetaSchema.parse({
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasNext: params.page < totalPages,
    hasPrev: params.page > 1,
  });
}

// =====================================================
// Common Entity Schemas
// =====================================================

/**
 * ユーザーロールスキーマ
 */
export const userRoleSchema = z.enum(['ADMIN', 'MEMBER']);

/**
 * ユーザーステータススキーマ
 */
export const userStatusSchema = z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED']);

/**
 * ビジネスタイプスキーマ
 */
export const businessTypeSchema = z.enum(['CORPORATION', 'SOLE_PROPRIETOR']);

/**
 * 都道府県スキーマ
 */
export const prefectureSchema = z.enum([
  '北海道',
  '青森県',
  '岩手県',
  '宮城県',
  '秋田県',
  '山形県',
  '福島県',
  '茨城県',
  '栃木県',
  '群馬県',
  '埼玉県',
  '千葉県',
  '東京都',
  '神奈川県',
  '新潟県',
  '富山県',
  '石川県',
  '福井県',
  '山梨県',
  '長野県',
  '岐阜県',
  '静岡県',
  '愛知県',
  '三重県',
  '滋賀県',
  '京都府',
  '大阪府',
  '兵庫県',
  '奈良県',
  '和歌山県',
  '鳥取県',
  '島根県',
  '岡山県',
  '広島県',
  '山口県',
  '徳島県',
  '香川県',
  '愛媛県',
  '高知県',
  '福岡県',
  '佐賀県',
  '長崎県',
  '熊本県',
  '大分県',
  '宮崎県',
  '鹿児島県',
  '沖縄県',
]);

// =====================================================
// Database Schemas
// =====================================================

/**
 * SQLクエリ安全スキーマ
 *
 * 危険なSQLキーワードを検出
 */
export const sqlQuerySchema = z.object({
  query: z
    .string()
    .max(10000, { message: 'Query too long (max 10000 characters)' })
    .refine(
      (q) => {
        const upperQuery = q.toUpperCase();
        const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE'];
        return !dangerousKeywords.some((kw) => upperQuery.includes(kw));
      },
      { message: 'Dangerous SQL keyword detected' }
    )
    .refine(
      (q) => {
        const injectionPatterns = [/--/, /\/\*/, /\*\//, /;\s*DROP/i, /;\s*DELETE/i];
        return !injectionPatterns.some((pattern) => pattern.test(q));
      },
      { message: 'Invalid SQL pattern detected' }
    ),
  params: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).default([]),
});

/**
 * SQLクエリパラメータ型
 */
export type SqlQueryParams = z.infer<typeof sqlQuerySchema>;

// =====================================================
// API Request Schemas
// =====================================================

/**
 * 見積作成リクエストスキーマ
 */
export const createQuotationSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required').max(200),
  customer_email: emailSchema,
  customer_phone: phoneSchema.optional(),
  subtotal_amount: z.number().nonnegative(),
  tax_amount: z.number().nonnegative(),
  total_amount: z.number().nonnegative(),
  notes: z.string().max(2000).optional(),
  valid_until: dateSchema,
  items: z.array(
    z.object({
      product_name: z.string().min(1).max(500),
      category: z.string().optional(),
      quantity: z.number().int().positive(),
      unit_price: z.number().nonnegative(),
      total_price: z.number().nonnegative(),
      specifications: z.string().max(2000).optional(),
      notes: z.string().max(1000).optional(),
    })
  ).min(1, 'At least one item is required'),
});

/**
 * 注文作成リクエストスキーマ
 */
export const createOrderSchema = z.object({
  quotation_id: uuidSchema.optional(),
  customer_name: z.string().min(1).max(200),
  customer_email: emailSchema,
  customer_phone: phoneSchema.optional(),
  total_amount: z.number().nonnegative(),
  notes: z.string().max(2000).optional(),
  requested_delivery_date: dateSchema.optional(),
  shipping_address: z.object({
    postal_code: postalCodeSchema,
    prefecture: prefectureSchema,
    city: z.string().min(1).max(100),
    addressLine1: z.string().min(1).max(200),
    addressLine2: z.string().max(200).optional(),
    company: z.string().max(200).optional(),
    contactName: z.string().min(1).max(100),
    phone: phoneSchema,
  }),
  billing_address: z.object({
    postal_code: postalCodeSchema,
    prefecture: prefectureSchema,
    city: z.string().min(1).max(100),
    addressLine1: z.string().min(1).max(200),
    addressLine2: z.string().max(200).optional(),
    company: z.string().max(200).optional(),
    contactName: z.string().min(1).max(100),
    phone: phoneSchema,
  }),
});

// =====================================================
// Validation Helpers
// =====================================================

/**
 * Zodスキーマ検証ヘルパー
 *
 * @param schema - Zodスキーマ
 * @param data - 検証するデータ
 * @returns 検証結果
 *
 * @example
 * ```typescript
 * const result = safeParse(uuidSchema, userId);
 * if (!result.success) {
 *   return validationErrorResponse('Invalid user ID', result.error.errors);
 * }
 * const id = result.data; // string (UUID)
 * ```
 */
export function safeParse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.SafeParseSuccess<z.infer<T>> | z.SafeParseError<z.infer<T>> {
  return schema.safeParse(data);
}

/**
 * Zodスキーマ検証（エラーを投げる）
 *
 * @param schema - Zodスキーマ
 * @param data - 検証するデータ
 * @returns 検証されたデータ
 * @throws {z.ZodError} 検証失敗時
 */
export function parse<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> {
  return schema.parse(data);
}

/**
 * リクエストボディ検証ラッパー
 *
 * @param schema - Zodスキーマ
 * @returns リクエストボディ検証関数
 *
 * @example
 * ```typescript
 * const validateQuotation = validateRequestBody(createQuotationSchema);
 *
 * export async function POST(request: NextRequest) {
 *   const bodyResult = await validateQuotation(request);
 *   if (!bodyResult.success) {
 *     return validationErrorResponse('Invalid request', bodyResult.error.errors);
 *   }
 *   const data = bodyResult.data;
 *   // ...
 * }
 * ```
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  schema: T,
  request: Request
): Promise<z.SafeParseSuccess<z.infer<T>> | z.SafeParseError<z.infer<T>>> {
  try {
    const body = await request.json();
    return schema.safeParse(body);
  } catch (error) {
    return {
      success: false,
      error: new z.ZodError(
        [
          {
            code: z.ZodIssueCode.custom,
            path: [],
            message: 'Invalid JSON body',
          },
        ] as const
      ),
    } as z.SafeParseError<z.infer<T>>;
  }
}

// =====================================================
// Type Exports
// =====================================================

/**
 * 見積作成リクエスト型
 */
export type CreateQuotationRequest = z.infer<typeof createQuotationSchema>;

/**
 * 注文作成リクエスト型
 */
export type CreateOrderRequest = z.infer<typeof createOrderSchema>;

/**
 * ページネーション型
 */
export type Pagination = z.infer<typeof paginationSchema>;

/**
 * ページネーションメタデータ型
 */
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
