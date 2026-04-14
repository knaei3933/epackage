/**
 * Admin Alerts API Route
 *
 * 管理者ダッシュボード用アラート情報を提供
 * Provides alert information for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  count: number;
  action?: string;
  actionHref?: string;
}

/**
 * GET /api/admin/alerts
 * 管理者用アラート情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const alerts: Alert[] = [];

    // 1. 未対応のお問い合わせを確認
    const { count: pendingInquiries, error: inquiriesError } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // 過去7日間

    if (!inquiriesError && pendingInquiries && pendingInquiries > 0) {
      alerts.push({
        id: 'pending-inquiries',
        type: 'warning',
        message: '未対応のお問い合わせがあります',
        count: pendingInquiries,
        action: '確認する',
        actionHref: '/admin/inquiries'
      });
    }

    // 2. 在庫アラート（在庫切れの商品）
    const { data: lowStockItems, error: stockError } = await supabase
      .from('inventory_items')
      .select('id, product_name, quantity')
      .lt('quantity', 10)
      .limit(10);

    if (!stockError && lowStockItems && lowStockItems.length > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'warning',
        message: '在庫が少ない商品があります',
        count: lowStockItems.length,
        action: '在庫を確認',
        actionHref: '/admin/inventory'
      });
    }

    // 3. 期限が迫った見積もり（期限切れ間近）
    const { count: expiringQuotations, error: quoteError } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lte('valid_until', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()) // 3日以内に期限切れ
      .gte('valid_until', new Date().toISOString());

    if (!quoteError && expiringQuotations && expiringQuotations > 0) {
      alerts.push({
        id: 'expiring-quotes',
        type: 'info',
        message: '有効期限が迫っている見積もりがあります',
        count: expiringQuotations,
        action: '見積もりを確認',
        actionHref: '/admin/quotations'
      });
    }

    // 4. エラーログ確認（最近のエラー）
    const { count: recentErrors, error: logError } = await supabase
      .from('chatbot_failover_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'error')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 過去24時間

    if (!logError && recentErrors && recentErrors > 0) {
      alerts.push({
        id: 'recent-errors',
        type: 'error',
        message: 'AIチャットボットでエラーが発生しました',
        count: recentErrors,
        action: 'ログを確認',
        actionHref: '/admin/settings'
      });
    }

    return NextResponse.json({
      success: true,
      data: alerts
    });

  } catch (error) {
    console.error('[Alerts API] Error:', error);

    // エラーが発生しても空のアラート配列を返す
    return NextResponse.json({
      success: true,
      data: []
    }, { status: 200 });
  }
}
