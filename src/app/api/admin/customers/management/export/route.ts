/**
 * Customer Export API
 *
 * 顧客データエクスポートAPI
 * - CSV形式、Excel形式でエクスポート
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import ExcelJS from 'exceljs';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

// ============================================================
// Types
// ============================================================

interface ExportRequestBody {
  customerIds?: string[];
  format?: 'csv' | 'excel';
  filters?: {
    status?: string;
    search?: string;
    period?: string;
  };
}

// ============================================================
// POST - Export customers data
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createServiceClient();
    const body: ExportRequestBody = await request.json();

    const { customerIds, format = 'csv', filters } = body;

    // Build query for profiles
    let query = supabase
      .from('profiles')
      .select('*')
      .in('status', ['ACTIVE', 'PENDING', 'SUSPENDED']);

    // Apply filters if provided
    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`
        email.ilike.%${filters.search}%,
        kanji_last_name.ilike.%${filters.search}%,
        kanji_first_name.ilike.%${filters.search}%,
        kana_last_name.ilike.%${filters.search}%,
        kana_first_name.ilike.%${filters.search}%,
        company_name.ilike.%${filters.search}%,
        corporate_phone.ilike.%${filters.search}%,
        personal_phone.ilike.%${filters.search}%
      `);
    }

    if (customerIds && Array.isArray(customerIds) && customerIds.length > 0) {
      query = query.in('id', customerIds);
    }

    const { data: customers, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[Customer Export API] Supabase error:', error);
      return NextResponse.json(
        { success: false, error: '顧客データの取得に失敗しました。' },
        { status: 500 }
      );
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'エクスポートする顧客データがありません。' },
        { status: 404 }
      );
    }

    // Get order statistics for each customer
    const customerIdsList = customers.map((c: Profile) => c.id);
    const { data: orderStats } = await supabase
      .from('orders')
      .select('user_id, total_amount, created_at')
      .in('user_id', customerIdsList);

    const statsMap = new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate: string | null }>();
    orderStats?.forEach((order: any) => {
      if (!statsMap.has(order.user_id)) {
        statsMap.set(order.user_id, {
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
        });
      }
      const stats = statsMap.get(order.user_id)!;
      stats.totalOrders += 1;
      stats.totalSpent += order.total_amount || 0;
      if (!stats.lastOrderDate || new Date(order.created_at) > new Date(stats.lastOrderDate)) {
        stats.lastOrderDate = order.created_at;
      }
    });

    // Prepare export data
    const exportData = customers.map((customer: Profile) => {
      const stats = statsMap.get(customer.id) || { totalOrders: 0, totalSpent: 0, lastOrderDate: null };
      return {
        ID: customer.id,
        メールアドレス: customer.email,
        漢字姓: customer.kanji_last_name || '',
        漢字名: customer.kanji_first_name || '',
        ひらがな姓: customer.kana_last_name || '',
        ひらがな名: customer.kana_first_name || '',
        会社名: customer.company_name || '',
        法人番号: customer.legal_entity_number || '',
        役職: customer.position || '',
        部署: customer.department || '',
        会社電話: customer.corporate_phone || '',
        携帯電話: customer.personal_phone || '',
        種別: customer.business_type === 'CORPORATION' ? '法人' : customer.business_type === 'SOLE_PROPRIETOR' ? '個人事業主' : '個人',
        製品カテゴリー: customer.product_category || '',
        流入経路: customer.acquisition_channel || '',
        郵便番号: customer.postal_code || '',
        都道府県: customer.prefecture || '',
        市区町村: customer.city || '',
        番地: customer.street || '',
        建物名: customer.building || '',
        ステータス: customer.status === 'ACTIVE' ? 'アクティブ' : customer.status === 'PENDING' ? '承認待ち' : customer.status === 'SUSPENDED' ? '停止中' : '削除済み',
        ロール: customer.role === 'ADMIN' ? '管理者' : 'メンバー',
        総注文数: stats.totalOrders,
        総購入額: stats.totalSpent,
        最終注文日: stats.lastOrderDate ? new Date(stats.lastOrderDate).toLocaleDateString('ja-JP') : '',
        登録日: new Date(customer.created_at).toLocaleDateString('ja-JP'),
        最終ログイン: customer.last_login_at ? new Date(customer.last_login_at).toLocaleDateString('ja-JP') : '',
        更新日: new Date(customer.updated_at).toLocaleDateString('ja-JP'),
      };
    });

    if (format === 'excel') {
      // Create Excel workbook with formatting
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('顧客リスト');

      // Set column widths
      worksheet.columns = [
        { key: 'ID', width: 30 },
        { key: 'メールアドレス', width: 35 },
        { key: '漢字姓', width: 15 },
        { key: '漢字名', width: 15 },
        { key: 'ひらがな姓', width: 15 },
        { key: 'ひらがな名', width: 15 },
        { key: '会社名', width: 30 },
        { key: '法人番号', width: 15 },
        { key: '役職', width: 15 },
        { key: '部署', width: 15 },
        { key: '会社電話', width: 20 },
        { key: '携帯電話', width: 20 },
        { key: '種別', width: 10 },
        { key: '製品カテゴリー', width: 15 },
        { key: '流入経路', width: 20 },
        { key: '郵便番号', width: 10 },
        { key: '都道府県', width: 15 },
        { key: '市区町村', width: 20 },
        { key: '番地', width: 25 },
        { key: '建物名', width: 20 },
        { key: 'ステータス', width: 12 },
        { key: 'ロール', width: 12 },
        { key: '総注文数', width: 12 },
        { key: '総購入額', width: 15 },
        { key: '最終注文日', width: 15 },
        { key: '登録日', width: 15 },
        { key: '最終ログイン', width: 15 },
        { key: '更新日', width: 15 },
      ];

      // Add header row with styling
      const headerRow = worksheet.addRow(Object.keys(exportData[0]));
      headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.height = 25;

      // Add data rows
      exportData.forEach((data) => {
        worksheet.addRow(Object.values(data));
      });

      // Auto-filter
      worksheet.autoFilter = {
        from: 'A1',
        to: `${String.fromCharCode(65 + Object.keys(exportData[0]).length - 1)}1`,
      };

      // Freeze header row
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Return Excel file
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="customers_${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    } else {
      // Generate CSV
      const headers = Object.keys(exportData[0]).join(',');
      const rows = exportData.map((data) =>
        Object.values(data)
          .map((value) => {
            const stringValue = String(value || '');
            // Escape quotes and wrap in quotes if contains comma
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      );

      const csv = [headers, ...rows].join('\n');

      // Return CSV file
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="customers_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('[Customer Export API] Export error:', error);
    return NextResponse.json(
      { success: false, error: 'エクスポート中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// OPTIONS handler for CORS
// ============================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
