'use client';

import nextDynamic from 'next/dynamic';
import { FullPageSpinner } from '@/components/ui';

const AdminShipmentsClient = nextDynamic(() => import('./AdminShipmentsClient'), {
  ssr: false,
  loading: () => <FullPageSpinner label="出荷管理を読み込み中..." />,
});

export default AdminShipmentsClient;
