import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const componentSource = readFileSync(
  join(process.cwd(), 'src/app/member/orders/OrdersClient.tsx'),
  'utf8',
);

describe('member orders streaming shell', () => {
  it('renders the list region shell outside the data Suspense boundary', () => {
    const shellStart = componentSource.indexOf('data-testid="member-orders-list"');
    const listBoundary = componentSource.indexOf(
      '<Suspense fallback={<OrdersListSkeleton />}>',
      shellStart,
    );

    expect(shellStart).toBeGreaterThan(-1);
    expect(listBoundary).toBeGreaterThan(shellStart);
    expect(componentSource.slice(shellStart, listBoundary)).not.toContain('<Suspense');
    expect(componentSource).toContain('aria-label="注文一覧"');
  });
});
