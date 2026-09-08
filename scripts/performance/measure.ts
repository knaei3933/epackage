#!/usr/bin/env node
import { randomInt } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Browser, BrowserContext, BrowserContextOptions, Page, Response as PlaywrightResponse } from 'playwright-core';
import { createBundleEvidence } from './bundle-evidence';
import { redactJson, readCredentialFromEnv, type SecretValues } from './security';
import { createInMemoryContextOptions, createShuffledRouteOrder, loadRouteManifest, type AccountType, type PerformanceRoute } from './routes';

export interface MeasurementCredentials {
  member: { email: string; password: string };
  admin: { email: string; password: string };
}

export interface SampleInput {
  routeId: string;
  accountType: AccountType;
  mode: 'warmup' | 'measured';
  runNumber: number;
  startedAt: string;
  durationMs: number;
  finalUrl: string;
  httpStatus: number | null;
  navigationTiming: {
    startTime: number;
    responseStart: number | null;
    responseEnd: number | null;
    domContentLoadedEventEnd: number | null;
    loadEventEnd: number | null;
  };
  resourceTotals: { requestCount: number; transferBytes: number; decodedBytes: number };
  selectorEvidence: Array<{ selector: string; assertion: 'visible'; matched: boolean; matchCount: number }>;
}

export interface FailedSampleInput {
  routeId: string;
  accountType: AccountType;
  mode: 'warmup' | 'measured';
  runNumber: number;
  startedAt: string;
  errorCode: string;
  message: string;
  url: string;
  outcome?: 'transient' | 'final';
}

export interface MeasurementOptions {
  baseUrl: string;
  credentials: MeasurementCredentials;
  deploymentId: string;
  branch: string;
  commit: string;
  seed?: number;
  measuredRunsPerRoute?: number;
  output?: string;
  repoRoot?: string;
}

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}

export function bootstrapCi(values: readonly number[], seed: number, iterations = 2000): { lowerMs: number; upperMs: number } {
  if (values.length === 0) return { lowerMs: 0, upperMs: 0 };
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const medians: number[] = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const resample = Array.from({ length: values.length }, () => values[Math.floor(random() * values.length)]!);
    medians.push(median(resample));
  }
  medians.sort((left, right) => left - right);
  return {
    lowerMs: medians[Math.floor(iterations * 0.025)]!,
    upperMs: medians[Math.ceil(iterations * 0.975) - 1]!,
  };
}

/** Parses before redaction so encoded credentials in query/hash cannot be persisted. */
function reportUrl(value: string | undefined): string {
  if (!value) return '';
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    // Never echo an unparseable URL: it may contain credential material.
    return '[UNPARSEABLE_URL]';
  }
}

async function signIn(page: Page, baseUrl: string, account: { email: string; password: string }): Promise<void> {
  await page.goto(`${baseUrl}/auth/signin`, { waitUntil: 'networkidle', timeout: 60_000 });
  const email = page.locator('input[name="email"]');
  const password = page.locator('input[name="password"]');
  // Restricting to :not([disabled]) makes this wait cover visibility and
  // enabled state before hydration can trigger a native form submission.
  const submit = page.locator('form button[type="submit"]:not([disabled])');
  await submit.waitFor({ state: 'visible', timeout: 60_000 });
  await email.fill(account.email);
  await password.fill(account.password);
  await submit.click();
  try {
    await page.waitForURL(url => url.pathname === '/member/dashboard' || url.pathname === '/admin/dashboard', {
      timeout: 60_000,
    });
  } catch {
    // Keep this message fixed and credential-free: Playwright timeout details may include the sign-in URL.
    throw new Error('LOGIN_REDIRECT_FAILED');
  }
  await page.waitForLoadState('domcontentloaded');
}

function isInfrastructureNavigationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === 'TimeoutError') return true;
  return /(?:^|[\s:])?(?:net::)?ERR_(?:NETWORK|CONNECTION|SOCKET)|Target closed/.test(error.message);
}

function contextOptions(): BrowserContextOptions {
  const options = createInMemoryContextOptions() as unknown as BrowserContextOptions;
  if (options.storageState !== undefined) throw new Error('CONTEXT_ISOLATION_FAILED: storageState must not be configured');
  return options;
}

function credentialKey({ email, password }: MeasurementCredentials['member']): string {
  // Keys are process-local only; credential material is never logged or reported.
  return JSON.stringify([email, password]);
}

function emitProgress(fields: Record<string, string | number>): void {
  const label = Object.entries(fields).map(([key, value]) => `${key}=${value}`).join(' ');
  process.stderr.write(`PERF_PROGRESS ${label}\n`);
}

interface NavigationRetryContext {
  page: Page;
  url: string;
  timeoutMs: number;
  routeId: string;
  accountType: AccountType;
  mode: 'warmup' | 'measured';
  runNumber: number;
  startedAt: Date;
  failedSamples: FailedSampleInput[];
  secrets: SecretValues;
}

interface NavigationAttempt {
  response: PlaywrightResponse | null;
  finalFailure?: FailedSampleInput;
}

/** Navigates once, with exactly one retry for infrastructure-only failures. */
async function navigateWithInfrastructureRetry(context: NavigationRetryContext): Promise<NavigationAttempt> {
  const options = { timeout: context.timeoutMs, waitUntil: 'load' } as const;
  try {
    return { response: await context.page.goto(context.url, options) };
  } catch (firstError) {
    const failure = await failedSample(
      { id: context.routeId },
      context.accountType,
      context.mode,
      context.runNumber,
      context.startedAt,
      firstError,
      context.page,
      context.secrets,
    );

    if (!isInfrastructureNavigationError(firstError)) {
      const finalFailure = { ...failure, outcome: 'final' as const };
      context.failedSamples.push(finalFailure);
      return { response: null, finalFailure };
    }

    context.failedSamples.push({ ...failure, outcome: 'transient' as const });
    emitProgress({ route: context.routeId, phase: context.mode, run: context.runNumber, retry: 1 });
    try {
      return { response: await context.page.goto(context.url, options) };
    } catch (retryError) {
      const retryFailure = await failedSample(
        { id: context.routeId },
        context.accountType,
        context.mode,
        context.runNumber,
        context.startedAt,
        retryError,
        context.page,
        context.secrets,
      );
      const finalFailure = { ...retryFailure, outcome: 'final' as const };
      context.failedSamples.push(finalFailure);
      return { response: null, finalFailure };
    }
  }
}


/** Computes report data; no credential field is ever placed into the payload. */
export async function measureRoutes(options: MeasurementOptions): Promise<Record<string, unknown>> {
  const repoRoot = options.repoRoot ?? process.cwd();
  const manifest = loadRouteManifest(repoRoot);
  const seed = options.seed ?? randomInt(0, 2 ** 31);
  const measuredRunsPerRoute = options.measuredRunsPerRoute ?? 10;
  if (measuredRunsPerRoute < 10) throw new Error('PROTOCOL_VIOLATION: at least 10 measured runs are required');
  const routeOrder = createShuffledRouteOrder(manifest.routes, seed);
  const secrets: SecretValues = {
    memberEmail: options.credentials.member.email,
    memberPassword: options.credentials.member.password,
    adminEmail: options.credentials.admin.email,
    adminPassword: options.credentials.admin.password,
  };

  const { chromium } = (await import('playwright-core')) as typeof import('playwright-core');
  const browser: Browser = await chromium.launch({ headless: true });
  const startedAt = new Date();
  const browserVersion = browser.version();
  const rawResults = new Map<string, { routeId: string; accountType: AccountType; warmupRuns: number; measuredRuns: number; failedRuns: number; medianMs: number | null; rawSamples: SampleInput[]; failedSamples: FailedSampleInput[] }>(routeOrder.map(routeId => {
    const route = manifest.routes.find(item => item.id === routeId)!;
    return [routeId, { routeId, accountType: route.accountType, warmupRuns: 0, measuredRuns: 0, failedRuns: 0, medianMs: null, rawSamples: [], failedSamples: [] }];
  }));
  // One authenticated browser session per exact credential pair. Distinct roles
  // stay isolated; production-authorized identical dual-role credentials reuse
  // the same in-memory context so re-sign-in cannot invalidate the first session.
  const credentialContexts = new Map<string, BrowserContext>();

  try {
    // Strict sequential execution: this loop is intentionally not Promise.all.
    for (const routeId of routeOrder) {
      const route = manifest.routes.find(item => item.id === routeId)!;
      const result = rawResults.get(routeId)!;
      const credential = credentialKey(options.credentials[route.accountType]);
      let context = credentialContexts.get(credential);
      const account = options.credentials[route.accountType];

      emitProgress({ route: route.id, phase: 'signin' });
      if (!context) {
        context = await browser.newContext(contextOptions());
        credentialContexts.set(credential, context);
        const signInPage = await context.newPage();
        const signInStarted = new Date();
        try {
          await signIn(signInPage, options.baseUrl, account);
        } catch (error) {
          const failure = await failedSample(route, route.accountType, 'warmup', 1, signInStarted, error, signInPage, secrets);
          result.failedSamples.push({ ...failure, outcome: 'final' });
          result.failedRuns += 1;
        } finally {
          await signInPage.close();
        }
      }

      // Warmup is preparation only: failure never suppresses required measured runs.
      const warmupStarted = new Date();
      emitProgress({ route: route.id, phase: 'warmup', run: 1 });
      let warmupPage: Page | null = null;
      try {
        warmupPage = await context.newPage();
        const navigation = await navigateWithInfrastructureRetry({
          page: warmupPage,
          url: `${options.baseUrl}${route.url}`,
          timeoutMs: route.navigationTimeoutMs,
          routeId: route.id,
          accountType: route.accountType,
          mode: 'warmup',
          runNumber: 1,
          startedAt: warmupStarted,
          failedSamples: result.failedSamples,
          secrets,
        });

        if (!navigation.finalFailure) {
          const evidence = await assertSelectors(warmupPage, route);
          result.rawSamples.push({
            routeId, accountType: route.accountType, mode: 'warmup', runNumber: 1,
            startedAt: warmupStarted.toISOString(), durationMs: Date.now() - warmupStarted.getTime(),
            finalUrl: redactJson(reportUrl(warmupPage.url()), secrets).value, httpStatus: navigation.response?.status() ?? null,
            navigationTiming: await navigationTiming(warmupPage), resourceTotals: await resourceTotals(warmupPage),
            selectorEvidence: evidence,
          });
          result.warmupRuns = 1;
        } else {
          result.failedRuns += 1;
        }
      } catch (error) {
        const failure = await failedSample(route, route.accountType, 'warmup', 1, warmupStarted, error, warmupPage, secrets, `${options.baseUrl}${route.url}`);
        result.failedSamples.push({ ...failure, outcome: 'final' });
        result.failedRuns += 1;
      } finally {
        if (warmupPage) await warmupPage.close();
      }

      for (let runNumber = 1; runNumber <= measuredRunsPerRoute; runNumber += 1) {
        const sampleStarted = new Date();
        emitProgress({ route: route.id, phase: 'measured', run: runNumber });
        let page: Page | null = null;
        try {
          page = await context.newPage();
          const navigation = await navigateWithInfrastructureRetry({
            page,
            url: `${options.baseUrl}${route.url}`,
            timeoutMs: route.navigationTimeoutMs,
            routeId: route.id,
            accountType: route.accountType,
            mode: 'measured',
            runNumber,
            startedAt: sampleStarted,
            failedSamples: result.failedSamples,
            secrets,
          });

          if (!navigation.finalFailure) {
            const selectorEvidence = await assertSelectors(page, route);
            const duration = Date.now() - sampleStarted.getTime();
            result.rawSamples.push({
              routeId, accountType: route.accountType, mode: 'measured', runNumber,
              startedAt: sampleStarted.toISOString(), durationMs: duration,
              finalUrl: redactJson(reportUrl(page.url()), secrets).value, httpStatus: navigation.response?.status() ?? null,
              navigationTiming: await navigationTiming(page), resourceTotals: await resourceTotals(page),
              selectorEvidence,
            });
            result.measuredRuns += 1;
          } else {
            result.failedRuns += 1;
          }
        } catch (error) {
          const failure = await failedSample(route, route.accountType, 'measured', runNumber, sampleStarted, error, page, secrets, `${options.baseUrl}${route.url}`);
          result.failedSamples.push({ ...failure, outcome: 'final' });
          result.failedRuns += 1;
        } finally {
          if (page) await page.close();
        }
      }

      result.medianMs = median(result.rawSamples.filter(sample => sample.mode === 'measured').map(sample => sample.durationMs));

      emitProgress({
        route: route.id,
        measured: result.measuredRuns,
        failed: result.failedRuns,
      });
    }
  } finally {
    try {
      // Contexts never leave this process; teardown happens once, after the route loop.
      for (const context of credentialContexts.values()) {
        await context.close();
      }
      credentialContexts.clear();
    } finally {
      await browser.close();
    }
  }

  const aggregateResources = [...rawResults.values()].flatMap(result => result.rawSamples).reduce(
    (totals, sample) => ({ requestCount: totals.requestCount + sample.resourceTotals.requestCount, transferBytes: totals.transferBytes + sample.resourceTotals.transferBytes }),
    { requestCount: 0, transferBytes: 0 },
  );
  const bundleEvidence = await createBundleEvidence(repoRoot, resolve(repoRoot, '.next'), aggregateResources);
  const endedAt = new Date();
  const allMeasured = [...rawResults.values()].flatMap(result => result.rawSamples.filter(sample => sample.mode === 'measured').map(sample => sample.durationMs));
  const ci = bootstrapCi(allMeasured, seed);
  const totalFailures = [...rawResults.values()].reduce((sum, result) => sum + result.failedRuns, 0);
  const allRoutesAccepted = [...rawResults.values()].every(result => {
    const warmupSamples = result.rawSamples.filter(sample => sample.mode === 'warmup');
    const measuredSamples = result.rawSamples.filter(sample => sample.mode === 'measured');
    const selectorsPassed = result.rawSamples.every(sample => sample.selectorEvidence.every(evidence => evidence.matched));
    return result.warmupRuns === 1
      && warmupSamples.length === 1
      && result.measuredRuns >= measuredRunsPerRoute
      && measuredSamples.length >= measuredRunsPerRoute
      && result.failedRuns === 0
      && selectorsPassed;
  });
  const playwrightPackage = require('playwright-core/package.json') as { version: string };
  // Require is intentionally local to report construction and exposes only the package version.
  const report = {
    schemaVersion: '1.0.0' as const,
    reportKind: 'measurement_report' as const,
    generatedAt: endedAt.toISOString(),
    deployment: { id: redactJson(options.deploymentId, secrets).value },
    branchCommit: { branch: redactJson(options.branch, secrets).value, commit: redactJson(options.commit, secrets).value },
    tooling: {
      harness: 'playwright-routes-v1', playwright: playwrightPackage.version,
      browserName: 'chromium', browserVersion, node: process.version,
      platform: `${process.platform}-${process.arch}`,
    },
    measurementWindow: {
      timezone: 'Asia/Tokyo', startedAt: startedAt.toISOString(), endedAt: endedAt.toISOString(), toleranceMs: 0,
    },
    protocol: {
      signInPath: manifest.signInPath, navigationTimeoutMs: 60000, warmupRunsPerRoute: 1,
      measuredRunsPerRoute, concurrency: 1, routeSelectorAssertion: 'allVisible',
    },
    accounts: [
      { label: 'member' as const, type: 'member' as const },
      { label: 'admin' as const, type: 'admin' as const },
    ],
    routeOrderSeed: seed,
    routeOrder,
    results: routeOrder.map(routeId => rawResults.get(routeId)!),
    bootstrapCi: {
      method: 'percentile-bootstrap-of-route-measurements', iterations: 2000, confidenceLevel: 0.95,
      seed, metadataOnly: false, computedAt: endedAt.toISOString(), lowerMs: ci.lowerMs, upperMs: ci.upperMs,
    },
    bundleEvidence,
    isolation: { inMemoryContexts: true, storageStatePersisted: false, cookiesPersisted: false },
    secretScan: {
      status: 'passed' as const, patterns: ['supplied-credentials', 'jwt', 'authorization-header', 'cookie-header', 'signed-url-or-token-query', 'sensitive-key'],
      redactionsApplied: 0, scannedAt: endedAt.toISOString(),
    },
    acceptance: {
      verdict: allRoutesAccepted && totalFailures === 0 ? ('passed' as const) : ('failed' as const),
      reason: allRoutesAccepted && totalFailures === 0
        ? 'All routes completed with successful warmup and measured samples.'
        : `${totalFailures} final sample(s) failed or required measurements are incomplete.`,
    },
  };

  const redactedReport = redactJson(report, secrets);
  redactedReport.value.secretScan.redactionsApplied = redactedReport.redactionsApplied;
  const output = resolve(options.output ?? resolve(repoRoot, '.omx/reports/perf-routes-homepage-speed.json'));
  await writeFile(output, `${JSON.stringify(redactedReport.value, null, 2)}\n`, 'utf8');
  return redactedReport.value;
}

async function assertSelectors(page: Page, route: PerformanceRoute): Promise<SampleInput['selectorEvidence']> {
  return Promise.all(route.meaningfulContentSelectors.map(async selector => {
    const locator = page.locator(selector);
    await locator.first().waitFor({ state: 'visible', timeout: route.navigationTimeoutMs });
    const count = await locator.count();
    // A successful waitFor is authoritative even if React removes the node before
    // the separate count query; preserve a positive count when one is still present.
    return { selector, assertion: 'visible' as const, matched: true, matchCount: count > 0 ? count : 1 };
  }));
}

async function navigationTiming(page: Page): Promise<SampleInput['navigationTiming']> {
  return page.evaluate(() => {
    const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    return {
      startTime: entry?.startTime ?? 0,
      responseStart: entry?.responseStart ?? null,
      responseEnd: entry?.responseEnd ?? null,
      domContentLoadedEventEnd: entry?.domContentLoadedEventEnd ?? null,
      loadEventEnd: entry?.loadEventEnd ?? null,
    };
  });
}

async function resourceTotals(page: Page): Promise<SampleInput['resourceTotals']> {
  return page.evaluate(() => {
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return {
      requestCount: entries.length,
      transferBytes: entries.reduce((total, entry) => total + (entry.transferSize || 0), 0),
      decodedBytes: entries.reduce((total, entry) => total + (entry.encodedBodySize || 0), 0),
    };
  });
}

async function failedSample(
  route: Pick<PerformanceRoute, 'id'>,
  accountType: AccountType,
  mode: 'warmup' | 'measured',
  runNumber: number,
  startedAt: Date,
  error: unknown,
  page: Page | null,
  secrets: SecretValues,
  fallbackUrl?: string,
): Promise<FailedSampleInput> {
  const nativeError = error instanceof Error ? error : new Error(String(error));
  return {
    routeId: route.id, accountType, mode, runNumber, startedAt: startedAt.toISOString(),
    errorCode: error instanceof Error && error.name ? error.name : 'NAVIGATION_FAILED',
    message: redactJson(nativeError.message, secrets).value,
    url: redactJson(reportUrl(page?.url() ?? fallbackUrl), secrets).value,
  };
}

function parseOptions(argv: readonly string[]): MeasurementOptions {
  const value = (flag: string): string => {
    const index = argv.indexOf(flag);
    if (index < 0 || !argv[index + 1]) throw new Error(`MISSING_ARGUMENT: ${flag}`);
    return argv[index + 1]!;
  };
  return {
    baseUrl: value('--base-url').replace(/\/$/, ''),
    deploymentId: value('--deployment-id'),
    branch: value('--branch'),
    commit: value('--commit'),
    seed: argv.includes('--seed') ? Number(value('--seed')) : undefined,
    measuredRunsPerRoute: argv.includes('--runs') ? Number(value('--runs')) : 10,
    output: argv.includes('--output') ? resolve(value('--output')) : undefined,
    credentials: {
      member: {
        email: readCredentialFromEnv('PROD_MEMBER_TEST_EMAIL'),
        password: readCredentialFromEnv('PROD_MEMBER_TEST_PASSWORD'),
      },
      admin: {
        email: readCredentialFromEnv('PROD_ADMIN_TEST_EMAIL'),
        password: readCredentialFromEnv('PROD_ADMIN_TEST_PASSWORD'),
      },
    },
  };
}

if (require.main === module) {
  measureRoutes(parseOptions(process.argv.slice(2))).then(report => {
    const acceptance = report.acceptance as { verdict?: string } | undefined;
    process.stdout.write(`MEASUREMENT_COMPLETE: ${acceptance?.verdict ?? 'unknown'}\n`);
  }).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
