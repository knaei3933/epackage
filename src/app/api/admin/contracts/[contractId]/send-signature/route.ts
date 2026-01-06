/**
 * Contract Signature Request API
 *
 * 契約署名依頼API
 *
 * POST - Send contract for signature
 */

import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { contractId } = await params;
    const body = await request.json();
    const { message, expiryDays = 7 } = body;

    const supabase = createSupabaseClient();

    // Fetch contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check contract status
    if (contract.status !== 'DRAFT' && contract.status !== 'SENT') {
      return NextResponse.json(
        { error: 'Contract can only be sent from DRAFT or SENT status' },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Update contract status
    const { data: updatedContract, error: updateError } = await supabase
      .from('contracts')
      .update({
        status: 'SENT',
        sent_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating contract:', updateError);
      return NextResponse.json(
        { error: 'Failed to send contract' },
        { status: 500 }
      );
    }

    // Create reminder record
    await supabase
      .from('contract_reminders')
      .insert({
        contract_id: contractId,
        reminder_type: 'signature_request',
        scheduled_for: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        status: 'sent',
        subject: '契約書への署名をお願いします',
        message: message || '契約書が準備できました。以下のリンクから署名をお願いします。',
        sent_by: user.id,
      });

    // TODO: Send email to customer
    // This would integrate with your email service

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      message: 'Contract sent for signature',
    });
  } catch (error: unknown) {
    console.error('Error sending contract:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send contract' },
      { status: 500 }
    );
  }
}
