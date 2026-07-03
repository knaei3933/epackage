'use client';

import nextDynamic from 'next/dynamic';
import { FullPageSpinner } from '@/components/ui';

// Client wrapper so that next/dynamic { ssr: false } is allowed
// (Next.js 16 forbids ssr: false inside Server Components).
// Keeps the large quotation-detail client bundle out of the initial
// page payload until the route is visited.
const QuotationDetailClient = nextDynamic(
  () => import('./QuotationDetailClient').then((m) => m.QuotationDetailClient),
  {
    ssr: false,
    loading: () => <FullPageSpinner label="見積詳細を読み込み中..." />,
  }
);

export default QuotationDetailClient;
