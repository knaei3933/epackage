import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const repoRoot = resolve(__dirname, '../..');
const artifactPath = resolve(
  repoRoot,
  '.omx/reports/route-group-inventory-homepage-speed.json',
);
const appRoot = resolve(repoRoot, 'src/app');

const artifact = JSON.parse(readFileSync(artifactPath, 'utf8'));

function walkPageFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) return walkPageFiles(fullPath);
    if (entry.isFile() && entry.name === 'page.tsx') return [fullPath];
    return [];
  });
}

function routeFromFile(file: string): string {
  const segments = relative(appRoot, resolve(repoRoot, file))
    .split(/[/\\]/)
    .slice(0, -1)
    .filter((segment) => segment.length > 0 && !segment.startsWith('('));
  return `/${segments.join('/')}`;
}

describe('G006 exhaustive route-group inventory', () => {
  it('inventories exactly 116 unique page routes without API handlers', () => {
    expect(artifact.entries).toHaveLength(116);
    expect(new Set(artifact.entries.map((entry: { route: string }) => entry.route)).size).toBe(116);
    expect(artifact.summary).toMatchObject({
      pageCount: 116,
      uniqueRouteCount: 116,
      auditedCount: 116,
      appliedCount: 8,
      noChangeRequiredCount: 108,
      highSeverityCount: 0,
    });
  });

  it('represents every source page file exactly once', () => {
    const sourceFiles = walkPageFiles(appRoot)
      .map((file) => relative(repoRoot, file))
      .sort();
    const inventoryFiles = artifact.entries
      .map((entry: { file: string }) => entry.file)
      .sort();

    expect(sourceFiles).toHaveLength(116);
    expect(inventoryFiles).toEqual(sourceFiles);
    expect(new Set(inventoryFiles).size).toBe(116);
  });

  it('derives every inventory route from its source page path', () => {
    for (const entry of artifact.entries) {
      expect(entry.route).toBe(routeFromFile(entry.file));
    }
    expect(artifact.entries.map((entry: { route: string }) => entry.route)).not.toContain('');
  });

  it('requires the complete audit record for every page', () => {
    const requiredFields = [
      'route',
      'group',
      'file',
      'auditStatus',
      'optimizationDecision',
      'evidencePath',
      'testsEvidencePath',
      'completionState',
      'severity',
      'rationale',
    ] as const;
    const allowedGroups = new Set([
      'public', 'auth', 'member', 'admin', 'designer', 'upload',
      'blog', 'catalog', 'guide', 'industry', 'other',
    ]);

    for (const entry of artifact.entries) {
      for (const field of requiredFields) {
        expect(typeof entry[field]).toBe('string');
        expect((entry[field] as string).length).toBeGreaterThan(0);
      }
      expect(entry.auditStatus).toBe('audited');
      expect(['applied', 'no-change-required']).toContain(entry.optimizationDecision);
      expect(entry.completionState).toBe('complete');
      expect(['none', 'low', 'medium', 'high']).toContain(entry.severity);
      expect(allowedGroups.has(entry.group)).toBe(true);
      expect(entry.rationale.length).toBeGreaterThan(20);
    }
  });

  it('records the seven narrowed pages as applied after optimization', () => {
    const appliedFiles = artifact.entries
      .filter((entry: { optimizationDecision: string }) => entry.optimizationDecision === 'applied')
      .map((entry: { file: string }) => entry.file)
      .sort();

    expect(appliedFiles).toEqual([
      'src/app/admin/blog/page.tsx',
      'src/app/admin/customers/orders/page.tsx',
      'src/app/admin/customers/profile/page.tsx',
      'src/app/admin/orders/page.tsx',
      'src/app/blog/[slug]/page.tsx',
      'src/app/designer-order/[token]/page.tsx',
      'src/app/designer/orders/[id]/page.tsx',
      'src/app/upload/[token]/page.tsx',
    ]);
  });

  it('classifies all 26 client-deferral recommendations as audited and not applied', () => {
    const recommendations =
      artifact.auditedFindings.deferredClientSectionRecommendations;
    expect(recommendations.count).toBe(26);
    expect(recommendations.recommendations).toHaveLength(26);
    expect(recommendations.auditedCount).toBe(26);
    expect(recommendations.notAppliedCount).toBe(26);
    expect(recommendations.appliedCount).toBe(0);

    for (const recommendation of recommendations.recommendations) {
      expect(recommendation.status).toBe('audited');
      expect(recommendation.decision).toBe('not-applied');
      expect([
        'ui-risk-review-required',
        'inherently-interactive',
      ]).toContain(recommendation.reasonCategory);
    }
  });
});
