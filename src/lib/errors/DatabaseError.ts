/**
 * Database Error Class
 *
 * データベース関連のエラーを表現するクラス
 * @module lib/errors/DatabaseError
 */

import { AppError, ErrorCode, ErrorSeverity } from './AppError';

/**
 * データベースエラータイプ
 */
export enum DatabaseErrorType {
  CONNECTION = 'CONNECTION',
  QUERY = 'QUERY',
  CONSTRAINT = 'CONSTRAINT',
  TRANSACTION = 'TRANSACTION',
  MIGRATION = 'MIGRATION',
  TIMEOUT = 'TIMEOUT',
}

/**
 * データベースエラークラス
 */
export class DatabaseError extends AppError {
  public readonly dbErrorType: DatabaseErrorType;
  public readonly query?: string;
  public readonly table?: string;
  public readonly constraint?: string;

  constructor(
    message: string,
    dbErrorType: DatabaseErrorType = DatabaseErrorType.QUERY,
    code: ErrorCode = ErrorCode.DATABASE_ERROR,
    context?: Record<string, unknown>,
    originalError?: Error,
    query?: string,
    table?: string,
    constraint?: string
  ) {
    const severity = dbErrorType === DatabaseErrorType.CONNECTION
      ? ErrorSeverity.CRITICAL
      : ErrorSeverity.HIGH;

    super(
      message,
      code,
      500,
      severity,
      true,
      { ...context, dbErrorType, query, table, constraint },
      originalError
    );

    this.dbErrorType = dbErrorType;
    this.query = query;
    this.table = table;
    this.constraint = constraint;
    this.name = 'DatabaseError';
  }

  /**
   * 接続エラー
   */
  static connection(message?: string, originalError?: Error): DatabaseError {
    return new DatabaseError(
      message || 'データベース接続エラーが発生しました。',
      DatabaseErrorType.CONNECTION,
      ErrorCode.DATABASE_CONNECTION_ERROR,
      undefined,
      originalError
    );
  }

  /**
   * クエリエラー
   */
  static query(message: string, query?: string, originalError?: Error): DatabaseError {
    return new DatabaseError(
      message,
      DatabaseErrorType.QUERY,
      ErrorCode.DATABASE_QUERY_ERROR,
      undefined,
      originalError,
      query
    );
  }

  /**
   * 制約違反エラー
   */
  static constraint(
    message: string,
    constraint: string,
    table?: string,
    originalError?: Error
  ): DatabaseError {
    return new DatabaseError(
      message,
      DatabaseErrorType.CONSTRAINT,
      ErrorCode.DATABASE_CONSTRAINT_ERROR,
      undefined,
      originalError,
      undefined,
      table,
      constraint
    );
  }

  /**
   * 一意制約違反
   */
  static uniqueViolation(
    field: string,
    value: string | number,
    table?: string,
    originalError?: Error
  ): DatabaseError {
    const message = `「${field}」の値「${value}」は既に使用されています。`;
    return new DatabaseError(
      message,
      DatabaseErrorType.CONSTRAINT,
      ErrorCode.ALREADY_EXISTS,
      { field, value },
      originalError,
      undefined,
      table,
      `unique_${field}`
    );
  }

  /**
   * 外部キー制約違反
   */
  static foreignKeyViolation(
    table: string,
    field: string,
    referencedTable?: string,
    originalError?: Error
  ): DatabaseError {
    const message = `関連するデータが存在しません。`;
    return new DatabaseError(
      message,
      DatabaseErrorType.CONSTRAINT,
      ErrorCode.DATABASE_CONSTRAINT_ERROR,
      { table, field, referencedTable },
      originalError,
      undefined,
      table,
      `fk_${table}_${field}`
    );
  }

  /**
   * NOT NULL制約違反
   */
  static notNullViolation(
    table: string,
    field: string,
    originalError?: Error
  ): DatabaseError {
    const message = `「${field}」は必須項目です。`;
    return new DatabaseError(
      message,
      DatabaseErrorType.CONSTRAINT,
      ErrorCode.VALIDATION_ERROR,
      { table, field },
      originalError,
      undefined,
      table,
      `not_null_${field}`
    );
  }

  /**
   * トランザクションエラー
   */
  static transaction(message: string, originalError?: Error): DatabaseError {
    return new DatabaseError(
      message,
      DatabaseErrorType.TRANSACTION,
      ErrorCode.DATABASE_ERROR,
      undefined,
      originalError
    );
  }

  /**
   * タイムアウトエラー
   */
  static timeout(query?: string, originalError?: Error): DatabaseError {
    return new DatabaseError(
      'データベースクエリがタイムアウトしました。',
      DatabaseErrorType.TIMEOUT,
      ErrorCode.API_TIMEOUT,
      undefined,
      originalError,
      query
    );
  }
}

/**
 * Supabaseエラーから変換
 */
export function fromSupabaseError(error: {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}): DatabaseError {
  const message = error.message || 'データベースエラーが発生しました。';
  const code = error.code;

  // 一意制約違反
  if (code === '23505') {
    const match = message.match(/Key \((.+?)\)=\((.+?)\)/);
    if (match) {
      return DatabaseError.uniqueViolation(match[1], match[2], undefined, new Error(message));
    }
  }

  // 外部キー制約違反
  if (code === '23503') {
    const match = message.match(/Key \((.+?)\)/);
    if (match) {
      return DatabaseError.foreignKeyViolation(undefined, match[1], undefined, new Error(message));
    }
  }

  // NOT NULL制約違反
  if (code === '23502') {
    const match = message.match(/column "(.+?)"/);
    if (match) {
      return DatabaseError.notNullViolation(undefined, match[1], new Error(message));
    }
  }

  // その他のデータベースエラー
  return new DatabaseError(
    message,
    DatabaseErrorType.QUERY,
    ErrorCode.DATABASE_QUERY_ERROR,
    { code: error.code, details: error.details, hint: error.hint },
    new Error(message)
  );
}
