/**
 * Contract Download API
 *
 * 契約書ダウンロードAPI
 *
 * GET - Generate and download contract PDF
 */

import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { generateContractPDF } from '@/lib/pdf-contracts';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

export async function GET(
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
    const supabase = createSupabaseClient();

    // Fetch contract with related data
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select(`
        *,
        orders (
          order_number,
          customer_name,
          customer_email,
          total_amount
        ),
        quotations (
          quotation_number,
          quotation_items (
            product_name,
            quantity,
            unit_price,
            total_price,
            specifications
          )
        )
      `)
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check if PDF already exists and is up to date
    if (contract.final_contract_url) {
      const lastUpdated = new Date(contract.updated_at).getTime();
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      // If PDF was generated within the last hour, return it
      if (now - lastUpdated < oneHour) {
        return NextResponse.redirect(contract.final_contract_url);
      }
    }

    // Generate contract PDF
    const contractData = {
      contractNumber: contract.contract_number,
      orderNumber: contract.orders?.order_number || '',
      customerName: contract.customer_name || contract.orders?.customer_name || '',
      customerEmail: contract.customer_email || contract.orders?.customer_email || '',
      totalAmount: contract.total_amount || contract.orders?.total_amount || 0,
      currency: contract.currency || 'JPY',
      validFrom: contract.valid_from,
      validUntil: contract.valid_until,
      terms: contract.terms,
      items: contract.quotations?.quotation_items || [],
      status: contract.status,
      signatures: {
        customer: {
          signed: !!contract.customer_signed_at,
          signedAt: contract.customer_signed_at,
          url: contract.customer_signature_url,
        },
        admin: {
          signed: !!contract.admin_signed_at,
          signedAt: contract.admin_signed_at,
          url: contract.admin_signature_url,
        },
      },
    };

    // Generate PDF using pdf-generator
    const pdfBuffer = await generateContractPDF(contractData);

    // Upload PDF to storage
    const fileName = `contracts/${contract.contract_number}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload contract PDF' },
        { status: 500 }
      );
    };

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('contracts')
      .getPublicUrl(fileName);

    const pdfUrl = urlData.publicUrl;

    // Update contract with PDF URL
    await supabase
      .from('contracts')
      .update({
        final_contract_url: pdfUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId);

    // Return PDF URL
    return NextResponse.json({
      success: true,
      url: pdfUrl,
      message: 'Contract PDF generated successfully',
    });
  } catch (error: unknown) {
    console.error('Error downloading contract:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate contract PDF' },
      { status: 500 }
    );
  }
}
