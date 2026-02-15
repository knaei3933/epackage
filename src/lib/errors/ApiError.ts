/**
 * API Error Class
 *
 * API関連のエラーを表現するクラス
 * @module lib/errors/ApiError
 */

import { AppError, ErrorCode, ErrorSeverity } from './AppError';

/**
 * HTTPステータスコード
 */
export enum HttpStatus {
  // クライアントエラー (4xx)
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // サーバーエラー (5xx)
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * APIエラークラス
 */
export class ApiError extends AppError {
  public readonly httpStatus: HttpStatus;

  constructor(
    message: string,
    httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    code: ErrorCode = ErrorCode.API_REQUEST_FAILED,
    context?: Record<string, unknown>,
    originalError?: Error
  ) {
    const severity = getSeverityFromHttpStatus(httpStatus);
    super(message, code, httpStatus, severity, true, context, originalError);
    this.httpStatus = httpStatus;
  }

  /**
   * HTTPステータスコードからエラーを生成
   */
  static fromHttpStatus(
    httpStatus: HttpStatus,
    message?: string,
    context?: Record<string, unknown>
  ): ApiError {
    const defaultMessage = getDefaultMessageForStatus(httpStatus);
    const code = getErrorCodeFromStatus(httpStatus);

    return new ApiError(message || defaultMessage, httpStatus, code, context);
  }

  /**
   * 400 Bad Requestエラー
   */
  static badRequest(message: string = 'リクエストが正しくありません。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.BAD_REQUEST, ErrorCode.INVALID_INPUT, context);
  }

  /**
   * 401 Unauthorizedエラー
   */
  static unauthorized(message: string = '認証が必要です。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, context);
  }

  /**
   * 403 Forbiddenエラー
   */
  static forbidden(message: string = 'この操作は許可されていません。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.FORBIDDEN, ErrorCode.PERMISSION_DENIED, context);
  }

  /**
   * 404 Not Foundエラー
   */
  static notFound(message: string = 'リソースが見つかりません。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND, context);
  }

  /**
   * 409 Conflictエラー
   */
  static conflict(message: string = 'リソースが競合しています。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS, context);
  }

  /**
   * 422 Unprocessable Entityエラー
   */
  static validationError(message: string = '入力内容を確認してください。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_ERROR, context);
  }

  /**
   * 429 Too Many Requestsエラー
   */
  static rateLimit(message: string = 'リクエスト回数の制限を超えました。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.TOO_MANY_REQUESTS, ErrorCode.API_RATE_LIMIT, context);
  }

  /**
   * 500 Internal Server Errorエラー
   */
  static internal(message: string = 'サーバーエラーが発生しました。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.API_REQUEST_FAILED, context);
  }

  /**
   * 503 Service Unavailableエラー
   */
  static unavailable(message: string = 'サービスを利用できません。', context?: Record<string, unknown>): ApiError {
    return new ApiError(message, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.EXTERNAL_SERVICE_ERROR, context);
  }
}

/**
 * HTTPステータスコードから严重度を取得
 */
function getSeverityFromHttpStatus(status: HttpStatus): ErrorSeverity {
  if (status >= 500) return ErrorSeverity.HIGH;
  if (status >= 400) return ErrorSeverity.MEDIUM;
  return ErrorSeverity.LOW;
}

/**
 * HTTPステータスコードからエラーコードを取得
 */
function getErrorCodeFromStatus(status: HttpStatus): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ErrorCode.INVALID_INPUT;
    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ErrorCode.PERMISSION_DENIED;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return ErrorCode.ALREADY_EXISTS;
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ErrorCode.VALIDATION_ERROR;
    case HttpStatus.TOO_MANY_REQUESTS:
      return ErrorCode.API_RATE_LIMIT;
    default:
      return ErrorCode.API_REQUEST_FAILED;
  }
}

/**
 * HTTPステータスコードのデフォルトメッセージ
 */
function getDefaultMessageForStatus(status: HttpStatus): string {
  const messages: Record<HttpStatus, string> = {
    [HttpStatus.BAD_REQUEST]: 'リクエストが正しくありません。',
    [HttpStatus.UNAUTHORIZED]: '認証が必要です。',
    [HttpStatus.FORBIDDEN]: 'この操作は許可されていません。',
    [HttpStatus.NOT_FOUND]: 'リソースが見つかりません。',
    [HttpStatus.METHOD_NOT_ALLOWED]: 'このメソッドは許可されていません。',
    [HttpStatus.CONFLICT]: 'リソースが競合しています。',
    [HttpStatus.UNPROCESSABLE_ENTITY]: '入力内容を確認してください。',
    [HttpStatus.TOO_MANY_REQUESTS]: 'リクエスト回数の制限を超えました。',
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'サーバーエラーが発生しました。',
    [HttpStatus.NOT_IMPLEMENTED]: 'この機能は実装されていません。',
    [HttpStatus.BAD_GATEWAY]: '外部サービスエラーが発生しました。',
    [HttpStatus.SERVICE_UNAVAILABLE]: 'サービスを利用できません。',
    [HttpStatus.GATEWAY_TIMEOUT]: '外部サービスがタイムアウトしました。',
  };

  return messages[status] || 'エラーが発生しました。';
}
