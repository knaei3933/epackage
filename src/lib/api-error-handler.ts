/**
 * API Error Handler
 *
 * 統一されたエラーハンドリングとエラー応答
 * 全APIルートで一貫したエラー処理を提供
 *
 * @module lib/api-error-handler
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// =====================================================
// Error Classes
// =====================================================

/**
 * HTTPステータスコード
 */
export type HttpStatus =
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500
  | 503;

/**
 * エラーコード
 */
export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CONFIG_ERROR';

/**
 * APIエラーベースクラス
 */
export class ApiError extends Error {
  constructor(
    public statusCode: HttpStatus,
    public code: ErrorCode,
    message: string,
    public details?: unknown,
    public stack?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(422, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

/**
 * 認証エラー
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentication required', details?: unknown) {
    super(401, 'UNAUTHORIZED', message, details);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 権限エラー
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', details?: unknown) {
    super(403, 'FORBIDDEN', message, details);
    this.name = 'ForbiddenError';
  }
}

/**
 * 未検出エラー
 */
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource', details?: unknown) {
    super(404, 'NOT_FOUND', `${resource} not found`, details);
    this.name = 'NotFoundError';
  }
}

/**
 * 競合エラー
 */
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', details?: unknown) {
    super(409, 'CONFLICT', message, details);
    this.name = 'ConflictError';
  }
}

/**
 * レート制限エラー
 */
export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded', details?: unknown) {
    super(429, 'RATE_LIMIT_EXCEEDED', message, details);
    this.name = 'RateLimitError';
  }
}

/**
 * データベースエラー
 */
export class DatabaseError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(500, 'DATABASE_ERROR', message, details);
    this.name = 'DatabaseError';
  }
}

/**
 * 内部エラー
 */
export class InternalError extends ApiError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(500, 'INTERNAL_ERROR', message, details);
    this.name = 'InternalError';
  }
}

// =====================================================
// Error Handlers
// =====================================================

/**
 * ZodバリデーションエラーをAPIエラーに変換
 *
 * @param error - ZodError
 * @returns ValidationError
 */
export function fromZodError(error: ZodError): ValidationError {
  const details = error.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
    code: e.code,
  }));

  return new ValidationError('Validation failed', details);
}

/**
 * エラーをAPIエラーに変換
 *
 * @param error - 未知のエラー
 * @returns ApiError
 */
export function toApiError(error: unknown): ApiError {
  // 既にApiErrorの場合
  if (error instanceof ApiError) {
    return error;
  }

  // ZodErrorの場合
  if (error instanceof ZodError) {
    return fromZodError(error);
  }

  // 標準Errorの場合
  if (error instanceof Error) {
    // スタックトレースを保存（開発モードのみ）
    const stack = process.env.NODE_ENV === 'development' ? error.stack : undefined;

    // エラーメッセージに基づいて分類
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return new ApiError(500, 'TIMEOUT_ERROR', error.message, undefined, stack);
    }

    if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      return new ApiError(500, 'NETWORK_ERROR', error.message, undefined, stack);
    }

    return new InternalError(error.message, undefined);
  }

  // プリミティブ値の場合
  if (typeof error === 'string') {
    return new InternalError(error);
  }

  // その他の場合
  return new InternalError('Unknown error occurred');
}

/**
 * エラーをHTTP応答に変換
 *
 * @param error - エラー
 * @returns NextResponse
 */
export function handleApiError(error: unknown): NextResponse {
  const apiError = toApiError(error);

  // エラーログ
  console.error('[API Error]', {
    name: apiError.name,
    code: apiError.code,
    statusCode: apiError.statusCode,
    message: apiError.message,
    details: apiError.details,
    stack: apiError.stack,
  });

  // 開発モードではスタックトレースを含める
  const shouldIncludeStack = process.env.NODE_ENV === 'development';

  return NextResponse.json(
    {
      error: {
        message: apiError.message,
        code: apiError.code,
        ...(apiError.details && { details: apiError.details }),
        ...(shouldIncludeStack && apiError.stack && { stack: apiError.stack }),
      },
    },
    { status: apiError.statusCode }
  );
}

// =====================================================
// Handler Wrappers
// =====================================================

/**
 * APIハンドラーをエラーハンドリングでラップ
 *
 * @param handler - APIハンドラー関数
 * @returns ラップされたハンドラー関数
 *
 * @example
 * ```typescript
 * export const GET = withApiHandler(async (request) => {
 *   // エラーが自動的にキャッチされて処理される
 *   const data = await someOperation();
 *   return NextResponse.json(data);
 * });
 * ```
 */
export function withApiHandler<T = any>(
  handler: (request: Request) => Promise<NextResponse<T>>
): (request: Request) => Promise<NextResponse> {
  return async (request: Request): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * 非同期関数をエラーハンドリングでラップ（汎用）
 *
 * @param fn - 非同期関数
 * @returns ラップされた関数
 *
 * @example
 * ```typescript
 * const safeOperation = withErrorHandler(async () => {
 *   return await riskyOperation();
 * });
 *
 * const result = await safeOperation();
 * if (result instanceof Error) {
 *   // エラー処理
 * }
 * ```
 */
export function withErrorHandler<T, E = Error>(
  fn: () => Promise<T>
): () => Promise<T | E> {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      return error as E;
    }
  };
}

// =====================================================
// Response Helpers
// =====================================================

/**
 * エラー応答を作成
 *
 * @param statusCode - HTTPステータスコード
 * @param code - エラーコード
 * @param message - エラーメッセージ
 * @param details - 追加詳細
 * @returns NextResponse
 */
export function errorResponse(
  statusCode: HttpStatus,
  code: ErrorCode,
  message: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      error: {
        message,
        code,
        ...(details && { details }),
      },
    },
    { status: statusCode }
  );
}

/**
 * バリデーションエラー応答を作成
 */
export function validationErrorResponse(message: string, details?: unknown): NextResponse {
  return errorResponse(422, 'VALIDATION_ERROR', message, details);
}

/**
 * 未認証エラー応答を作成
 */
export function unauthorizedErrorResponse(message = 'Authentication required'): NextResponse {
  return errorResponse(401, 'UNAUTHORIZED', message);
}

/**
 * 権限エラー応答を作成
 */
export function forbiddenErrorResponse(message = 'Forbidden'): NextResponse {
  return errorResponse(403, 'FORBIDDEN', message);
}

/**
 * 未検出エラー応答を作成
 */
export function notFoundErrorResponse(resource = 'Resource'): NextResponse {
  return errorResponse(404, 'NOT_FOUND', `${resource} not found`);
}

/**
 * 競合エラー応答を作成
 */
export function conflictErrorResponse(message = 'Resource conflict'): NextResponse {
  return errorResponse(409, 'CONFLICT', message);
}

/**
 * 内部エラー応答を作成
 */
export function internalErrorResponse(message = 'Internal server error'): NextResponse {
  return errorResponse(500, 'INTERNAL_ERROR', message);
}

// =====================================================
// Logging Utilities
// =====================================================

/**
 * エラー情報をログ（詳細版）
 *
 * @param error - エラー
 * @param context - 追加コンテキスト
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const apiError = error instanceof ApiError ? error : toApiError(error);

  console.error('[Error Log]', {
    ...context,
    name: apiError.name,
    code: apiError.code,
    statusCode: apiError.statusCode,
    message: apiError.message,
    details: apiError.details,
    timestamp: new Date().toISOString(),
  });
}

/**
 * エラー情報をログ（簡易版）
 *
 * @param error - エラー
 */
export function logErrorBrief(error: unknown): void {
  const apiError = error instanceof ApiError ? error : toApiError(error);

  console.error(`[${apiError.code}] ${apiError.message}`);
}

// =====================================================
// Export for Testing
// =====================================================

/**
 * テスト用: モックエラーを作成
 *
 * @internal テスト用のみ使用
 */
export function _createMockApiError(
  statusCode: HttpStatus = 500,
  code: ErrorCode = 'INTERNAL_ERROR',
  message = 'Mock error'
): ApiError {
  return new ApiError(statusCode, code, message);
}

/**
 * テスト用: エラー応答を検証
 *
 * @internal テスト用のみ使用
 */
export function _isErrorResponse(response: NextResponse): boolean {
  const status = response.status;
  return status >= 400 && status < 600;
}
