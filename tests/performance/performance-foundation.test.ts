import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createBundleEvidence, MissingBuildOutputError } from '../../scripts/performance/bundle-evidence';
import {
  bootstrapCi,
  median,
  measureRoutes,
} from '../../scripts/performance/measure';
import {
  createInMemoryContextOptions,
  assertInMemoryContextOptions,
  createShuffledRouteOrder,
  loadRouteManifest,
  validateRouteManifest,
  type PerformanceManifest,
} from '../../scripts/performance/routes';
import { redactJson, scanRedactedJson } from '../../scripts/performance/security';
import { runProtocolSelfCheck } from '../../scripts/performance/self-check';
import { validateMeasurementPayload, type MeasurementReport } from '../../scripts/performance/report-schema';

const repoRoot = resolve(__dirname, '../..');
const manifest = loadRouteManifest(repoRoot);

jest.mock('playwright-core', () => ({
  chromium: { launch: jest.fn() },
}));

const mockedPlaywright = jest.requireMock('playwright-core') as {
  chromium: { launch: jest.Mock };
};

function selectorEvidenceFor(routeId: string): MeasurementReport['results'][number]['rawSamples'][number]['selectorEvidence'] {
  const route = manifest.routes.find(item => item.id === routeId)!;
  return route.meaningfulContentSelectors.map(selector => ({
    selector,
    assertion: 'visible' as const,
    matched: true,
    matchCount: 1,
  }));
}

function sample(
  routeId: string,
  mode: 'warmup' | 'measured',
  runNumber: number,
): MeasurementReport['results'][number]['rawSamples'][number] {
  return {
    routeId,
    accountType: manifest.routes.find(route => route.id === routeId)!.accountType,
    mode,
    runNumber,
    startedAt: '2026-01-01T00:00:00.000Z',
    durationMs: 100 + runNumber,
    finalUrl: `https://production.invalid${manifest.routes.find(route => route.id === routeId)!.url}`,
    httpStatus: 200,
    navigationTiming: {
      startTime: 0,
      responseStart: 20,
      responseEnd: 50,
      domContentLoadedEventEnd: 75,
      loadEventEnd: 90,
    },
    resourceTotals: { requestCount: 10, transferBytes: 1000, decodedBytes: 2000 },
    selectorEvidence: selectorEvidenceFor(routeId),
  };
}

function completeReport(): MeasurementReport {
  return {
    schemaVersion: '1.0.0',
    reportKind: 'measurement_report',
    generatedAt: '2026-01-01T00:00:00.000Z',
    deployment: { id: 'deployment-evidence', provider: 'operator-supplied' },
    branchCommit: { branch: 'main', commit: '1234567890abcdef' },
    tooling: {
      harness: 'playwright-routes-v1',
      playwright: '1.58.2',
      browserName: 'chromium',
      browserVersion: '140.0.0',
      node: process.version,
      platform: 'linux-x64',
    },
    measurementWindow: {
      timezone: 'Asia/Tokyo',
      startedAt: '2026-01-01T00:00:00.000Z',
      endedAt: '2026-01-01T00:01:00.000Z',
      toleranceMs: 0,
    },
    protocol: {
      signInPath: '/auth/signin',
      navigationTimeoutMs: 60000,
      warmupRunsPerRoute: 1,
      measuredRunsPerRoute: 10,
      concurrency: 1,
      routeSelectorAssertion: 'allVisible',
    },
    accounts: [
      { label: 'member', type: 'member' },
      { label: 'admin', type: 'admin' },
    ],
    routeOrderSeed: 42,
    routeOrder: createShuffledRouteOrder(manifest.routes, 42),
    results: manifest.routes.map(route => ({
      routeId: route.id,
      accountType: route.accountType,
      warmupRuns: 1,
      measuredRuns: 10,
      failedRuns: 0,
      medianMs: 105,
      rawSamples: [sample(route.id, 'warmup', 1), ...Array.from({ length: 10 }, (_, index) => sample(route.id, 'measured', index + 1))],
      failedSamples: [],
    })),
    bootstrapCi: {
      method: 'percentile-bootstrap-of-route-measurements',
      iterations: 2000,
      confidenceLevel: 0.95,
      seed: 42,
      metadataOnly: false,
      computedAt: '2026-01-01T00:01:00.000Z',
      lowerMs: 100,
      upperMs: 111,
    },
    bundleEvidence: {
      status: 'available',
      sourcePath: '.next',
      buildId: 'build-evidence',
      generatedAt: '2026-01-01T00:01:00.000Z',
      totalBytes: 1,
      fileCounts: { chunks: 1, css: 1, media: 0, other: 0 },
      resourceTotals: { requestCount: 10, transferBytes: 1000 },
    },
    isolation: { inMemoryContexts: true, storageStatePersisted: false, cookiesPersisted: false },
    secretScan: {
      status: 'passed',
      patterns: ['supplied-credentials', 'jwt', 'authorization-header', 'cookie-header', 'signed-url-or-token-query', 'sensitive-key'],
      redactionsApplied: 0,
      scannedAt: '2026-01-01T00:01:00.000Z',
    },
    acceptance: { verdict: 'passed', reason: 'All route and selector samples passed.' },
  };
}

describe('route manifest', () => {
  it('contains exactly the six required authenticated routes with complete policy', () => {
    expect(manifest.signInPath).toBe('/auth/signin');
    expect(manifest.routes.map(route => route.id).sort()).toEqual([
      'admin-dashboard', 'admin-orders', 'admin-quotations',
      'member-dashboard', 'member-orders', 'member-quotations',
    ]);
    for (const route of manifest.routes) {
      expect(route.url).toMatch(/^\/(member|admin)\//);
      expect(route.role).toBe(route.accountType);
      expect(route.navigationTimeoutMs).toBe(60000);
      expect(route.selectorAssertion).toBe('allVisible');
      expect(route.meaningfulContentSelectors.length).toBeGreaterThan(0);
    }
  });

  it('requires route-specific meaningful selectors rather than body/html', () => {
    expect(() => validateRouteManifest({
      ...manifest,
      routes: manifest.routes.map(route => route.id === manifest.routes[0]!.id
        ? { ...route, meaningfulContentSelectors: ['body'] }
        : route),
    } as PerformanceManifest)).toThrow('not route-specific');
    expect(() => validateRouteManifest({
      ...manifest,
      routes: manifest.routes.map(route => route.id === manifest.routes[0]!.id
        ? { ...route, navigationTimeoutMs: 59999 }
        : route),
    } as PerformanceManifest)).toThrow('timeout');
  });
});

describe('protocol', () => {
  it('passes self-check without requiring PROD_* variables', () => {
    const result = runProtocolSelfCheck(7, repoRoot);
    expect(result).toEqual({
      ok: true,
      routeCount: 6,
      routeOrderSeed: 7,
      routeOrder: createShuffledRouteOrder(manifest.routes, 7),
      protocolLocked: true,
      productionVariablesRequired: false,
    });
  });

  it('is deterministic for a fixed route-order seed', () => {
    expect(createShuffledRouteOrder(manifest.routes, 42)).toEqual(createShuffledRouteOrder(manifest.routes, 42));
    expect(createShuffledRouteOrder(manifest.routes, 42)).not.toEqual(manifest.routes.map(route => route.id));
    expect([...createShuffledRouteOrder(manifest.routes, 42)].sort()).toEqual([
      'admin-dashboard', 'admin-orders', 'admin-quotations',
      'member-dashboard', 'member-orders', 'member-quotations',
    ]);
  });
});

describe('report validation', () => {
  it('accepts a complete, redacted report', () => {
    const result = validateMeasurementPayload(completeReport(), { repoRoot, requireCompleteMeasurement: true });
    expect(result).toMatchObject({ ok: true, redactionsApplied: 0 });
  });

  it('fails closed when a route has fewer than ten measured samples', () => {
    const report = completeReport();
    const firstResult = report.results[0]!;
    firstResult.measuredRuns = 9;
    firstResult.rawSamples = firstResult.rawSamples.filter(item => item.mode !== 'measured' || item.runNumber !== 10);
    const result = validateMeasurementPayload(report, { repoRoot, requireCompleteMeasurement: true });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(' ')).toContain(`${firstResult.routeId}: requires at least 10`);
  });

  it('fails when selector evidence is absent or selector matching failed', () => {
    const missing = completeReport();
    missing.results[0]!.rawSamples[0]!.selectorEvidence = [];
    const failed = completeReport();
    failed.results[1]!.rawSamples[0]!.selectorEvidence[0]!.matched = false;

    expect(validateMeasurementPayload(missing, { repoRoot }).ok).toBe(false);
    expect(validateMeasurementPayload(failed, { repoRoot }).ok).toBe(false);
  });

  it('enforces one member and one admin account and sample account separation', () => {
    const badAccounts = completeReport();
    badAccounts.accounts = [
      { label: 'member', type: 'member' },
      { label: 'admin2', type: 'member' },
    ];
    const leakedSample = completeReport();
    leakedSample.results[0]!.rawSamples[0]!.accountType = 'admin';

    expect(validateMeasurementPayload(badAccounts, { repoRoot }).ok).toBe(false);
    expect(validateMeasurementPayload(leakedSample, { repoRoot }).ok).toBe(false);
  });

  it('validates both committed pending artifacts structurally without production samples', () => {
    for (const path of [
      '.omx/reports/perf-routes-homepage-speed.json',
      '.omx/reports/perf-protocol-lock-homepage-speed.template.json',
    ]) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const payload = require(resolve(repoRoot, path));
      const result = validateMeasurementPayload(payload, { repoRoot, requireCompleteMeasurement: false });
      expect(result).toMatchObject({ ok: true });
    }
  });
});

describe('secret and session redaction', () => {
  it('redacts supplied credentials plus auth, cookie, token, session, and storage-state carriers', () => {
    const secrets = { memberEmail: 'member@production.invalid', memberPassword: 'super-secret-password' };
    const redacted = redactJson({
      memberEmail: 'member@production.invalid',
      memberPassword: 'super-secret-password',
      cookie: 'session=redacted',
      authorization: 'Bearer abc',
      storageState: '{"cookies":[]}',
      tokenUrl: 'https://production.invalid/storage/v1/object/sign/bucket/x?token=abc123',
      jwt: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.do-not-consider-this-a-real-signature',
      safe: 'performance data',
    }, secrets);

    expect(JSON.stringify(redacted.value)).not.toContain('member@production.invalid');
    expect(JSON.stringify(redacted.value)).not.toContain('super-secret-password');
    expect(Object.values(redacted.value as Record<string, unknown>)).toContain('[REDACTED]');
    expect(redacted.redactionsApplied).toBeGreaterThan(0);
  });

  it('throws when a known session credential survives redaction', () => {
    expect(() => scanRedactedJson({
      authorization: 'Bearer abc',
    })).toThrow('SECRET_SCAN_FAILED');
    expect(() => scanRedactedJson({
      safe: 'https://production.invalid/file?signature=abc',
    })).toThrow('SECRET_SCAN_FAILED');
  });
});

describe('isolation and statistics', () => {
  it('keeps browser context options in-memory and rejects storage state', () => {
    const options = createInMemoryContextOptions();
    expect(options).toEqual({});
    expect(() => assertInMemoryContextOptions({ storageState: 'cookies.json' })).toThrow('CONTEXT_ISOLATION_FAILED');
  });

  it('computes stable medians and bootstrap metadata', () => {
    expect(median([10, 20, 30])).toBe(20);
    const ci = bootstrapCi([100, 101, 102, 103, 104], 42, 1000);
    expect(ci.lowerMs).toBeLessThanOrEqual(ci.upperMs);
    expect(bootstrapCi([100, 101, 102, 103, 104], 42, 1000)).toEqual(ci);
  });
});

describe('measurement harness', () => {
  const credentials = {
    member: { email: 'member-progress@production.invalid', password: 'member-progress-password' },
    admin: { email: 'admin-progress@production.invalid', password: 'admin-progress-password' },
  };
  let activeContexts: number;
  let maximumActiveContexts: number;
  let signInFailuresRemaining: number;
  let signInRedirectFailuresRemaining: number;
  let signInNavigationWaits: Array<{ matches: Record<'memberDashboard' | 'adminDashboard' | 'signIn', boolean>; timeoutMs: number | undefined }>;
  let signInLoadStates: string[];
  let selectorEvidenceEvents: Array<{ selector: string; action: 'wait' | 'count'; timeoutMs?: number }>;
  let signInNavigationOptions: Array<{ url: string; waitUntil?: string; timeout?: number }>;
  let signInInteractions: Array<{ action: 'waitFor' | 'fill' | 'click'; selector: string; value?: string }>;

  const mockPage = (isFirstContext: boolean) => {
    let navigationAttempts = 0;
    const locator = (selector: string) => {
      let visible = false;
      return {
        count: async () => {
          selectorEvidenceEvents.push({ selector, action: 'count' });
          return visible ? 2 : 0;
        },
        fill: async (value: string) => {
          if (selector.startsWith('input[')) {
            signInInteractions.push({ action: 'fill', selector, value });
          }
        },
        click: async () => {
          if (selector.startsWith('form')) {
            signInInteractions.push({ action: 'click', selector });
          }
        },
        waitFor: async (options: { state?: string }) => {
          if (selector.startsWith('form')) {
            signInInteractions.push({ action: 'waitFor', selector, value: options.state });
          }
        },
        first: () => ({
          waitFor: async (options: { timeout?: number }) => {
            selectorEvidenceEvents.push({ selector, action: 'wait', timeoutMs: options?.timeout });
            visible = true;
          },
        }),
      };
    };

    return {
      goto: async (url: string, options?: { waitUntil?: string; timeout?: number }) => {
        if (url.endsWith('/auth/signin')) {
          signInNavigationOptions.push({ url, waitUntil: options?.waitUntil, timeout: options?.timeout });
        }
        navigationAttempts += 1;
        if (isFirstContext && navigationAttempts === 1 && signInFailuresRemaining > 0) {
          signInFailuresRemaining -= 1;
          throw new Error(`${credentials.member.email} sign-in infrastructure unavailable`);
        }
        return { status: () => 200 };
      },
      locator: (selector: string) => locator(selector),
      getByLabel: () => locator('legacy-label-selector'),
      getByRole: () => locator('legacy-role-selector'),
      url: () => {
        const email = encodeURIComponent(credentials.member.email);
        const password = encodeURIComponent(credentials.member.password);
        return `https://production.invalid/redirect-target?legacy=1&email=${email}&password=${password}&token=must-not-appear#credential-hash`;
      },
      waitForURL: async (pattern: unknown, options?: { timeout?: number }) => {
        const matches = (pathname: string) => typeof pattern === 'function'
          && Boolean((pattern as (url: URL) => boolean)(new URL(`https://production.invalid${pathname}`)));
        signInNavigationWaits.push({
          matches: {
            memberDashboard: matches('/member/dashboard'),
            adminDashboard: matches('/admin/dashboard'),
            signIn: matches('/auth/signin'),
          },
          timeoutMs: options?.timeout,
        });
        if (signInRedirectFailuresRemaining > 0) {
          signInRedirectFailuresRemaining -= 1;
          throw new Error('redirect wait timed out');
        }
      },
      waitForLoadState: async (state: string) => {
        signInLoadStates.push(state);
        return undefined;
      },
      evaluate: (callback: () => unknown) => callback(),
      close: async () => undefined,
    };
  };

  const configureBrowser = () => {
    mockedPlaywright.chromium.launch.mockImplementation(async () => {
      let contextIndex = 0;
      return {
        version: () => 'browser-metadata-must-not-appear',
        newContext: async () => {
          const isFirstContext = contextIndex === 0;
          contextIndex += 1;
          activeContexts += 1;
          maximumActiveContexts = Math.max(maximumActiveContexts, activeContexts);
          await new Promise(resolve => setTimeout(resolve, 1));
          activeContexts -= 1;
          return { newPage: async () => mockPage(isFirstContext), close: async () => undefined };
        },
        close: async () => undefined,
      };
    });
  };

  const measure = async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'perf-measure-'));
    try {
      return await measureRoutes({
        baseUrl: 'https://production.invalid',
        credentials,
        deploymentId: 'deployment-progress-evidence',
        branch: 'main',
        commit: '1234567890abcdef',
        seed: 42,
        measuredRunsPerRoute: 10,
        output: join(outputDirectory, 'report.json'),
        repoRoot,
      }) as unknown as MeasurementReport;
    } finally {
      await rm(outputDirectory, { recursive: true, force: true });
    }
  };

  beforeEach(() => {
    activeContexts = 0;
    maximumActiveContexts = 0;
    signInFailuresRemaining = 0;
    signInRedirectFailuresRemaining = 0;
    signInNavigationWaits = [];
    signInLoadStates = [];
    selectorEvidenceEvents = [];
    signInNavigationOptions = [];
    signInInteractions = [];
    configureBrowser();
  });

  afterEach(() => {
    mockedPlaywright.chromium.launch.mockReset();
  });

  it('emits fixed, safe progress labels without credentials, URLs, errors, or browser metadata', async () => {
    let progress = '';
    const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(((chunk: unknown) => {
      progress += String(chunk);
      return true;
    }) as typeof process.stderr.write);

    try {
      const report = await measure();
      const firstRoute = report.routeOrder[0]!;

      expect(report.acceptance.verdict).toBe('passed');
      expect(report.results.every(result => result.measuredRuns === 10 && result.failedRuns === 0)).toBe(true);
      expect(progress).toContain(`PERF_PROGRESS route=${firstRoute} phase=signin`);
      expect(progress).toContain(`PERF_PROGRESS route=${firstRoute} phase=warmup run=1`);
      expect(progress).toContain(`PERF_PROGRESS route=${firstRoute} phase=measured run=3`);
      expect(progress).toContain(`PERF_PROGRESS route=${firstRoute} measured=10 failed=0`);
      expect(progress).not.toContain(credentials.member.email);
      expect(progress).not.toContain(credentials.member.password);
      expect(progress).not.toContain('production.invalid');
      expect(progress).not.toContain('browser-metadata-must-not-appear');
      expect(progress).not.toContain('must-not-appear');
    } finally {
      stderrWrite.mockRestore();
    }
  });

  it('records selector evidence from the DOM after each visibility wait', async () => {
    const report = await measure();

    expect(report.results.every(result => (
      result.rawSamples.every(({ selectorEvidence }) => (
        selectorEvidence.every(item => item.assertion === 'visible' && item.matched && item.matchCount === 2)
      ))
    ))).toBe(true);

    const expectedWaitCount = manifest.routes.reduce(
      (total, route) => total + route.meaningfulContentSelectors.length * 11,
      0,
    );
    const waitedSelectors = new Set<string>();
    for (const event of selectorEvidenceEvents) {
      if (event.action === 'wait') {
        expect(event.timeoutMs).toBe(60_000);
        waitedSelectors.add(event.selector);
      } else {
        expect(waitedSelectors.has(event.selector)).toBe(true);
      }
    }
    expect(selectorEvidenceEvents.filter(event => event.action === 'wait')).toHaveLength(expectedWaitCount);
    expect(selectorEvidenceEvents.filter(event => event.action === 'count')).toHaveLength(expectedWaitCount);
  });

  it('records a sign-in infrastructure failure and still constructs a failed report', async () => {
    signInFailuresRemaining = 1;
    let progress = '';
    const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(((chunk: unknown) => {
      progress += String(chunk);
      return true;
    }) as typeof process.stderr.write);

    try {
      const report = await measure();
      const firstRoute = report.routeOrder[0]!;
      const firstResult = report.results.find(result => result.routeId === firstRoute)!;

      expect(maximumActiveContexts).toBe(1);
      expect(firstResult.failedRuns).toBe(1);
      expect(firstResult.failedSamples).toHaveLength(1);
      expect(firstResult.failedSamples[0]!.message).toBe('[REDACTED:MEMBEREMAIL] sign-in infrastructure unavailable');
      expect(firstResult.measuredRuns).toBe(10);
      expect(report.results.filter(result => result.measuredRuns === 10)).toHaveLength(6);
      expect(report.acceptance.verdict).toBe('failed');
      expect(report.acceptance.reason).toBe('1 final sample(s) failed or required measurements are incomplete.');
      expect(progress).toContain(`PERF_PROGRESS route=${firstRoute} phase=signin`);
      expect(progress).toContain(`PERF_PROGRESS route=${firstRoute} measured=10 failed=1`);
      expect(progress).not.toContain(credentials.member.email);
    } finally {
      stderrWrite.mockRestore();
    }
  });

  it('signs in after hydration using enabled-form selectors and waits for a dashboard', async () => {
    const submitSelector = 'form:has(input[name="email"]) button[type="submit"]:not([disabled])';
    const report = await measure();

    expect(signInNavigationOptions).toHaveLength(2);
    expect(signInNavigationOptions.every(options => (
      options.url === 'https://production.invalid/auth/signin'
        && options.waitUntil === 'networkidle'
        && options.timeout === 60_000
    ))).toBe(true);
    expect(signInInteractions.slice(0, 4)).toEqual([
      { action: 'waitFor', selector: submitSelector, value: 'visible' },
      { action: 'fill', selector: 'input[name="email"]', value: credentials.member.email },
      { action: 'fill', selector: 'input[name="password"]', value: credentials.member.password },
      { action: 'click', selector: submitSelector },
    ]);
    expect(signInNavigationWaits).toHaveLength(2);
    expect(signInNavigationWaits[0]).toEqual({
      matches: { memberDashboard: true, adminDashboard: true, signIn: false },
      timeoutMs: 60_000,
    });
    expect(signInNavigationWaits.every(wait => (
      wait.matches.memberDashboard && wait.matches.adminDashboard && !wait.matches.signIn && wait.timeoutMs === 60_000
    ))).toBe(true);
    expect(signInLoadStates).toEqual(['domcontentloaded', 'domcontentloaded']);
    expect(report.results.every(result => result.failedRuns === 0)).toBe(true);
  });

  it('parses page URLs before redaction and persists neither query strings nor encoded credentials', async () => {
    const report = await measure();
    const persistedUrls = report.results.flatMap(result => [
      ...result.rawSamples.map(sample => sample.finalUrl),
      ...result.failedSamples.map(sample => sample.url),
    ]);

    expect(persistedUrls.length).toBeGreaterThan(0);
    expect(persistedUrls.every(url => url === 'https://production.invalid/redirect-target')).toBe(true);
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain('?');
    expect(serialized).not.toContain('#');
    expect(serialized).not.toContain(encodeURIComponent(credentials.member.email));
    expect(serialized).not.toContain(encodeURIComponent(credentials.member.password));
    expect(serialized).not.toContain(credentials.member.email);
    expect(serialized).not.toContain(credentials.member.password);
  });

  it('records a stable sign-in failure without exposing redirect wait details', async () => {
    signInRedirectFailuresRemaining = 1;
    let progress = '';
    const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(((chunk: unknown) => {
      progress += String(chunk);
      return true;
    }) as typeof process.stderr.write);

    try {
      const report = await measure();
      const firstRoute = report.routeOrder[0]!;
      const firstResult = report.results.find(result => result.routeId === firstRoute)!;

      expect(signInNavigationWaits).toHaveLength(2);
      expect(signInNavigationWaits[0]).toEqual({
        matches: { memberDashboard: true, adminDashboard: true, signIn: false },
        timeoutMs: 60_000,
      });
      expect(signInLoadStates).toHaveLength(1);
      expect(firstResult.failedRuns).toBe(1);
      expect(firstResult.failedSamples[0]!.message).toBe('LOGIN_REDIRECT_FAILED');
      expect(firstResult.measuredRuns).toBe(10);
      expect(report.acceptance.verdict).toBe('failed');
      expect(progress).not.toContain(credentials.member.email);
      expect(progress).not.toContain(credentials.member.password);
      expect(progress).not.toContain('redirect wait timed out');
    } finally {
      stderrWrite.mockRestore();
    }
  });
});

describe('bundle evidence', () => {
  it('gives a clear non-secret failure when Next build output is missing', async () => {
    const emptyRoot = await mkdtemp(join(tmpdir(), 'perf-no-next-'));
    await writeFile(join(emptyRoot, 'README'), 'empty');

    try {
      await expect(createBundleEvidence(repoRoot, emptyRoot)).rejects.toThrow('NEXT_BUILD_OUTPUT_MISSING');
      await expect(createBundleEvidence(repoRoot, emptyRoot)).rejects.toThrow(MissingBuildOutputError);
    } finally {
      await writeFile(join(emptyRoot, 'BUILD_ID'), '').catch(() => undefined);
      await expect(createBundleEvidence(repoRoot, emptyRoot)).rejects.toThrow('NEXT_BUILD_OUTPUT_MISSING');
    }
  });
});
