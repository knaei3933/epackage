/**
 * Designer Dashboard Page
 *
 * デザイナーダッシュボード
 * - 割り当てられた注文一覧表示
 * - ステータスフィルタリング
 * - 注文詳細ページへのリンク
 *
 * @route /designer
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Filter,
} from 'lucide-react';
import { DesignerDashboardClient } from './DesignerDashboardClient';
import { FullPageSpinner } from '@/components/ui';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface DesignerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: DesignerOrderItem[];
  assigned_designer_email?: string;
}

interface DesignerOrderItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface DesignerProfile {
  id: string;
  email: string;
  name?: string;
}

// =====================================================
// Authentication & Data Fetching
// =====================================================

/**
 * デザイナー認証チェック
 */
async function requireDesignerAuth(): Promise<DesignerProfile | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return null;
  }

  // 韓国デザイナーメールアドレスリストを取得
  const { data: setting } = await supabase
    .from('notification_settings')
    .select('value')
    .eq('key', 'korea_designer_emails')
    .maybeSingle();

  const designerEmails = (setting?.value as string[]) || [];

  if (!designerEmails.includes(user.email)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name,
  };
}

/**
 * デザイナーに割り当てられた注文を取得
 * - statusがCORRECTION_IN_PROGRESSの注文
 * - design_revisionsにdesigner_emailが一致するリビジョンがある注文
 */
async function fetchDesignerOrders(
  designerEmail: string,
  statusFilter?: string
): Promise<DesignerOrder[]> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  // サービスロールクライアントではRLSをバイパス
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  );

  // 1. CORRECTION_IN_PROGRESSステータスの注文を取得
  let query = supabaseAdmin
    .from('orders')
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      status,
      total_amount,
      created_at,
      items:order_items(id, product_name, quantity)
    `)
    .in('status', ['CORRECTION_IN_PROGRESS', 'CUSTOMER_APPROVAL_PENDING']);

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: orders, error: ordersError } = await query
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('[DesignerDashboard] Orders fetch error:', ordersError);
    return [];
  }

  // 2. このデザイナーに関連する注文のみフィルタリング
  const designerOrders = (orders || []).filter((order: any) => {
    // design_revisionsテーブルでこの注文・デザイナーの組み合わせを確認
    return true; // 暫定的に全て表示
  }) as DesignerOrder[];

  return designerOrders;
}

// =====================================================
// Server Component
// =====================================================

async function DashboardContent({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const designer = await requireDesignerAuth();

  if (!designer) {
    redirect('/auth/signin?redirect=/designer&error=designer_required');
  }

  const initialStatus = searchParams.status || 'all';
  const orders = await fetchDesignerOrders(designer.email, initialStatus);

  // ステータス別のカウント
  const statusCounts = {
    all: orders.length,
    correction_in_progress: orders.filter(o => o.status === 'CORRECTION_IN_PROGRESS').length,
    customer_approval_pending: orders.filter(o => o.status === 'CUSTOMER_APPROVAL_PENDING').length,
  };

  return (
    <DesignerDashboardClient
      designerEmail={designer.email}
      designerName={designer.name}
      initialOrders={orders}
      initialStatus={initialStatus}
      statusCounts={statusCounts}
    />
  );
}

// =====================================================
// Page Component
// =====================================================

export default async function DesignerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;

  return (
    <Suspense fallback={<FullPageSpinner label="ダッシュボードを読み込み中..." />}>
      <DashboardContent searchParams={params} />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata() {
  return {
    title: 'デザイナーダッシュボード | EPackage Lab',
    description: '韓国デザイナー向け教正データ管理ポータル',
  };
}
