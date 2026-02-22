/**
 * Member Quotation Invoice API
 *
 * POST /api/member/quotations/[id]/invoice
 * Get invoice details including bank information for payment
 *
 * 銀行振込情報を含む請求書データを返す
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase-ssr';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface InvoiceResponse {
  success: boolean;
  invoice?: {
    quotationNumber: string;
    bankInfo: {
      bankName: string;
      branchName: string;
      accountType: string;
      accountNumber: string;
      accountHolder: string;
    };
    totalAmount: number;
    dueDate?: string;
  };
  error?: string;
  errorEn?: string;
}

// =====================================================
// POST Handler - Get Invoice Details
// =====================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: quotationId } = params;

    // Get authenticated user
    const authUser = await getAuthenticatedUser(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: userId, supabase } = authUser;

    // Fetch quotation
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select('id, quotation_number, total_amount, user_id, valid_until, status')
      .eq('id', quotationId)
      .single();

    if (error || !quotation) {
      return NextResponse.json(
        { success: false, error: '見積が見つかりません。', errorEn: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Authorization check
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'この見積にアクセスする権限がありません。', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // Bank information (from environment or default)
    const bankInfo = {
      bankName: process.env.BANK_NAME || '三井住友銀行',
      branchName: process.env.BANK_BRANCH || '明石支店',
      accountType: process.env.BANK_ACCOUNT_TYPE || '普通(425)',
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '7346221',
      accountHolder: process.env.BANK_ACCOUNT_HOLDER || '金井貿易株式会社',
    };

    const response: InvoiceResponse = {
      success: true,
      invoice: {
        quotationNumber: quotation.quotation_number,
        bankInfo,
        totalAmount: quotation.total_amount,
        dueDate: quotation.valid_until || undefined,
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Quotation Invoice API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

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
