/**
 * Token-Based Designer Upload Page (Server Component)
 *
 * トークンベースデザイナーアップロードページ - Server Component
 * - トークンによる認証（ログイン不要）
 * - 注文詳細表示
 * - 既存の修正データ表示
 * - コメント表示・入力
 * - 修正データアップロード
 *
 * Route: /upload/[token]
 */

import { notFound, redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase';
import { hashToken, isTokenExpired } from '@/lib/designer-tokens';
import { TokenUploadClient } from './TokenUploadClient';
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

interface DesignerUploadToken {
  id: string;
  order_id: string;
  order_item_id: string | null;
  token_hash: string;
  expires_at: string;
  status: 'active' | 'used' | 'expired' | 'revoked';
  upload_count: number;
  created_at: string;
  last_accessed_at: string | null;
  last_uploaded_at: string | null;
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

// ============================================================
// Server-Side Data Fetching
// ============================================================

async function getTokenUploadData(token: string) {
  const supabase = createServiceClient();

  // Hash the token to compare with stored hash
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Get the designer upload token record
  const { data: tokenData, error: tokenError } = await supabase
    .from('designer_upload_tokens')
    .select(`
      *,
      orders (
        id,
        order_number,
        customer_name,
        customer_email,
        total_amount,
        status,
        created_at,
        items:order_items(id, product_name, quantity, sku_name)
      )
    `)
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (tokenError || !tokenData) {
    console.error('[TokenUploadPage] Token not found or invalid');
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(new Date(tokenData.expires_at))) {
    console.error('[TokenUploadPage] Token expired');
    return { expired: true };
  }

  // Check if token is active
  if (tokenData.status !== 'active') {
    console.error('[TokenUploadPage] Token not active:', tokenData.status);
    return { cancelled: true };
  }

  const order = tokenData.orders as any;
  if (!order) {
    console.error('[TokenUploadPage] Order not found');
    return null;
  }

  // Get existing revisions for this order
  const { data: revisions, error: revisionsError } = await supabase
    .from('design_revisions')
    .select('*')
    .eq('order_id', tokenData.order_id)
    .eq('uploaded_by_type', 'korea_designer')
    .order('revision_number', { ascending: false });

  // Get comments for this order
  const { data: comments, error: commentsError } = await supabase
    .from('design_review_comments')
    .select('*')
    .eq('order_id', tokenData.order_id)
    .order('created_at', { ascending: true });

  // Get SKU name if order_item_id exists
  let skuName = null;
  if (tokenData.order_item_id) {
    const item = order.items.find((i: OrderItem) => i.id === tokenData.order_item_id);
    skuName = item?.sku_name || item?.product_name || null;
  }

  return {
    tokenData: {
      ...tokenData,
      sku_name: skuName,
    },
    order,
    revisions: revisions || [],
    comments: comments || [],
  };
}

// ============================================================
// Page Component
// ============================================================

interface TokenUploadPageProps {
  params: Promise<{ token: string }>;
}

export default async function TokenUploadPage({ params }: TokenUploadPageProps) {
  const { token } = await params;

  // Validate token format first
  const tokenFormatValid = /^[A-Za-z0-9_-]{43}$/.test(token);
  if (!tokenFormatValid) {
    redirect('/upload/invalid');
  }

  // Fetch data
  const data = await getTokenUploadData(token);

  // Handle invalid token
  if (!data) {
    redirect('/upload/invalid');
  }

  // Handle expired token
  if ('expired' in data) {
    redirect('/upload/invalid?reason=expired');
  }

  // Handle cancelled correction
  if ('cancelled' in data) {
    redirect('/upload/invalid?reason=cancelled');
  }

  const { tokenData, order, revisions, comments } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <TokenUploadClient
        token={token}
        tokenData={tokenData}
        order={order}
        initialRevisions={revisions}
        initialComments={comments}
      />
    </div>
  );
}

// ============================================================
// Metadata
// ============================================================

export const metadata = {
  title: 'デザイナーアップロード | Epackage Lab',
  description: 'トークンベースのデザイナー修正データアップロード',
};

export const dynamic = 'force-dynamic';
