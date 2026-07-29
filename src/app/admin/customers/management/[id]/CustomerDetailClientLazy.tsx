'use client';

import nextDynamic from 'next/dynamic';
import { FullPageSpinner } from '@/components/ui';

// Client wrapper so that next/dynamic { ssr: false } is allowed
// (Next.js 16 forbids ssr: false inside Server Components).
const CustomerDetailClient = nextDynamic(
  () => import('./CustomerDetailClient'),
  {
    ssr: false,
    loading: () => <FullPageSpinner label="顧客詳細を読み込み中..." />,
  }
);

export default CustomerDetailClient;
