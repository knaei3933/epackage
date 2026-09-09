import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const componentSource = readFileSync(
  join(process.cwd(), 'src/app/admin/dashboard/AdminDashboardClient.tsx'),
  'utf8',
);

describe('admin dashboard meaningful content placement', () => {
  it('places h1 and status KPI h2 before the orderStats-dependent markup', () => {
    const shellStart = componentSource.indexOf(
      'export default function AdminDashboardClient',
    );
    const dataBoundary = componentSource.indexOf(
      '<Suspense fallback={<AdminStatsSkeleton />}>',
      shellStart,
    );
    const h1 = componentSource.indexOf('<h1', shellStart);
    const h2 = componentSource.indexOf('<h2', shellStart);
    const shellBeforeData = componentSource.slice(shellStart, dataBoundary);

    expect(shellStart).toBeGreaterThan(-1);
    expect(dataBoundary).toBeGreaterThan(shellStart);
    expect(h1).toBeGreaterThan(shellStart);
    expect(h2).toBeGreaterThan(h1);
    expect(h2).toBeLessThan(dataBoundary);
    expect(shellBeforeData).toContain('管理ダッシュボード');
    expect(shellBeforeData).toContain('ステータス別 KPI');
    expect(shellBeforeData).not.toContain('{orderStats && (');
  });
});
