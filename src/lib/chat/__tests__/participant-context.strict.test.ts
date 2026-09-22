/**
 * @jest-environment node
 */

import {
  isChatLeadStaffParticipant,
  resolveChatParticipantStrict,
} from '@/lib/chat/participant-context';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';

jest.mock('@/lib/supabase-ssr', () => ({
  createSupabaseSSRClient: jest.fn(),
}));

const mockedCreateClient = createSupabaseSSRClient as jest.Mock;
const authGetUser = jest.fn();
const maybeSingle = jest.fn();

const request = new Request('https://www.package-lab.com/api/chat/lead');

const setupClient = () => {
  maybeSingle.mockReset();
  mockedCreateClient.mockReset();
  mockedCreateClient.mockResolvedValue({
    client: {
      auth: { getUser: authGetUser },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({ maybeSingle })),
        })),
      })),
    },
  });
};

describe('strict chat participant resolution', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupClient();
  });

  it('distinguishes anonymous from active roles', async () => {
    authGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(resolveChatParticipantStrict(request)).resolves.toEqual({ status: 'anonymous' });

    authGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-member' } },
      error: null,
    });
    maybeSingle.mockResolvedValueOnce({ data: { role: 'MEMBER', status: 'ACTIVE' }, error: null });
    await expect(resolveChatParticipantStrict(request)).resolves.toEqual({
      status: 'active',
      userId: 'user-member',
      role: 'MEMBER',
    });
  });

  it('never silently downgrades infrastructure failures to guest', async () => {
    authGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'auth unavailable' },
    });
    await expect(resolveChatParticipantStrict(request)).resolves.toEqual({
      status: 'infrastructure-error',
    });

    authGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-member' } },
      error: null,
    });
    maybeSingle.mockResolvedValueOnce({ data: null, error: { message: 'db unavailable' } });
    await expect(resolveChatParticipantStrict(request)).resolves.toEqual({
      status: 'infrastructure-error',
    });
  });

  it('treats unknown or inactive profiles as inactive and limits staff roles', async () => {
    authGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-suspended' } },
      error: null,
    });
    maybeSingle.mockResolvedValueOnce({ data: { role: 'MEMBER', status: 'SUSPENDED' }, error: null });
    await expect(resolveChatParticipantStrict(request)).resolves.toEqual({ status: 'inactive' });

    expect(isChatLeadStaffParticipant({ status: 'inactive' })).toBe(false);
    expect(isChatLeadStaffParticipant({
      status: 'active',
      userId: 'user-sales',
      role: 'SALES',
    })).toBe(true);
  });
});
