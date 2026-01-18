import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { handleApiError, ValidationError } from '@/lib/api-error-handler';
import { uuidSchema } from '@/lib/validation-schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST handler - Send signature request for contract
 */

// ============================================================
// Validation Schema
// ============================================================

const requestSignatureSchema = z.object({
  contractId: uuidSchema,
  method: z.enum(['email', 'portal']),
  message: z.string().optional(),
});

export const POST = withAdminAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const validationResult = requestSignatureSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError('Invalid request data', validationResult.error.errors);
    }

    const data = validationResult.data;
    const { contractId, method, message } = data;

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
      throw new Error('Contract not found');
    }

    // Check if contract can be sent for signature
    if (!['DRAFT', 'SENT', 'EXPIRED'].includes(contract.status)) {
      throw new Error(`Cannot send signature request for current status: ${contract.status}`);
    }

    const customerEmail = contract.orders?.customer_email;

    // Check if customer email exists for email method
    if (method === 'email' && !customerEmail) {
      throw new Error('Customer email not registered');
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
      throw new Error('Failed to update contract');
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
    return handleApiError(error);
  }
});
