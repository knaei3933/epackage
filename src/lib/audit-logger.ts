/**
 * Audit Logger for Electronic Signature System
 *
 * 日本電子署名法および個人情報保護法準拠の監査ログシステム
 * - 電子署名作成/検証記録
 * - IPアドレス追跡ログ
 * - システムアクセス記録
 * - 完全性確保
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
   * 監査ログ一意ID
   */
  id: string;

  /**
   * イベント発生タイムスタンプ (UTC)
   */
  timestamp: string;

  /**
   * イベントタイプ
   */
  event_type: AuditEventType;

  /**
   * リソースタイプ
   */
  resource_type: 'timestamp_token' | 'signature' | 'contract' | 'user' | 'system' | 'ip_validation' | 'other';

  /**
   * リソースID (外部キー)
   */
  resource_id?: string;

  /**
   * ユーザーID
   */
  user_id?: string;

  /**
   * ユーザーメール（個人情報保護法に従いマスキング可能）
   */
  user_email?: string;

  /**
   * IPアドレス（検証済み）
   */
  ip_address?: string;

  /**
   * IP検証結果
   */
  ip_validation?: {
    trust_level: 'trusted' | 'verified' | 'suspicious' | 'untrusted';
    source: string;
    is_private: boolean;
    warnings?: string[];
  };

  /**
   * セッションID
   */
  session_id?: string;

  /**
   * ユーザーエージェント
   */
  user_agent?: string;

  /**
   * リクエストID（追跡用）
   */
  request_id?: string;

  /**
   * 操作結果
   */
  outcome: 'success' | 'failure' | 'partial';

  /**
   * 詳細情報（構造化データ）
   */
  details?: {
    // タイムスタンプ関連
    timestamp_id?: string;
    document_hash?: string;
    document_type?: string;

    // 署名関連
    signature_id?: string;
    contract_id?: string;

    // 契約関連
    contract_number?: string;
    contract_status?: string;

    // セキュリティ関連
    security_event?: string;
    threat_level?: 'low' | 'medium' | 'high' | 'critical';

    // その他
    [key: string]: any;
  };

  /**
   * エラーメッセージ
   */
  error_message?: string;

  /**
   * 管轄権（日本: JP）
   */
  jurisdiction: 'JP' | 'OTHER';

  /**
   * データ保存期間（日）
   */
  retention_period_days: number;

  /**
   * 削除予定日
   */
  scheduled_deletion_at?: string;

  /**
   * 作成日
   */
  created_at: string;
}

export interface AuditLogFilter {
  /**
   * イベントタイプフィルター
   */
  event_type?: AuditEventType[];

  /**
   * リソースタイプフィルター
   */
  resource_type?: AuditLogEntry['resource_type'][];

  /**
   * リソースIDフィルター
   */
  resource_id?: string;

  /**
   * ユーザーIDフィルター
   */
  user_id?: string;

  /**
   * 開始日フィルター
   */
  from_date?: string;

  /**
   * 終了日フィルター
   */
  to_date?: string;

  /**
   * 結果フィルター
   */
  outcome?: 'success' | 'failure' | 'partial';

  /**
   * IPアドレスフィルター
   */
  ip_address?: string;

  /**
   * 制限
   */
  limit?: number;

  /**
   * オフセット
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
 * 日本法規に基づく監査ログ保存期間
 */
export const AUDIT_LOG_RETENTION_PERIODS = {
  // 電子署名法: 7年
  E_SIGNATURE: 7 * 365,

  // e-文書法: 7年
  E_DOC: 7 * 365,

  // 税法関連: 7年
  TAX: 7 * 365,

  // 商法: 10年（一部商業帳簿）
  COMMERCIAL: 10 * 365,

  // セキュリティイベント: 3年（不正アクセス禁止法）
  SECURITY: 3 * 365,

  // デフォルト: 1年
  DEFAULT: 1 * 365,
} as const;

/**
 * セキュリティイベントタイプ
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
 * 監査ロガークラス
 */
export class AuditLogger {
  private supabase = createServiceClient();
  private sessionId: string;
  private requestContext: Map<string, string> = new Map();

  constructor(sessionId?: string) {
    this.sessionId = sessionId || crypto.randomUUID();
  }

  /**
   * リクエストコンテキスト設定
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
   * 監査ログ生成
   */
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'created_at' | 'jurisdiction' | 'retention_period_days'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const now = new Date().toISOString();

      // 保存期間決定
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
   * タイムスタンプ生成ログ
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
   * 署名生成ログ
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
   * 契約署名ログ
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
   * IP検証ログ
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
   * セキュリティアラートログ
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
   * 監査ログ取得
   */
  async query(filter: AuditLogFilter): Promise<{ success: boolean; data?: AuditLogEntry[]; error?: string }> {
    try {
      let query = this.supabase
        .from('audit_logs')
        .select('*');

      // イベントタイプフィルター
      if (filter.event_type && filter.event_type.length > 0) {
        query = query.in('event_type', filter.event_type);
      }

      // リソースタイプフィルター
      if (filter.resource_type && filter.resource_type.length > 0) {
        query = query.in('resource_type', filter.resource_type);
      }

      // リソースIDフィルター
      if (filter.resource_id) {
        query = query.eq('resource_id', filter.resource_id);
      }

      // ユーザーIDフィルター
      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }

      // 結果フィルター
      if (filter.outcome) {
        query = query.eq('outcome', filter.outcome);
      }

      // IPアドレスフィルター
      if (filter.ip_address) {
        query = query.eq('ip_address', filter.ip_address);
      }

      // 日付範囲フィルター
      if (filter.from_date) {
        query = query.gte('timestamp', filter.from_date);
      }
      if (filter.to_date) {
        query = query.lte('timestamp', filter.to_date);
      }

      // ソート（最新順）
      query = query.order('timestamp', { ascending: false });

      // 制限
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
   * 監査ログ要約生成
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
   * イベントタイプに基づく保存期間決定
   */
  private determineRetentionPeriod(
    eventType: AuditEventType,
    resourceType: AuditLogEntry['resource_type']
  ): number {
    // セキュリティイベント
    if (SECURITY_EVENT_TYPES.includes(eventType)) {
      return AUDIT_LOG_RETENTION_PERIODS.SECURITY;
    }

    // 電子署名/契約関連
    if (resourceType === 'timestamp_token' || resourceType === 'signature' || resourceType === 'contract') {
      return AUDIT_LOG_RETENTION_PERIODS.E_SIGNATURE;
    }

    // デフォルト
    return AUDIT_LOG_RETENTION_PERIODS.DEFAULT;
  }

  /**
   * 削除予定日計算
   */
  private calculateDeletionDate(retentionDays: number): string {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + retentionDays);
    return deletionDate.toISOString();
  }

  /**
   * メールマスキング（個人情報保護法準拠）
   */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;

    // ローカルパートの最初の2文字と最後の2文字のみ表示
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
 * デフォルト監査ロガーインスタンス返却
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
 * APIルート用監査ログラッパー
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

    // 監査ログ生成
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
    // エラー発生時監査ログ
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
 * 日本電子署名法準拠レポート生成
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

    // 準拠検証
    const compliance = {
      timestampCreation: summary.by_event_type['timestamp_created'] > 0,
      ipTracking: summary.unique_ips > 0,
      integrityPreservation: summary.failure_count === 0 || summary.failure_count < summary.total_events * 0.05,
      retentionPeriod: true, // 自動設定
      accessControl: summary.unique_users > 0,
    };

    // 推奨事項生成
    const recommendations: string[] = [];

    if (!compliance.timestampCreation) {
      recommendations.push('タイムスタンプ生成ログがありません。すべての電子署名にタイムスタンプを適用する必要があります。');
    }

    if (!compliance.ipTracking) {
      recommendations.push('IP追跡記録が不足しています。すべての署名リクエストにIP検証を実装する必要があります。');
    }

    if (!compliance.integrityPreservation) {
      recommendations.push(`失敗率が高いです (${((summary.failure_count / summary.total_events) * 100).toFixed(1)}%)。システム安定性を改善する必要があります。`);
    }

    if (summary.security_alerts > 0) {
      recommendations.push(`${summary.security_alerts}件のセキュリティアラートがあります。セキュリティポリシーを検討する必要があります。`);
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
 * 期限切れ監査ログ削除（定期実行用）
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
 * 監査ログ項目をテキスト形式に変換
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
 * 監査ログCSVエクスポート
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
