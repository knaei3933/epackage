import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createPreflightArtifact, executePreflight, runPreflight } from '../../scripts/performance/preflight';

const repoRoot = resolve(__dirname, '../..');

const environment = {
  PROD_MEMBER_TEST_EMAIL: 'member@production.invalid',
  PROD_MEMBER_TEST_PASSWORD: 'member-password',
  PROD_ADMIN_TEST_EMAIL: 'admin@production.invalid',
  PROD_ADMIN_TEST_PASSWORD: 'admin-password',
};

const arguments_ = [
  '--base-url', 'https://production.example.com',
  '--deployment-id', 'deployment-42',
  '--branch', 'release-branch',
  '--commit', 'abc123def456',
];

class CaptureOutput {
  readonly chunks: string[] = [];

  write(chunk: string): boolean {
    this.chunks.push(chunk);
    return true;
  }

  get text(): string {
    return this.chunks.join('');
  }
}

async function createFixture(protocol: Record<string, unknown> = {
  warmupRunsPerRoute: 1,
  measuredRunsPerRoute: 10,
  concurrency: 1,
}, includeEvidence = true): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'perf-preflight-'));
  await mkdir(join(root, 'scripts/performance'), { recursive: true });
  await mkdir(join(root, '.omx/reports'), { recursive: true });
  await copyFile(
    join(repoRoot, 'scripts/performance/routes.manifest.json'),
    join(root, 'scripts/performance/routes.manifest.json'),
  );
  await writeFile(
    join(root, '.omx/reports/perf-protocol-lock-homepage-speed.template.json'),
    JSON.stringify({ protocol }),
  );
  if (includeEvidence) {
    await writeFile(join(root, '.omx/reports/bundle-evidence-baseline-homepage-speed.json'), '{}');
  }
  return root;
}

describe('production preflight', () => {
  it('passes only when credentials, identity, manifest, protocol, and bundle evidence are ready', async () => {
    const fixture = await createFixture();
    try {
      const result = runPreflight({ argv: arguments_, environment, repoRoot: fixture });
      expect(result).toEqual({
        ok: true,
        checks: {
          requiredArguments: 'pass',
          credentials: 'pass',
          accountDistinctness: 'pass',
          baseUrl: 'pass',
          deploymentIdentity: 'pass',
          routeManifest: 'pass',
          measurementProtocol: 'pass',
          bundleEvidence: 'pass',
        },
        metadata: {
          baseUrlOrigin: 'https://production.example.com',
          deploymentId: 'deployment-42',
          branch: 'release-branch',
          commit: 'abc123def456',
          routeCount: 6,
          routeOrderSeed: 1,
        },
      });
    } finally {
      await rm(fixture, { recursive: true, force: true });
    }
  });

  it('redacts a credential reused as stdout metadata before emitting success', async () => {
    const fixture = await createFixture();
    const stdout = new CaptureOutput();
    try {
      const exitCode = executePreflight({
        argv: [...arguments_.slice(0, 5), environment.PROD_MEMBER_TEST_PASSWORD, ...arguments_.slice(6)],
        environment,
        repoRoot: fixture,
        stdout,
      });
      expect(exitCode).toBe(0);
      expect(stdout.text).toContain('PREFLIGHT_OK');
      expect(stdout.text).toContain('[REDACTED:MEMBERPASSWORD]');
      expect(stdout.text).not.toContain(environment.PROD_MEMBER_TEST_PASSWORD);
    } finally {
      await rm(fixture, { recursive: true, force: true });
    }
  });

  it('reports every missing credential without reporting account equality', () => {
    const result = runPreflight({
      argv: arguments_,
      environment: {},
      repoRoot,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasonCodes).toEqual([
        'MISSING_ENV:PROD_MEMBER_TEST_EMAIL',
        'MISSING_ENV:PROD_MEMBER_TEST_PASSWORD',
        'MISSING_ENV:PROD_ADMIN_TEST_EMAIL',
        'MISSING_ENV:PROD_ADMIN_TEST_PASSWORD',
      ]);
    }
  });

  it('reports each missing required argument', () => {
    const result = runPreflight({ argv: [], environment, repoRoot });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasonCodes).toEqual([
        'MISSING_ARG:--base-url',
        'MISSING_ARG:--deployment-id',
        'MISSING_ARG:--branch',
        'MISSING_ARG:--commit',
        'INVALID_BASE_URL',
      ]);
    }
  });

  it('enforces distinct member and admin email values case-insensitively', () => {
    const result = runPreflight({
      argv: arguments_,
      environment: {
        ...environment,
        PROD_ADMIN_TEST_EMAIL: ' Member@Production.invalid ',
      },
      repoRoot,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reasonCodes).toEqual(['ACCOUNTS_NOT_DISTINCT']);
  });

  it('rejects insecure or query-bearing base URLs without echoing their values', () => {
    const result = runPreflight({
      argv: ['--base-url', 'http://production.example.com/?token=secret', ...arguments_.slice(2)],
      environment,
      repoRoot,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reasonCodes).toEqual(['INVALID_BASE_URL']);
      expect(JSON.stringify(result)).not.toContain('token');
    }
  });

  it('fails closed on a protocol count mismatch and a missing evidence file', async () => {
    const invalidProtocol = await createFixture({
      warmupRunsPerRoute: 1,
      measuredRunsPerRoute: 9,
      concurrency: 1,
    });
    const missingEvidence = await createFixture(undefined, false);
    try {
      const protocolResult = runPreflight({ argv: arguments_, environment, repoRoot: invalidProtocol });
      const evidenceResult = runPreflight({ argv: arguments_, environment, repoRoot: missingEvidence });
      expect(protocolResult.ok).toBe(false);
      expect(evidenceResult.ok).toBe(false);
      if (!protocolResult.ok && !evidenceResult.ok) {
        expect(protocolResult.reasonCodes).toEqual(['PROTOCOL_INVALID']);
        expect(evidenceResult.reasonCodes).toEqual(['MISSING_BUNDLE_EVIDENCE']);
      }
    } finally {
      await rm(invalidProtocol, { recursive: true, force: true });
      await rm(missingEvidence, { recursive: true, force: true });
    }
  });

  it('writes a redacted failed artifact without exposing supplied credentials', async () => {
    const fixture = await createFixture(undefined, false);
    const outputPath = join(fixture, 'preflight-failed.json');
    const stdout = new CaptureOutput();
    try {
      const exitCode = executePreflight({
        argv: [...arguments_, '--output', 'preflight-failed.json'],
        environment,
        repoRoot: fixture,
        stdout,
      });
      const artifact = JSON.parse(await readFile(outputPath, 'utf8'));
      expect(exitCode).toBe(1);
      expect(stdout.text).toContain('MISSING_BUNDLE_EVIDENCE');
      expect(artifact).toMatchObject({
        status: 'failed',
        reasonCodes: ['MISSING_BUNDLE_EVIDENCE'],
        metadata: null,
      });
      expect(stdout.text).not.toContain(environment.PROD_MEMBER_TEST_EMAIL);
      expect(stdout.text).not.toContain(environment.PROD_MEMBER_TEST_PASSWORD);
      expect(stdout.text).not.toContain(environment.PROD_ADMIN_TEST_EMAIL);
      expect(stdout.text).not.toContain(environment.PROD_ADMIN_TEST_PASSWORD);
      expect(await readFile(outputPath, 'utf8')).not.toContain(environment.PROD_MEMBER_TEST_EMAIL);
      expect(await readFile(outputPath, 'utf8')).not.toContain(environment.PROD_MEMBER_TEST_PASSWORD);
      expect(await readFile(outputPath, 'utf8')).not.toContain(environment.PROD_ADMIN_TEST_EMAIL);
      expect(await readFile(outputPath, 'utf8')).not.toContain(environment.PROD_ADMIN_TEST_PASSWORD);
    } finally {
      await rm(fixture, { recursive: true, force: true });
    }
  });

  it('blocks artifact writes when secret scanning finds a credential carrier', async () => {
    const fixture = await createFixture();
    const outputPath = join(fixture, 'blocked.json');
    const stdout = new CaptureOutput();
    try {
      const exitCode = executePreflight({
        argv: [...arguments_.slice(0, 3), 'deployment?token=value', ...arguments_.slice(4), '--output', 'blocked.json'],
        environment,
        repoRoot: fixture,
        stdout,
      });
      expect(exitCode).toBe(1);
      expect(stdout.text).toBe('PREFLIGHT_FAILED\nSECRET_SCAN_FAILED\n');
      expect(existsSync(outputPath)).toBe(false);
    } finally {
      await rm(fixture, { recursive: true, force: true });
    }
  });

  it('redacts a supplied credential if it appears in non-secret metadata before scanning', () => {
    const result = runPreflight({ argv: arguments_, environment, repoRoot });
    const artifact = createPreflightArtifact(result, {
      memberEmail: environment.PROD_MEMBER_TEST_EMAIL,
      memberPassword: environment.PROD_MEMBER_TEST_PASSWORD,
      adminEmail: environment.PROD_ADMIN_TEST_EMAIL,
      adminPassword: environment.PROD_ADMIN_TEST_PASSWORD,
    }, '2026-01-01T00:00:00.000Z');
    expect(JSON.stringify(artifact)).not.toContain(environment.PROD_MEMBER_TEST_EMAIL);
    expect(JSON.stringify(artifact)).not.toContain(environment.PROD_ADMIN_TEST_PASSWORD);
  });
});
