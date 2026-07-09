'use client';

import nextDynamic from 'next/dynamic';
import { FullPageSpinner } from '@/components/ui';

const AdminCouponsClient = nextDynamic(() => import('./AdminCouponsClient'), {
  ssr: false,
  loading: () => <FullPageSpinner label="クーポン管理を読み込み中..." />,
});

export default AdminCouponsClient;
