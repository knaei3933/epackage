/**
 * Inquiry Attachment File Validation
 *
 * 会員お問い合わせスレッド機能の添付ファイル検証:
 * - 許可 MIME: image/jpeg, image/png, image/gif, image/webp, application/pdf
 * - 最大サイズ: 10MB（1ファイルあたり）
 * - 最大枚数: 1メッセージあたり5枚
 * - 検証内容: MIME + magic number（ファイル署名）・ファイルサイズ・拡張子
 *
 * 既存の file-validator/security-validator.ts（magic-number 検知内蔵）をラップし、
 * お問い合わせ添付用の制約を適用する。file-type ライブラリは依存関係に無いため、
 * 既存の magic-number 実装（file-type と同等の署名検証）を再利用。
 *
 * クライアント（ブラウザ File）・API（Node.js File/Buffer）共用。
 */

import {
  validateFileSecurity,
  type SecurityValidationResult,
  type SecurityError,
} from './file-validator/security-validator';

// =====================================================
// Constants（migration の inquiry-attachments バケット定義と一致）
// =====================================================

/** 1ファイルあたりの最大サイズ: 10MB（storage.buckets.file_size_limit と一致） */
export const INQUIRY_ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024;

/** 1メッセージあたりの最大添付数: 5枚 */
export const INQUIRY_ATTACHMENT_MAX_COUNT = 5;

/** 許可される MIME タイプ（storage.buckets.allowed_mime_types と一致） */
export const INQUIRY_ATTACHMENT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
] as const;

/** 添付ファイル情報（DB の attachments JSONB 要素構造に対応） */
export interface InquiryAttachmentMeta {
  /** Storage の path（{user_id}/{inquiry_id}/{message_id}/{filename}） */
  url: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
  validation_status: 'valid' | 'invalid';
}

// =====================================================
// 単一ファイル検証
// =====================================================

export interface InquiryFileValidationResult {
  valid: boolean;
  errors: string[];
  /** 検証済みの MIME タイプ（magic number から判定） */
  detectedMimeType?: string;
}

/**
 * 添付可能な File かどうかの形状判定（ブラウザ File / Node.js File 両対応）
 */
function isFileLike(
  file: unknown
): file is File & { arrayBuffer: () => Promise<ArrayBuffer> } {
  if (typeof file !== 'object' || file === null) return false;
  const f = file as { name?: unknown; size?: unknown; type?: unknown; arrayBuffer?: unknown };
  return (
    typeof f.name === 'string' &&
    typeof f.size === 'number' &&
    typeof f.arrayBuffer === 'function'
  );
}

/**
 * 1ファイルのお問い合わせ添付としての妥当性を検証
 * - MIME + magic number（ファイル署名）による偽装検知
 * - ファイルサイズ上限（10MB）
 * - 拡張子の怪しさ検知
 */
export async function validateInquiryAttachment(
  file: unknown
): Promise<InquiryFileValidationResult> {
  if (!isFileLike(file)) {
    return { valid: false, errors: ['ファイル形式が不正です（File オブジェクトが必要です）。'] };
  }

  // サイズ上限の事前チェック（arrayBuffer 展開前の高速拒否）
  if (file.size > INQUIRY_ATTACHMENT_MAX_SIZE) {
    return {
      valid: false,
      errors: [
        `ファイルサイズが上限（${INQUIRY_ATTACHMENT_MAX_SIZE / (1024 * 1024)}MB）を超えています: ${file.name}`,
      ],
    };
  }

  // 既存の magic-number 検知エンジンで本検証
  // （allowedTypes をお問い合わせ添付用の5種類に制限）
  const result: SecurityValidationResult = await validateFileSecurity(file, {
    maxSize: INQUIRY_ATTACHMENT_MAX_SIZE,
    allowedTypes: [...INQUIRY_ATTACHMENT_ALLOWED_TYPES],
    requireMagicNumber: true,
    scanForViruses: false,
    strictMode: true,
  });

  if (result.isValid) {
    return {
      valid: true,
      errors: [],
      detectedMimeType: result.fileInfo.detectedType,
    };
  }

  // エラーメッセージを日本語で集約（critical/high のみを拒否理由に）
  const blockingErrors = result.errors.filter(
    (e: SecurityError) => e.severity === 'critical' || e.severity === 'high'
  );

  const messages =
    blockingErrors.length > 0
      ? blockingErrors.map((e) => `${e.message_ja} (${file.name})`)
      : ['ファイルの検証に失敗しました。'];

  return {
    valid: false,
    errors: messages,
    detectedMimeType: result.fileInfo.detectedType,
  };
}

// =====================================================
// 複数ファイル検証（1メッセージ分）
// =====================================================

export interface InquiryAttachmentsValidationResult {
  valid: boolean;
  errors: string[];
  /** 検証通過したファイル（元の順序を維持） */
  validFiles: File[];
}

/**
 * 1メッセージ分の添付ファイル群を検証
 * - 件数上限（5枚）
 * - 各ファイルの MIME + magic number + サイズ
 */
export async function validateInquiryAttachments(
  files: unknown[]
): Promise<InquiryAttachmentsValidationResult> {
  // 件数上限チェック
  if (files.length > INQUIRY_ATTACHMENT_MAX_COUNT) {
    return {
      valid: false,
      errors: [
        `添付ファイルは1メッセージにつき最大${INQUIRY_ATTACHMENT_MAX_COUNT}枚までです（現在: ${files.length}枚）。`,
      ],
      validFiles: [],
    };
  }

  const errors: string[] = [];
  const validFiles: File[] = [];

  for (const file of files) {
    const result = await validateInquiryAttachment(file);
    if (result.valid) {
      validFiles.push(file as File);
    } else {
      errors.push(...result.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  };
}

// =====================================================
// 同名ファイル重複回避
// =====================================================

/**
 * 同名ファイルの重複を回避するため、既存ファイル名と衝突しない一意名を生成
 * - 衝突しない場合は元の名前をそのまま返す
 * - 衝突する場合は拡張子を保持した上で -2, -3, ... のサフィックスを付与
 * （例: "photo.png" が既存 → "photo-2.png" / さらに衝突なら "photo-3.png"）
 *
 * 用途: Storage の同一フォルダ内で同名アップロードによる制約違反を防止。
 * 会員お問い合わせ作成・追記の両 API で共用（DRY）。
 *
 * @param originalName 元のファイル名
 * @param existingNames 既に使われたファイル名の配列
 */
export function resolveUniqueFileName(
  originalName: string,
  existingNames: string[]
): string {
  if (!existingNames.includes(originalName)) return originalName;
  const dot = originalName.lastIndexOf('.');
  const base = dot > 0 ? originalName.slice(0, dot) : originalName;
  const ext = dot > 0 ? originalName.slice(dot) : '';
  let n = 2;
  while (existingNames.includes(`${base}-${n}${ext}`)) n++;
  return `${base}-${n}${ext}`;
}

// =====================================================
// 注文チャット添付（order-inquiry-link / inquiry-order-attachments バケット対応）
// =====================================================
// 一般 inquiry 添付（10MB・画像+PDF）との違い:
//   - 容量: 100MB（AI/EPS/PSD/PDF など大容量デザインデータに対応）
//   - MIME: 画像4種 + PDF + PostScript(AI/EPS/PS) + Photoshop(PSD) + Illustrator
//   - 件数上限: 5枚（一般 inquiry と同様）
// security-validator の magic-number 検知エンジンを共用（AI/EPS/PSD/PS 対応済み）。
// =====================================================

/** 1ファイルあたりの最大サイズ: 100MB（inquiry-order-attachments バケット file_size_limit と一致） */
export const ORDER_INQUIRY_ATTACHMENT_MAX_SIZE = 100 * 1024 * 1024;

/** 1メッセージあたりの最大添付数: 5枚（一般 inquiry と同様） */
export const ORDER_INQUIRY_ATTACHMENT_MAX_COUNT = 5;

/**
 * 許可される MIME タイプ（inquiry-order-attachments バケット allowed_mime_types と一致）
 * ※ application/illustrator は PDF ベースの AI（magic number は %PDF で判定される）
 */
export const ORDER_INQUIRY_ATTACHMENT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/postscript',
  'image/vnd.adobe.photoshop',
  'application/illustrator',
] as const;

/**
 * 1ファイルの注文チャット添付としての妥当性を検証
 * - MIME + magic number（デザインデータ対応・AI/EPS/PSD/PDF の署名検証）
 * - ファイルサイズ上限（100MB）
 *
 * validateInquiryAttachment との違いは maxSize と allowedTypes のみ。
 * 両者は security-validator の magic-number 検知エンジンを共用。
 */
export async function validateOrderInquiryAttachment(
  file: unknown
): Promise<InquiryFileValidationResult> {
  if (!isFileLike(file)) {
    return { valid: false, errors: ['ファイル形式が不正です（File オブジェクトが必要です）。'] };
  }

  // サイズ上限の事前チェック（100MB・arrayBuffer 展開前の高速拒否）
  if (file.size > ORDER_INQUIRY_ATTACHMENT_MAX_SIZE) {
    return {
      valid: false,
      errors: [
        `ファイルサイズが上限（${ORDER_INQUIRY_ATTACHMENT_MAX_SIZE / (1024 * 1024)}MB）を超えています: ${file.name}`,
      ],
    };
  }

  // 既存の magic-number 検知エンジンで本検証（デザインデータ8種を許可）
  const result: SecurityValidationResult = await validateFileSecurity(file, {
    maxSize: ORDER_INQUIRY_ATTACHMENT_MAX_SIZE,
    allowedTypes: [...ORDER_INQUIRY_ATTACHMENT_ALLOWED_TYPES],
    requireMagicNumber: true,
    scanForViruses: false,
    strictMode: true,
  });

  if (result.isValid) {
    // 事後チェック（MEDIUM-1）: magic-number 検知は通過しても、検知された MIME が
    // 注文チャット許可リスト（8種: 画像4 + PDF + PostScript + Photoshop + Illustrator）に
    // 含まれない場合は拒否する。security-validator 共有 lib には触らず file-validation 側で完結。
    // （validateFileSecurity は共有エンジンのため allowedTypes を超えて isValid となり得る）
    const detectedType = result.fileInfo.detectedType;
    if (
      !detectedType ||
      !(ORDER_INQUIRY_ATTACHMENT_ALLOWED_TYPES as readonly string[]).includes(detectedType)
    ) {
      return {
        valid: false,
        errors: [`対応していないファイル形式です (${file.name})`],
      };
    }
    return {
      valid: true,
      errors: [],
      detectedMimeType: detectedType,
    };
  }

  // エラーメッセージを日本語で集約（critical/high のみを拒否理由に）
  const blockingErrors = result.errors.filter(
    (e: SecurityError) => e.severity === 'critical' || e.severity === 'high'
  );

  const messages =
    blockingErrors.length > 0
      ? blockingErrors.map((e) => `${e.message_ja} (${file.name})`)
      : ['ファイルの検証に失敗しました。'];

  return {
    valid: false,
    errors: messages,
    detectedMimeType: result.fileInfo.detectedType,
  };
}

/**
 * 1メッセージ分の注文チャット添付ファイル群を検証
 * - 件数上限（5枚）
 * - 各ファイルの MIME + magic number + サイズ（100MB）
 */
export async function validateOrderInquiryAttachments(
  files: unknown[]
): Promise<InquiryAttachmentsValidationResult> {
  // 件数上限チェック
  if (files.length > ORDER_INQUIRY_ATTACHMENT_MAX_COUNT) {
    return {
      valid: false,
      errors: [
        `添付ファイルは1メッセージにつき最大${ORDER_INQUIRY_ATTACHMENT_MAX_COUNT}枚までです（現在: ${files.length}枚）。`,
      ],
      validFiles: [],
    };
  }

  const errors: string[] = [];
  const validFiles: File[] = [];

  for (const file of files) {
    const result = await validateOrderInquiryAttachment(file);
    if (result.valid) {
      validFiles.push(file as File);
    } else {
      errors.push(...result.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  };
}
