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
import TokenUploadClient from './TokenUploadClient';

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

interface KoreaCorrection {
  id: string;
  order_id: string;
  order_item_id: string | null;
  token_hash: string;
  token_expires_at: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  customer_files: string[] | null;
  corrected_files: string[] | null;
  preview_image_url: string | null;
  original_file_url: string | null;
  comment_ko: string | null;
  comment_ja: string | null;
  translation_status: 'pending' | 'translated' | 'failed' | 'manual';
  created_at: string;
  updated_at: string;
}

interface CorrectionComment {
  id: string;
  korea_correction_id: string;
  author_name: string;
  content: string;
  content_translated: string | null;
  original_language: 'ko' | 'ja' | 'en';
  is_designer: boolean;
  created_at: string;
}

// ============================================================
// Server-Side Data Fetching
// ============================================================

async function getTokenUploadData(token: string) {
  const supabase = createServiceClient();

  // Hash the token to compare with stored hash
  const tokenHash = hashToken(token);

  // Get the Korea correction record with token
  const { data: correction, error: correctionError } = await supabase
    .from('korea_corrections')
    .select('*')
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (correctionError || !correction) {
    console.error('[TokenUploadPage] Correction not found or invalid token');
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(new Date(correction.token_expires_at))) {
    console.error('[TokenUploadPage] Token expired');
    return { expired: true };
  }

  // Check if correction is cancelled
  if (correction.status === 'cancelled') {
    console.error('[TokenUploadPage] Correction cancelled');
    return { cancelled: true };
  }

  // Get order details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      customer_name,
      customer_email,
      total_amount,
      status,
      created_at,
      items:order_items(id, product_name, quantity, sku_name)
    `)
    .eq('id', correction.order_id)
    .maybeSingle();

  if (orderError || !order) {
    console.error('[TokenUploadPage] Order not found');
    return null;
  }

  // Get comments for this correction
  const { data: comments, error: commentsError } = await supabase
    .from('korea_correction_comments')
    .select('*')
    .eq('korea_correction_id', correction.id)
    .order('created_at', { ascending: true });

  // Get SKU name if order_item_id exists
  let skuName = null;
  if (correction.order_item_id) {
    const item = order.items.find((i: OrderItem) => i.id === correction.order_item_id);
    skuName = item?.sku_name || item?.product_name || null;
  }

  return {
    correction: {
      ...correction,
      sku_name: skuName,
    },
    order,
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

  const { correction, order, comments } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <TokenUploadClient
        token={token}
        correction={correction}
        order={order}
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
