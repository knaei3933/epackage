import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type AccountType = 'member' | 'admin';

export interface PerformanceRoute {
  id: string;
  url: string;
  accountType: AccountType;
  role: AccountType;
  meaningfulContentSelectors: string[];
  selectorAssertion: 'allVisible';
  navigationTimeoutMs: number;
}

export interface PerformanceManifest {
  version: string;
  signInPath: string;
  routes: PerformanceRoute[];
}

export const EXPECTED_ROUTE_IDS: readonly string[] = [
  'member-dashboard',
  'member-orders',
  'member-quotations',
  'admin-dashboard',
  'admin-orders',
  'admin-quotations',
];

export function loadRouteManifest(repoRoot = process.cwd()): PerformanceManifest {
  const manifestPath = resolve(repoRoot, 'scripts/performance/routes.manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PerformanceManifest;
  validateRouteManifest(manifest);
  return manifest;
}

export function validateRouteManifest(manifest: PerformanceManifest): void {
  const ids = manifest.routes.map(route => route.id);
  if (manifest.signInPath !== '/auth/signin') throw new Error('INVALID_MANIFEST: signInPath must be /auth/signin');
  if (ids.length !== 6 || new Set(ids).size !== 6) throw new Error('INVALID_MANIFEST: exactly six unique routes are required');
  if (ids.some(id => !EXPECTED_ROUTE_IDS.includes(id))) throw new Error(`INVALID_MANIFEST: unexpected route IDs: ${ids.join(',')}`);

  for (const route of manifest.routes) {
    if (!route.url.startsWith('/')) throw new Error(`INVALID_MANIFEST: ${route.id} URL must be relative`);
    if (route.accountType !== route.role) throw new Error(`INVALID_MANIFEST: ${route.id} role must match account type`);
    if (route.navigationTimeoutMs !== 60000) throw new Error(`INVALID_MANIFEST: ${route.id} timeout must be 60000ms`);
    if (route.selectorAssertion !== 'allVisible') throw new Error(`INVALID_MANIFEST: ${route.id} assertion must be allVisible`);
    if (route.meaningfulContentSelectors.length === 0) throw new Error(`INVALID_MANIFEST: ${route.id} has no content selectors`);
    for (const selector of route.meaningfulContentSelectors) {
      const normalized = selector.toLowerCase();
      if (normalized === 'body' || normalized === 'html' || normalized.startsWith('body >') || normalized.startsWith('html >')) {
        throw new Error(`INVALID_MANIFEST: ${route.id} selector is not route-specific: ${selector}`);
      }
    }
  }

  const memberIds = EXPECTED_ROUTE_IDS.slice(0, 3);
  const adminIds = EXPECTED_ROUTE_IDS.slice(3);
  const getRoute = (id: string) => manifest.routes.find(route => route.id === id);
  for (const id of memberIds) {
    const route = getRoute(id);
    if (route?.accountType !== 'member') throw new Error(`INVALID_MANIFEST: ${id} must be member`);
  }
  for (const id of adminIds) {
    const route = getRoute(id);
    if (route?.accountType !== 'admin') throw new Error(`INVALID_MANIFEST: ${id} must be admin`);
  }
}

/** Deterministic Fisher-Yates shuffle; no browser or timing dependency. */
export function createShuffledRouteOrder(routes: readonly { id: string }[], seed: number): string[] {
  if (!Number.isInteger(seed) || seed < 0) throw new Error('INVALID_ROUTE_ORDER_SEED');
  const order = routes.map(route => route.id);
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1));
    [order[index], order[swap]] = [order[swap]!, order[index]!];
  }
  return order;
}

export function createInMemoryContextOptions(): Record<string, never> {
  return {};
}

export function assertInMemoryContextOptions(options: unknown): void {
  if (options && typeof options === 'object' && Object.keys(options).length > 0) {
    throw new Error('CONTEXT_ISOLATION_FAILED: browser context options must remain empty');
  }
}
