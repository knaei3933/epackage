/**
 * Error Handling Module
 *
 * 統一されたエラーハンドリングシステム
 *
 * @example
 * import { ApiError, ValidationError, errorHandler } from '@/lib/errors';
 *
 * throw ApiError.notFound('注文が見つかりません。');
 * throw ValidationError.forField('email', 'メールアドレスを入力してください。');
 *
 * // API Routeで使用
 * const { response } = errorHandler.handle(error);
 * return Response.json(response, { status: response.statusCode });
 *
 * @module lib/errors
 */

export { AppError, ErrorCode, ErrorSeverity, toAppError } from './AppError';
export { ApiError, HttpStatus } from './ApiError';
export {
  ValidationError,
  RequiredFieldError,
  FormatError,
  RangeError,
  LengthError,
} from './ValidationError';
export { DatabaseError, DatabaseErrorType, fromSupabaseError } from './DatabaseError';
export {
  ErrorHandler,
  errorHandler,
  handleError,
  withErrorHandler,
  handleServerAction,
  type ErrorResponse,
  type ErrorHandlerConfig,
} from './handler';
