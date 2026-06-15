/**
 * @jest-environment node
 */

/**
 * E4 Privilege-Escalation Penetration Test — S2.0 security gate
 *
 * Verifies AC-A2 / Pre-mortem P6 for session/route.ts:
 * - profile lookup failure MUST return 401 (no MEMBER/ACTIVE fallback)
 * - non-ACTIVE profile MUST return 401
 * - spoofed x-user-role / x-user-status headers MUST NOT grant privilege
 *
 * The header-spoof scenario covers the original vulnerability: an attacker
 * (or a user whose profile is missing/inactive) injects x-user-status:ACTIVE
 * and expects to receive an authenticated session. The fix (S2.0) rejects
 * this because role/status now come from the DB-verified profile only, and
 * profile-absence returns 401.
 */

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(),
  auth: {},
}));

jest.mock('@/lib/supabase-ssr', () => ({
  createSupabaseSSRClient: jest.fn(),
}));

import { GET } from '../route';
import { createServiceClient } from '@/lib/supabase';
import { NextRequest } from 'next/server';

const mockedCreateServiceClient = createServiceClient as jest.Mock;

function buildRequest(headers: Record<string, string> = {}): NextRequest {
  const url = 'http://localhost:3000/api/auth/session';
  const req = new NextRequest(url, { method: 'GET' });
  for (const [k, v] of Object.entries(headers)) {
    req.headers.set(k, v);
  }
  return req;
}

function setServiceProfile(profile: Record<string, unknown> | null, error: unknown = null) {
  mockedCreateServiceClient.mockReturnValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({ data: profile, error }),
        }),
      }),
    }),
  });
}

describe('S2.0 / E4: session route privilege-escalation defense', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...origEnv };
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    // Ensure dev-mock branch never fires during these tests
    delete process.env.ENABLE_DEV_MOCK_AUTH;
  });

  afterAll(() => {
    process.env = origEnv;
  });

  it('rejects with 401 when x-user-id header present but profile lookup fails', async () => {
    // Attacker injects x-user-status:ACTIVE — must not grant access.
    setServiceProfile(null);
    const req = buildRequest({
      'x-user-id': 'attacker-uuid',
      'x-user-role': 'ADMIN',
      'x-user-status': 'ACTIVE',
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.session).toBeNull();
    expect(body.profile).toBeNull();
  });

  it('rejects with 401 when profile lookup errors (DB failure)', async () => {
    setServiceProfile(null, { message: 'connection refused', code: 'PGRST' });
    const req = buildRequest({
      'x-user-id': 'some-uuid',
      'x-user-role': 'MEMBER',
      'x-user-status': 'ACTIVE',
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('rejects with 401 when profile status is not ACTIVE (e.g. SUSPENDED)', async () => {
    setServiceProfile({
      id: 'suspended-uuid',
      email: 'suspended@example.com',
      role: 'MEMBER',
      status: 'SUSPENDED',
    });
    const req = buildRequest({
      'x-user-id': 'suspended-uuid',
      'x-user-role': 'MEMBER',
      'x-user-status': 'ACTIVE', // spoofed — must be ignored
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('rejects with 401 when profile status is PENDING', async () => {
    setServiceProfile({
      id: 'pending-uuid',
      email: 'pending@example.com',
      role: 'MEMBER',
      status: 'PENDING',
    });
    const req = buildRequest({
      'x-user-id': 'pending-uuid',
      'x-user-status': 'ACTIVE', // spoofed
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('grants session ONLY when DB profile is ACTIVE — role comes from DB not header', async () => {
    setServiceProfile({
      id: 'legit-uuid',
      email: 'legit@example.com',
      kanji_last_name: '合法',
      kanji_first_name: '太郎',
      kana_last_name: 'ゴウホウ',
      kana_first_name: 'タロウ',
      role: 'MEMBER',
      status: 'ACTIVE',
    });
    const req = buildRequest({
      'x-user-id': 'legit-uuid',
      // spoofed privilege — must be overridden by DB profile
      'x-user-role': 'ADMIN',
      'x-user-status': 'ACTIVE',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    // profile.role is the DB value (MEMBER), NOT the spoofed ADMIN header.
    expect(body.profile.role).toBe('MEMBER');
    expect(body.profile.status).toBe('ACTIVE');
    expect(body.session.user.id).toBe('legit-uuid');
  });

  it('never returns a synthesized profile with MEMBER/ACTIVE defaults', async () => {
    // The pre-S2.0 bug returned profile:{role:'MEMBER',status:'ACTIVE'} on
    // lookup failure. Verify no such shape leaks through on any failure mode.
    setServiceProfile(null);
    const req = buildRequest({
      'x-user-id': 'ghost-uuid',
      'x-user-role': 'MEMBER',
      'x-user-status': 'ACTIVE',
    });

    const res = await GET(req);
    const body = await res.json();
    // Must be 401, and profile must be null (not a synthesized object).
    expect(res.status).toBe(401);
    expect(body.profile).toBeNull();
    // Explicit guard: ensure no object with role:'MEMBER'/status:'ACTIVE' is present.
    if (body.profile && typeof body.profile === 'object') {
      expect(body.profile.role).not.toBe('MEMBER');
      expect(body.profile.status).not.toBe('ACTIVE');
    }
  });
});
