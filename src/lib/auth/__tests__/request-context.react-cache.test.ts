/**
 * @jest-environment node
 *
 * React installs its request cache dispatcher during a Next server render.
 * Jest does not provide that dispatcher, so this suite runs React's actual
 * react-server `cache` implementation against minimal dispatcher-compatible
 * cache scopes. It tests the closest real-cache boundary without replacing
 * `cache`; a full dispatcher assertion would require a Next server render.
 */

import path from 'path';
import type { RBACContext } from '@/lib/rbac/rbac-helpers';

const mockReactServerEntry = path.join(
  path.dirname(require.resolve('react/package.json')),
  'react.react-server.js'
);

jest.mock('react', () => jest.requireActual(mockReactServerEntry));

const mockGetRBACContext = jest.fn();
const mockFrom = jest.fn();
const mockHeaderGet = jest.fn(() => null);

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
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => ({ get: mockHeaderGet })),
}));

type ProfileResult = { data: unknown; error: { message: string } | null };
type CacheRoot = Map<object, unknown>;
type CacheDispatcher = {
  getCacheForType: (createRoot: () => CacheRoot) => CacheRoot;
};

let profileResult: ProfileResult = { data: null, error: null };
const serverInternals = (
  jest.requireActual(mockReactServerEntry) as {
    __SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?: {
      A?: CacheDispatcher | null;
    };
  }
).__SERVER_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

function createProfileQuery() {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    maybeSingle: jest.fn(async () => profileResult),
  };
  return query;
}

function activeContext(
  userId: string,
  role: RBACContext['role']
): RBACContext {
  return {
    userId,
    role,
    status: 'ACTIVE',
    permissions: role === 'member' ? [] : ['order:read', 'quotation:read'],
    isDevMode: false,
  };
}

async function inActualCacheScope<Result>(
  operation: () => Promise<Result>
): Promise<Result> {
  const cacheRoots = new Map<object, CacheRoot>();
  const dispatcher: CacheDispatcher = {
    getCacheForType(createRoot) {
      let root = cacheRoots.get(createRoot);
      if (!root) {
        root = createRoot();
        cacheRoots.set(createRoot, root);
      }
      return root;
    },
  };

  if (!serverInternals) {
    throw new Error('React server cache internals are unavailable');
  }

  serverInternals.A = dispatcher;
  try {
    return await operation();
  } finally {
    serverInternals.A = null;
  }
}

describe('request context with actual React server cache', () => {
  let requestContext: typeof import('../request-context');

  beforeAll(async () => {
    requestContext = await import('../request-context');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    profileResult = {
      data: {
        id: 'user-a',
        email: 'a@example.com',
      },
      error: null,
    };
    mockGetRBACContext.mockResolvedValue(activeContext('user-a', 'member'));
    mockFrom.mockImplementation(() => createProfileQuery());
  });

  it('shares one computation per cache scope and recomputes in a separate scope', async () => {
    const scopeA = await inActualCacheScope(async () => {
      const contextPromise = requestContext.getRequestRBACContext();
      const contextAgain = requestContext.getRequestRBACContext();
      const profilePromise = requestContext.getRequestProfile();
      const profileAgain = requestContext.getRequestProfile();

      const [contextA, contextAAgain, profileA, profileAAgain] = await Promise.all([
        contextPromise,
        contextAgain,
        profilePromise,
        profileAgain,
      ]);

      expect(contextAAgain).toBe(contextA);
      expect(profileAAgain).toBe(profileA);

      return { contextA, profileA };
    });

    expect(mockGetRBACContext).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(scopeA.contextA?.userId).toBe('user-a');
    expect(scopeA.profileA?.id).toBe('user-a');

    jest.clearAllMocks();
    mockGetRBACContext.mockResolvedValue(activeContext('user-b', 'member'));
    profileResult = {
      data: {
        id: 'user-b',
        email: 'b@example.com',
      },
      error: null,
    };
    mockFrom.mockImplementation(() => createProfileQuery());

    const scopeB = await inActualCacheScope(async () => {
      const [contextB, profileB] = await Promise.all([
        requestContext.getRequestRBACContext(),
        requestContext.getRequestProfile(),
      ]);
      return { contextB, profileB };
    });

    expect(mockGetRBACContext).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(scopeB.contextB?.userId).toBe('user-b');
    expect(scopeB.profileB?.id).toBe('user-b');
    expect(scopeB.profileB).not.toBe(scopeA.profileA);
  });
});
