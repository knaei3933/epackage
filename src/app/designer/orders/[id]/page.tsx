/**
 * Designer Order Detail Page (Correction Interface)
 *
 * デザイナー注文詳細・教正インターフェース
 * - 注文詳細表示
 * - 顧客ファイル表示
 * - 教正データアップロード（プレビュー画像・原版ファイル）
 * - 韓国語コメント入力
 * - 過去のリビジョン表示
 *
 * @route /designer/orders/[id]
 */

import { Suspense } from 'react';
import { redirect, notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, FileText, User, Calendar, Package, AlertCircle } from 'lucide-react';
import { DesignerOrderDetailClient } from '../../DesignerOrderDetailClient';
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
  customer_phone?: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: DesignerOrderItem[];
  delivery_address?: any;
  billing_address?: any;
  notes?: string;
}

interface DesignerOrderItem {
  id: string;
  product_name: string;
  quantity: number;
  specifications?: Record<string, any>;
}

interface DesignRevision {
  id: string;
  order_id: string;
  order_item_id?: string | null;
  revision_number: number;
  revision_name: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  partner_comment: string | null;
  preview_image_url: string;
  original_file_url: string;
  created_at: string;
  updated_at: string;
}

interface DesignerProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isAdmin?: boolean;
}

// =====================================================
// Authentication & Data Fetching
// =====================================================

/**
 * デザイナー認証チェック
 * - 管理者（ADMIN）または韓国デザイナーホワイトリスト内のユーザーのみアクセス可能
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

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const userRole = profile?.role || '';

  // Check if user is admin
  if (userRole === 'ADMIN') {
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      role: userRole,
      isAdmin: true,
    };
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
    role: userRole,
    isAdmin: false,
  };
}

/**
 * 注文詳細とリビジョンを取得
 * @param isAdmin - 管理者の場合はサービスロールキーを使用してRLSをバイパス
 */
async function fetchOrderDetail(orderId: string, isAdmin: boolean = false): Promise<{
  order: DesignerOrder | null;
  revisions: DesignRevision[];
}> {
  let supabase: any;

  if (isAdmin) {
    // 管理者の場合はサービスロールキーを使用（RLSバイパス）
    supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  } else {
    // デザイナーの場合はanonキーを使用
    const cookieStore = await cookies();
    supabase = createServerClient(
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
  }

  // 注文を取得
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      customer_phone,
      status,
      total_amount,
      created_at,
      notes,
      items:order_items(id, product_name, quantity, specifications)
    `)
    .eq('id', orderId)
    .maybeSingle();

  if (orderError || !order) {
    console.error('[DesignerOrderDetail] Order fetch error:', orderError);
    return { order: null, revisions: [] };
  }

  // リビジョンを取得
  const { data: revisions, error: revisionsError } = await supabase
    .from('design_revisions')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (revisionsError) {
    console.error('[DesignerOrderDetail] Revisions fetch error:', revisionsError);
  }

  return {
    order: order as DesignerOrder,
    revisions: (revisions || []) as DesignRevision[],
  };
}

// =====================================================
// Server Component
// =====================================================

async function OrderDetailContent({ orderId }: { orderId: string }) {
  const designer = await requireDesignerAuth();

  if (!designer) {
    redirect('/auth/signin?redirect=/designer/orders/' + orderId + '&error=designer_required');
  }

  const { order, revisions } = await fetchOrderDetail(orderId, designer.isAdmin || false);

  if (!order) {
    notFound();
  }

  return (
    <DesignerOrderDetailClient
      designerEmail={designer.email}
      designerName={designer.name}
      order={order}
      initialRevisions={revisions}
      isAdmin={designer.isAdmin || false}
    />
  );
}

// =====================================================
// Page Component
// =====================================================

export default async function DesignerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<FullPageSpinner label="注文詳細を読み込み中..." />}>
      <OrderDetailContent orderId={id} />
    </Suspense>
  );
}

// =====================================================
// Metadata
// =====================================================

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return {
    title: `注文詳細 | デザイナーポータル`,
    description: '教正データのアップロード・管理',
  };
}
