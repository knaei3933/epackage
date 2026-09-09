/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';

import {
  encodeTrustedProfileHeader,
  PROFILE_COLUMNS,
  TRUSTED_PROFILE_HEADER,
} from '@/lib/auth/profile-header';

const mockGetUser = jest.fn();
const mockFrom = jest.fn();
const mockCreateMiddlewareClient = jest.fn();

jest.mock('@/lib/middleware/client', () => ({
  createMiddlewareClient: mockCreateMiddlewareClient,
}));

jest.mock('@/lib/middleware/csrf', () => ({
  validateCSRFRequest: jest.fn(() => ({ valid: true })),
  isValidOrigin: jest.fn(() => true),
  isCSRFProtectedPath: jest.fn(() => true),
}));

const verifiedProfile = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'member@example.com',
  role: 'MEMBER',
  status: 'ACTIVE',
  kanji_last_name: '山田',
  kanji_first_name: '太郎',
  company_name: null,
  created_at: '2026-01-01T00:00:00Z',
  last_login_at: null,
};

function createProfileQuery() {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    single: jest.fn(async () => ({ data: verifiedProfile, error: null })),
  };
  return query;
}

function createRequest(profileHeaderValue?: string) {
  return new NextRequest('http://localhost/member/orders', {
    headers: profileHeaderValue
      ? { [TRUSTED_PROFILE_HEADER]: profileHeaderValue }
      : undefined,
  });
}

function createCookieResponse() {
  const response = NextResponse.next();
  response.cookies.set({
    name: 'sb-refresh-token',
    value: 'rotated-token',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}

function expectForwardedRequestHeader(
  response: NextResponse,
  name: string,
  value: string,
) {
  const overrideNames = response.headers.get('x-middleware-override-headers');
  expect(overrideNames).toContain(name);
  expect(response.headers.get(`x-middleware-request-${name}`)).toBe(value);
}

describe('middleware trusted profile header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation(() => createProfileQuery());
    mockCreateMiddlewareClient.mockImplementation(() => ({
      supabase: { auth: { getUser: mockGetUser }, from: mockFrom },
      response: createCookieResponse(),
    }));
    mockGetUser.mockResolvedValue({
      data: { user: { id: verifiedProfile.id, email: verifiedProfile.email } },
      error: null,
    });
  });

  it('strips attacker-supplied profile headers before authentication', async () => {
    const { middleware } = await import('./middleware');
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    const response = await middleware(
      createRequest('eyJyb2xlIjoiQURNSU4iLCJzdGF0dXMiOiJBQ1RJVkUifQ=='),
    );

    expect(response.headers.get(TRUSTED_PROFILE_HEADER)).toBeNull();
    expect(response.headers.get('x-middleware-request-' + TRUSTED_PROFILE_HEADER)).toBeNull();
    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });

  it('forwards an all-field trusted profile on the request only after getUser and DB lookup', async () => {
    const { middleware } = await import('./middleware');
    const response = await middleware(createRequest());
    const encoded = response.headers.get(
      `x-middleware-request-${TRUSTED_PROFILE_HEADER}`,
    );

    expect(mockGetUser).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockFrom.mock.results[0]?.value.select).toHaveBeenCalledWith(
      PROFILE_COLUMNS,
    );
    expect(encoded).toBe(encodeTrustedProfileHeader(verifiedProfile as any));
    expect(JSON.parse(Buffer.from(encoded!, 'base64').toString('utf8'))).toMatchObject({
      id: verifiedProfile.id,
      role: 'MEMBER',
      status: 'ACTIVE',
    });
    expectForwardedRequestHeader(response, TRUSTED_PROFILE_HEADER, encoded!);
    expectForwardedRequestHeader(response, 'x-user-id', verifiedProfile.id);
    expectForwardedRequestHeader(response, 'x-user-role', 'MEMBER');
    expectForwardedRequestHeader(response, 'x-user-status', 'ACTIVE');

    expect(response.headers.get(TRUSTED_PROFILE_HEADER)).toBeNull();
    expect(response.headers.get('x-user-id')).toBeNull();
    expect(response.headers.get('x-user-role')).toBeNull();
    expect(response.headers.get('x-user-status')).toBeNull();
  });

  it('keeps Supabase cookie updates on the browser response and marks it private', async () => {
    const { middleware } = await import('./middleware');
    const response = await middleware(createRequest());
    const encoded = response.headers.get(
      `x-middleware-request-${TRUSTED_PROFILE_HEADER}`,
    );

    expect(encoded).not.toBeNull();
    expect(response.headers.get(TRUSTED_PROFILE_HEADER)).toBeNull();
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.cookies.get('sb-refresh-token')?.value).toBe('rotated-token');
  });

  it.each([
    ['/api/auth/session', 'MEMBER'],
    ['/api/admin/users', 'ADMIN'],
    ['/api/designer/orders', 'KOREA_DESIGNER'],
    ['/api/member/orders', 'MEMBER'],
    ['/member/orders', 'MEMBER'],
    ['/designer/orders/order-a', 'KOREA_DESIGNER'],
  ] as const)('keeps profile headers request-only on %s', async (pathname, role) => {
    const { middleware } = await import('./middleware');
    const verified = verifiedProfile;
    verified.role = role;
    mockGetUser.mockResolvedValue({
      data: { user: { id: verified.id, email: verified.email } },
      error: null,
    });

    const response = await middleware(
      new NextRequest(new URL(pathname, 'http://localhost')),
    );
    const encoded = response.headers.get(
      `x-middleware-request-${TRUSTED_PROFILE_HEADER}`,
    );

    expect(encoded).toBe(encodeTrustedProfileHeader(verified));
    expectForwardedRequestHeader(response, 'x-user-id', verified.id);
    expectForwardedRequestHeader(response, 'x-user-role', role);
    expectForwardedRequestHeader(response, 'x-user-status', 'ACTIVE');
    expect(response.headers.get(TRUSTED_PROFILE_HEADER)).toBeNull();
    expect(response.headers.get('x-user-id')).toBeNull();
    expect(response.headers.get('x-user-role')).toBeNull();
    expect(response.headers.get('x-user-status')).toBeNull();
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
