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

  const stats = {
    total: data?.length || 0,
    pending: data?.filter((o: { status: string }) => o.status === 'PENDING').length || 0,
    processing: data?.filter((o: { status: string }) => o.status === 'PROCESSING').length || 0,
    completed: data?.filter((o: { status: string }) => o.status === 'COMPLETED').length || 0,
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

  return {
    total: data?.length || 0,
    draft: data?.filter((q: { status: string }) => q.status === 'draft').length || 0,
    sent: data?.filter((q: { status: string }) => q.status === 'sent').length || 0,
    approved: data?.filter((q: { status: string }) => q.status === 'approved').length || 0,
    rejected: data?.filter((q: { status: string }) => q.status === 'rejected').length || 0,
    totalAmount: data?.reduce((sum: number, q: { total_amount: number | null }) => sum + (q.total_amount || 0), 0) || 0,
  };
}
