/**
 * Customer Portal Layout
 * カスタマーポータルレイアウト
 */

import { PortalLayout } from '@/components/portal/PortalLayout';
import { redirect } from 'next/navigation';
import { requireAuth, getCurrentUserId } from '@/lib/dashboard';
import { createServiceClient } from '@/lib/supabase';

// Force dynamic rendering - this page requires authentication and cannot be pre-rendered
export const dynamic = 'force-dynamic';

export default async function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication using middleware headers
  const user = await requireAuth();
  const userId = await getCurrentUserId();

  // Check if user is active using service client
  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('status')
    .eq('id', userId)
    .maybeSingle();

  if (!profile || profile.status !== 'ACTIVE') {
    redirect('/auth/pending');
  }

  return <PortalLayout>{children}</PortalLayout>;
}
