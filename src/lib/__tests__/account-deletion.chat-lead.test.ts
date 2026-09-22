/**
 * @jest-environment node
 */

import { deleteAccount } from '@/lib/account-deletion';
import { createServiceClient } from '@/lib/supabase';
import { sendAccountDeletionEmail } from '@/lib/email/account-deleted';

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
}));

jest.mock('@/lib/email/account-deleted', () => ({
  sendAccountDeletionEmail: jest.fn(),
}));

const mockedCreateClient = createServiceClient as jest.Mock;
const mockedSendEmail = sendAccountDeletionEmail as jest.Mock;
const callOrder: string[] = [];
const rpcMock = jest.fn();
const deleteUserMock = jest.fn();

const createClient = () => {
  callOrder.length = 0;
  rpcMock.mockReset();
  deleteUserMock.mockReset();

  rpcMock.mockImplementation(() => {
    callOrder.push('chat-lead-rpc');
    return Promise.resolve({ data: [{ unlinked_count: 2 }], error: null });
  });
  deleteUserMock.mockImplementation(() => {
    callOrder.push('auth-delete');
    return Promise.resolve({ data: null, error: null });
  });

  const from = jest.fn((table: string) => ({
    delete: () => ({
      eq: () => {
        if (table === 'profiles') callOrder.push('profile-delete');
        const count = table === 'profiles' ? 1 : 0;
        return {
          not: () => Promise.resolve({ count }),
          then: (
            resolve: (value: { count: number }) => unknown,
          ) => Promise.resolve({ count }).then(resolve),
        };
      },
      in: () => Promise.resolve({ count: 0 }),
    }),
    select: () => ({
      eq: () => ({
        in: () => Promise.resolve({ data: [] }),
      }),
    }),
  }));

  mockedCreateClient.mockReturnValue({
    from,
    rpc: rpcMock,
    auth: {
      admin: {
        deleteUser: deleteUserMock,
      },
    },
  });
};

describe('account deletion chat-lead lifecycle', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedSendEmail.mockResolvedValue(undefined);
    process.env = { ...originalEnv, CHAT_LEAD_SCHEMA_READY: undefined };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not call the local-only chat lead RPC when schema readiness is false', async () => {
    createClient();
    const result = await deleteAccount('user-1', 'user@example.jp', { sendEmail: false });

    expect(result.success).toBe(true);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(deleteUserMock).toHaveBeenCalled();
  });

  it('unlinks and redacts linked leads before profile/auth deletion', async () => {
    createClient();
    process.env.CHAT_LEAD_SCHEMA_READY = 'true';

    const result = await deleteAccount('user-1', 'user@example.jp', { sendEmail: false });

    expect(result.success).toBe(true);
    expect(result.deletedCounts?.chatLeads).toBe(2);
    expect(callOrder).toEqual(['chat-lead-rpc', 'profile-delete', 'auth-delete']);
    expect(deleteUserMock).toHaveBeenCalledWith('user-1');
  });

  it('fails closed before auth deletion when chat lead unlink/redaction fails', async () => {
    createClient();
    process.env.CHAT_LEAD_SCHEMA_READY = 'true';
    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'audit write failed' },
    });

    const result = await deleteAccount('user-1', 'user@example.jp', { sendEmail: false });

    expect(result.success).toBe(false);
    expect(result.message).toBe('チャット連携データの削除に失敗しました');
    expect(deleteUserMock).not.toHaveBeenCalled();
  });
});
