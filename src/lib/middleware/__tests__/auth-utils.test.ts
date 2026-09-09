import { getVerifiedAuthUser, getUserProfile } from '../auth-utils';

describe('middleware auth utilities', () => {
  describe('getVerifiedAuthUser', () => {
    it('returns normalized claims from Supabase getClaims', async () => {
      const supabase = {
        auth: {
          getClaims: async () => ({
            data: { claims: { sub: 'user-1', email: 'user@example.test' } },
            error: null,
          }),
        },
      };

      await expect(getVerifiedAuthUser(supabase)).resolves.toEqual({
        id: 'user-1',
        email: 'user@example.test',
      });
    });

    it('rejects malformed or errored claims', async () => {
      const supabase = {
        auth: {
          getClaims: async () => ({
            data: { claims: { email: 'user@example.test' } },
            error: null,
          }),
        },
      };

      await expect(getVerifiedAuthUser(supabase)).resolves.toBeNull();
    });
  });

  describe('getUserProfile', () => {
    it('reuses a fresh profile for repeated middleware calls', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      const select = jest.fn().mockReturnThis();
      const eq = jest.fn().mockReturnThis();
      const single = jest.fn().mockResolvedValue({
        data: { id: 'profile-user-1', role: 'ADMIN', status: 'ACTIVE' },
        error: null,
      });
      const supabase = { from: jest.fn(() => ({ select, eq, single })) };

      const first = await getUserProfile(supabase, 'profile-user-1');
      const second = await getUserProfile(supabase, 'profile-user-1');

      expect(first).toEqual({ id: 'profile-user-1', role: 'ADMIN', status: 'ACTIVE' });
      expect(second).toBe(first);
      expect(supabase.from).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
});
