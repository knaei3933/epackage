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
  const rows = (data || []) as Array<{ status?: string; total_amount?: number | null; created_at?: string }>;

  // ステータス別集計（A5 正規化: 常に空配列だった ordersByStatus を実データで返す・any[] 解消）
  const statusCounts: Record<string, number> = {};
  rows.forEach((o) => {
    const status = upper(o.status) || 'UNKNOWN';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  // 月別売上集計（A5 正規化: 常に空配列だった monthlyRevenue を実データで返す・{ month, revenue } 形式・any[] 解消）
  const monthlyRevenueMap: Record<string, number> = {};
  rows.forEach((o) => {
    if (!o.created_at) return;
    const date = new Date(o.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + (o.total_amount || 0);
  });
  const monthlyRevenue = Object.entries(monthlyRevenueMap)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const stats = {
    total: rows.length,
    pending: rows.filter((o) => upper(o.status) === 'PENDING' || upper(o.status) === 'QUOTATION_PENDING').length,
    processing: rows.filter((o) => upper(o.status) === 'PROCESSING' || upper(o.status).includes('CORRECTION') || upper(o.status).includes('MODIFICATION')).length,
    completed: rows.filter((o) => upper(o.status) === 'COMPLETED' || upper(o.status) === 'SHIPPED').length,
    totalRevenue: rows.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    ordersByStatus,
    monthlyRevenue,
  };

  return stats;
}

/**
 * 見積統計取得
 */
export async function fetchQuotationStats(period?: number) {
  const supabase = createServiceClient();

  // C3: period フィルタを dashboard.ts の quotations クエリと統一（period 未指定時は全件で従来互換）
  let query = supabase
    .from('quotations')
    .select('status, total_amount')
    .order('created_at', { ascending: false });

  if (period !== undefined) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    query = query.gte('created_at', startDate.toISOString());
  }

  const { data, error } = await query;

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
