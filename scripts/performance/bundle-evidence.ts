import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

export interface BundleEvidence {
  status: 'available' | 'missing';
  sourcePath: string;
  buildId?: string;
  generatedAt?: string;
  totalBytes?: number;
  fileCounts?: Record<string, number>;
  resourceTotals?: { requestCount: number; transferBytes: number };
  errorCode?: 'NEXT_BUILD_OUTPUT_MISSING';
}

function classify(relativePath: string): string {
  if (relativePath.includes(`${sep}static${sep}chunks${sep}`)) return 'chunks';
  if (relativePath.includes(`${sep}static${sep}css${sep}`)) return 'css';
  if (relativePath.includes(`${sep}static${sep}media${sep}`)) return 'media';
  return 'other';
}

export class MissingBuildOutputError extends Error {
  readonly code = 'NEXT_BUILD_OUTPUT_MISSING';
  constructor(buildRoot: string) {
    super(`NEXT_BUILD_OUTPUT_MISSING: run "npm run build" before collecting bundle evidence (${buildRoot})`);
    this.name = 'MissingBuildOutputError';
  }
}

async function walkFiles(root: string): Promise<Array<{ path: string; bytes: number }>> {
  const entries = await readdir(root, { withFileTypes: true });
  const files: Array<{ path: string; bytes: number }> = [];
  for (const entry of entries) {
    const entryPath = join(root, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(entryPath));
    else if (entry.isFile()) files.push({ path: entryPath, bytes: (await stat(entryPath)).size });
  }
  return files;
}

export async function createBundleEvidence(
  repoRoot = process.cwd(),
  buildRoot = resolve(repoRoot, '.next'),
  browserResourceTotals?: { requestCount: number; transferBytes: number },
): Promise<BundleEvidence> {
  const buildIdPath = join(buildRoot, 'BUILD_ID');
  try {
    await stat(buildIdPath);
  } catch {
    throw new MissingBuildOutputError(buildRoot);
  }

  const buildId = (await readFile(buildIdPath, 'utf8')).trim();
  if (!buildId) throw new MissingBuildOutputError(buildRoot);
  const files = await walkFiles(buildRoot);
  const fileCounts: Record<string, number> = { chunks: 0, css: 0, media: 0, other: 0 };
  let totalBytes = 0;
  for (const file of files) {
    totalBytes += file.bytes;
    const key = classify(relative(buildRoot, file.path));
    fileCounts[key] = (fileCounts[key] ?? 0) + 1;
  }

  return {
    status: 'available',
    sourcePath: buildRoot,
    buildId,
    generatedAt: new Date().toISOString(),
    totalBytes,
    fileCounts,
    resourceTotals: browserResourceTotals ?? { requestCount: 0, transferBytes: 0 },
  };
}
