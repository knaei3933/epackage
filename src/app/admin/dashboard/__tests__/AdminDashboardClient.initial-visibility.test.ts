import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const componentSource = readFileSync(
  join(process.cwd(), 'src/app/admin/dashboard/AdminDashboardClient.tsx'),
  'utf8'
);

describe('AdminDashboardClient initial visibility', () => {
  it('renders h1 and status KPI h2 outside initial-hidden animated wrappers', () => {
    const headerStart = componentSource.indexOf('Modern Header Section');
    const statusHeading = componentSource.indexOf('ステータス別 KPI', headerStart);
    const statusHeadingElement = componentSource.indexOf('<h2', statusHeading);

    expect(headerStart).toBeGreaterThan(-1);
    expect(statusHeading).toBeGreaterThan(headerStart);

    const initiallyVisibleRegion = componentSource.slice(headerStart, statusHeading);
    expect(initiallyVisibleRegion).not.toContain('initial="hidden"');
    expect(initiallyVisibleRegion).not.toContain('delayChildren');
    expect(initiallyVisibleRegion).not.toContain('staggerChildren');

    const h1Start = componentSource.indexOf('<h1', headerStart);
    const h2Start = statusHeadingElement;
    const h1End = componentSource.indexOf('</h1>', h1Start);
    const h2End = componentSource.indexOf('</h2>', h2Start);
    expect(h1Start).toBeGreaterThan(headerStart);
    expect(h2Start).toBeGreaterThan(headerStart);
    expect(componentSource.slice(h1Start, h1End)).not.toContain('initial=');
    expect(componentSource.slice(h2Start, h2End)).not.toContain('initial=');
  });
});
