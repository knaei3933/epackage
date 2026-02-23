/**
 * Token-Based Designer Order Page (Server Component)
 *
 * トークンベースデザイナー注文詳細ページ - Server Component
 * - トークンによる認証（ログイン不要）
 * - 注文詳細表示
 * - 修正データ表示
 * - コメント表示
 *
 * Route: /designer-order/[token]
 */

import { notFound, redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase';
import { hashToken, isTokenExpired } from '@/lib/designer-tokens';
import { DesignerOrderTokenClient } from './DesignerOrderTokenClient';
import * as crypto from 'crypto';

// ============================================================
// Types
// ============================================================

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  sku_name: string | null;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

interface DesignerTaskAssignment {
  id: string;
  designer_id: string;
  order_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at: string;
  completed_at: string | null;
  notes: string | null;
  access_token_hash: string | null;
  access_token_expires_at: string | null;
  last_accessed_at: string | null;
}

interface DesignRevision {
  id: string;
  revision_number: number;
  preview_image_url: string | null;
  original_file_url: string | null;
  korean_designer_comment: string | null;
  korean_designer_comment_ja: string | null;
  approval_status: string;
  created_at: string;
  original_customer_filename?: string | null;
  generated_correction_filename?: string | null;
}

interface DesignReviewComment {
  id: string;
  order_id: string;
  revision_id: string | null;
  content: string;
  content_translated: string | null;
  original_language: string;
  author_name_display: string;
  author_role: string;
  created_at: string;
}

interface CustomerFileUpload {
  id: string;
  file_name: string;
  file_type: string;
  drive_view_link: string | null;
  drive_content_link: string | null;
  uploaded_at: string;
}

// ============================================================
// Server-Side Data Fetching
// ============================================================

async function getDesignerOrderData(token: string) {
  const supabase = createServiceClient();

  // Hash the token to compare with stored hash
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  console.log('[DesignerOrderPage] Looking up token hash:', tokenHash);

  // Get the designer task assignment record
  const { data: assignmentData, error: assignmentError } = await supabase
    .from('designer_task_assignments')
    .select(`
      *,
      orders (
        id,
        order_number,
        customer_name,
        customer_email,
        total_amount,
        status,
        created_at
      )
    `)
    .eq('access_token_hash', tokenHash)
    .maybeSingle();

  console.log('[DesignerOrderPage] Assignment data:', assignmentData);
  console.log('[DesignerOrderPage] Assignment error:', assignmentError);

  if (assignmentError || !assignmentData) {
    console.error('[DesignerOrderPage] Token not found or invalid:', assignmentError);
    return null;
  }

  // Check if token is expired
  if (assignmentData.access_token_expires_at && isTokenExpired(new Date(assignmentData.access_token_expires_at))) {
    console.error('[DesignerOrderPage] Token expired');
    return { expired: true };
  }

  // Update last_accessed_at
  await supabase
    .from('designer_task_assignments')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', assignmentData.id);

  const order = assignmentData.orders as any;
  if (!order) {
    console.error('[DesignerOrderPage] Order not found');
    return null;
  }

  // Get order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  // Get existing revisions for this order
  const { data: revisions, error: revisionsError } = await supabase
    .from('design_revisions')
    .select('*')
    .eq('order_id', assignmentData.order_id)
    .eq('uploaded_by_type', 'korea_designer')
    .order('revision_number', { ascending: false });

  // Get comments for this order
  const { data: comments, error: commentsError } = await supabase
    .from('design_review_comments')
    .select('*')
    .eq('order_id', assignmentData.order_id)
    .order('created_at', { ascending: true });

  // Get customer uploaded files for this order
  const { data: customerUploads, error: uploadsError } = await supabase
    .from('order_file_uploads')
    .select('id, file_name, file_type, drive_view_link, drive_content_link, uploaded_at')
    .eq('order_id', assignmentData.order_id)
    .eq('file_type', 'upload')
    .order('uploaded_at', { ascending: false });

  return {
    assignmentData: {
      ...assignmentData,
      sku_name: null,
    },
    order: {
      ...order,
      items: items || [],
    },
    revisions: revisions || [],
    comments: comments || [],
    customerUploads: customerUploads || [],
  };
}

// ============================================================
// Page Component
// ============================================================

interface DesignerOrderPageProps {
  params: Promise<{ token: string }>;
}

export default async function DesignerOrderPage({ params }: DesignerOrderPageProps) {
  const { token } = await params;

  // Validate token format first
  const tokenFormatValid = /^[A-Za-z0-9_-]{43}$/.test(token);

  // Fetch data only if token format is valid
  const data = tokenFormatValid ? await getDesignerOrderData(token) : null;

  // Handle invalid/expired tokens by rendering inline instead of redirect
  // This avoids RSC streaming issues with redirect()
  if (!data || 'expired' in data) {
    const isExpired = data && 'expired' in data;
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            링크가 유효하지 않습니다
          </h1>
          <p className="text-slate-600">
            {isExpired
              ? '링크가 만료되었습니다. 새 링크를 요청해 주세요.'
              : tokenFormatValid
                ? '올바른 링크인지 확인해 주세요.'
                : '잘못된 토큰 형식입니다.'}
          </p>
        </div>
      </div>
    );
  }

  const { assignmentData, order, revisions, comments, customerUploads } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DesignerOrderTokenClient
        token={token}
        assignmentData={assignmentData}
        order={order}
        initialRevisions={revisions}
        initialComments={comments}
        initialCustomerUploads={customerUploads}
      />
    </div>
  );
}

// ============================================================
// Metadata
// ============================================================

export const metadata = {
  title: '주문 상세 | 디자이너 포털',
  description: '토큰 기반 디자이너 주문 상세 조회',
};

export const dynamic = 'force-dynamic';
