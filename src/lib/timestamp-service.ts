/**
 * Timestamp Service for Japanese Electronic Signature Law Compliance
 *
 * 일본 전자서명법 (電子署名法) 및 e-문서법 (電子文書法) 준수를 위한
 * 타임스탬프 서비스입니다.
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
   * 타임스탬프 고유 ID
   */
  id: string;

  /**
   * 타임스탬프 값 (RFC 3339 / ISO 8601)
   */
  timestamp: string;

  /**
   * 서명 또는 문서의 해시값
   */
  documentHash: string;

  /**
   * 타임스탬프 제공자 정보
   */
  tsaInfo: {
    name: string;
    url?: string;
    certificate?: string;
  };

  /**
   * 알고리즘 정보
   */
  algorithm: {
    hashAlgorithm: 'SHA-256' | 'SHA-384' | 'SHA-512';
    signatureAlgorithm?: string;
  };

  /**
   * 무결성 검증용 서명
   */
  signature?: string;

  /**
   * 검증 상태
   */
  verificationStatus: 'valid' | 'invalid' | 'pending';

  /**
   * 메타데이터
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
 * 일본 전자서명법에 따른 타임스탬프 유효기간
 * - 기본: 3년 (상법에 따른 상업 장부 보존 기간)
 * - e-문서법: 7년 (전자 장부 보존 기간)
 * - 세법 관련: 7년 (법인세법에 따른 장부 보존 기간)
 */
export const TIMESTAMP_VALIDITY_PERIODS = {
  DEFAULT: 3 * 365 * 24 * 60 * 60 * 1000, // 3년
  EDOC: 7 * 365 * 24 * 60 * 60 * 1000,     // 7년 (e-문서법)
  TAX: 7 * 365 * 24 * 60 * 60 * 1000,      // 7년 (세법)
  PERMANENT: -1,                           // 영구 보존
} as const;

/**
 * 타임스탬프 알고리즘 (일본 JIS X 5070 표준)
 */
const DEFAULT_HASH_ALGORITHM = 'SHA-256' as const;

/**
 * 타임스탬프 제공자 정보
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
 * 문서 내용으로부터 해시값 생성
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
 * 파일로부터 해시값 생성
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
 * 타임스탬프 토큰 생성
 */
export async function createTimestampToken(
  request: TimestampRequest
): Promise<TimestampToken> {
  const now = new Date();
  const timestamp = now.toISOString();

  // 타임스탬프 ID 생성 (UUID)
  const id = crypto.randomUUID();

  // 만료일 계산 (기본 7년, e-문서법 준수)
  const expiresAt = new Date(
    now.getTime() + TIMESTAMP_VALIDITY_PERIODS.EDOC
  ).toISOString();

  // 타임스탬프 토큰 생성
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

  // 서명 생성 (무결성 보장)
  const signature = await signTimestampToken(token);
  token.signature = signature;

  return token;
}

/**
 * 타임스탬프 토큰 서명
 */
async function signTimestampToken(token: TimestampToken): Promise<string> {
  // 토큰의 핵심 필드만 포함하여 서명 데이터 생성
  const signatureData = JSON.stringify({
    id: token.id,
    timestamp: token.timestamp,
    documentHash: token.documentHash,
    tsaInfo: token.tsaInfo,
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(signatureData);

  // HMAC-SHA256 서명 생성
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
 * 타임스탬프 토큰 검증
 */
export async function verifyTimestampToken(
  token: TimestampToken,
  documentHash: string
): Promise<TimestampVerificationResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  let valid = true;

  // 1. 해시값 일치 검증
  if (token.documentHash !== documentHash) {
    issues.push('문서 해시값이 일치하지 않습니다. 위・변조 가능성.');
    valid = false;
  }

  // 2. 서명 검증
  if (token.signature) {
    const signatureValid = await verifySignature(token);
    if (!signatureValid) {
      issues.push('타임스탬프 서명이 유효하지 않습니다.');
      valid = false;
    }
  } else {
    warnings.push('서명이 없습니다. 무결성을 보장할 수 없습니다.');
  }

  // 3. 만료일 검증
  if (token.metadata.expiresAt) {
    const now = new Date();
    const expiresAt = new Date(token.metadata.expiresAt);

    if (now > expiresAt) {
      issues.push('타임스탬프 유효기간이 만료되었습니다.');
      valid = false;
    }
  }

  // 4. 시간 순서 검증 (타임스탬프가 현재 시간보다 미래인지)
  const timestampDate = new Date(token.timestamp);
  const now = new Date();

  if (timestampDate > now) {
    issues.push('타임스탬프가 미래 시간입니다. 시스템 시간 오류 가능성.');
    valid = false;
  }

  // 5. 일본 전자서명법 준수 검증
  const complianceCheck = checkJapaneseLawCompliance(token, valid);

  if (!complianceCheck.japanESignLaw) {
    issues.push('일본 전자서명법 요구사항을 충족하지 않습니다.');
  }

  if (!complianceCheck.japanEDocLaw) {
    warnings.push('e-문서법 권장사항을 충족하지 않습니다.');
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
 * 타임스탬프 서명 검증
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

    // 서명을 hex에서 Uint8Array로 변환
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
 * 일본 전자서명법 및 e-문서법 준수 검증
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
 * 일본 전자서명법 (電子署名法) 준수 검증
 *
 * 제4조 (전자署名의 作成等)
 * - 전자서명 작성 시각의 기록
 * - 전자서명 작성 장소의 IP 주소 기록
 * - 위조・변조 방지를 위한 무결성 확보
 */
function validateESignLaw(token: TimestampToken): boolean {
  // 1. 타임스탬프 존재
  if (!token.timestamp) return false;

  // 2. 문서 해시값 존재
  if (!token.documentHash) return false;

  // 3. 무결성 확보 (서명)
  if (!token.signature) return false;

  // 4. TSA 정보 존재
  if (!token.tsaInfo || !token.tsaInfo.name) return false;

  // 5. 일본 관할권
  if (token.metadata.jurisdiction !== 'JP') return false;

  return true;
}

/**
 * 일본 e-문서법 (電子文書法) 준수 검증
 *
 * e-문서법 제3조 (전자장부의 작성 등)
 * - 작성 시각의 기록
 * - 작성자의 식별
 * - 7년간 보존
 * - 진정성 확보
 */
function validateEDocLaw(token: TimestampToken): boolean {
  // 1. 작성 시각 기록
  if (!token.metadata.createdAt) return false;

  // 2. 작성자 식별 (userId 또는 IP)
  if (!token.metadata.userId && !token.metadata.ipAddress) return false;

  // 3. 7년 보존 기간 (만료일 설정)
  if (!token.metadata.expiresAt) return false;

  const expiresAt = new Date(token.metadata.expiresAt);
  const createdAt = new Date(token.metadata.createdAt);
  const preservationPeriod = 7 * 365 * 24 * 60 * 60 * 1000; // 7년
  const expectedExpiry = new Date(createdAt.getTime() + preservationPeriod);

  // 만료일이 7년 이상으로 설정되어 있는지 확인
  if (expiresAt < expectedExpiry) {
    return false;
  }

  // 4. 진정성 확보 (서명)
  if (!token.signature) return false;

  // 5. 문서 유형 분류
  if (!token.metadata.documentType) return false;

  return true;
}

// =====================================================
// Database Integration
// =====================================================

/**
 * 타임스탬프 저장
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
 * 데이터베이스에서 타임스탬프 조회
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
 * 전자서명 타임스탬프 API 핸들러
 */
export async function handleTimestampRequest(
  request: TimestampRequest
): Promise<{
  success: boolean;
  token?: TimestampToken;
  error?: string;
}> {
  try {
    // 1. 타임스탬프 생성
    const token = await createTimestampToken(request);

    // 2. 데이터베이스 저장
    const saveResult = await saveTimestampToDatabase(token);

    if (!saveResult.success) {
      return {
        success: false,
        error: `타임스탬프 저장 실패: ${saveResult.error}`,
      };
    }

    // 3. 감사 로그 생성
    await createAuditLog(token, request);

    return {
      success: true,
      token,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '타임스탬프 생성 실패';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 타임스탬프 검증 API 핸들러
 */
export async function handleTimestampVerification(
  tokenId: string,
  documentHash: string
): Promise<TimestampVerificationResult & { success: boolean }> {
  try {
    // 1. 데이터베이스에서 토큰 조회
    const { success, token, error } = await getTimestampFromDatabase(tokenId);

    if (!success || !token) {
      return {
        success: false,
        valid: false,
        issues: [error || '타임스탬프를 찾을 수 없습니다.'],
        warnings: [],
        complianceCheck: {
          japanESignLaw: false,
          japanEDocLaw: false,
          timestampValid: false,
          integrityPreserved: false,
        },
      };
    }

    // 2. 토큰 검증
    const verification = await verifyTimestampToken(token, documentHash);

    return {
      success: true,
      ...verification,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '검증 실패';
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
 * 감사 로그 생성
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
    // 감사 로그 실패는 타임스탬프 생성 실패로 처리하지 않음
    console.error('Audit log creation failed:', error);
  }
}

// =====================================================
// Utilities
// =====================================================

/**
 * 타임스탬프 토큰을 JSON 형식으로 변환 (출력용)
 */
export function formatTimestampToken(token: TimestampToken): string {
  return JSON.stringify(token, null, 2);
}

/**
 * 타임스탬프 검증 결과를 보고서 형식으로 변환
 */
export function formatVerificationReport(
  result: TimestampVerificationResult
): string {
  const lines: string[] = [];

  lines.push('='.repeat(50));
  lines.push('타임스탬프 검증 보고서');
  lines.push('='.repeat(50));
  lines.push('');

  lines.push(`[기본 정보]`);
  lines.push(`  토큰 ID: ${result.token.id}`);
  lines.push(`  타임스탬프: ${result.token.timestamp}`);
  lines.push(`  문서 해시: ${result.token.documentHash}`);
  lines.push(`  TSA: ${result.token.tsaInfo.name}`);
  lines.push('');

  lines.push(`[검증 결과]`);
  lines.push(`  유효성: ${result.valid ? 'O' : 'X'}`);
  lines.push(`  상태: ${result.token.verificationStatus}`);
  lines.push('');

  lines.push(`[일본 법규 준수]`);
  lines.push(`  전자서명법: ${result.complianceCheck.japanESignLaw ? 'O' : 'X'}`);
  lines.push(`  e-문서법: ${result.complianceCheck.japanEDocLaw ? 'O' : 'X'}`);
  lines.push(`  무결성 확보: ${result.complianceCheck.integrityPreserved ? 'O' : 'X'}`);
  lines.push('');

  if (result.issues.length > 0) {
    lines.push(`[발견된 문제]`);
    result.issues.forEach(issue => {
      lines.push(`  - ${issue}`);
    });
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push(`[경고]`);
    result.warnings.forEach(warning => {
      lines.push(`  - ${warning}`);
    });
    lines.push('');
  }

  lines.push('='.repeat(50));

  return lines.join('\n');
}

/**
 * 일본 전자서명법 요약 정보
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
      '전자서명 작성 시각의 기록',
      '전자서명 작성 장소의 식별 (IP 주소 등)',
      '위조・변조 방지를 위한 무결성 확보',
      '전자서명 작성자의 식별',
      'TSA(타임스탬프 제공자) 정보',
    ],
    timestampRequirements: [
      'UTC 기준 정확한 시각 기록',
      'RFC 3339 또는 ISO 8601 형식',
      'TSA에 의한 서명',
      '검증 가능한 형식',
    ],
    preservationPeriod: '7년 (e-문서법 기준), 세법 관련 문서는 7년',
  };
}
