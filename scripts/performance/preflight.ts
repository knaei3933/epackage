#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { redactJson, scanRedactedJson, type SecretValues } from './security';
import { loadRouteManifest } from './routes';

export type PreflightCheckName =
  | 'requiredArguments'
  | 'credentials'
  | 'accountDistinctness'
  | 'baseUrl'
  | 'deploymentIdentity'
  | 'routeManifest'
  | 'measurementProtocol'
  | 'bundleEvidence';

export type PreflightCheckStatus = 'pass' | 'fail' | 'skipped';

export interface PreflightMetadata {
  baseUrlOrigin: string;
  deploymentId: string;
  branch: string;
  commit: string;
  routeCount: number;
  routeOrderSeed: number;
}

export interface PreflightArtifact {
  schemaVersion: '1.0.0';
  reportKind: 'production_preflight';
  status: 'ok' | 'failed';
  reasonCodes: string[];
  checks: Record<PreflightCheckName, PreflightCheckStatus>;
  metadata: PreflightMetadata | null;
  generatedAt: string;
}

export type PreflightResult =
  | { ok: true; metadata: PreflightMetadata; checks: Record<PreflightCheckName, PreflightCheckStatus> }
  | { ok: false; reasonCodes: string[]; checks: Record<PreflightCheckName, PreflightCheckStatus> };

interface ParsedArguments {
  baseUrl?: string;
  deploymentId?: string;
  branch?: string;
  commit?: string;
  output?: string;
}

const REQUIRED_FLAGS = ['--base-url', '--deployment-id', '--branch', '--commit'] as const;
const OPTIONAL_FLAGS = ['--output'] as const;
const ALL_FLAGS = [...REQUIRED_FLAGS, ...OPTIONAL_FLAGS] as const;
const CREDENTIAL_ENVIRONMENT_NAMES = [
  'PROD_MEMBER_TEST_EMAIL',
  'PROD_MEMBER_TEST_PASSWORD',
  'PROD_ADMIN_TEST_EMAIL',
  'PROD_ADMIN_TEST_PASSWORD',
] as const;
const ROUTE_ORDER_SEED = 1;

function failedChecks(): Record<PreflightCheckName, PreflightCheckStatus> {
  return {
    requiredArguments: 'fail',
    credentials: 'fail',
    accountDistinctness: 'skipped',
    baseUrl: 'fail',
    deploymentIdentity: 'fail',
    routeManifest: 'fail',
    measurementProtocol: 'fail',
    bundleEvidence: 'fail',
  };
}

function passes(checks: Record<PreflightCheckName, PreflightCheckStatus>, names: readonly PreflightCheckName[]): void {
  for (const name of names) checks[name] = 'pass';
}

function parseArguments(argv: readonly string[]): { arguments: ParsedArguments; reasonCodes: string[] } {
  const parsed: ParsedArguments = {};
  const seen = new Set<string>();
  const reasonCodes: string[] = [];
  let index = 0;

  while (index < argv.length) {
    const flag = argv[index];
    if (!ALL_FLAGS.includes(flag as (typeof ALL_FLAGS)[number])) {
      reasonCodes.push('UNKNOWN_ARGUMENT');
      index += 1;
      continue;
    }

    const value = argv[index + 1];
    if (value === undefined || value.trim().length === 0) {
      reasonCodes.push(`MISSING_ARG:${flag}`);
      index += 2;
      continue;
    }
    if (seen.has(flag)) {
      reasonCodes.push(`DUPLICATE_ARG:${flag}`);
      index += 2;
      continue;
    }

    seen.add(flag);
    if (flag === '--base-url') parsed.baseUrl = value;
    else if (flag === '--deployment-id') parsed.deploymentId = value;
    else if (flag === '--branch') parsed.branch = value;
    else if (flag === '--commit') parsed.commit = value;
    else if (flag === '--output') parsed.output = value;
    index += 2;
  }

  for (const flag of REQUIRED_FLAGS) {
    if (!seen.has(flag)) reasonCodes.push(`MISSING_ARG:${flag}`);
  }

  return { arguments: parsed, reasonCodes: [...new Set(reasonCodes)] };
}

function isSecureProductionOrigin(candidate: string): boolean {
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  const isLocalHost = hostname === 'localhost' || hostname.endsWith('.localhost');
  const isIpAddress = /^(?:\d{1,5}(?:\.\d{1,5}){3}|\[[0-9a-f:]+\])$/.test(hostname);
  const isInternalName = !hostname.includes('.') && hostname !== '';
  return (
    url.protocol === 'https:'
    && url.username === ''
    && url.password === ''
    && url.search === ''
    && url.hash === ''
    && url.pathname === '/'
    && hostname.length > 0
    && !isLocalHost
    && !isIpAddress
    && !isInternalName
  );
}

function validateProtocolTemplate(repoRoot: string): boolean {
  const path = resolve(repoRoot, '.omx/reports/perf-protocol-lock-homepage-speed.template.json');
  if (!existsSync(path)) return false;

  try {
    const template = JSON.parse(readFileSync(path, 'utf8')) as {
      protocol?: {
        warmupRunsPerRoute?: number;
        measuredRunsPerRoute?: number;
        concurrency?: number;
      };
    };
    return template.protocol?.warmupRunsPerRoute === 1
      && template.protocol?.measuredRunsPerRoute === 10
      && template.protocol?.concurrency === 1;
  } catch {
    return false;
  }
}

export function runPreflight(input: {
  argv: readonly string[];
  environment?: NodeJS.ProcessEnv;
  repoRoot?: string;
}): PreflightResult {
  const environment = input.environment ?? process.env;
  const repoRoot = input.repoRoot ?? process.cwd();
  const checks = failedChecks();
  const parsed = parseArguments(input.argv);
  const missingArguments = parsed.reasonCodes.length > 0;
  if (!missingArguments) passes(checks, ['requiredArguments']);

  const missingEnvironment = CREDENTIAL_ENVIRONMENT_NAMES.filter(name => {
    const value = environment[name];
    return typeof value !== 'string' || value.length === 0;
  });
  if (!missingArguments && missingEnvironment.length === 0) passes(checks, ['credentials']);

  const credentials = {
    memberEmail: missingEnvironment.includes('PROD_MEMBER_TEST_EMAIL') ? undefined : environment.PROD_MEMBER_TEST_EMAIL!,
    memberPassword: missingEnvironment.includes('PROD_MEMBER_TEST_PASSWORD') ? undefined : environment.PROD_MEMBER_TEST_PASSWORD!,
    adminEmail: missingEnvironment.includes('PROD_ADMIN_TEST_EMAIL') ? undefined : environment.PROD_ADMIN_TEST_EMAIL!,
    adminPassword: missingEnvironment.includes('PROD_ADMIN_TEST_PASSWORD') ? undefined : environment.PROD_ADMIN_TEST_PASSWORD!,
  };
  const emailsDistinct = credentials.memberEmail !== undefined
    && credentials.adminEmail !== undefined
    && credentials.memberEmail.trim().toLowerCase() !== credentials.adminEmail.trim().toLowerCase();
  if (!missingArguments && missingEnvironment.length === 0 && emailsDistinct) passes(checks, ['accountDistinctness']);

  let baseUrlOrigin: string | null = null;
  if (!missingArguments && parsed.arguments.baseUrl !== undefined && isSecureProductionOrigin(parsed.arguments.baseUrl)) {
    baseUrlOrigin = new URL(parsed.arguments.baseUrl).origin;
    passes(checks, ['baseUrl']);
  }

  const identityPresent = !missingArguments
    && parsed.arguments.deploymentId !== undefined
    && parsed.arguments.branch !== undefined
    && parsed.arguments.commit !== undefined;
  if (identityPresent) passes(checks, ['deploymentIdentity']);

  let routeCount = 0;
  try {
    const manifest = loadRouteManifest(repoRoot);
    routeCount = manifest.routes.length;
    passes(checks, ['routeManifest']);
  } catch {
    routeCount = 0;
  }

  if (validateProtocolTemplate(repoRoot)) passes(checks, ['measurementProtocol']);
  if (existsSync(resolve(repoRoot, '.omx/reports/bundle-evidence-baseline-homepage-speed.json'))) {
    passes(checks, ['bundleEvidence']);
  }

  const reasonCodes: string[] = [];
  if (missingArguments) reasonCodes.push(...parsed.reasonCodes);
  reasonCodes.push(...missingEnvironment.map(name => `MISSING_ENV:${name}`));
  if (!missingArguments && missingEnvironment.length === 0 && !emailsDistinct) reasonCodes.push('ACCOUNTS_NOT_DISTINCT');
  if (checks.baseUrl === 'fail') reasonCodes.push('INVALID_BASE_URL');
  if (checks.routeManifest === 'fail' || checks.measurementProtocol === 'fail') reasonCodes.push('PROTOCOL_INVALID');
  if (checks.bundleEvidence === 'fail') reasonCodes.push('MISSING_BUNDLE_EVIDENCE');

  if (reasonCodes.length > 0) return { ok: false, reasonCodes: [...new Set(reasonCodes)], checks };
  return {
    ok: true,
    metadata: {
      baseUrlOrigin: baseUrlOrigin!,
      deploymentId: parsed.arguments.deploymentId!,
      branch: parsed.arguments.branch!,
      commit: parsed.arguments.commit!,
      routeCount,
      routeOrderSeed: ROUTE_ORDER_SEED,
    },
    checks,
  };
}

function assertNoKnownSecret(value: unknown, secrets: SecretValues, path = '$'): void {
  if (typeof value === 'string') {
    for (const secret of Object.values(secrets)) {
      if (secret.length > 0 && value.includes(secret)) throw new Error('SECRET_SCAN_FAILED');
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertNoKnownSecret(child, secrets, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) assertNoKnownSecret(child, secrets, path);
  }
}

export function createPreflightArtifact(
  result: PreflightResult,
  secrets: SecretValues,
  generatedAt = new Date().toISOString(),
): PreflightArtifact {
  const reasonCodes = result.ok ? [] : result.reasonCodes;
  const artifact: PreflightArtifact = {
    schemaVersion: '1.0.0',
    reportKind: 'production_preflight',
    status: result.ok ? 'ok' : 'failed',
    reasonCodes,
    checks: result.checks,
    metadata: result.ok ? result.metadata : null,
    generatedAt,
  };
  scanRedactedJson(artifact);
  const redacted = redactJson(artifact, secrets).value;
  scanRedactedJson(redacted);
  assertNoKnownSecret(redacted, secrets);
  return redacted;
}

export function writePreflightArtifact(path: string, artifact: PreflightArtifact): void {
  writeFileSync(path, `${JSON.stringify(artifact, null, 2)}\n`);
}

export function executePreflight(input: {
  argv: readonly string[];
  environment?: NodeJS.ProcessEnv;
  repoRoot?: string;
  stdout?: { write: (chunk: string) => unknown };
}): number {
  const output = input.stdout ?? process.stdout;
  const result = runPreflight(input);
  const parsed = parseArguments(input.argv);
  const outputPath = parsed.arguments.output;
  const secrets: SecretValues = {
    memberEmail: input.environment?.PROD_MEMBER_TEST_EMAIL ?? '',
    memberPassword: input.environment?.PROD_MEMBER_TEST_PASSWORD ?? '',
    adminEmail: input.environment?.PROD_ADMIN_TEST_EMAIL ?? '',
    adminPassword: input.environment?.PROD_ADMIN_TEST_PASSWORD ?? '',
  };

  if (outputPath !== undefined || result.ok) {
    try {
      const artifact = createPreflightArtifact(result, secrets);
      if (outputPath !== undefined) {
        writePreflightArtifact(resolve(input.repoRoot ?? process.cwd(), outputPath), artifact);
      }
      if (result.ok) {
        output.write(`PREFLIGHT_OK\n${JSON.stringify({ status: 'ok', metadata: artifact.metadata }, null, 2)}\n`);
        return 0;
      }
    } catch (error) {
      const reason = error instanceof Error && error.message.startsWith('SECRET_SCAN_FAILED')
        ? 'SECRET_SCAN_FAILED'
        : 'OUTPUT_WRITE_FAILED';
      output.write(`PREFLIGHT_FAILED\n${reason}\n`);
      return 1;
    }
  }

  output.write(`PREFLIGHT_FAILED\n${result.reasonCodes.join('\n')}\n`);
  return 1;
}

if (require.main === module) {
  process.exitCode = executePreflight({ argv: process.argv.slice(2) });
}
