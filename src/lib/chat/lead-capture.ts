import 'server-only';

import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

export interface ChatLeadCapability {
  readonly enabled: boolean;
  readonly leadIntents: readonly string[];
  readonly consentVersion: number | null;
  readonly privacyPolicyVersion: number | null;
}

interface ChatLeadReadinessRow {
  ready?: boolean;
  privacy_approval_record?: string;
  privacy_policy_version?: number;
  consent_version?: number;
  contact_retention_days?: number;
  summary_consent_retention_days?: number;
  audit_retention_days?: number;
  legacy_resolution?: 'unresolved' | 'disabled' | 'replaced' | 'approved_exception';
  legacy_approval_record?: string | null;
  legacy_replacement_version?: number | null;
  schema_version?: number;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseInteger = (value: string | undefined): number | null => {
  if (value === undefined || !/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) ? parsed : null;
};

const parseUUID = (value: string | undefined): string | null =>
  value && UUID_PATTERN.test(value) ? value.toLowerCase() : null;

const matchesLegacyState = (readiness: ChatLeadReadinessRow): boolean => {
  const legacyEnabled = process.env.CHAT_LEGACY_HUMAN_HANDOFF_ENABLED === 'true';
  const replacementVersion = parseInteger(
    process.env.CHAT_LEGACY_HANDOFF_REPLACEMENT_VERSION,
  );

  if (readiness.legacy_resolution === 'disabled') return !legacyEnabled;
  if (readiness.legacy_resolution === 'replaced') {
    return !legacyEnabled &&
      typeof readiness.legacy_replacement_version === 'number' &&
      readiness.legacy_replacement_version === replacementVersion;
  }
  if (readiness.legacy_resolution === 'approved_exception') {
    const approvalRecord = parseUUID(process.env.CHAT_LEGACY_HANDOFF_APPROVAL_RECORD);
    return legacyEnabled &&
      typeof readiness.legacy_approval_record === 'string' &&
      readiness.legacy_approval_record.toLowerCase() === approvalRecord;
  }
  return false;
};

/**
 * Resolve whether the approved server/DB readiness values agree. This remains
 * testable for rollout preparation but does not by itself authorize PII.
 */
export interface ChatLeadReadinessApproval {
  readonly approved: boolean;
  readonly consentVersion: number | null;
  readonly privacyPolicyVersion: number | null;
}

export async function isChatLeadReadinessApproved(): Promise<ChatLeadReadinessApproval> {
  if (process.env.CHAT_LEAD_CAPTURE_ENABLED !== 'true') {
    return {
      approved: false,
      consentVersion: null,
      privacyPolicyVersion: null,
    };
  }

  const privacyApprovalRecord = parseUUID(
    process.env.CHAT_LEAD_PRIVACY_APPROVAL_RECORD,
  );
  const privacyPolicyVersion = parseInteger(
    process.env.CHAT_LEAD_PRIVACY_POLICY_VERSION,
  );
  const consentVersion = parseInteger(process.env.CHAT_LEAD_CONSENT_VERSION);
  const contactRetentionDays = parseInteger(
    process.env.CHAT_LEAD_CONTACT_RETENTION_DAYS,
  );
  const summaryRetentionDays = parseInteger(
    process.env.CHAT_LEAD_SUMMARY_CONSENT_RETENTION_DAYS,
  );
  const auditRetentionDays = parseInteger(
    process.env.CHAT_LEAD_AUDIT_RETENTION_DAYS,
  );
  const schemaVersion = parseInteger(process.env.CHAT_LEAD_SCHEMA_VERSION);

  if (
    !privacyApprovalRecord ||
    privacyPolicyVersion === null ||
    consentVersion === null ||
    contactRetentionDays === null ||
    summaryRetentionDays === null ||
    auditRetentionDays === null ||
    schemaVersion === null ||
    contactRetentionDays < 1 || contactRetentionDays > 365 ||
    summaryRetentionDays < 30 || summaryRetentionDays > 2555 ||
    auditRetentionDays < 30 || auditRetentionDays > 2555 ||
    contactRetentionDays > summaryRetentionDays ||
    summaryRetentionDays > auditRetentionDays
  ) {
    return {
      approved: false,
      consentVersion: null,
      privacyPolicyVersion: null,
    };
  }

  try {
    const client = createAuthenticatedServiceClient({
      operation: 'verify_chat_lead_readiness',
      route: '/api/chat/suggestions',
    });
    const { data, error } = await client.rpc('verify_chat_lead_readiness');
    if (error || !data) {
      return {
        approved: false,
        consentVersion: null,
        privacyPolicyVersion: null,
      };
    }

    const readiness = Array.isArray(data) ? data[0] : data;
    if (typeof readiness !== 'object' || readiness === null) {
      return {
        approved: false,
        consentVersion: null,
        privacyPolicyVersion: null,
      };
    }

    const row = readiness as ChatLeadReadinessRow;
    const approved =
      row.ready === true &&
      row.privacy_approval_record?.toLowerCase() === privacyApprovalRecord &&
      row.privacy_policy_version === privacyPolicyVersion &&
      row.consent_version === consentVersion &&
      row.contact_retention_days === contactRetentionDays &&
      row.summary_consent_retention_days === summaryRetentionDays &&
      row.audit_retention_days === auditRetentionDays &&
      row.schema_version === schemaVersion &&
      matchesLegacyState(row);

    return {
      approved,
      consentVersion: approved ? consentVersion : null,
      privacyPolicyVersion: approved ? privacyPolicyVersion : null,
    };
  } catch {
      return {
        approved: false,
        consentVersion: null,
        privacyPolicyVersion: null,
      };
  }
}

/**
 * PII capture remains disabled until the complete lead ingestion/UI milestone
 * exists. Readiness is deliberately not sufficient to advertise capability.
 */
export async function getChatLeadCapability(): Promise<ChatLeadCapability> {
  const readiness = await isChatLeadReadinessApproved();
  if (!readiness.approved) {
    return {
      enabled: false,
      leadIntents: [],
      consentVersion: null,
      privacyPolicyVersion: null,
    };
  }

  return {
    enabled: true,
    leadIntents: ['quote', 'sample', 'technical', 'human'],
    consentVersion: readiness.consentVersion,
    privacyPolicyVersion: readiness.privacyPolicyVersion,
  };
}

export function isLegacyHumanHandoffEnabled(): boolean {
  return process.env.CHAT_LEGACY_HUMAN_HANDOFF_ENABLED === 'true';
}
