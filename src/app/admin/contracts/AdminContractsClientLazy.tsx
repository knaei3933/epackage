'use client';

import nextDynamic from 'next/dynamic';
import { FullPageSpinner } from '@/components/ui';

const AdminContractsClient = nextDynamic(() => import('./AdminContractsClient'), {
  ssr: false,
  loading: () => <FullPageSpinner label="契約管理を読み込み中..." />,
});

export default AdminContractsClient;
