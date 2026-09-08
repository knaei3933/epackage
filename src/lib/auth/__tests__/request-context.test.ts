/**
 * @jest-environment node
 */

import type { RBACContext } from '@/lib/rbac/rbac-helpers';

const mockGetRBACContext = jest.fn();
const mockGetProfile = jest.fn();
const mockFrom = jest.fn();
const mockRedirect = jest.fn((destination: string) => {
  throw new Error(`REDIRECT:${destination}`);
});
const requestCacheState = (() => {
  const key = Symbol.for('epac.request-context.test');
  if (!(globalThis as any)[key]) {
    (globalThis as any)[key] = { current: undefined, generation: 0 };
  }
  return (globalThis as any)[key];
})();

jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  const requestScopedCache = <Args extends unknown[], Result>(
    callback: (...args: Args) => Promise<Result>
  ) => {
    return (...args: Args): Promise<Result> => {
      // Capture the active test request synchronously, just as React captures
      // its request store when a cached function is first invoked.
      const current = requestCacheState.current as Map<object, unknown> | undefined;
      if (!current) {
        // Outside a request, do not retain values in module/global scope.
        return callback(...args);
      }

      const cacheKey = JSON.stringify(args);
      let functionCache = current.get(callback) as Map<string, Promise<Result>> | undefined;
      if (!functionCache) {
        functionCache = new Map<Args, Promise<Result>>();
        current.set(callback, functionCache);
      }

      const existing = functionCache.get(cacheKey);
      if (existing) {
        return existing;
      }

      const pending = callback(...args);
      functionCache.set(cacheKey, pending);
      return pending;
    };
  };

  (requestScopedCache as any).__withRequestCache = async <Result,>(
    operation: () => Promise<Result>
  ): Promise<Result> => {
    requestCacheState.current = new Map();
    requestCacheState.generation += 1;
    try {
      return await operation();
    } finally {
      requestCacheState.current = undefined;
    }
  };

  return {
    ...actualReact,
    cache: requestScopedCache,
  };
});

jest.mock('@/lib/rbac/rbac-helpers', () => ({
  getRBACContext: mockGetRBACContext,
  hasPermission: jest.fn((context: RBACContext | null, permission: string) => {
    if (!context) return false;
    if (context.role === 'admin') return true;
    return context.permissions.includes(permission as never);
  }),
}));

jest.mock('@/lib/supabase', () => ({
  createServiceClient: jest.fn(() => ({ from: mockFrom })),
  auth: {
    getProfile: mockGetProfile,
  },
}));

jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
}));

jest.mock('@/app/member/orders/OrdersClient', () => ({
  OrdersClient: () => null,
}));

type ProfileResult = { data: unknown; error: { message: string } | null };
let profileResult: ProfileResult = { data: null, error: null };

function createProfileQuery() {
  const query: any = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    maybeSingle: jest.fn(async () => profileResult),
  };
  return query;
}

function activeContext(
  userId: string,
  role: RBACContext['role'],
  status: RBACContext['status'] = 'ACTIVE'
): RBACContext {
  return {
    userId,
    role,
    status,
    permissions: role === 'member' ? [] : ['order:read', 'quotation:read'],
    isDevMode: false,
  };
}

async function inRequest<Result>(operation: () => Promise<Result>): Promise<Result> {
  const withRequestCache = (require('react').cache as any).__withRequestCache;
  return withRequestCache(operation);
}

describe('request-scoped verified auth context', () => {
  let requestContext: typeof import('../request-context');
  let dashboard: typeof import('@/lib/dashboard');
  let adminLoader: typeof import('@/app/admin/loader');
  let ordersPage: typeof import('@/app/member/orders/page');

  beforeAll(async () => {
    requestContext = await import('../request-context');
    dashboard = await import('@/lib/dashboard');
    adminLoader = await import('@/app/admin/loader');
    ordersPage = await import('@/app/member/orders/page');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    profileResult = {
      data: {
        id: 'user-a',
        email: 'a@example.com',
        role: 'MEMBER',
        status: 'ACTIVE',
        kanji_last_name: '山田',
        kanji_first_name: '太郎',
        kana_last_name: 'ヤマダ',
        kana_first_name: 'タロウ',
        company_name: 'A株式会社',
      },
      error: null,
    };
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'member'));
    mockFrom.mockImplementation(() => createProfileQuery());
  });

  it('calls RBAC and profile lookup once across repeated accessors and both auth surfaces', async () => {
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'admin'));

    await inRequest(async () => {
      const [contextA, contextB, profileA, profileB, member, admin] = await Promise.all([
        requestContext.getRequestRBACContext(),
        requestContext.getRequestRBACContext(),
        requestContext.getRequestProfile(),
        requestContext.getRequestProfile(),
        dashboard.requireAuth(),
        adminLoader.requireAdminAuth(['order:read']),
      ]);

      expect(contextA).toBe(contextB);
      expect(profileA).toBe(profileB);
      expect(member.id).toBe('user-a');
      expect(member.email).toBe('a@example.com');
      expect(member.user_metadata?.kanji_last_name).toBe('山田');
      expect(admin).toMatchObject({
        userId: 'user-a',
        role: 'admin',
        userName: '山田 太郎',
      });
    });

    expect(mockGetRBACContext).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    const query = mockFrom.mock.results[0].value;
    expect(query.select).toHaveBeenCalledTimes(1);
    expect(query.select).toHaveBeenCalledWith(
      'id,email,role,status,kanji_last_name,kanji_first_name,kana_last_name,kana_first_name,corporate_phone,personal_phone,fax,company_name,position,department,company_url,postal_code,prefecture,city,street,product_category,business_type,created_at,last_login_at'
    );
    expect(query.select).not.toHaveBeenCalledWith('*');
    expect(query.eq).toHaveBeenCalledWith('id', 'user-a');
    expect(mockGetProfile).not.toHaveBeenCalled();
  });

  it('does not leak user A identity into a separate request for user B', async () => {
    mockGetRBACContext.mockReset();
    mockGetRBACContext
      .mockResolvedValueOnce(activeContext('user-a', 'member'))
      .mockResolvedValueOnce(activeContext('user-b', 'member'));
    profileResult = {
      data: { id: 'user-a', email: 'a@example.com' },
      error: null,
    };
    const a = await inRequest(async () => {
      const context = requestContext.getRequestRBACContext();
      const profile = requestContext.getRequestProfile();
      const user = dashboard.requireAuth();
      return {
        context: await context,
        profile: await profile,
        user: await user,
      };
    });

    profileResult = {
      data: { id: 'user-b', email: 'b@example.com' },
      error: null,
    };
    const b = await inRequest(async () => {
      const context = requestContext.getRequestRBACContext();
      const profile = requestContext.getRequestProfile();
      const user = dashboard.requireAuth();
      return {
        context: await context,
        profile: await profile,
        user: await user,
      };
    });

    expect(a.context?.userId).toBe('user-a');
    expect(a.profile?.id).toBe('user-a');
    expect(a.user.id).toBe('user-a');
    expect(b.context?.userId).toBe('user-b');
    expect(b.profile?.id).toBe('user-b');
    expect(b.user.id).toBe('user-b');
    expect(a.profile).not.toBe(b.profile);
    expect(mockGetRBACContext).toHaveBeenCalledTimes(2);
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it('treats only missing RBAC context as member authentication failure', async () => {
    mockGetRBACContext.mockResolvedValue(null);
    await expect(inRequest(() => dashboard.requireAuth())).rejects.toThrow(
      dashboard.AuthRequiredError
    );
    expect(mockFrom).not.toHaveBeenCalled();

    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    jest.clearAllMocks();
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'member'));
    profileResult = { data: null, error: null };
    const nullProfile = await inRequest(() => dashboard.requireAuth());
    expect(nullProfile).toEqual({
      id: 'user-a',
      email: '',
      user_metadata: {
        kanji_last_name: '',
        kanji_first_name: '',
        name_kanji: '',
        name_kana: '',
        kana_last_name: '',
        kana_first_name: '',
        corporate_phone: '',
        personal_phone: '',
        fax: '',
        company_name: '',
        position: '',
        department: '',
        company_url: '',
        postal_code: '',
        prefecture: '',
        city: '',
        street: '',
        product_category: '',
        business_type: '',
        role: '',
        status: '',
        created_at: '',
        last_login_at: undefined,
      },
    });
    expect(consoleError).toHaveBeenCalledWith(
      '[RequestContext] Profile lookup failed: profile row is null'
    );

    jest.clearAllMocks();
    consoleError.mockClear();
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'member'));
    profileResult = {
      data: null,
      error: { message: 'profile query failed' },
    };
    const failedProfile = await inRequest(() => dashboard.requireAuth());
    expect(failedProfile.id).toBe('user-a');
    expect(failedProfile.email).toBe('');
    expect(failedProfile.user_metadata?.company_name).toBe('');
    expect(consoleError).toHaveBeenCalledWith(
      '[RequestContext] Profile query error:',
      'profile query failed'
    );

    consoleError.mockRestore();

    profileResult = {
      data: { id: 'user-a', email: 'a@example.com' },
      error: null,
    };
    jest.clearAllMocks();
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'member'));
    const wrongRole = await inRequest(() => dashboard.requireAuth());
    expect(wrongRole.id).toBe('user-a');

    jest.clearAllMocks();
    mockGetRBACContext.mockResolvedValue(
      activeContext('user-a', 'member', 'SUSPENDED')
    );
    profileResult.data = {
      id: 'user-a',
      email: 'a@example.com',
      role: 'MEMBER',
      status: 'SUSPENDED',
    };
    const suspended = await inRequest(() => dashboard.requireAuth());
    expect(suspended.user_metadata?.status).toBe('SUSPENDED');
  });

  it('preserves admin display fallback when RBAC succeeds but profile is missing', async () => {
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'admin'));
    profileResult = { data: null, error: null };
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const admin = await inRequest(() => adminLoader.requireAdminAuth());
    expect(admin).toMatchObject({
      userId: 'user-a',
      role: 'admin',
      userName: '管理者',
    });
    expect(consoleError).toHaveBeenCalledWith(
      '[RequestContext] Profile lookup failed: using admin fallback name'
    );

    consoleError.mockRestore();

    jest.clearAllMocks();
    mockGetRBACContext.mockResolvedValue(
      activeContext('user-a', 'admin', 'SUSPENDED')
    );
    await expect(
      inRequest(() => adminLoader.requireAdminAuth())
    ).rejects.toThrow('REDIRECT:/?error=account_inactive');
  });

  it('allows admin, operator, and sales but denies members in the admin loader', async () => {
    for (const role of ['admin', 'operator', 'sales'] as const) {
      jest.clearAllMocks();
      mockGetRBACContext.mockResolvedValue(activeContext('user-a', role));
      profileResult = {
        data: { id: 'user-a', email: 'a@example.com' },
        error: null,
      };

      const auth = await inRequest(() => adminLoader.requireAdminAuth());
      expect(auth.userId).toBe('user-a');
      expect(auth.role).toBe(role);
    }

    jest.clearAllMocks();
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'member'));
    profileResult = { data: { id: 'user-a', email: 'a@example.com' }, error: null };
    await expect(
      inRequest(() => adminLoader.requireAdminAuth())
    ).rejects.toThrow('REDIRECT:/member/dashboard?error=admin_required');
  });

  it('preserves RBAC suspension and permission denial for admins', async () => {
    jest.clearAllMocks();
    mockGetRBACContext.mockResolvedValue(
      activeContext('user-a', 'admin', 'SUSPENDED')
    );
    profileResult = { data: { id: 'user-a', email: 'a@example.com' }, error: null };
    await expect(
      inRequest(() => adminLoader.requireAdminAuth())
    ).rejects.toThrow('REDIRECT:/?error=account_inactive');

    jest.clearAllMocks();
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'sales'));
    profileResult = { data: { id: 'user-a', email: 'a@example.com' }, error: null };
    await expect(
      inRequest(() =>
        adminLoader.requireAdminAuth(['order:write' as never])
      )
    ).rejects.toThrow(
      'REDIRECT:/admin/dashboard?error=insufficient_permissions'
    );
  });

  it('uses the request auth user and does not call auth.getProfile in /member/orders', async () => {
    const element = await inRequest(() => ordersPage.default());

    expect(mockGetProfile).not.toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledTimes(1);

    expect((element as any).props).toMatchObject({
      userId: 'user-a',
      userEmail: 'a@example.com',
      userProfile: {
        kanji_last_name: '山田',
        company_name: 'A株式会社',
      },
    });
  });

  it('preserves the /member/orders unauthenticated redirect', async () => {
    mockGetRBACContext.mockResolvedValue(null);

    await expect(
      inRequest(() => ordersPage.default())
    ).rejects.toThrow('REDIRECT:/auth/signin?redirect=/member/orders');

    expect(mockRedirect).toHaveBeenCalledWith(
      '/auth/signin?redirect=/member/orders'
    );
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
