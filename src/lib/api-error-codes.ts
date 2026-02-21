/**
 * API Error Code Definitions
 *
 * APIエラーコード定数
 * Standardized error codes and messages across the application
 *
 * @module lib/api-error-codes
 */

/**
 * Design Revision API Error Codes
 * デザイン改訂APIエラーコード
 */
export const DESIGN_REVISION_ERRORS = {
  MISSING_REJECTION_REASON: {
    code: 'DR-001',
    message: '却下理由を入力してください。',
    messageEn: 'Rejection reason is required.',
    status: 400,
  },
  INVALID_REVISION_STATUS: {
    code: 'DR-002',
    message: '無効なステータスです。',
    messageEn: 'Invalid status value.',
    status: 400,
  },
  REVISION_NOT_PENDING: {
    code: 'DR-003',
    message: 'この改訂はすでに処理されています。',
    messageEn: 'Revision is not in pending status.',
    status: 400,
  },
  REVISION_NOT_FOUND: {
    code: 'DR-004',
    message: 'デザイン改訂が見つかりません。',
    messageEn: 'Design revision not found.',
    status: 404,
  },
  INVALID_FILE_FORMAT: {
    code: 'DR-005',
    message: '対応していないファイル形式です。',
    messageEn: 'File format not supported.',
    status: 400,
  },
  FILE_UPLOAD_FAILED: {
    code: 'DR-006',
    message: 'ファイルのアップロードに失敗しました。',
    messageEn: 'File upload failed.',
    status: 500,
  },
  NO_CURRENT_SUBMISSION: {
    code: 'DR-007',
    message: '現在の校正データが見つかりません。',
    messageEn: 'No current submission found.',
    status: 404,
  },
  EMAIL_SEND_FAILED: {
    code: 'DR-008',
    message: '通知メールの送信に失敗しました。',
    messageEn: 'Failed to send notification email.',
    status: 500,
  },
  UNAUTHORIZED_ACCESS: {
    code: 'DR-009',
    message: 'アクセス権限がありません。',
    messageEn: 'Unauthorized access.',
    status: 403,
  },
  MISSING_REVISION_ID: {
    code: 'DR-010',
    message: '改訂IDを指定してください。',
    messageEn: 'Revision ID is required.',
    status: 400,
  },
} as const;

/**
 * General API Error Codes
 * 汎用APIエラーコード
 */
export const GENERAL_API_ERRORS = {
  UNAUTHORIZED: {
    code: 'GEN-001',
    message: '認証されていません。',
    messageEn: 'Unauthorized.',
    status: 401,
  },
  FORBIDDEN: {
    code: 'GEN-002',
    message: 'アクセス権限がありません。',
    messageEn: 'Forbidden.',
    status: 403,
  },
  NOT_FOUND: {
    code: 'GEN-003',
    message: 'リソースが見つかりません。',
    messageEn: 'Resource not found.',
    status: 404,
  },
  INTERNAL_ERROR: {
    code: 'GEN-500',
    message: '予期しないエラーが発生しました。',
    messageEn: 'Internal server error.',
    status: 500,
  },
  INVALID_REQUEST: {
    code: 'GEN-400',
    message: 'リクエストが無効です。',
    messageEn: 'Invalid request.',
    status: 400,
  },
} as const;

/**
 * Type guard for error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Create a standardized error response
 *
 * @param error - Error object from error constants
 * @param details - Additional error details
 * @returns Formatted error response
 */
export function createErrorResponse(
  error: { code: string; message: string; status: number },
  details?: unknown
): { response: ApiErrorResponse; status: number } {
  return {
    response: {
      success: false,
      error: error.message,
      code: error.code,
      details,
    },
    status: error.status,
  };
}

/**
 * Legacy error code mapping (for backward compatibility)
 */
export const API_ERROR_CODES = {
  MISSING_REJECTION_REASON: {
    message: '却下理由を入力してください。',
    messageEn: 'Rejection reason is required.',
    status: 400,
  },
  INVALID_FILE_FORMAT: {
    message: '対応していないファイル形式です。',
    messageEn: 'File format not supported.',
    status: 400,
  },
  NO_CURRENT_SUBMISSION: {
    message: '現在の校正データが見つかりません。',
    messageEn: 'No current submission found.',
    status: 404,
  },
  REVISION_NOT_PENDING: {
    message: 'この改訂はすでに処理されています。',
    messageEn: 'Revision is not in pending status.',
    status: 400,
  },
  EMAIL_SEND_FAILED: {
    message: '通知メールの送信に失敗しました。',
    messageEn: 'Failed to send notification email.',
    status: 500,
  },
} as const;
