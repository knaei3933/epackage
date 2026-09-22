/**
 * @jest-environment node
 */

import {
  getChatLeadCapability,
  isChatLeadReadinessApproved,
} from '@/lib/chat/lead-capture';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

jest.mock('@/lib/supabase-authenticated', () => ({
  createAuthenticatedServiceClient: jest.fn(),
}));

const mockedCreateClient = createAuthenticatedServiceClient as jest.Mock;
const rpcMock = jest.fn();
const approvalRecord = '88888888-8888-4888-8888-888888888888';

const validReadiness = () => ({
  data: [{
    ready: true,
    privacy_approval_record: approvalRecord,
    privacy_policy_version: 1,
    consent_version: 1,
    contact_retention_days: 180,
    summary_consent_retention_days: 2555,
    audit_retention_days: 2555,
    legacy_resolution: 'disabled',
    legacy_approval_record: null,
    legacy_replacement_version: null,
    schema_version: 1,
  }],
  error: null,
});

describe('chat lead capability gate', () => {
  const originalEnv = { ...process.env };

  const setValidEnv = () => {
    process.env = {
      ...originalEnv,
      CHAT_LEAD_CAPTURE_ENABLED: 'true',
      CHAT_LEAD_PRIVACY_APPROVAL_RECORD: approvalRecord,
      CHAT_LEAD_PRIVACY_POLICY_VERSION: '1',
      CHAT_LEAD_CONSENT_VERSION: '1',
      CHAT_LEAD_CONTACT_RETENTION_DAYS: '180',
      CHAT_LEAD_SUMMARY_CONSENT_RETENTION_DAYS: '2555',
      CHAT_LEAD_AUDIT_RETENTION_DAYS: '2555',
      CHAT_LEAD_SCHEMA_VERSION: '1',
      CHAT_LEGACY_HUMAN_HANDOFF_ENABLED: 'false',
    };
  };

  beforeEach(() => {
    jest.resetAllMocks();
    rpcMock.mockReset();
    mockedCreateClient.mockReturnValue({ rpc: rpcMock });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not query readiness when the feature flag is false', async () => {
    process.env = { ...originalEnv, CHAT_LEAD_CAPTURE_ENABLED: undefined };

    await expect(getChatLeadCapability()).resolves.toEqual({
      enabled: false,
      leadIntents: [],
      consentVersion: null,
      privacyPolicyVersion: null,
    });
    expect(mockedCreateClient).not.toHaveBeenCalled();
  });

  it('fails closed on invalid or unordered environment retention values', async () => {
    setValidEnv();
    process.env.CHAT_LEAD_CONTACT_RETENTION_DAYS = '366';
    await expect(isChatLeadReadinessApproved()).resolves.toEqual({
      approved: false,
      consentVersion: null,
      privacyPolicyVersion: null,
    });

    setValidEnv();
    process.env.CHAT_LEAD_SUMMARY_CONSENT_RETENTION_DAYS = '100';
    await expect(isChatLeadReadinessApproved()).resolves.toEqual({
      approved: false,
      consentVersion: null,
      privacyPolicyVersion: null,
    });
    expect(mockedCreateClient).not.toHaveBeenCalled();
  });

  it('enables only when DB approval, versions, retention, schema, and legacy state match', async () => {
    setValidEnv();
    rpcMock.mockResolvedValue(validReadiness());

    await expect(isChatLeadReadinessApproved()).resolves.toEqual({
      approved: true,
      consentVersion: 1,
      privacyPolicyVersion: 1,
    });
    await expect(getChatLeadCapability()).resolves.toEqual({
      enabled: true,
      leadIntents: ['quote', 'sample', 'technical', 'human'],
      consentVersion: 1,
      privacyPolicyVersion: 1,
    });
  });

  it.each([
    ['approval record mismatch', { privacy_approval_record: '99999999-9999-4999-8999-999999999999' }],
    ['version mismatch', { consent_version: 2 }],
    ['legacy mismatch', { legacy_resolution: 'approved_exception' }],
    ['schema mismatch', { schema_version: 2 }],
    ['readiness false', { ready: false }],
  ])('fails closed on %s', async (_name, overrides) => {
    setValidEnv();
    const result = validReadiness();
    Object.assign(result.data[0], overrides);
    rpcMock.mockResolvedValueOnce(result);

    await expect(isChatLeadReadinessApproved()).resolves.toEqual({
      approved: false,
      consentVersion: null,
      privacyPolicyVersion: null,
    });
  });

  it('fails closed on readiness RPC error or infrastructure failure', async () => {
    setValidEnv();
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'limiter failed' } });
    await expect(isChatLeadReadinessApproved()).resolves.toEqual({
      approved: false,
      consentVersion: null,
      privacyPolicyVersion: null,
    });

    rpcMock.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(getChatLeadCapability()).resolves.toEqual({
      enabled: false,
      leadIntents: [],
      consentVersion: null,
      privacyPolicyVersion: null,
    });
  });
});
