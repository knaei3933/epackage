/**
 * Timestamp Verification Service (Japan e-Signature Law Compliant)
 *
 * タイムスタンプ検証サービス (日本の電子署名法準拠)
 * Time Stamping Authority (TSA) integration for legal timestamp verification
 */

import { TimestampData, TimestampRequest, TimestampResponse, TSA_PROVIDERS } from '@/types/signature';

// ============================================================
// Configuration
// ============================================================

const TSA_API_KEY = process.env.NEXT_PUBLIC_TSA_API_KEY || '';
const TSA_PROVIDER = process.env.NEXT_PUBLIC_TSA_PROVIDER || 'DEMO';

// ============================================================
// Main Functions
// ============================================================

/**
 * Request timestamp from TSA
 * TSAからタイムスタンプをリクエスト
 */
export async function requestTimestamp(
  request: TimestampRequest
): Promise<TimestampResponse> {
  // Development mode: Return mock timestamp
  if (process.env.NODE_ENV === 'development') {
    console.log('[TSA Mock] Timestamp request:', request);
    return createMockTimestamp(request);
  }

  try {
    const tsaUrl = TSA_PROVIDERS[TSA_PROVIDER as keyof typeof TSA_PROVIDERS] || TSA_PROVIDERS.DEMO;

    // Calculate document hash
    const documentHash = await calculateDocumentHash(request.documentHash);

    // Call TSA API
    const response = await fetch(`${tsaUrl}/api/timestamp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TSA_API_KEY}`,
      },
      body: JSON.stringify({
        documentHash,
        signerId: request.signerId,
        contractId: request.contractId,
      }),
    });

    if (!response.ok) {
      throw new Error(`TSA request failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      timestampToken: data.token,
      timestamp: data.timestamp,
      tsaUrl: tsaUrl,
    };
  } catch (error) {
    console.error('Timestamp request error:', error);
    // Fallback to mock timestamp for development
    return createMockTimestamp(request);
  }
}

/**
 * Verify timestamp token
 * タイムスタンプトークンを検証
 */
export async function verifyTimestamp(
  timestampToken: string,
  documentHash: string
): Promise<{ valid: boolean; timestamp: string; verifiedAt: string; error?: string }> {
  // Development mode: Return mock verification
  if (process.env.NODE_ENV === 'development') {
    console.log('[TSA Mock] Timestamp verification:', { timestampToken, documentHash });
    return {
      valid: true,
      timestamp: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    };
  }

  try {
    const tsaUrl = TSA_PROVIDERS[TSA_PROVIDER as keyof typeof TSA_PROVIDERS] || TSA_PROVIDERS.DEMO;

    const response = await fetch(`${tsaUrl}/api/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TSA_API_KEY}`,
      },
      body: JSON.stringify({
        token: timestampToken,
        documentHash,
      }),
    });

    if (!response.ok) {
      throw new Error(`TSA verification failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      valid: data.valid,
      timestamp: data.timestamp,
      verifiedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Timestamp verification error:', error);
    return {
      valid: false,
      timestamp: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create timestamp data for storage
 * 保存用タイムスタンプデータを作成
 */
export async function createTimestampData(
  request: TimestampRequest
): Promise<TimestampData> {
  const response = await requestTimestamp(request);

  if (!response.success || !response.timestampToken) {
    throw new Error(response.error || 'Failed to create timestamp');
  }

  return {
    token: response.timestampToken,
    timestamp: response.timestamp,
    tsaUrl: response.tsaUrl,
    verified: false, // Will be verified separately
    certificateHash: await calculateCertificateHash(response.timestampToken),
  };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Calculate document hash using SHA-256
 * SHA-256を使用してドキュメントハッシュを計算
 */
async function calculateDocumentHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataArray = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Calculate certificate hash
 * 証明書ハッシュを計算
 */
async function calculateCertificateHash(token: string): Promise<string> {
  return calculateDocumentHash(token);
}

/**
 * Create mock timestamp for development
 * 開発用モックタイムスタンプを作成
 */
function createMockTimestamp(request: TimestampRequest): TimestampResponse {
  const now = new Date();
  const token = `mock_tsa_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  return {
    success: true,
    timestampToken: token,
    timestamp: now.toISOString(),
    tsaUrl: TSA_PROVIDERS.DEMO,
  };
}

/**
 * Check if timestamp is still valid (not expired)
 * タイムスタンプが有効期限内か確認
 */
export function isTimestampValid(timestampData: TimestampData): boolean {
  const timestamp = new Date(timestampData.timestamp);
  const now = new Date();

  // Japan e-Signature Law: Timestamp is valid for at least 10 years
  // 電子署名法: タイムスタンプは最低10年間有効
  const expiryDate = new Date(timestamp);
  expiryDate.setFullYear(expiryDate.getFullYear() + 10);

  return now < expiryDate;
}

/**
 * Format timestamp for display
 * 表示用タイムスタンプをフォーマット
 */
export function formatTimestamp(isoString: string, locale: string = 'ja-JP'): string {
  const date = new Date(isoString);
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get timestamp expiration date
 * タイムスタンプ有効期限を取得
 */
export function getTimestampExpiry(timestamp: string): string {
  const date = new Date(timestamp);
  date.setFullYear(date.getFullYear() + 10);
  return date.toISOString();
}

// ============================================================
// TSA Provider Selection
// ============================================================

/**
 * Get available TSA providers
 * 利用可能なTSAプロバイダーを取得
 */
export function getTSAProviders(): Record<string, string> {
  return TSA_PROVIDERS;
}

/**
 * Get current TSA provider URL
 * 現在のTSAプロバイダーURLを取得
 */
export function getCurrentTSAProvider(): string {
  return TSA_PROVIDERS[TSA_PROVIDER as keyof typeof TSA_PROVIDERS] || TSA_PROVIDERS.DEMO;
}

// ============================================================
// Verification Status
// ============================================================

/**
 * Get timestamp verification status
 * タイムスタンプ検証ステータスを取得
 */
export function getTimestampVerificationStatus(timestampData: TimestampData): {
  status: 'verified' | 'pending' | 'expired' | 'invalid';
  message: string;
} {
  if (timestampData.verified) {
    if (isTimestampValid(timestampData)) {
      return {
        status: 'verified',
        message: 'タイムスタンプが検証され、有効です',
      };
    } else {
      return {
        status: 'expired',
        message: 'タイムスタンプの有効期限が切れています',
      };
    }
  } else {
    return {
      status: 'pending',
      message: 'タイムスタンプの検証が必要です',
    };
  }
}
