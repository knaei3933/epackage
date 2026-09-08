import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { redactJson, scanRedactedJson, type JsonValue, type SecretValues } from './security';
import { EXPECTED_ROUTE_IDS, loadRouteManifest } from './routes';

export const accountTypeSchema = z.enum(['member', 'admin']);
export const selectorEvidenceSchema = z.object({
  selector: z.string().min(1),
  assertion: z.literal('visible'),
  matched: z.boolean(),
  matchCount: z.number().int().min(0),
});

export const sampleSchema = z.object({
  routeId: z.string().min(1),
  accountType: accountTypeSchema,
  mode: z.enum(['warmup', 'measured']),
  runNumber: z.number().int().min(1),
  startedAt: z.string().datetime(),
  durationMs: z.number().min(0),
  finalUrl: z.string().min(1),
  httpStatus: z.number().int().min(100).max(599).nullable(),
  navigationTiming: z.object({
    startTime: z.number().min(0),
    responseStart: z.number().min(0).nullable(),
    responseEnd: z.number().min(0).nullable(),
    domContentLoadedEventEnd: z.number().min(0).nullable(),
    loadEventEnd: z.number().min(0).nullable(),
  }),
  resourceTotals: z.object({
    requestCount: z.number().int().min(0),
    transferBytes: z.number().int().min(0),
    decodedBytes: z.number().int().min(0),
  }),
  selectorEvidence: z.array(selectorEvidenceSchema).min(1),
});

export const failedSampleSchema = z.object({
  routeId: z.string().min(1),
  accountType: accountTypeSchema,
  mode: z.enum(['warmup', 'measured']),
  runNumber: z.number().int().min(1),
  startedAt: z.string().datetime(),
  errorCode: z.string().min(1),
  message: z.string(),
  url: z.string().min(1),
  outcome: z.enum(['transient', 'final']).optional(),
});

export const routeResultSchema = z.object({
  routeId: z.string().min(1),
  accountType: accountTypeSchema,
  warmupRuns: z.number().int().min(0),
  measuredRuns: z.number().int().min(0),
  failedRuns: z.number().int().min(0),
  medianMs: z.number().min(0).nullable(),
  rawSamples: z.array(sampleSchema),
  failedSamples: z.array(failedSampleSchema),
});

export const measurementReportSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  reportKind: z.enum(['measurement_report', 'protocol_lock']),
  generatedAt: z.string().datetime(),
  deployment: z.object({
    id: z.string().min(1),
    provider: z.string().min(1).optional(),
  }),
  branchCommit: z.object({ branch: z.string().min(1), commit: z.string().min(7).max(40) }),
  tooling: z.object({
    harness: z.literal('playwright-routes-v1'),
    playwright: z.string().min(1),
    browserName: z.string().min(1),
    browserVersion: z.string().min(1),
    node: z.string().min(1),
    platform: z.string().optional(),
  }),
  measurementWindow: z.object({
    timezone: z.string().min(1),
    startedAt: z.string().datetime(),
    endedAt: z.string().datetime(),
    toleranceMs: z.number().int().min(0),
  }),
  protocol: z.object({
    signInPath: z.literal('/auth/signin'),
    navigationTimeoutMs: z.literal(60000),
    warmupRunsPerRoute: z.literal(1),
    measuredRunsPerRoute: z.number().int().min(10),
    concurrency: z.literal(1),
    routeSelectorAssertion: z.literal('allVisible'),
  }),
  accounts: z.array(z.object({ label: z.enum(['member', 'admin']), type: z.enum(['member', 'admin']) })).length(2),
  routeOrderSeed: z.number().int().min(0),
  routeOrder: z.array(z.enum(EXPECTED_ROUTE_IDS as [string, ...string[]])).length(6),
  results: z.array(routeResultSchema).length(6),
  bootstrapCi: z.object({
    method: z.string().min(1),
    iterations: z.number().int().min(1000),
    confidenceLevel: z.number().min(0).max(1),
    seed: z.number().int().min(0),
    metadataOnly: z.boolean(),
    computedAt: z.string().datetime().optional(),
    lowerMs: z.number().min(0).optional(),
    upperMs: z.number().min(0).optional(),
  }),
  bundleEvidence: z.object({
    status: z.enum(['available', 'missing']),
    sourcePath: z.string().min(1),
    buildId: z.string().min(1).optional(),
    generatedAt: z.string().datetime().optional(),
    totalBytes: z.number().int().min(0).optional(),
    fileCounts: z.record(z.number().int().min(0)).optional(),
    resourceTotals: z.object({
      requestCount: z.number().int().min(0),
      transferBytes: z.number().int().min(0),
    }).optional(),
    errorCode: z.literal('NEXT_BUILD_OUTPUT_MISSING').optional(),
  }),
  isolation: z.object({
    inMemoryContexts: z.literal(true),
    storageStatePersisted: z.literal(false),
    cookiesPersisted: z.literal(false),
  }),
  secretScan: z.object({
    status: z.enum(['passed', 'failed']),
    patterns: z.array(z.string()),
    redactionsApplied: z.number().int().min(0),
    scannedAt: z.string().datetime(),
  }),
  acceptance: z.object({
    verdict: z.enum(['pending', 'passed', 'failed', 'blocked']),
    reason: z.string().min(1).optional(),
  }),
});

export type MeasurementReport = z.infer<typeof measurementReportSchema>;
export type PerformanceSample = z.infer<typeof sampleSchema>;

export interface ValidationOptions {
  repoRoot?: string;
  requireCompleteMeasurement?: boolean;
  secrets?: SecretValues;
}

export interface ValidationSuccess {
  ok: true;
  report: MeasurementReport;
  redactionsApplied: number;
}

export type ValidationResult = ValidationSuccess | { ok: false; errors: string[] };

function assertJsonSchemaShape(repoRoot: string): void {
  const path = resolve(repoRoot, '.omx/reports/perf-report-schema.json');
  const schema = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema' || schema.type !== 'object') {
    throw new Error('REPORT_SCHEMA_INVALID');
  }
  const required = schema.required;
  if (!Array.isArray(required) || required.length < 15) throw new Error('REPORT_SCHEMA_INVALID');
}

function exactIds<T extends { routeId: string }>(values: readonly T[], label: string): string[] {
  const ids = values.map(value => value.routeId);
  if (new Set(ids).size !== 6 || !EXPECTED_ROUTE_IDS.every(id => ids.includes(id))) {
    throw new Error(`${label}_ROUTES_INVALID: expected exactly ${EXPECTED_ROUTE_IDS.join(',')}`);
  }
  return ids;
}

export function validateMeasurementPayload(
  input: unknown,
  options: ValidationOptions = {},
): ValidationResult {
  const repoRoot = options.repoRoot ?? process.cwd();
  const errors: Array<string | Error> = [];
  try {
    assertJsonSchemaShape(repoRoot);

    const redacted = redactJson(input, options.secrets ?? {});
    scanRedactedJson(redacted.value);
    const parsed = measurementReportSchema.safeParse(redacted.value);
    if (!parsed.success) {
      return { ok: false, errors: parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) };
    }

    const report = parsed.data;
    const manifest = loadRouteManifest(repoRoot);
    const routeById = new Map(manifest.routes.map(route => [route.id, route]));
    const order = [...new Set(report.routeOrder)];
    if (order.length !== 6 || EXPECTED_ROUTE_IDS.some(id => !order.includes(id))) {
      errors.push('routeOrder must contain each expected route exactly once');
    }

    const accountTypes = report.accounts.map(account => account.type).sort();
    if (JSON.stringify(accountTypes) !== JSON.stringify(['admin', 'member'])) errors.push('accounts must contain one member and one admin');
    if (report.accounts.some(account => account.label !== account.type)) errors.push('account label and type must match');

    exactIds(report.results, 'RESULT');
    for (const result of report.results) {
      const route = routeById.get(result.routeId);
      if (route && result.accountType !== route.accountType) errors.push(`${result.routeId}: accountType does not match manifest`);
      const measuredSamples = result.rawSamples.filter(sample => sample.mode === 'measured');
      const warmupSamples = result.rawSamples.filter(sample => sample.mode === 'warmup');
      const isComplete = options.requireCompleteMeasurement !== false
        && report.acceptance.verdict === 'passed'
        && report.reportKind === 'measurement_report';
      if (isComplete && measuredSamples.length < report.protocol.measuredRunsPerRoute) {
        errors.push(`${result.routeId}: requires at least ${report.protocol.measuredRunsPerRoute} measured samples`);
      }
      if (isComplete && warmupSamples.length !== report.protocol.warmupRunsPerRoute) {
        errors.push(`${result.routeId}: requires exactly one warmup sample`);
      }
      for (const sample of [...result.rawSamples, ...result.failedSamples]) {
        if (sample.accountType !== result.accountType) errors.push(`${result.routeId}: sample account separation failed`);
        if (sample.routeId !== result.routeId) errors.push(`${result.routeId}: sample route mismatch`);
      }
      for (const sample of result.rawSamples) {
        const evidenceSelectors = sample.selectorEvidence.map(item => item.selector).sort();
        const expectedSelectors = [...route?.meaningfulContentSelectors ?? []].sort();
        if (JSON.stringify(evidenceSelectors) !== JSON.stringify(expectedSelectors)) {
          errors.push(`${result.routeId}: selector evidence does not match manifest`);
        }
        if (sample.selectorEvidence.some(item => !item.matched || item.matchCount < 1 || item.assertion !== 'visible')) {
          errors.push(`${result.routeId}: meaningful-content selector did not pass`);
        }
        if (isComplete && sample.mode === 'measured' && sample.durationMs !== null && sample.durationMs < 0) {
          errors.push(`${result.routeId}: invalid measured duration`);
        }
      }
    const usesTransientOutcomes = result.failedSamples.some(sample => sample.outcome !== undefined);
    const expectedFailedRuns = usesTransientOutcomes
      ? result.failedSamples.filter(sample => sample.outcome !== 'transient').length
      : result.failedSamples.length;
    if (result.failedRuns !== expectedFailedRuns) errors.push(`${result.routeId}: failedRuns count mismatch`);
    }

    if (report.acceptance.verdict === 'passed' && report.secretScan.status !== 'passed') errors.push('accepted report must have a passed secret scan');
    if (report.acceptance.verdict === 'passed' && report.bundleEvidence.status !== 'available') errors.push('accepted report requires bundle evidence');
    if (report.acceptance.verdict === 'passed' && (
      !report.bundleEvidence.buildId ||
      report.bundleEvidence.totalBytes === undefined ||
      !report.bundleEvidence.resourceTotals
    )) errors.push('accepted bundle evidence requires build ID, build bytes, and browser resource totals');
    if (errors.length > 0) return { ok: false, errors: errors.map(String) };
    return { ok: true, report, redactionsApplied: redacted.redactionsApplied };
  } catch (error) {
    return { ok: false, errors: [error instanceof Error ? error.message : String(error)] };
  }
}
