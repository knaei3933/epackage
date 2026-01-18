/**
 * Custom Error Types
 *
 * アプリケーション固有のエラータイプ定義
 * エラーハンドリングとユーザーフレンドリーなエラーメッセージの提供
 *
 * @module types/errors
 */

// =====================================================
// Base Error Types
// =====================================================

/**
 * Base Application Error
 * - 全てのカスタムエラーの基底クラス
 * - エラー追跡用のメタデータを含む
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public userMessage?: string,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * ユーザー向けのエラーメッセージを取得
   */
  getUserMessage(): string {
    return this.userMessage || this.message;
  }

  /**
   * エラー情報をJSON形式でシリアライズ
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      metadata: this.metadata,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

// =====================================================
// Network Errors
// =====================================================

/**
 * Network Connection Error
 * - ネットワーク接続の問題
 * - APIエンドポイントへの到達失敗
 */
export class NetworkError extends AppError {
  constructor(
    message: string = 'ネットワーク接続エラーが発生しました',
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      'NETWORK_ERROR',
      0, // Fetch API doesn't set status on network errors
      'ネットワーク接続を確認してください。もう一度お試しください。',
      metadata
    );
  }
}

/**
 * API Request Error
 * - APIリクエストの失敗
 * - HTTPステータスコードを含む
 */
export class APIError extends AppError {
  constructor(
    message: string,
    public statusCode: number = 500,
    public response?: Response,
    metadata?: Record<string, unknown>
  ) {
    const userMessage = getAPIUserMessage(statusCode);
    super(message, 'API_ERROR', statusCode, userMessage, {
      ...metadata,
      status: statusCode,
      url: response?.url,
    });
  }
}

/**
 * Timeout Error
 * - リクエストタイムアウト
 */
export class TimeoutError extends AppError {
  constructor(
    timeoutMs: number,
    metadata?: Record<string, unknown>
  ) {
    super(
      `Request timeout after ${timeoutMs}ms`,
      'TIMEOUT_ERROR',
      408,
      'リクエストがタイムアウトしました。もう一度お試しください。',
      { ...metadata, timeoutMs }
    );
  }
}

// =====================================================
// Authentication & Authorization Errors
// =====================================================

/**
 * Authentication Error
 * - 認証失敗
 * - セッション切れ
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = '認証に失敗しました',
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      'AUTH_ERROR',
      401,
      'ログインが必要です。再度サインインしてください。',
      metadata
    );
  }
}

/**
 * Authorization Error
 * - 権限不足
 * - アクセス拒否
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = '権限がありません',
    requiredRole?: string,
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      'AUTHORIZATION_ERROR',
      403,
      'この操作を実行する権限がありません。',
      { ...metadata, requiredRole }
    );
  }
}

/**
 * Session Expired Error
 * - セッション有効期限切れ
 */
export class SessionExpiredError extends AuthenticationError {
  constructor(metadata?: Record<string, unknown>) {
    super(
      'セッションの有効期限が切れました',
      { ...metadata, expired: true }
    );
    this.code = 'SESSION_EXPIRED';
    this.userMessage = 'セッションの有効期限が切れました。再度サインインしてください。';
  }
}

// =====================================================
// Validation Errors
// =====================================================

/**
 * Validation Error
 * - 入力検証失敗
 * - 複数のフィールドエラーを含む
 */
export class ValidationError extends AppError {
  constructor(
    message: string = '入力内容を確認してください',
    public fields?: Record<string, string[]>,
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      400,
      '入力内容に誤りがあります。確認してください。',
      { ...metadata, fields }
    );
  }

  /**
   * フィールドごとのエラーメッセージを取得
   */
  getFieldErrors(fieldName: string): string[] | undefined {
    return this.fields?.[fieldName];
  }

  /**
   * 全てのフィールドエラーをフラット化
   */
  getAllFieldErrors(): string[] {
    if (!this.fields) return [];
    return Object.values(this.fields).flat();
  }
}

// =====================================================
// Not Found Errors
// =====================================================

/**
 * Resource Not Found Error
 * - リソースが存在しない
 */
export class NotFoundError extends AppError {
  constructor(
    resourceType: string,
    identifier?: string,
    metadata?: Record<string, unknown>
  ) {
    const message = identifier
      ? `${resourceType} (ID: ${identifier}) が見つかりません`
      : `${resourceType} が見つかりません`;

    super(
      message,
      'NOT_FOUND',
      404,
      '要求されたリソースが見つかりません。',
      { ...metadata, resourceType, identifier }
    );
  }
}

/**
 * Page Not Found Error
 * - ページが存在しない
 */
export class PageNotFoundError extends NotFoundError {
  constructor(pathname: string, metadata?: Record<string, unknown>) {
    super('ページ', pathname, metadata);
    this.code = 'PAGE_NOT_FOUND';
    this.userMessage = 'ページが見つかりません。URLを確認してください。';
  }
}

// =====================================================
// Business Logic Errors
// =====================================================

/**
 * Business Rule Violation Error
 * - ビジネスルール違反
 */
export class BusinessRuleError extends AppError {
  constructor(
    message: string,
    public rule: string,
    userMessage?: string,
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      'BUSINESS_RULE_ERROR',
      400,
      userMessage || message,
      { ...metadata, rule }
    );
  }
}

/**
 * Conflict Error
 * - リソースの競合
 * - 重複作成の試み
 */
export class ConflictError extends AppError {
  constructor(
    message: string = 'リソースが競合しています',
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      'CONFLICT_ERROR',
      409,
      'この操作は競合しているため実行できません。',
      metadata
    );
  }
}

// =====================================================
// File Upload Errors
// =====================================================

/**
 * File Upload Error
 * - ファイルアップロード失敗
 */
export class FileUploadError extends AppError {
  constructor(
    message: string,
    public fileName?: string,
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      'FILE_UPLOAD_ERROR',
      400,
      'ファイルのアップロードに失敗しました。もう一度お試しください。',
      { ...metadata, fileName }
    );
  }
}

/**
 * File Size Limit Error
 * - ファイルサイズ超過
 */
export class FileSizeLimitError extends FileUploadError {
  constructor(
    maxSize: number,
    fileName?: string
  ) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    super(
      `File size exceeds ${maxSizeMB}MB limit`,
      fileName,
      { maxSize, maxSizeMB }
    );
    this.code = 'FILE_SIZE_LIMIT';
    this.userMessage = `ファイルサイズは${maxSizeMB}MB以下にしてください。`;
  }
}

/**
 * Invalid File Type Error
 * - 不正なファイルタイプ
 */
export class InvalidFileTypeError extends FileUploadError {
  constructor(
    allowedTypes: string[],
    actualType?: string,
    fileName?: string
  ) {
    super(
      `Invalid file type: ${actualType}`,
      fileName,
      { allowedTypes, actualType }
    );
    this.code = 'INVALID_FILE_TYPE';
    this.userMessage = `このファイルタイプは許可されていません。`;
  }
}

// =====================================================
// Database Errors
// =====================================================

/**
 * Database Error
 * - データベース操作失敗
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public query?: string,
    metadata?: Record<string, unknown>
  ) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      'データベースエラーが発生しました。しばらく待ってからもう一度お試しください。',
      { ...metadata, query }
    );
  }
}

/**
 * Constraint Violation Error
 * - 制約違反
 */
export class ConstraintViolationError extends DatabaseError {
  constructor(
    constraint: string,
    metadata?: Record<string, unknown>
  ) {
    super(
      `Database constraint violation: ${constraint}`,
      undefined,
      { ...metadata, constraint }
    );
    this.code = 'CONSTRAINT_VIOLATION';
    this.userMessage = 'この操作は制約違反のため実行できません。';
  }
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * HTTPステータスコードに基づくユーザーメッセージ
 */
function getAPIUserMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: 'リクエスト内容に誤りがあります。',
    401: 'ログインが必要です。',
    403: 'この操作を実行する権限がありません。',
    404: '要求されたリソースが見つかりません。',
    408: 'リクエストがタイムアウトしました。',
    409: 'この操作は競合しているため実行できません。',
    429: 'リクエストが多すぎます。しばらく待ってからお試しください。',
    500: 'サーバーエラーが発生しました。',
    502: '外部サービスでエラーが発生しました。',
    503: 'サービス一時停止中です。しばらく待ってからお試しください。',
    504: 'リクエストがタイムアウトしました。',
  };

  return messages[statusCode] || 'エラーが発生しました。もう一度お試しください。';
}

/**
 * エラーがAppErrorのインスタンスかどうかを判定
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 任意のエラーをAppErrorに変換
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      500,
      '予期しないエラーが発生しました。'
    );
  }

  if (typeof error === 'string') {
    return new AppError(error, 'UNKNOWN_ERROR', 500);
  }

  return new AppError(
    '不明なエラーが発生しました',
    'UNKNOWN_ERROR',
    500,
    '予期しないエラーが発生しました。'
  );
}

/**
 * エラーコードに基づくエラータイプ判定
 */
export function getErrorTypeFromCode(code: string): string {
  const typeMap: Record<string, string> = {
    NETWORK_ERROR: 'network',
    API_ERROR: 'api',
    TIMEOUT_ERROR: 'timeout',
    AUTH_ERROR: 'authentication',
    AUTHORIZATION_ERROR: 'authorization',
    SESSION_EXPIRED: 'session',
    VALIDATION_ERROR: 'validation',
    NOT_FOUND: 'not_found',
    PAGE_NOT_FOUND: 'not_found',
    BUSINESS_RULE_ERROR: 'business',
    CONFLICT_ERROR: 'conflict',
    FILE_UPLOAD_ERROR: 'file',
    FILE_SIZE_LIMIT: 'file',
    INVALID_FILE_TYPE: 'file',
    DATABASE_ERROR: 'database',
    CONSTRAINT_VIOLATION: 'database',
  };

  return typeMap[code] || 'unknown';
}

/**
 * エラーログ用のシリアライズ
 */
export function serializeError(error: unknown): {
  type: string;
  code: string;
  message: string;
  userMessage: string;
  statusCode: number;
  metadata?: Record<string, unknown>;
} {
  const appError = toAppError(error);
  return {
    type: getErrorTypeFromCode(appError.code),
    code: appError.code,
    message: appError.message,
    userMessage: appError.getUserMessage(),
    statusCode: appError.statusCode,
    metadata: appError.metadata,
  };
}
