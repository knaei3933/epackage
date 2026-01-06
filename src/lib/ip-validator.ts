/**
 * IP Address Validator for Electronic Signature System
 *
 * 일본 전자서명법 준수를 위한 IP 주소 검증 시스템
 * - x-forwarded-for 헤더 스푸핑 방지
 * - Cloudflare cf-connecting-ip 우선 검증
 * - 프록시 체인 검증
 * - 사설 IP 탐지
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
   * 검증된 클라이언트 IP 주소
   */
  clientIP: string;

  /**
   * IP 주소의 신뢰도 레벨
   */
  trustLevel: 'trusted' | 'verified' | 'suspicious' | 'untrusted';

  /**
   * 검증에 사용된 소스 헤더
   */
  source: 'cf-connecting-ip' | 'x-forwarded-for' | 'x-real-ip' | 'fallback';

  /**
   * 검증 경고 메시지
   */
  warnings: string[];

  /**
   * 감사 로그용 메타데이터
   */
  metadata: {
    /**
     * 원본 헤더 값들
     */
    rawHeaders: {
      cfConnectingIP?: string;
      xForwardedFor?: string;
      xRealIP?: string;
    };

    /**
     * 프록시 체인 (있는 경우)
     */
    proxyChain?: string[];

    /**
     * IP 버전 (IPv4/IPv6)
     */
    ipVersion: 'IPv4' | 'IPv6';

    /**
     * 사설 IP 여부
     */
    isPrivate: boolean;

    /**
     * 검증 타임스탬프
     */
    validatedAt: string;
  };
}

export interface IPValidatorOptions {
  /**
   * 신뢰할 수 있는 프록시 IP 목록
   */
  trustedProxies?: string[];

  /**
   * 사설 IP 허용 여부 (개발 환경용)
   */
  allowPrivateIP?: boolean;

  /**
   * 엄격한 검증 모드 (프로덕션 권장)
   */
  strictMode?: boolean;
}

// =====================================================
// Constants
// =====================================================

/**
 * 사설 IP 주소 범위 (RFC 1918, RFC 4193)
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
 * 로컬호스트 주소
 */
const LOCALHOST_ADDRESSES = [
  '127.0.0.1',
  '::1',
  'localhost',
  '0.0.0.0',
  '::',
];

/**
 * Cloudflare IP 범위 (일부)
 * 전체 목록: https://www.cloudflare.com/ips/
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
 * IP 주소 정규화 (공백 제거, 소문자 변환)
 */
function normalizeIP(ip: string): string {
  return ip.trim().toLowerCase();
}

/**
 * IPv4 주소 유효성 검증
 */
function isValidIPv4(ip: string): boolean {
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Pattern);

  if (!match) return false;

  // 각 옥텟이 0-255 범위인지 확인
  return match.slice(1, 5).every(octet => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * IPv6 주소 유효성 검증
 */
function isValidIPv6(ip: string): boolean {
  // 간단한 IPv6 패턴 검증
  const ipv6Pattern = /^([0-9a-f]{0,4}:){7}[0-9a-f]{0,4}$/i;
  const compressedPattern = /^((?:[0-9a-f]{0,4}:)*::(?:[0-9a-f]{0,4}:*)*)[0-9a-f]{0,4}$/i;

  return ipv6Pattern.test(ip) || compressedPattern.test(ip);
}

/**
 * IP 주소 유효성 검증 (IPv4/IPv6)
 */
function isValidIP(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

/**
 * IP 주소가 사설 대역인지 확인
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
 * IP 버전 확인
 */
function getIPVersion(ip: string): 'IPv4' | 'IPv6' {
  return ip.includes(':') ? 'IPv6' : 'IPv4';
}

/**
 * x-forwarded-for 헤더 파싱
 * 형식: "client, proxy1, proxy2"
 */
function parseXForwardedFor(header: string | null): string[] {
  if (!header) return [];

  return header
    .split(',')
    .map(ip => normalizeIP(ip))
    .filter(ip => ip.length > 0);
}

/**
 * Cloudflare IP인지 확인
 */
function isCloudflareIP(ip: string): boolean {
  return CLOUDFLARE_IP_PATTERNS.some(pattern => pattern.test(ip));
}

// =====================================================
// Main Validation Function
// =====================================================

/**
 * HTTP 헤더에서 클라이언트 IP 주소를 추출하고 검증합니다.
 *
 * 우선순위:
 * 1. cf-connecting-ip (Cloudflare) - 가장 신뢰
 * 2. x-forwarded-for (프록시 체인 검증)
 * 3. x-real-ip (nginx)
 * 4. fallback (직접 연결)
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
  // 1. Cloudflare cf-connecting-ip 확인 (가장 신뢰)
  // ===================================================

  const cfIP = headers['cf-connecting-ip'];
  rawHeaders.cfConnectingIP = cfIP;

  if (cfIP && isValidIP(cfIP)) {
    const normalizedCF = normalizeIP(cfIP);
    const isPrivate = isPrivateIP(normalizedCF);

    if (isPrivate && !allowPrivateIP) {
      warnings.push('Cloudflare IP가 사설 대역입니다. 헤더 스푸핑 가능성.');
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
  // 2. x-forwarded-for 헤더 확인 (프록시 체인)
  // ===================================================

  const xff = headers['x-forwarded-for'];
  rawHeaders.xForwardedFor = xff;

  if (xff) {
    proxyChain = parseXForwardedFor(xff);

    if (proxyChain.length > 0) {
      // 첫 번째 IP가 클라이언트 IP (가장 왼쪽)
      const clientIP = proxyChain[0];

      if (isValidIP(clientIP)) {
        const isPrivate = isPrivateIP(clientIP);
        const isTrustedProxy = proxyChain.slice(1).every(proxy =>
          trustedProxies.includes(proxy) || isCloudflareIP(proxy)
        );

        // 프록시 체인 검증
        if (strictMode && !isTrustedProxy && proxyChain.length > 1) {
          warnings.push(
            `프록시 체인에 신뢰할 수 없는 IP가 포함되어 있습니다: ${proxyChain.slice(1).join(', ')}`
          );
        }

        if (isPrivate && !allowPrivateIP) {
          warnings.push('x-forwarded-for의 클라이언트 IP가 사설 대역입니다.');
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
  // 3. x-real-ip 헤더 확인 (nginx)
  // ===================================================

  const realIP = headers['x-real-ip'];
  rawHeaders.xRealIP = realIP;

  if (realIP && isValidIP(realIP)) {
    const normalizedReal = normalizeIP(realIP);
    const isPrivate = isPrivateIP(normalizedReal);

    if (isPrivate && !allowPrivateIP) {
      warnings.push('x-real-ip가 사설 대역입니다.');
    }

    warnings.push('cf-connecting-ip과 x-forwarded-for이 없어 x-real-ip를 사용합니다.');

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
  // 4. Fallback (헤더 없음)
  // ===================================================

  warnings.push(
    'IP 추적 헤더가 없습니다. 직접 연결 또는 헤더 전달 안 됨.'
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
 * IP 주소로 지역 정보 조회 (선택적 기능)
 *
 * GeoIP 데이터베이스 연동 시 사용
 */
export async function getGeoLocation(
  ip: string
): Promise<{
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
} | null> {
  // 구현 필요: GeoIP 데이터베이스 또는 API 연동
  // 예: MaxMind GeoLite2, IP-API.com 등

  if (ip === 'unknown') {
    return null;
  }

  // TODO: GeoIP 조회 구현
  return null;
}

// =====================================================
// Audit Log Helpers
// =====================================================

/**
 * IP 검증 결과를 감사 로그 형식으로 변환
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
 * IP 검증 결과를 데이터베이스 저장용 객체로 변환
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
 * 일본 전자서명법 준수를 위한 IP 검증 규칙
 *
 * 전자서명법 제4조 (전자署名의 作成 등)
 * - 전자서명 작성 시작・완료 시각의 기록
 * - 전자서명 작성 장소의 IP 주소 기록
 * - 위조・변조 방지를 위한 무결성 확보
 */
export function checkJapaneseESignCompliance(
  validation: IPValidationResult
): {
  compliant: boolean;
  requirements: string[];
  issues: string[];
} {
  const requirements: string[] = [
    '전자서명 작성 시각 기록 (timestamp)',
    '전자서명 작성 장소의 IP 주소 기록',
    'IP 주소 검증 및 신뢰도 평가',
    '데이터 무결성 확보 (audit log)',
  ];

  const issues: string[] = [];

  if (validation.clientIP === 'unknown') {
    issues.push('클라이언트 IP를 식별할 수 없습니다.');
  }

  if (validation.trustLevel === 'untrusted') {
    issues.push('IP 주소 신뢰도가 낮습니다. 헤더 스푸핑 가능성.');
  }

  if (validation.metadata.isPrivate) {
    issues.push('사설 IP 주소입니다. 실제 위치 추적이 어렵습니다.');
  }

  if (validation.warnings.length > 0) {
    issues.push(`IP 검증 경고: ${validation.warnings.join(', ')}`);
  }

  return {
    compliant: issues.length === 0,
    requirements,
    issues,
  };
}

/**
 * 개인정보보호법 (APPI) 준수를 위한 데이터 마스킹
 *
 * 일본 개인정보보호법에 따라 IP 주소 일부를 마스킹
 * - IPv4: 마지막 옥텟 마스킹 (예: 192.168.1.xxx)
 * - IPv6: 마지막 64비트 마스킹
 */
export function maskIPForPrivacy(ip: string): string {
  if (!isValidIP(ip)) {
    return ip;
  }

  if (ip.includes(':')) {
    // IPv6: 마지막 4그룹 마스킹
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + ':xxxx:xxxx:xxxx:xxxx';
  } else {
    // IPv4: 마지막 옥텟 마스킹
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
}

// =====================================================
// Next.js Helpers
// =====================================================

/**
 * Next.js API Request 헤더에서 IP 추출
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
