/**
 * IP Address Validator for Electronic Signature System
 *
 * 日本電子署名法準拠のためのIPアドレス検証システム
 * - x-forwarded-forヘッダースプーフィング防止
 * - Cloudflare cf-connecting-ip優先検証
 * - プロキシチェーン検証
 * - プライベートIP検知
 *
 * References:
 * - 日本電子署名法 (電子署名法, Law No. 102 of 2000)
 * - 日本e-文書法 (電子文書法)
 * - 個人情報保護法 (APPI)
 */

// =====================================================
// Types & Interfaces
// =====================================================

export interface IPValidationResult {
  /**
   * 検証されたクライアントIPアドレス
   */
  clientIP: string;

  /**
   * IPアドレスの信頼度レベル
   */
  trustLevel: 'trusted' | 'verified' | 'suspicious' | 'untrusted';

  /**
   * 検証に使用されたソースヘッダー
   */
  source: 'cf-connecting-ip' | 'x-forwarded-for' | 'x-real-ip' | 'fallback';

  /**
   * 検証警告メッセージ
   */
  warnings: string[];

  /**
   * 監査ログ用メタデータ
   */
  metadata: {
    /**
     * 元のヘッダー値
     */
    rawHeaders: {
      cfConnectingIP?: string;
      xForwardedFor?: string;
      xRealIP?: string;
    };

    /**
     * プロキシチェーン (ある場合)
     */
    proxyChain?: string[];

    /**
     * IPバージョン (IPv4/IPv6)
     */
    ipVersion: 'IPv4' | 'IPv6';

    /**
     * プライベートIPかどうか
     */
    isPrivate: boolean;

    /**
     * 検証タイムスタンプ
     */
    validatedAt: string;
  };
}

export interface IPValidatorOptions {
  /**
   * 信頼できるプロキシIPリスト
   */
  trustedProxies?: string[];

  /**
   * プライベートIP許可 (開発環境用)
   */
  allowPrivateIP?: boolean;

  /**
   * 厳格な検証モード (本番推奨)
   */
  strictMode?: boolean;
}

// =====================================================
// Constants
// =====================================================

/**
 * プライベートIPアドレス範囲 (RFC 1918, RFC 4193)
 */
const PRIVATE_IP_RANGES = [
  // IPv4 Private Ranges
  /^10\./,                              // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,    // 172.16.0.0/12
  /^192\.168\./,                        // 192.168.0.0/16
  /^127\./,                             // 127.0.0.0/8 (loopback)
  /^169\.254\./,                        // 169.254.0.0/16 (link-local)

  // IPv6 Private Ranges
  /^fe80:/i,                            // fe80::/10 (link-local)
  /^fc00:/i,                            // fc00::/7 (unique local)
  /^::1$/i,                             // ::1 (loopback)
  /^fd/i,                               // fd00::/8 (unique local)
];

/**
 * ローカルホストアドレス
 */
const LOCALHOST_ADDRESSES = [
  '127.0.0.1',
  '::1',
  'localhost',
  '0.0.0.0',
  '::',
];

/**
 * Cloudflare IP範囲 (一部)
 * 完全リスト: https://www.cloudflare.com/ips/
 */
const CLOUDFLARE_IP_PATTERNS = [
  /^173\.245\./,
  /^103\.21\./,
  /^103\.22\./,
  /^103\.23\./,
  /^103\.24\./,
  /^103\.25\./,
  /^103\.26\./,
  /^103\.27\./,
  /^103\.28\./,
  /^103\.29\./,
];

// =====================================================
// Helper Functions
// =====================================================

/**
 * IPアドレス正規化 (空白削除、小文字変換)
 */
function normalizeIP(ip: string): string {
  return ip.trim().toLowerCase();
}

/**
 * IPv4アドレス有効性検証
 */
function isValidIPv4(ip: string): boolean {
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Pattern);

  if (!match) return false;

  // 各オクテットが0-255範囲か確認
  return match.slice(1, 5).every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * IPv6アドレス有効性検証
 */
function isValidIPv6(ip: string): boolean {
  // 簡単なIPv6パターン検証
  const ipv6Pattern = /^([0-9a-f]{0,4}:){7}[0-9a-f]{0,4}$/i;
  const compressedPattern = /^((?:[0-9a-f]{0,4}:)*::(?:[0-9a-f]{0,4}:*)*)[0-9a-f]{0,4}$/i;

  return ipv6Pattern.test(ip) || compressedPattern.test(ip);
}

/**
 * IPアドレス有効性検証 (IPv4/IPv6)
 */
function isValidIP(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

/**
 * IPアドレスがプライベート範囲か確認
 */
function isPrivateIP(ip: string): boolean {
  const normalized = normalizeIP(ip);

  // localhost 체크
  if (LOCALHOST_ADDRESSES.includes(normalized)) {
    return true;
  }

  // 사설 IP 패턴 체크
  return PRIVATE_IP_RANGES.some(pattern => pattern.test(normalized));
}

/**
 * IPバージョン確認
 */
function getIPVersion(ip: string): 'IPv4' | 'IPv6' {
  return ip.includes(':') ? 'IPv6' : 'IPv4';
}

/**
 * x-forwarded-forヘッダーパース
 * 形式: "client, proxy1, proxy2"
 */
function parseXForwardedFor(header: string | null): string[] {
  if (!header) return [];

  return header
    .split(',')
    .map(ip => normalizeIP(ip))
    .filter(ip => ip.length > 0);
}

/**
 * Cloudflare IPか確認
 */
function isCloudflareIP(ip: string): boolean {
  return CLOUDFLARE_IP_PATTERNS.some(pattern => pattern.test(ip));
}

// =====================================================
// Main Validation Function
// =====================================================

/**
 * HTTPヘッダーからクライアントIPアドレスを抽出・検証します。
 *
 * 優先順位:
 * 1. cf-connecting-ip (Cloudflare) - 最も信頼
 * 2. x-forwarded-for (プロキシチェーン検証)
 * 3. x-real-ip (nginx)
 * 4. fallback (直接接続)
 */
export function validateClientIP(
  headers: {
    'cf-connecting-ip'?: string;
    'x-forwarded-for'?: string;
    'x-real-ip'?: string;
  },
  options: IPValidatorOptions = {}
): IPValidationResult {
  const {
    trustedProxies = [],
    allowPrivateIP = false,
    strictMode = true,
  } = options;

  const warnings: string[] = [];
  const rawHeaders: IPValidationResult['metadata']['rawHeaders'] = {};
  let proxyChain: string[] | undefined;

  // ===================================================
  // 1. Cloudflare cf-connecting-ip確認 (最も信頼)
  // ===================================================

  const cfIP = headers['cf-connecting-ip'];
  rawHeaders.cfConnectingIP = cfIP;

  if (cfIP && isValidIP(cfIP)) {
    const normalizedCF = normalizeIP(cfIP);
    const isPrivate = isPrivateIP(normalizedCF);

    if (isPrivate && !allowPrivateIP) {
      warnings.push('Cloudflare IPがプライベート範囲です。ヘッダースプーフィングの可能性。');
    }

    return {
      clientIP: normalizedCF,
      trustLevel: isPrivate ? 'suspicious' : 'trusted',
      source: 'cf-connecting-ip',
      warnings,
      metadata: {
        rawHeaders,
        proxyChain: undefined,
        ipVersion: getIPVersion(normalizedCF),
        isPrivate,
        validatedAt: new Date().toISOString(),
      },
    };
  }

  // ===================================================
  // 2. x-forwarded-forヘッダー確認 (プロキシチェーン)
  // ===================================================

  const xff = headers['x-forwarded-for'];
  rawHeaders.xForwardedFor = xff;

  if (xff) {
    proxyChain = parseXForwardedFor(xff);

    if (proxyChain.length > 0) {
      // 最初のIPがクライアントIP (最左)
      const clientIP = proxyChain[0];

      if (isValidIP(clientIP)) {
        const isPrivate = isPrivateIP(clientIP);
        const isTrustedProxy = proxyChain.slice(1).every(proxy =>
          trustedProxies.includes(proxy) || isCloudflareIP(proxy)
        );

        // プロキシチェーン検証
        if (strictMode && !isTrustedProxy && proxyChain.length > 1) {
          warnings.push(
            `プロキシチェーンに信頼できないIPが含まれています: ${proxyChain.slice(1).join(', ')}`
          );
        }

        if (isPrivate && !allowPrivateIP) {
          warnings.push('x-forwarded-forのクライアントIPがプライベート範囲です。');
        }

        return {
          clientIP: normalizeIP(clientIP),
          trustLevel: isTrustedProxy ? 'verified' : 'suspicious',
          source: 'x-forwarded-for',
          warnings,
          metadata: {
            rawHeaders,
            proxyChain,
            ipVersion: getIPVersion(clientIP),
            isPrivate,
            validatedAt: new Date().toISOString(),
          },
        };
      }
    }
  }

  // ===================================================
  // 3. x-real-ipヘッダー確認 (nginx)
  // ===================================================

  const realIP = headers['x-real-ip'];
  rawHeaders.xRealIP = realIP;

  if (realIP && isValidIP(realIP)) {
    const normalizedReal = normalizeIP(realIP);
    const isPrivate = isPrivateIP(normalizedReal);

    if (isPrivate && !allowPrivateIP) {
      warnings.push('x-real-ipがプライベート範囲です。');
    }

    warnings.push('cf-connecting-ipとx-forwarded-forがないためx-real-ipを使用します。');

    return {
      clientIP: normalizedReal,
      trustLevel: isPrivate ? 'suspicious' : 'verified',
      source: 'x-real-ip',
      warnings,
      metadata: {
        rawHeaders,
        proxyChain,
        ipVersion: getIPVersion(normalizedReal),
        isPrivate,
        validatedAt: new Date().toISOString(),
      },
    };
  }

  // ===================================================
  // 4. Fallback (ヘッダーなし)
  // ===================================================

  warnings.push(
    'IP追跡ヘッダーがありません。直接接続またはヘッダー転送なし。'
  );

  return {
    clientIP: 'unknown',
    trustLevel: 'untrusted',
    source: 'fallback',
    warnings,
    metadata: {
      rawHeaders,
      proxyChain,
      ipVersion: 'IPv4',
      isPrivate: false,
      validatedAt: new Date().toISOString(),
    },
  };
}

/**
 * IPアドレスで地域情報取得 (オプション機能)
 *
 * GeoIPデータベース連携時使用
 */
export async function getGeoLocation(
  ip: string
): Promise<{
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
} | null> {
  // 実装必要: GeoIPデータベースまたはAPI連携
  // 例: MaxMind GeoLite2, IP-API.com等

  if (ip === 'unknown') {
    return null;
  }

  // TODO: GeoIP検索実装
  return null;
}

// =====================================================
// Audit Log Helpers
// =====================================================

/**
 * IP検証結果を監査ログ形式に変換
 */
export function formatAuditLog(
  validation: IPValidationResult,
  additionalContext?: Record<string, any>
): string {
  const logData = {
    timestamp: validation.metadata.validatedAt,
    client_ip: validation.clientIP,
    trust_level: validation.trustLevel,
    source: validation.source,
    ip_version: validation.metadata.ipVersion,
    is_private: validation.metadata.isPrivate,
    warnings: validation.warnings,
    proxy_chain: validation.metadata.proxyChain,
    ...additionalContext,
  };

  return JSON.stringify(logData);
}

/**
 * IP検証結果をデータベース保存用オブジェクトに変換
 */
export function toDatabaseRecord(
  validation: IPValidationResult,
  signatureId?: string
): {
  signature_id?: string;
  client_ip: string;
  trust_level: string;
  source: string;
  ip_version: string;
  is_private: boolean;
  warnings: string[];
  proxy_chain: string[] | null;
  raw_headers: any;
  validated_at: string;
} {
  return {
    signature_id: signatureId,
    client_ip: validation.clientIP,
    trust_level: validation.trustLevel,
    source: validation.source,
    ip_version: validation.metadata.ipVersion,
    is_private: validation.metadata.isPrivate,
    warnings: validation.warnings,
    proxy_chain: validation.metadata.proxyChain || null,
    raw_headers: validation.metadata.rawHeaders,
    validated_at: validation.metadata.validatedAt,
  };
}

// =====================================================
// Security & Compliance Helpers
// =====================================================

/**
 * 日本電子署名法準拠のためのIP検証ルール
 *
 * 電子署名法第4条 (電子署名の作成等)
 * - 電子署名作成開始・完了時刻の記録
 * - 電子署名作成場所のIPアドレス記録
 * - 偽造・変造防止のための完全性確保
 */
export function checkJapaneseESignCompliance(
  validation: IPValidationResult
): {
  compliant: boolean;
  requirements: string[];
  issues: string[];
} {
  const requirements: string[] = [
    '電子署名作成時刻記録 (timestamp)',
    '電子署名作成場所のIPアドレス記録',
    'IPアドレス検証および信頼度評価',
    'データ完全性確保 (audit log)',
  ];

  const issues: string[] = [];

  if (validation.clientIP === 'unknown') {
    issues.push('クライアントIPを識別できません。');
  }

  if (validation.trustLevel === 'untrusted') {
    issues.push('IPアドレス信頼度が低いです。ヘッダースプーフィングの可能性。');
  }

  if (validation.metadata.isPrivate) {
    issues.push('プライベートIPアドレスです。実際の位置追跡が困難です。');
  }

  if (validation.warnings.length > 0) {
    issues.push(`IP検証警告: ${validation.warnings.join(', ')}`);
  }

  return {
    compliant: issues.length === 0,
    requirements,
    issues,
  };
}

/**
 * 個人情報保護法 (APPI) 準拠のためのデータマスキング
 *
 * 日本個人情報保護法に従いIPアドレスの一部をマスキング
 * - IPv4: 最後のオクテットマスキング (例: 192.168.1.xxx)
 * - IPv6: 最後の64ビットマスキング
 */
export function maskIPForPrivacy(ip: string): string {
  if (!isValidIP(ip)) {
    return ip;
  }

  if (ip.includes(':')) {
    // IPv6: 最後の4グループマスキング
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + ':xxxx:xxxx:xxxx:xxxx';
  } else {
    // IPv4: 最後のオクテットマスキング
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
}

// =====================================================
// Next.js Helpers
// =====================================================

/**
 * Next.js APIリクエストヘッダーからIP抽出
 */
export function extractIPFromNextRequest(
  request: Request
): IPValidationResult {
  const headers: Record<string, string> = {};

  if (request.headers.has('cf-connecting-ip')) {
    headers['cf-connecting-ip'] = request.headers.get('cf-connecting-ip')!;
  }

  if (request.headers.has('x-forwarded-for')) {
    headers['x-forwarded-for'] = request.headers.get('x-forwarded-for')!;
  }

  if (request.headers.has('x-real-ip')) {
    headers['x-real-ip'] = request.headers.get('x-real-ip')!;
  }

  return validateClientIP(headers, {
    allowPrivateIP: process.env.NODE_ENV === 'development',
    strictMode: process.env.NODE_ENV === 'production',
  });
}
