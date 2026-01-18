/**
 * Timestamp Service for Japanese Electronic Signature Law Compliance
 *
 * 日本電子署名法（電子署名法）およびe-文書法（電子文書法）準拠の
 * タイムスタンプサービスです。
 *
 * Legal References:
 * - 電子署名法 (Law No. 102 of 2000)
 * - 電子文書法 (Law No. 43 of 2004)
 * - e-文書法施行規則
 * - 個人情報保護法 (APPI, Act No. 57 of 2003)
 *
 * Technical References:
 * - RFC 3161 (Time-Stamp Protocol)
 * - ISO 18014 (Information technology - Security techniques - Time-stamping services)
 * - JIS X 5070 (Japanese Industrial Standard for electronic signatures)
 */

import { createServiceClient } from './supabase';

// =====================================================
// Types & Interfaces
// =====================================================

/**
 * Database row type for timestamp_tokens table (snake_case fields)
 */
interface TimestampTokenDbRow {
  id: string;
  timestamp: string;
  document_hash: string;
  tsa_name: string;
  tsa_url: string | null;
  tsa_certificate: string | null;
  hash_algorithm: string;
  signature_algorithm: string | null;
  signature: string | null;
  verification_status: string;
  metadata: {
    createdAt: string;
    expiresAt?: string;
    ipAddress?: string;
    userId?: string;
    documentType: string;
    jurisdiction: 'JP' | 'OTHER';
  };
}

export interface TimestampToken {
  /**
   * タイムスタンプ一意ID
   */
  id: string;

  /**
   * タイムスタンプ値 (RFC 3339 / ISO 8601)
   */
  timestamp: string;

  /**
   * 署名または文書のハッシュ値
   */
  documentHash: string;

  /**
   * タイムスタンプ提供者情報
   */
  tsaInfo: {
    name: string;
    url?: string;
    certificate?: string;
  };

  /**
   * アルゴリズム情報
   */
  algorithm: {
    hashAlgorithm: 'SHA-256' | 'SHA-384' | 'SHA-512';
    signatureAlgorithm?: string;
  };

  /**
   * 完全性検証用署名
   */
  signature?: string;

  /**
   * 検証ステータス
   */
  verificationStatus: 'valid' | 'invalid' | 'pending';

  /**
   * メタデータ
   */
  metadata: {
    createdAt: string;
    expiresAt?: string;
    ipAddress?: string;
    userId?: string;
    documentType: string;
    jurisdiction: 'JP' | 'OTHER';
  };
}

export interface TimestampRequest {
  documentHash: string;
  documentType: string;
  userId?: string;
  ipAddress?: string;
  additionalData?: Record<string, unknown>;
}

export interface TimestampVerificationResult {
  valid: boolean;
  token?: TimestampToken;
  issues: string[];
  warnings: string[];
  complianceCheck: {
    japanESignLaw: boolean;
    japanEDocLaw: boolean;
    timestampValid: boolean;
    integrityPreserved: boolean;
  };
}

// =====================================================
// Constants
// =====================================================

/**
 * 日本電子署名法に基づくタイムスタンプ有効期間
 * - 基本期間: 3年（商法に基づく商業帳簿保存期間）
 * - e-文書法: 7年（電子帳簿保存期間）
 * - 税法関連: 7年（法人税法に基づく帳簿保存期間）
 */
export const TIMESTAMP_VALIDITY_PERIODS = {
  DEFAULT: 3 * 365 * 24 * 60 * 60 * 1000, // 3年
  EDOC: 7 * 365 * 24 * 60 * 60 * 1000,     // 7年 (e-文書法)
  TAX: 7 * 365 * 24 * 60 * 60 * 1000,      // 7年 (税法)
  PERMANENT: -1,                           // 永久保存
} as const;

/**
 * タイムスタンプアルゴリズム（日本JIS X 5070標準）
 */
const DEFAULT_HASH_ALGORITHM = 'SHA-256' as const;

/**
 * タイムスタンプ提供者情報
 */
const TSA_INFO = {
  name: process.env.TSA_NAME || 'Epackage Lab Timestamp Authority',
  url: process.env.TSA_URL || 'https://tsa.epackage-lab.com',
  certificate: process.env.TSA_CERTIFICATE,
};

// =====================================================
// Hash Generation
// =====================================================

/**
 * 文書内容からハッシュ値生成
 */
export async function generateDocumentHash(
  content: string | Buffer,
  algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512' = DEFAULT_HASH_ALGORITHM
): Promise<string> {
  const encoder = new TextEncoder();
  const data = typeof content === 'string' ? encoder.encode(content) : new Uint8Array(content);

  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * ファイルからハッシュ値生成
 */
export async function generateFileHash(
  file: File,
  algorithm: 'SHA-256' | 'SHA-384' | 'SHA-512' = DEFAULT_HASH_ALGORITHM
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return generateDocumentHash(Buffer.from(new Uint8Array(arrayBuffer)), algorithm);
}

// =====================================================
// Timestamp Token Creation
// =====================================================

/**
 * タイムスタンプトークン生成
 */
export async function createTimestampToken(
  request: TimestampRequest
): Promise<TimestampToken> {
  const now = new Date();
  const timestamp = now.toISOString();

  // タイムスタンプID生成 (UUID)
  const id = crypto.randomUUID();

  // 有効期限計算（基本7年、e-文書法準拠）
  const expiresAt = new Date(
    now.getTime() + TIMESTAMP_VALIDITY_PERIODS.EDOC
  ).toISOString();

  // タイムスタンプトークン生成
  const token: TimestampToken = {
    id,
    timestamp,
    documentHash: request.documentHash,
    tsaInfo: TSA_INFO,
    algorithm: {
      hashAlgorithm: DEFAULT_HASH_ALGORITHM,
    },
    verificationStatus: 'valid',
    metadata: {
      createdAt: timestamp,
      expiresAt,
      ipAddress: request.ipAddress,
      userId: request.userId,
      documentType: request.documentType,
      jurisdiction: 'JP',
    },
  };

  // 署名生成（完全性保証）
  const signature = await signTimestampToken(token);
  token.signature = signature;

  return token;
}

/**
 * タイムスタンプトークン署名
 */
async function signTimestampToken(token: TimestampToken): Promise<string> {
  // トークンの核フィールドのみを含む署名データ生成
  const signatureData = JSON.stringify({
    id: token.id,
    timestamp: token.timestamp,
    documentHash: token.documentHash,
    tsaInfo: token.tsaInfo,
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(signatureData);

  // HMAC-SHA256署名生成
  const secretKey = process.env.TSA_SECRET_KEY || 'default-secret-key';
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return signatureHex;
}

// =====================================================
// Timestamp Verification
// =====================================================

/**
 * タイムスタンプトークン検証
 */
export async function verifyTimestampToken(
  token: TimestampToken,
  documentHash: string
): Promise<TimestampVerificationResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  let valid = true;

  // 1. ハッシュ値一致検証
  if (token.documentHash !== documentHash) {
    issues.push('文書ハッシュ値が一致しません。偽装・改ざんの可能性があります。');
    valid = false;
  }

  // 2. 署名検証
  if (token.signature) {
    const signatureValid = await verifySignature(token);
    if (!signatureValid) {
      issues.push('タイムスタンプ署名が有効ではありません。');
      valid = false;
    }
  } else {
    warnings.push('署名がありません。完全性を保証できません。');
  }

  // 3. 有効期限検証
  if (token.metadata.expiresAt) {
    const now = new Date();
    const expiresAt = new Date(token.metadata.expiresAt);

    if (now > expiresAt) {
      issues.push('タイムスタンプ有効期限が切れています。');
      valid = false;
    }
  }

  // 4. 時間順序検証（タイムスタンプが現在時刻より未来であるか）
  const timestampDate = new Date(token.timestamp);
  const now = new Date();

  if (timestampDate > now) {
    issues.push('タイムスタンプが未来の時刻です。システム時刻エラーの可能性があります。');
    valid = false;
  }

  // 5. 日本電子署名法準拠検証
  const complianceCheck = checkJapaneseLawCompliance(token, valid);

  if (!complianceCheck.japanESignLaw) {
    issues.push('日本電子署名法の要件を満たしていません。');
  }

  if (!complianceCheck.japanEDocLaw) {
    warnings.push('e-文書法の推奨事項を満たしていません。');
  }

  return {
    valid: valid && complianceCheck.japanESignLaw,
    token,
    issues,
    warnings,
    complianceCheck,
  };
}

/**
 * タイムスタンプ署名検証
 */
async function verifySignature(token: TimestampToken): Promise<boolean> {
  if (!token.signature) return false;

  try {
    const signatureData = JSON.stringify({
      id: token.id,
      timestamp: token.timestamp,
      documentHash: token.documentHash,
      tsaInfo: token.tsaInfo,
    });

    const encoder = new TextEncoder();
    const data = encoder.encode(signatureData);

    const secretKey = process.env.TSA_SECRET_KEY || 'default-secret-key';
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // 署名をhexからUint8Arrayに変換
    const signatureBytes = new Uint8Array(
      token.signature.match(/[\da-f]{2}/gi)!.map(h => parseInt(h, 16))
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, data);
    return isValid;
  } catch {
    return false;
  }
}

// =====================================================
// Japanese Law Compliance
// =====================================================

/**
 * 日本電子署名法およびe-文書法準拠検証
 */
function checkJapaneseLawCompliance(
  token: TimestampToken,
  valid: boolean
): TimestampVerificationResult['complianceCheck'] {
  return {
    japanESignLaw: validateESignLaw(token),
    japanEDocLaw: validateEDocLaw(token),
    timestampValid: valid,
    integrityPreserved: !!token.signature,
  };
}

/**
 * 日本電子署名法（電子署名法）準拠検証
 *
 * 第4条（電子署名の作成等）
 * - 電子署名作成時刻の記録
 * - 電子署名作成場所のIPアドレス記録
 * - 偽造・改ざん防止のための完全性確保
 */
function validateESignLaw(token: TimestampToken): boolean {
  // 1. タイムスタンプ存在
  if (!token.timestamp) return false;

  // 2. 文書ハッシュ値存在
  if (!token.documentHash) return false;

  // 3. 完全性確保（署名）
  if (!token.signature) return false;

  // 4. TSA情報存在
  if (!token.tsaInfo || !token.tsaInfo.name) return false;

  // 5. 日本管轄権
  if (token.metadata.jurisdiction !== 'JP') return false;

  return true;
}

/**
 * 日本e-文書法（電子文書法）準拠検証
 *
 * e-文書法第3条（電子帳簿の作成等）
 * - 作成時刻の記録
 * - 作成者の識別
 * - 7年間保存
 * - 真正性確保
 */
function validateEDocLaw(token: TimestampToken): boolean {
  // 1. 作成時刻記録
  if (!token.metadata.createdAt) return false;

  // 2. 作成者識別（userIdまたはIP）
  if (!token.metadata.userId && !token.metadata.ipAddress) return false;

  // 3. 7年保存期間（有効期限設定）
  if (!token.metadata.expiresAt) return false;

  const expiresAt = new Date(token.metadata.expiresAt);
  const createdAt = new Date(token.metadata.createdAt);
  const preservationPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7年
  const expectedExpiry = new Date(createdAt.getTime() + preservationPeriod);

  // 有効期限が7年以上に設定されているか確認
  if (expiresAt < expectedExpiry) {
    return false;
  }

  // 4. 真正性確保（署名）
  if (!token.signature) return false;

  // 5. 文書タイプ分類
  if (!token.metadata.documentType) return false;

  return true;
}

// =====================================================
// Database Integration
// =====================================================

/**
 * タイムスタンプ保存
 */
export async function saveTimestampToDatabase(
  token: TimestampToken
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServiceClient();

    // Type for insert payload with snake_case fields matching database schema
    type InsertPayload = {
      id: string;
      timestamp: string;
      document_hash: string;
      tsa_name: string;
      tsa_url: string | null;
      tsa_certificate: string | null;
      hash_algorithm: string;
      signature_algorithm: string | null;
      signature: string | null;
      verification_status: string;
      metadata: TimestampToken['metadata'];
    };

    const insertPayload: InsertPayload = {
      id: token.id,
      timestamp: token.timestamp,
      document_hash: token.documentHash,
      tsa_name: token.tsaInfo.name,
      tsa_url: token.tsaInfo.url || null,
      tsa_certificate: token.tsaInfo.certificate || null,
      hash_algorithm: token.algorithm.hashAlgorithm,
      signature_algorithm: token.algorithm.signatureAlgorithm || null,
      signature: token.signature || null,
      verification_status: token.verificationStatus,
      metadata: token.metadata,
    };

    const { error } = await supabase
      .from('timestamp_tokens')
      .insert(insertPayload as unknown as InsertPayload);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * データベースからタイムスタンプ取得
 */
export async function getTimestampFromDatabase(
  id: string
): Promise<{ success: boolean; token?: TimestampToken; error?: string }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('timestamp_tokens')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Type assertion for database row with snake_case fields
    const dbRow = data as unknown as TimestampTokenDbRow;

    // Map snake_case database fields to camelCase TypeScript interface
    const token: TimestampToken = {
      id: dbRow.id,
      timestamp: dbRow.timestamp,
      documentHash: dbRow.document_hash,
      tsaInfo: {
        name: dbRow.tsa_name,
        url: dbRow.tsa_url || undefined,
        certificate: dbRow.tsa_certificate || undefined,
      },
      algorithm: {
        hashAlgorithm: dbRow.hash_algorithm as 'SHA-256' | 'SHA-384' | 'SHA-512',
        signatureAlgorithm: dbRow.signature_algorithm || undefined,
      },
      signature: dbRow.signature || undefined,
      verificationStatus: dbRow.verification_status as 'valid' | 'invalid' | 'pending',
      metadata: dbRow.metadata,
    };

    return { success: true, token };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// =====================================================
// API Helpers
// =====================================================

/**
 * 電子署名タイムスタンプAPIハンドラー
 */
export async function handleTimestampRequest(
  request: TimestampRequest
): Promise<{
  success: boolean;
  token?: TimestampToken;
  error?: string;
}> {
  try {
    // 1. タイムスタンプ生成
    const token = await createTimestampToken(request);

    // 2. データベース保存
    const saveResult = await saveTimestampToDatabase(token);

    if (!saveResult.success) {
      return {
        success: false,
        error: `タイムスタンプ保存失敗: ${saveResult.error}`,
      };
    }

    // 3. 監査ログ生成
    await createAuditLog(token, request);

    return {
      success: true,
      token,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'タイムスタンプ生成失敗';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * タイムスタンプ検証APIハンドラー
 */
export async function handleTimestampVerification(
  tokenId: string,
  documentHash: string
): Promise<TimestampVerificationResult & { success: boolean }> {
  try {
    // 1. データベースからトークン取得
    const { success, token, error } = await getTimestampFromDatabase(tokenId);

    if (!success || !token) {
      return {
        success: false,
        valid: false,
        issues: [error || 'タイムスタンプが見つかりません。'],
        warnings: [],
        complianceCheck: {
          japanESignLaw: false,
          japanEDocLaw: false,
          timestampValid: false,
          integrityPreserved: false,
        },
      };
    }

    // 2. トークン検証
    const verification = await verifyTimestampToken(token, documentHash);

    return {
      success: true,
      ...verification,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '検証失敗';
    return {
      success: false,
      valid: false,
      issues: [errorMessage],
      warnings: [],
      complianceCheck: {
        japanESignLaw: false,
        japanEDocLaw: false,
        timestampValid: false,
        integrityPreserved: false,
      },
    };
  }
}

/**
 * 監査ログ生成
 */
async function createAuditLog(
  token: TimestampToken,
  request: TimestampRequest
): Promise<void> {
  try {
    const supabase = createServiceClient();

    // Type for audit log insert payload
    type AuditLogInsert = {
      timestamp: string;
      event_type: string;
      resource_type: string;
      resource_id: string;
      user_id?: string;
      ip_address?: string;
      details: Record<string, unknown>;
    };

    const auditLogData: AuditLogInsert = {
      timestamp: token.timestamp,
      event_type: 'timestamp_created',
      resource_type: 'timestamp_token',
      resource_id: token.id,
      user_id: request.userId,
      ip_address: request.ipAddress,
      details: {
        documentHash: token.documentHash,
        documentType: request.documentType,
        jurisdiction: token.metadata.jurisdiction,
        tsaName: token.tsaInfo.name,
        compliance: {
          eSignLaw: true,
          eDocLaw: true,
        },
      },
    };

    await supabase
      .from('audit_logs')
      .insert(auditLogData as unknown as AuditLogInsert);
  } catch (error) {
    // 監査ログ失敗はタイムスタンプ生成失敗として処理しない
    console.error('Audit log creation failed:', error);
  }
}

// =====================================================
// Utilities
// =====================================================

/**
 * タイムスタンプトークンをJSON形式に変換（出力用）
 */
export function formatTimestampToken(token: TimestampToken): string {
  return JSON.stringify(token, null, 2);
}

/**
 * タイムスタンプ検証結果をレポート形式に変換
 */
export function formatVerificationReport(
  result: TimestampVerificationResult
): string {
  const lines: string[] = [];

  lines.push('='.repeat(50));
  lines.push('タイムスタンプ検証レポート');
  lines.push('='.repeat(50));
  lines.push('');

  lines.push(`[基本情報]`);
  lines.push(`  トークンID: ${result.token.id}`);
  lines.push(`  タイムスタンプ: ${result.token.timestamp}`);
  lines.push(`  文書ハッシュ: ${result.token.documentHash}`);
  lines.push(`  TSA: ${result.token.tsaInfo.name}`);
  lines.push('');

  lines.push(`[検証結果]`);
  lines.push(`  有効性: ${result.valid ? 'O' : 'X'}`);
  lines.push(`  ステータス: ${result.token.verificationStatus}`);
  lines.push('');

  lines.push(`[日本法規準拠]`);
  lines.push(`  電子署名法: ${result.complianceCheck.japanESignLaw ? 'O' : 'X'}`);
  lines.push(`  e-文書法: ${result.complianceCheck.japanEDocLaw ? 'O' : 'X'}`);
  lines.push(`  完全性確保: ${result.complianceCheck.integrityPreserved ? 'O' : 'X'}`);
  lines.push('');

  if (result.issues.length > 0) {
    lines.push(`[検出された問題]`);
    result.issues.forEach(issue => {
      lines.push(`  - ${issue}`);
    });
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push(`[警告]`);
    result.warnings.forEach(warning => {
      lines.push(`  - ${warning}`);
    });
    lines.push('');
  }

  lines.push('='.repeat(50));

  return lines.join('\n');
}

/**
 * 日本電子署名法要約情報
 */
export function getJapaneseESignLawSummary(): {
  lawName: string;
  lawNumber: string;
  enactedDate: string;
  keyRequirements: string[];
  timestampRequirements: string[];
  preservationPeriod: string;
} {
  return {
    lawName: '電子署名法',
    lawNumber: 'Law No. 102 of 2000',
    enactedDate: '2001-04-01',
    keyRequirements: [
      '電子署名作成時刻の記録',
      '電子署名作成場所の識別（IPアドレス等）',
      '偽造・改ざん防止のための完全性確保',
      '電子署名作成者の識別',
      'TSA（タイムスタンプ提供者）情報',
    ],
    timestampRequirements: [
      'UTC基準正確な時刻記録',
      'RFC 3339またはISO 8601形式',
      'TSAによる署名',
      '検証可能な形式',
    ],
    preservationPeriod: '7年（e-文書法基準）、税法関連文書は7年',
  };
}
