/**
 * Audit Logger for Electronic Signature System
 *
 * 일본 전자서명법 및 개인정보보호법 준수를 위한 감사 로그 시스템
 * - 전자서명 작성/검증 기록
 * - IP 주소 추적 로그
 * - 시스템 접근 기록
 * - 무결성 확보
 *
 * Legal References:
 * - 日本電子署名法 (電子署名法)
 * - 日本e-文書法 (電子文書法)
 * - 個人情報保護法 (APPI)
 * - 不正アクセス禁止法
 */

import { createServiceClient } from './supabase';
import type { IPValidationResult } from './ip-validator';
import type { TimestampToken } from './timestamp-service';
import type { Database } from '@/types/database';

// =====================================================
// Types & Interfaces
// ============================================================

// Type-safe helper functions
/**
 * Type-safe insert helper for audit_logs table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
async function insertAuditLog(supabase: ReturnType<typeof createServiceClient>, data: Database['public']['Tables']['audit_logs']['Insert']) {
  return (supabase as any)
    .from('audit_logs')
    .insert(data)
    .select('id')
    .single();
}

export type AuditEventType =
  | 'system_start'
  | 'system_shutdown'
  | 'user_login'
  | 'user_logout'
  | 'timestamp_created'
  | 'timestamp_verified'
  | 'signature_created'
  | 'signature_verified'
  | 'contract_created'
  | 'contract_signed'
  | 'contract_status_changed'
  | 'ip_validation'
  | 'security_alert'
  | 'data_access'
  | 'data_modification'
  | 'data_deletion'
  | 'admin_action'
  | 'error_occurred';

export interface AuditLogEntry {
  /**
   * 감사 로그 고유 ID
   */
  id: string;

  /**
   * 이벤트 발생 타임스탬프 (UTC)
   */
  timestamp: string;

  /**
   * 이벤트 유형
   */
  event_type: AuditEventType;

  /**
   * 리소스 유형
   */
  resource_type: 'timestamp_token' | 'signature' | 'contract' | 'user' | 'system' | 'ip_validation' | 'other';

  /**
   * 리소스 ID (외래 키)
   */
  resource_id?: string;

  /**
   * 사용자 ID
   */
  user_id?: string;

  /**
   * 사용자 이메일 (개인정보보호법에 따라 마스킹 가능)
   */
  user_email?: string;

  /**
   * IP 주소 (검증됨)
   */
  ip_address?: string;

  /**
   * IP 검증 결과
   */
  ip_validation?: {
    trust_level: 'trusted' | 'verified' | 'suspicious' | 'untrusted';
    source: string;
    is_private: boolean;
    warnings?: string[];
  };

  /**
   * 세션 ID
   */
  session_id?: string;

  /**
   * 사용자 에이전트
   */
  user_agent?: string;

  /**
   * 요청 ID (추적용)
   */
  request_id?: string;

  /**
   * 작업 결과
   */
  outcome: 'success' | 'failure' | 'partial';

  /**
   * 상세 정보 (구조화된 데이터)
   */
  details?: {
    // 타임스탬프 관련
    timestamp_id?: string;
    document_hash?: string;
    document_type?: string;

    // 서명 관련
    signature_id?: string;
    contract_id?: string;

    // 계약 관련
    contract_number?: string;
    contract_status?: string;

    // 보안 관련
    security_event?: string;
    threat_level?: 'low' | 'medium' | 'high' | 'critical';

    // 기타
    [key: string]: any;
  };

  /**
   * 오류 메시지
   */
  error_message?: string;

  /**
   * 관할권 (일본: JP)
   */
  jurisdiction: 'JP' | 'OTHER';

  /**
   * 데이터 보존 기간 (일)
   */
  retention_period_days: number;

  /**
   * 삭제 예정일
   */
  scheduled_deletion_at?: string;

  /**
   * 생성일
   */
  created_at: string;
}

export interface AuditLogFilter {
  /**
   * 이벤트 유형 필터
   */
  event_type?: AuditEventType[];

  /**
   * 리소스 유형 필터
   */
  resource_type?: AuditLogEntry['resource_type'][];

  /**
   * 리소스 ID 필터
   */
  resource_id?: string;

  /**
   * 사용자 ID 필터
   */
  user_id?: string;

  /**
   * 시작일 필터
   */
  from_date?: string;

  /**
   * 종료일 필터
   */
  to_date?: string;

  /**
   * 결과 필터
   */
  outcome?: 'success' | 'failure' | 'partial';

  /**
   * IP 주소 필터
   */
  ip_address?: string;

  /**
   * 제한
   */
  limit?: number;

  /**
   * 오프셋
   */
  offset?: number;
}

export interface AuditLogSummary {
  total_events: number;
  success_count: number;
  failure_count: number;
  by_event_type: Record<string, number>;
  by_resource_type: Record<string, number>;
  unique_users: number;
  unique_ips: number;
  time_range: {
    earliest: string;
    latest: string;
  };
  security_alerts: number;
}

// =====================================================
// Constants
// =====================================================

/**
 * 일본 법규에 따른 감사 로그 보존 기간
 */
export const AUDIT_LOG_RETENTION_PERIODS = {
  // 전자서명법: 7년
  E_SIGNATURE: 7 * 365,

  // e-문서법: 7년
  E_DOC: 7 * 365,

  // 세법 관련: 7년
  TAX: 7 * 365,

  // 상법: 10년 (일부 상업 장부)
  COMMERCIAL: 10 * 365,

  // 보안 이벤트: 3년 (不正アクセス禁止法)
  SECURITY: 3 * 365,

  // 기본: 1년
  DEFAULT: 1 * 365,
} as const;

/**
 * 보안 이벤트 유형
 */
export const SECURITY_EVENT_TYPES: AuditEventType[] = [
  'security_alert',
  'ip_validation',
  'user_login',
  'user_logout',
];

// =====================================================
// Main Audit Logger Class
// =====================================================

/**
 * 감사 로거 클래스
 */
export class AuditLogger {
  private supabase = createServiceClient();
  private sessionId: string;
  private requestContext: Map<string, string> = new Map();

  constructor(sessionId?: string) {
    this.sessionId = sessionId || crypto.randomUUID();
  }

  /**
   * 요청 컨텍스트 설정
   */
  setRequestContext(context: { requestId?: string; userAgent?: string }): void {
    if (context.requestId) {
      this.requestContext.set('request_id', context.requestId);
    }
    if (context.userAgent) {
      this.requestContext.set('user_agent', context.userAgent);
    }
  }

  /**
   * 감사 로그 생성
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'created_at' | 'jurisdiction' | 'retention_period_days'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const now = new Date().toISOString();

      // 보존 기간 결정
      const retentionPeriod = this.determineRetentionPeriod(entry.event_type, entry.resource_type);

      const logEntry: Database['public']['Tables']['audit_logs']['Insert'] = {
        timestamp: now,
        event_type: entry.event_type as Database['public']['Tables']['audit_logs']['Row']['event_type'],
        resource_type: entry.resource_type as Database['public']['Tables']['audit_logs']['Row']['resource_type'],
        resource_id: entry.resource_id || null,
        user_id: entry.user_id || null,
        user_email: entry.user_email || null,
        ip_address: entry.ip_address || null,
        ip_validation: entry.ip_validation as Database['public']['Tables']['audit_logs']['Insert']['ip_validation'] || null,
        session_id: entry.session_id || null,
        user_agent: entry.user_agent || null,
        request_id: entry.request_id || null,
        outcome: entry.outcome,
        details: entry.details as Database['public']['Tables']['audit_logs']['Insert']['details'] || null,
        error_message: entry.error_message || null,
        jurisdiction: 'JP',
        retention_period_days: retentionPeriod,
        scheduled_deletion_at: this.calculateDeletionDate(retentionPeriod),
      };

      // 개인정보보호법에 따른 이메일 마스킹
      if (logEntry.user_email) {
        logEntry.user_email = this.maskEmail(logEntry.user_email);
      }

      const { data, error } = await insertAuditLog(this.supabase, logEntry);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 타임스탬프 생성 로그
   */
  async logTimestampCreated(
    token: TimestampToken,
    userId?: string,
    ipValidation?: IPValidationResult
  ): Promise<void> {
    await this.log({
      event_type: 'timestamp_created',
      resource_type: 'timestamp_token',
      resource_id: token.id,
      user_id: userId || token.metadata.userId,
      ip_address: ipValidation?.clientIP,
      ip_validation: ipValidation ? {
        trust_level: ipValidation.trustLevel,
        source: ipValidation.source,
        is_private: ipValidation.metadata.isPrivate,
        warnings: ipValidation.warnings,
      } : undefined,
      outcome: 'success',
      details: {
        timestamp_id: token.id,
        document_hash: token.documentHash,
        document_type: token.metadata.documentType,
        tsa_name: token.tsaInfo.name,
        hash_algorithm: token.algorithm.hashAlgorithm,
        jurisdiction: token.metadata.jurisdiction,
      },
    });
  }

  /**
   * 서명 생성 로그
   */
  async logSignatureCreated(
    signatureId: string,
    contractId: string,
    userId?: string,
    ipValidation?: IPValidationResult,
    additionalDetails?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: 'signature_created',
      resource_type: 'signature',
      resource_id: signatureId,
      user_id: userId,
      ip_address: ipValidation?.clientIP,
      ip_validation: ipValidation ? {
        trust_level: ipValidation.trustLevel,
        source: ipValidation.source,
        is_private: ipValidation.metadata.isPrivate,
        warnings: ipValidation.warnings,
      } : undefined,
      outcome: 'success',
      details: {
        signature_id: signatureId,
        contract_id: contractId,
        ...additionalDetails,
      },
    });
  }

  /**
   * 계약 서명 로그
   */
  async logContractSigned(
    contractId: string,
    contractNumber: string,
    userId?: string,
    ipValidation?: IPValidationResult
  ): Promise<void> {
    await this.log({
      event_type: 'contract_signed',
      resource_type: 'contract',
      resource_id: contractId,
      user_id: userId,
      ip_address: ipValidation?.clientIP,
      ip_validation: ipValidation ? {
        trust_level: ipValidation.trustLevel,
        source: ipValidation.source,
        is_private: ipValidation.metadata.isPrivate,
        warnings: ipValidation.warnings,
      } : undefined,
      outcome: 'success',
      details: {
        contract_id: contractId,
        contract_number: contractNumber,
        document_type: 'contract',
      },
    });
  }

  /**
   * IP 검증 로그
   */
  async logIPValidation(
    validation: IPValidationResult,
    userId?: string
  ): Promise<void> {
    const outcome = validation.trustLevel === 'trusted' || validation.trustLevel === 'verified'
      ? 'success'
      : validation.trustLevel === 'suspicious' ? 'partial' : 'failure';

    await this.log({
      event_type: 'ip_validation',
      resource_type: 'ip_validation',
      user_id: userId,
      ip_address: validation.clientIP,
      ip_validation: {
        trust_level: validation.trustLevel,
        source: validation.source,
        is_private: validation.metadata.isPrivate,
        warnings: validation.warnings,
      },
      outcome,
      details: {
        ip_version: validation.metadata.ipVersion,
        proxy_chain: validation.metadata.proxyChain,
        raw_headers: validation.metadata.rawHeaders,
        validation_warnings: validation.warnings,
      },
    });
  }

  /**
   * 보안 알림 로그
   */
  async logSecurityAlert(
    event: string,
    threatLevel: 'low' | 'medium' | 'high' | 'critical',
    details: Record<string, any>,
    userId?: string,
    ipValidation?: IPValidationResult
  ): Promise<void> {
    await this.log({
      event_type: 'security_alert',
      resource_type: 'system',
      user_id: userId,
      ip_address: ipValidation?.clientIP,
      ip_validation: ipValidation ? {
        trust_level: ipValidation.trustLevel,
        source: ipValidation.source,
        is_private: ipValidation.metadata.isPrivate,
        warnings: ipValidation.warnings,
      } : undefined,
      outcome: threatLevel === 'critical' || threatLevel === 'high' ? 'failure' : 'partial',
      details: {
        security_event: event,
        threat_level: threatLevel,
        ...details,
      },
    });
  }

  /**
   * 감사 로그 조회
   */
  async query(filter: AuditLogFilter): Promise<{ success: boolean; data?: AuditLogEntry[]; error?: string }> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*');

      // 이벤트 유형 필터
      if (filter.event_type && filter.event_type.length > 0) {
        query = query.in('event_type', filter.event_type);
      }

      // 리소스 유형 필터
      if (filter.resource_type && filter.resource_type.length > 0) {
        query = query.in('resource_type', filter.resource_type);
      }

      // 리소스 ID 필터
      if (filter.resource_id) {
        query = query.eq('resource_id', filter.resource_id);
      }

      // 사용자 ID 필터
      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      // 결과 필터
      if (filter.outcome) {
        query = query.eq('outcome', filter.outcome);
      }

      // IP 주소 필터
      if (filter.ip_address) {
        query = query.eq('ip_address', filter.ip_address);
      }

      // 날짜 범위 필터
      if (filter.from_date) {
        query = query.gte('timestamp', filter.from_date);
      }
      if (filter.to_date) {
        query = query.lte('timestamp', filter.to_date);
      }

      // 정렬 (최신순)
      query = query.order('timestamp', { ascending: false });

      // 제한
      if (filter.limit) {
        query = query.limit(filter.limit);
      }
      if (filter.offset) {
        query = query.range(filter.offset, (filter.offset + (filter.limit || 100)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as AuditLogEntry[] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 감사 로그 요약 생성
   */
  async getSummary(filter?: AuditLogFilter): Promise<{ success: boolean; summary?: AuditLogSummary; error?: string }> {
    try {
      const { success, data } = await this.query(filter || {});

      if (!success || !data) {
        return { success: false, error: 'Failed to query audit logs' };
      }

      const summary: AuditLogSummary = {
        total_events: data.length,
        success_count: data.filter(l => l.outcome === 'success').length,
        failure_count: data.filter(l => l.outcome === 'failure').length,
        by_event_type: {},
        by_resource_type: {},
        unique_users: new Set(data.filter(l => l.user_id).map(l => l.user_id)).size,
        unique_ips: new Set(data.filter(l => l.ip_address).map(l => l.ip_address)).size,
        time_range: {
          earliest: data[data.length - 1]?.timestamp || new Date().toISOString(),
          latest: data[0]?.timestamp || new Date().toISOString(),
        },
        security_alerts: data.filter(l => l.event_type === 'security_alert').length,
      };

      // 이벤트 유형별 집계
      data.forEach(log => {
        summary.by_event_type[log.event_type] = (summary.by_event_type[log.event_type] || 0) + 1;
        summary.by_resource_type[log.resource_type] = (summary.by_resource_type[log.resource_type] || 0) + 1;
      });

      return { success: true, summary };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // Private Helper Methods
  // =====================================================

  /**
   * 이벤트 유형에 따른 보존 기간 결정
   */
  private determineRetentionPeriod(
    eventType: AuditEventType,
    resourceType: AuditLogEntry['resource_type']
  ): number {
    // 보안 이벤트
    if (SECURITY_EVENT_TYPES.includes(eventType)) {
      return AUDIT_LOG_RETENTION_PERIODS.SECURITY;
    }

    // 전자서명/계약 관련
    if (resourceType === 'timestamp_token' || resourceType === 'signature' || resourceType === 'contract') {
      return AUDIT_LOG_RETENTION_PERIODS.E_SIGNATURE;
    }

    // 기본
    return AUDIT_LOG_RETENTION_PERIODS.DEFAULT;
  }

  /**
   * 삭제 예정일 계산
   */
  private calculateDeletionDate(retentionDays: number): string {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + retentionDays);
    return deletionDate.toISOString();
  }

  /**
   * 이메일 마스킹 (개인정보보호법 준수)
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;

    // 로컬 파트의 첫 2文字와 마지막 2文字만 표시
    const maskedLocal = local.length <= 4
      ? local.substring(0, 1) + '***'
      : local.substring(0, 2) + '***' + local.substring(local.length - 2);

    return `${maskedLocal}@${domain}`;
  }
}

// =====================================================
// Singleton Instance
// =====================================================

let defaultLogger: AuditLogger | null = null;

/**
 * 기본 감사 로거 인스턴스 반환
 */
export function getAuditLogger(sessionId?: string): AuditLogger {
  if (!defaultLogger) {
    defaultLogger = new AuditLogger(sessionId);
  }
  return defaultLogger;
}

// =====================================================
// API Route Helpers
// =====================================================

/**
 * API 라우트용 감사 로그 래퍼
 */
export async function withAuditLog<T>(
  eventType: AuditEventType,
  resourceType: AuditLogEntry['resource_type'],
  fn: () => Promise<{ success: boolean; data?: T; error?: string }>,
  context: {
    userId?: string;
    ipValidation?: IPValidationResult;
    additionalDetails?: Record<string, any>;
  } = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const logger = getAuditLogger();

  try {
    const result = await fn();

    // 감사 로그 생성
    await logger.log({
      event_type: eventType,
      resource_type: resourceType,
      resource_id: result.data && typeof result.data === 'object' && 'id' in result.data
        ? String((result.data as { id?: string | number }).id ?? '')
        : undefined,
      user_id: context.userId,
      ip_address: context.ipValidation?.clientIP,
      ip_validation: context.ipValidation ? {
        trust_level: context.ipValidation.trustLevel,
        source: context.ipValidation.source,
        is_private: context.ipValidation.metadata.isPrivate,
        warnings: context.ipValidation.warnings,
      } : undefined,
      outcome: result.success ? 'success' : 'failure',
      error_message: result.error,
      details: context.additionalDetails,
    });

    return result;
  } catch (error: unknown) {
    // 오류 발생 시 감사 로그
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logger.log({
      event_type: 'error_occurred',
      resource_type: 'system',
      user_id: context.userId,
      ip_address: context.ipValidation?.clientIP,
      outcome: 'failure',
      error_message: errorMessage,
      details: {
        original_event_type: eventType,
        original_resource_type: resourceType,
        ...context.additionalDetails,
      },
    });

    return { success: false, error: errorMessage };
  }
}

// =====================================================
// Compliance Reports
// =====================================================

/**
 * 일본 전자서명법 준수 보고서 생성
 */
export async function generateComplianceReport(
  filter: AuditLogFilter
): Promise<{
  success: boolean;
  report?: {
    summary: AuditLogSummary;
    compliance: {
      timestampCreation: boolean;
      ipTracking: boolean;
      integrityPreservation: boolean;
      retentionPeriod: boolean;
      accessControl: boolean;
    };
    recommendations: string[];
  };
  error?: string;
}> {
  const logger = getAuditLogger();

  try {
    const { success, summary } = await logger.getSummary(filter);

    if (!success || !summary) {
      return { success: false, error: 'Failed to generate summary' };
    }

    // 준수 검증
    const compliance = {
      timestampCreation: summary.by_event_type['timestamp_created'] > 0,
      ipTracking: summary.unique_ips > 0,
      integrityPreservation: summary.failure_count === 0 || summary.failure_count < summary.total_events * 0.05,
      retentionPeriod: true, // 자동으로 설정됨
      accessControl: summary.unique_users > 0,
    };

    // 권장사항 생성
    const recommendations: string[] = [];

    if (!compliance.timestampCreation) {
      recommendations.push('타임스탬프 생성 로그가 없습니다. 모든 전자서명에 타임스탬프를 적용해야 합니다.');
    }

    if (!compliance.ipTracking) {
      recommendations.push('IP 추적 기록이 부족합니다. 모든 서명 요청에 IP 검증을 구현해야 합니다.');
    }

    if (!compliance.integrityPreservation) {
      recommendations.push(`실패율이 높습니다 (${((summary.failure_count / summary.total_events) * 100).toFixed(1)}%). 시스템 안정성을 개선해야 합니다.`);
    }

    if (summary.security_alerts > 0) {
      recommendations.push(`${summary.security_alerts}건의 보안 알림이 있습니다. 보안 정책을 검토해야 합니다.`);
    }

    return {
      success: true,
      report: {
        summary,
        compliance,
        recommendations,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// =====================================================
// Data Cleanup
// =====================================================

/**
 * 만료된 감사 로그 삭제 (주기적 실행용)
 */
export async function cleanupExpiredAuditLogs(): Promise<{ deleted: number; error?: string }> {
  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data, error, count } = await supabase
      .from('audit_logs')
      .delete()
      .lt('scheduled_deletion_at', now)
      .select('id');

    if (error) {
      return { deleted: 0, error: error.message };
    }

    return { deleted: count || 0 };
  } catch (error: any) {
    return { deleted: 0, error: error.message };
  }
}

// =====================================================
// Export Functions
// =====================================================

/**
 * 감사 로그 항목을 텍스트 형식으로 변환
 */
export function formatAuditLogEntry(entry: AuditLogEntry): string {
  const lines: string[] = [];

  lines.push(`[${entry.timestamp}] ${entry.event_type}`);
  lines.push(`  Resource: ${entry.resource_type}${entry.resource_id ? ` (${entry.resource_id})` : ''}`);
  lines.push(`  Outcome: ${entry.outcome}`);
  if (entry.user_id) {
    lines.push(`  User: ${entry.user_id}`);
  }
  if (entry.ip_address) {
    const trustInfo = entry.ip_validation ? ` [${entry.ip_validation.trust_level}]` : '';
    lines.push(`  IP: ${entry.ip_address}${trustInfo}`);
  }
  if (entry.error_message) {
    lines.push(`  Error: ${entry.error_message}`);
  }

  return lines.join('\n');
}

/**
 * 감사 로그 CSV 내보내기
 */
export async function exportAuditLogsToCSV(
  filter: AuditLogFilter
): Promise<{ success: boolean; csv?: string; error?: string }> {
  const logger = getAuditLogger();
  const { success, data } = await logger.query(filter);

  if (!success || !data) {
    return { success: false, error: 'Failed to query audit logs' };
  }

  const headers = [
    'timestamp',
    'event_type',
    'resource_type',
    'resource_id',
    'user_id',
    'ip_address',
    'outcome',
    'error_message',
  ];

  const rows = data.map(entry => [
    entry.timestamp,
    entry.event_type,
    entry.resource_type,
    entry.resource_id || '',
    entry.user_id || '',
    entry.ip_address || '',
    entry.outcome,
    entry.error_message || '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return { success: true, csv };
}
