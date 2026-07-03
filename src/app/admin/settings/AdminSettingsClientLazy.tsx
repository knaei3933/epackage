'use client';

import nextDynamic from 'next/dynamic';
import { FullPageSpinner } from '@/components/ui';

// Client wrapper so that next/dynamic { ssr: false } is allowed
// (Next.js 16 forbids ssr: false inside Server Components).
const AdminSettingsClient = nextDynamic(() => import('./AdminSettingsClient'), {
  ssr: false,
  loading: () => <FullPageSpinner label="設定を読み込み中..." />,
});

export default AdminSettingsClient;
