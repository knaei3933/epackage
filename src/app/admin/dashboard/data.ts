/**
 * Dashboard Data Fetching
 *
 * ダッシュボード用データフェッチ関数
 * - 注文統計取得
 * - 見積統計取得
 */

import { createServiceClient } from '@/lib/supabase';

/**
 * 注文統計取得
 */
export async function fetchOrderStats(period: number = 30) {
  const supabase = createServiceClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  const { data, error } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Dashboard] Order stats fetch error:', error);
    return null;
  }

  // 大文字小文字を区別せずステータスを集計（DB値は大文字・小文字混在の可能性あり）
  const upper = (s?: string) => (s || '').toUpperCase();
  const stats = {
    total: data?.length || 0,
    pending: data?.filter((o: { status: string }) => upper(o.status) === 'PENDING' || upper(o.status) === 'QUOTATION_PENDING').length || 0,
    processing: data?.filter((o: { status: string }) => upper(o.status) === 'PROCESSING' || upper(o.status).includes('CORRECTION') || upper(o.status).includes('MODIFICATION')).length || 0,
    completed: data?.filter((o: { status: string }) => upper(o.status) === 'COMPLETED' || upper(o.status) === 'SHIPPED').length || 0,
    totalRevenue: data?.reduce((sum: number, o: { total_amount: number | null }) => sum + (o.total_amount || 0), 0) || 0,
    ordersByStatus: [] as any[],
    monthlyRevenue: [] as any[],
  };

  return stats;
}

/**
 * 見積統計取得
 */
export async function fetchQuotationStats() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('quotations')
    .select('status, total_amount')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Dashboard] Quotation stats fetch error:', error);
    return null;
  }

  // 大文字小文字を区別せずステータスを集計（DB値は大文字優先だがレガシー小文字にも対応）
  const norm = (s?: string) => (s || '').toUpperCase();
  return {
    total: data?.length || 0,
    draft: data?.filter((q: { status: string }) => norm(q.status) === 'DRAFT').length || 0,
    sent: data?.filter((q: { status: string }) => norm(q.status) === 'SENT').length || 0,
    approved: data?.filter((q: { status: string }) => norm(q.status) === 'APPROVED' || norm(q.status) === 'QUOTATION_APPROVED').length || 0,
    rejected: data?.filter((q: { status: string }) => norm(q.status) === 'REJECTED').length || 0,
    converted: data?.filter((q: { status: string }) => norm(q.status) === 'CONVERTED').length || 0,
    totalAmount: data?.reduce((sum: number, q: { total_amount: number | null }) => sum + (q.total_amount || 0), 0) || 0,
  };
}
