import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createShuffledRouteOrder, loadRouteManifest, validateRouteManifest } from './routes';

export interface SelfCheckResult {
  ok: true;
  routeCount: 6;
  routeOrderSeed: number;
  routeOrder: string[];
  protocolLocked: true;
  productionVariablesRequired: false;
}

export function runProtocolSelfCheck(seed = 1, repoRoot = process.cwd()): SelfCheckResult {
  const manifest = loadRouteManifest(repoRoot);
  validateRouteManifest(manifest);
  const order = createShuffledRouteOrder(manifest.routes, seed);
  const schemaPath = resolve(repoRoot, '.omx/reports/perf-report-schema.json');
  const templatePath = resolve(repoRoot, '.omx/reports/perf-protocol-lock-homepage-speed.template.json');
  if (!existsSync(schemaPath) || !existsSync(templatePath)) throw new Error('SELF_CHECK_FAILED: report or protocol artifact missing');

  const template = JSON.parse(readFileSync(templatePath, 'utf8')) as { protocol?: { measuredRunsPerRoute?: number; concurrency?: number } };
  if (template.protocol?.measuredRunsPerRoute !== 10 || template.protocol?.concurrency !== 1) {
    throw new Error('SELF_CHECK_FAILED: protocol policy mismatch');
  }
  return {
    ok: true,
    routeCount: 6,
    routeOrderSeed: seed,
    routeOrder: order,
    protocolLocked: true,
    productionVariablesRequired: false,
  };
}

function main(): void {
  const seedIndex = process.argv.indexOf('--seed');
  const seed = seedIndex >= 0 ? Number(process.argv[seedIndex + 1]) : 1;
  const result = runProtocolSelfCheck(seed);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (require.main === module) main();
