/**
 * @jest-environment node
 */

import {
  listChatLeadsForStaff,
  updateChatLeadWorkflow,
  revealChatLeadContact,
  isValidLeadUUID,
} from '@/lib/chat/lead-admin';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

jest.mock('@/lib/supabase-authenticated', () => ({
  createAuthenticatedServiceClient: jest.fn(),
}));

const mockedCreate = createAuthenticatedServiceClient as jest.Mock;
const rpcMock = jest.fn();
const selectMock = jest.fn();

const buildClient = () => ({
  rpc: rpcMock,
  from: jest.fn(() => ({
    select: selectMock.mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
    eq: jest.fn().mockReturnThis(),
  })),
});

beforeEach(() => {
  jest.resetAllMocks();
  selectMock.mockReturnThis();
  mockedCreate.mockReturnValue(buildClient());
});

describe('isValidLeadUUID', () => {
  it('accepts valid UUID', () => {
    expect(isValidLeadUUID('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
  });

  it('rejects invalid UUID', () => {
    expect(isValidLeadUUID('not-a-uuid')).toBe(false);
  });
});

describe('listChatLeadsForStaff', () => {
  it('returns null on error', async () => {
    const client = buildClient();
    client.from = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({ data: null, error: { message: 'err' }, count: null }),
      eq: jest.fn().mockReturnThis(),
    }));
    mockedCreate.mockReturnValue(client);

    const result = await listChatLeadsForStaff({});
    expect(result).toBeNull();
  });
});

describe('updateChatLeadWorkflow', () => {
  it('rejects invalid leadId', async () => {
    const result = await updateChatLeadWorkflow({
      leadId: 'bad',
      actorUserId: '123e4567-e89b-42d3-a456-426614174000',
      status: 'contacted',
      outcome: 'pending',
      handoffState: 'none',
    });
    expect(result).toBeNull();
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('calls RPC with correct params', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [{ lead_id: '123e4567-e89b-42d3-a456-426614174000', status: 'contacted', outcome: 'pending', handoff_state: 'none', updated_at: '2026-01-01' }],
      error: null,
    });

    const result = await updateChatLeadWorkflow({
      leadId: '123e4567-e89b-42d3-a456-426614174000',
      actorUserId: '123e4567-e89b-42d3-a456-426614174001',
      status: 'contacted',
      outcome: 'pending',
      handoffState: 'none',
    });

    expect(result?.accepted).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith('update_chat_lead_workflow', expect.objectContaining({
      p_lead_id: '123e4567-e89b-42d3-a456-426614174000',
      p_status: 'contacted',
    }));
  });
});

describe('revealChatLeadContact', () => {
  it('returns redacted marker for redacted contact', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [{ was_redacted: true, contact_channel: null, email: null, phone: null, company_name: null, contact_name: null, preferred_channel: null, contact_window: null }],
      error: null,
    });

    const result = await revealChatLeadContact({
      leadId: '123e4567-e89b-42d3-a456-426614174000',
      actorUserId: '123e4567-e89b-42d3-a456-426614174001',
    });

    expect(result?.redacted).toBe(true);
    expect(result?.contact).toBeUndefined();
  });

  it('returns contact for active lead', async () => {
    rpcMock.mockResolvedValueOnce({
      data: [{ was_redacted: false, contact_channel: 'email', email: 'test@example.jp', phone: null, company_name: null, contact_name: null, preferred_channel: 'email', contact_window: 'unspecified' }],
      error: null,
    });

    const result = await revealChatLeadContact({
      leadId: '123e4567-e89b-42d3-a456-426614174000',
      actorUserId: '123e4567-e89b-42d3-a456-426614174001',
    });

    expect(result?.redacted).toBe(false);
    expect(result?.contact?.email).toBe('test@example.jp');
  });
});
