import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateMeasurementPayload } from './report-schema';

export async function validateReportFile(path: string, repoRoot = process.cwd()): Promise<string> {
  const raw = await readFile(path, 'utf8');
  const result = validateMeasurementPayload(JSON.parse(raw), { repoRoot, requireCompleteMeasurement: false });
  if (!result.ok) throw new Error(`REPORT_VALIDATION_FAILED: ${result.errors.join('; ')}`);
  return `${result.report.acceptance.verdict}: ${resolve(path)}`;
}

async function main(): Promise<void> {
  const positional = process.argv.slice(2).filter(value => !value.startsWith('--'));
  if (positional.length === 0) {
    console.error('Usage: ts-node --transpile-only scripts/performance/validate-report.ts <report.json>');
    process.exitCode = 2;
    return;
  }
  try {
    process.stdout.write(`${await validateReportFile(resolve(positional[0]!))}\n`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (require.main === module) void main();
