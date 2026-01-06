import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST handler - Send signature request for contract
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { contractId, method, message } = body;

    // Validate required fields
    if (!contractId || !method) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: '必須フィールドが不足しています' } },
        { status: 400 }
      );
    }

    // Validate method
    if (!['email', 'portal'].includes(method)) {
      return NextResponse.json(
        { error: { code: 'INVALID_METHOD', message: '無効な送信方法です' } },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = createServiceClient();

    // Get contract and customer details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        order_id,
        status,
        orders (
          customer_name,
          customer_email
        )
      `)
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: '契約書が見つかりません' } },
        { status: 404 }
      );
    }

    // Check if contract can be sent for signature
    if (!['DRAFT', 'SENT', 'EXPIRED'].includes(contract.status)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_STATUS',
            message: `現在のステータスでは署名リクエストを送信できません: ${contract.status}`,
          },
        },
        { status: 400 }
      );
    }

    const customerEmail = contract.orders?.customer_email;

    // Check if customer email exists for email method
    if (method === 'email' && !customerEmail) {
      return NextResponse.json(
        { error: { code: 'NO_EMAIL', message: '顧客のメールアドレスが登録されていません' } },
        { status: 400 }
      );
    }

    // Generate signature token and expiration
    const signatureToken = `SIG-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    // Update contract with signature request details
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'SENT',
        sent_at: new Date().toISOString(),
        signature_token: signatureToken,
        signature_expires_at: expiresAt.toISOString(),
        signature_request_method: method,
        signature_request_message: message || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select('id, contract_number, status, sent_at, signature_expires_at')
      .single();

    if (updateError || !updatedContract) {
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: '契約書の更新に失敗しました' } },
        { status: 500 }
      );
    }

    // Create signature request log entry
    const { error: logError } = await supabase
      .from('contract_signature_logs')
      .insert({
        contract_id: contractId,
        action: 'REQUEST_SENT',
        method: method,
        sent_to: method === 'email' ? customerEmail : null,
        message: message || null,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Failed to create signature log:', logError);
    }

    // TODO: Send actual email notification
    // This would integrate with the email system
    // if (method === 'email') {
    //   await sendSignatureRequestEmail(customerEmail, {
    //     contractNumber: contract.contract_number,
    //     signatureToken,
    //     expiresAt,
    //     message,
    //   });
    // }

    return NextResponse.json({
      success: true,
      data: {
        contract: updatedContract,
        method,
        recipient: method === 'email' ? customerEmail : 'Portal',
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Contract signature request error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : '署名リクエストの送信に失敗しました',
        },
      },
      { status: 500 }
    );
  }
}
