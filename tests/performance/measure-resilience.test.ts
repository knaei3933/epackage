import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { measureRoutes } from '../../scripts/performance/measure';
import { createShuffledRouteOrder, loadRouteManifest, type AccountType } from '../../scripts/performance/routes';
import { validateMeasurementPayload, type MeasurementReport } from '../../scripts/performance/report-schema';

const repoRoot = resolve(__dirname, '../..');
const manifest = loadRouteManifest(repoRoot);

jest.mock('playwright-core', () => ({
  chromium: { launch: jest.fn() },
}));

const mockedPlaywright = jest.requireMock('playwright-core') as {
  chromium: { launch: jest.Mock };
};

const credentials = {
  member: { email: 'member@production.invalid', password: 'member-password' },
  admin: { email: 'admin@production.invalid', password: 'admin-password' },
};

interface NavigationKey {
  contextIndex: number;
  phase: 'warmup' | 'measured';
  runNumber: number;
  attempt: number;
}

interface TrackedContext {
  id: number;
  accountType: AccountType;
  closed: boolean;
}

interface SignInAttempt {
  contextId: number;
  accountType: AccountType;
}

describe('measurement harness resilience', () => {
  let warmupFirstFailure: Error | undefined;
  let warmupRetryFailure: Error | undefined;
  let measuredFirstFailure: Error | undefined;
  let measuredRetryFailure: Error | undefined;
  let selectorFailureRun: number | undefined;
  let rerenderRemovesContent: boolean | undefined;
  let navigationCalls: NavigationKey[];
  let createdContexts: TrackedContext[];
  let signInAttempts: SignInAttempt[];

  const error = (message: string, name?: string): Error => {
    const value = new Error(message);
    if (name) value.name = name;
    return value;
  };

  const configureBrowser = (routeOrder = createShuffledRouteOrder(manifest.routes, 42)) => {
    mockedPlaywright.chromium.launch.mockImplementation(async () => {
      let contextIndex = 0;
      return {
        version: () => 'test-browser',
        newContext: async () => {
          const routeIndex = contextIndex;
          contextIndex += 1;
          const usedAccountTypes = new Set(createdContexts.map(context => context.accountType));
          const accountType = routeOrder
            .map(routeId => manifest.routes.find(route => route.id === routeId)!.accountType)
            .find(account => !usedAccountTypes.has(account)) ?? 'admin';
          const context: TrackedContext = { id: routeIndex, accountType, closed: false };
          createdContexts.push(context);
          let sampleIndex = 0;
          const createPage = () => {
            const kindIndex = sampleIndex;
            sampleIndex += 1;
            if (kindIndex === 0) {
              signInAttempts.push({ contextId: routeIndex, accountType });
              return {
                goto: async () => ({ status: () => 200 }),
                locator: () => ({
                  count: async () => 1,
                  fill: async () => undefined,
                  click: async () => undefined,
                  first: () => ({ waitFor: async () => undefined }),
                }),
                getByLabel: () => ({
                  count: async () => 1,
                  fill: async () => undefined,
                  click: async () => undefined,
                  first: () => ({ waitFor: async () => undefined }),
                }),
                getByRole: () => ({
                  count: async () => 1,
                  fill: async () => undefined,
                  click: async () => undefined,
                  first: () => ({ waitFor: async () => undefined }),
                }),
                waitForURL: async () => undefined,
                waitForLoadState: async () => undefined,
                url: () => 'https://production.invalid/member/dashboard',
                evaluate: (callback: () => unknown) => callback(),
                close: async () => undefined,
              };
            }

            const routeSampleIndex = (kindIndex - 1) % 11;
            const phase = routeSampleIndex === 0 ? 'warmup' as const : 'measured' as const;
            const runNumber = phase === 'warmup' ? 1 : routeSampleIndex;
            const attempts: NavigationKey['attempt'][] = [];
            const selectorFails = phase === 'measured' && runNumber === selectorFailureRun;
            return {
              goto: async () => {
                const attempt = attempts.push(attempts.length + 1);
                const key: NavigationKey = { contextIndex: routeIndex, phase, runNumber, attempt };
                navigationCalls.push(key);
                if (phase === 'warmup') {
                  if (attempt === 1 && warmupFirstFailure) throw warmupFirstFailure;
                  if (attempt === 2 && warmupRetryFailure) throw warmupRetryFailure;
                } else if (runNumber === 1) {
                  if (attempt === 1 && measuredFirstFailure) throw measuredFirstFailure;
                  if (attempt === 2 && measuredRetryFailure) throw measuredRetryFailure;
                }
                return { status: () => 200 };
              },
              locator: () => ({
                count: async () => (rerenderRemovesContent ? 0 : 1),
                first: () => ({
                  waitFor: async () => {
                    if (selectorFails) throw error('SELECTOR_NOT_VISIBLE');
                  },
                }),
              }),
              url: () => 'https://production.invalid/redirect-target?token=must-not-appear',
              evaluate: (callback: () => unknown) => callback(),
              close: async () => undefined,
            };
          };

          return {
            newPage: createPage,
            close: async () => {
              context.closed = true;
            },
          };
        },
        close: async () => undefined,
      };
    });
  };

  const measure = async (measurementCredentials = credentials): Promise<MeasurementReport> => {
    const outputDirectory = await mkdtemp(join(tmpdir(), 'perf-resilience-'));
    try {
      return await measureRoutes({
        baseUrl: 'https://production.invalid',
        credentials: measurementCredentials,
        deploymentId: 'deployment-evidence',
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
    navigationCalls = [];
    warmupFirstFailure = undefined;
    warmupRetryFailure = undefined;
    measuredFirstFailure = undefined;
    measuredRetryFailure = undefined;
    selectorFailureRun = undefined;
    rerenderRemovesContent = false;
    configureBrowser();
    createdContexts = [];
    signInAttempts = [];
  });

  afterEach(() => {
    mockedPlaywright.chromium.launch.mockReset();
  });

  it('attempts all measured samples after a final warmup failure', async () => {
    warmupFirstFailure = error('NAVIGATION_FAILED');
    const report = await measure();

    expect(report.results).toHaveLength(6);
    expect(report.results.map(result => ({
      warmupRuns: result.warmupRuns,
      measuredRuns: result.measuredRuns,
      failedRuns: result.failedRuns,
      measuredSamples: result.rawSamples.filter(sample => sample.mode === 'measured').length,
      failures: result.failedSamples.map(({ mode, outcome }) => ({ mode, outcome })),
    }))).toEqual(Array.from({ length: 6 }, () => ({
      warmupRuns: 0,
      measuredRuns: 10,
      failedRuns: 1,
      measuredSamples: 10,
      failures: [{ mode: 'warmup', outcome: 'final' }],
    })));
    expect(report.acceptance.verdict).toBe('failed');
    expect(validateMeasurementPayload(report, { repoRoot })).toEqual(expect.objectContaining({ ok: true }));
  });

  it('records one transient infrastructure attempt and accepts the successful retry', async () => {
    measuredFirstFailure = error('net::ERR_NETWORK_CHANGED');
    let progress = '';
    const stderrWrite = jest.spyOn(process.stderr, 'write').mockImplementation(((chunk: unknown) => {
      progress += String(chunk);
      return true;
    }) as typeof process.stderr.write);

    try {
      const report = await measure();

      expect(report.results.every(result => (
        result.warmupRuns === 1
          && result.measuredRuns === 10
          && result.failedRuns === 0
          && result.rawSamples.filter(sample => sample.mode === 'measured').length === 10
      ))).toBe(true);
      expect(report.results.every(result => result.failedSamples.length === 1
          && result.failedSamples[0]!.mode === 'measured'
          && result.failedSamples[0]!.runNumber === 1
          && result.failedSamples[0]!.outcome === 'transient'
      )).toBe(true);
      expect(report.acceptance.verdict).toBe('passed');
      expect(validateMeasurementPayload(report, { repoRoot })).toEqual(expect.objectContaining({ ok: true }));

      for (const route of manifest.routes) {
        const retryLog = `PERF_PROGRESS route=${route.id} phase=measured run=1 retry=1\n`;
        expect(progress.split(retryLog)).toHaveLength(2);
      }
    } finally {
      stderrWrite.mockRestore();
    }
  });

  it('counts a double infrastructure failure once while auditing both attempts', async () => {
    measuredFirstFailure = error('navigation timed out', 'TimeoutError');
    measuredRetryFailure = error('net::ERR_CONNECTION_RESET');
    const report = await measure();

    expect(report.results.map(result => ({ warmupRuns: result.warmupRuns, measuredRuns: result.measuredRuns, failedRuns: result.failedRuns, failedSamples: result.failedSamples.map(({ outcome }) => outcome) }))).toEqual(Array.from({ length: 6 }, () => ({
      warmupRuns: 1, measuredRuns: 9, failedRuns: 1, failedSamples: ['transient', 'final'],
    })));
    expect(report.results.every(result => result.rawSamples.filter(sample => sample.mode === 'measured').length === 9)).toBe(true);
    expect(report.results.every(result => result.failedSamples.length === 2
        && result.failedSamples[0]!.outcome === 'transient'
        && result.failedSamples[1]!.outcome === 'final'
    )).toBe(true);
    expect(report.acceptance.verdict).toBe('failed');
    expect(validateMeasurementPayload(report, { repoRoot })).toEqual(expect.objectContaining({ ok: true }));
  });

  it('does not retry selector failures as navigation infrastructure failures', async () => {
    selectorFailureRun = 1;
    const report = await measure();

    expect(report.results.every(result => (
      result.warmupRuns === 1
        && result.measuredRuns === 9
        && result.failedRuns === 1
        && result.rawSamples.filter(sample => sample.mode === 'measured').length === 9
    ))).toBe(true);
    expect(report.results.every(result => result.failedSamples.length === 1
        && result.failedSamples[0]!.mode === 'measured'
        && result.failedSamples[0]!.outcome === 'final'
    )).toBe(true);
    expect(navigationCalls.filter(call => call.phase === 'measured' && call.runNumber === 1))
      .toHaveLength(manifest.routes.length);
    expect(report.acceptance.verdict).toBe('failed');
  });

  it('keeps selector evidence when a rerender removes content after successful visibility', async () => {
    rerenderRemovesContent = true;
    const report = await measure();
    const firstSample = report.results[0]!.rawSamples.find(sample => sample.mode === 'measured')!;

    expect(firstSample.selectorEvidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ assertion: 'visible', matched: true, matchCount: 1 }),
      ]),
    );
    expect(firstSample.selectorEvidence.every(item => item.matched && item.matchCount === 1)).toBe(true);
    expect(report.acceptance.verdict).toBe('passed');
  });

  it('reuses one signed-in context per account type', async () => {
    const report = await measure();
    const firstAccount = manifest.routes.find(route => route.id === report.routeOrder[0])!.accountType;
    const secondAccount = firstAccount === 'member' ? 'admin' : 'member';

    expect(createdContexts.map(context => context.id)).toEqual([0, 1]);
    expect(createdContexts.map(context => context.accountType)).toEqual([firstAccount, secondAccount]);
    expect(signInAttempts).toEqual([
      { contextId: 0, accountType: firstAccount },
      { contextId: 1, accountType: secondAccount },
    ]);
    expect(navigationCalls.filter(call => call.contextIndex === 0).length).toBeGreaterThan(0);
    expect(navigationCalls.filter(call => call.contextIndex === 1).length).toBeGreaterThan(0);
    expect(report.results.filter(result => result.accountType === firstAccount)).toHaveLength(3);
    expect(report.results.filter(result => result.accountType === secondAccount)).toHaveLength(3);
    expect(createdContexts.map(context => context.closed)).toEqual([true, true]);
  });

  it('keeps separate account contexts when identical owner credentials are supplied', async () => {
    const sharedCredentials = {
      member: credentials.member,
      admin: credentials.member,
    };

    const report = await measure(sharedCredentials);

    expect(createdContexts).toHaveLength(2);
    expect(createdContexts.map(context => context.accountType)).toEqual(['member', 'admin']);
    expect(signInAttempts).toEqual([
      { contextId: 0, accountType: 'member' },
      { contextId: 1, accountType: 'admin' },
    ]);
    expect(navigationCalls.filter(call => call.contextIndex === 0).length).toBeGreaterThan(0);
    expect(navigationCalls.filter(call => call.contextIndex === 1).length).toBeGreaterThan(0);
    expect(report.acceptance.verdict).toBe('passed');
  });
});
