'use client';

import nextDynamic from 'next/dynamic';
import { FullPageSpinner } from '@/components/ui';

const AdminApprovalsClient = nextDynamic(() => import('./AdminApprovalsClient'), {
  ssr: false,
  loading: () => <FullPageSpinner label="承認待ちリストを読み込み中..." />,
});

export default AdminApprovalsClient;
