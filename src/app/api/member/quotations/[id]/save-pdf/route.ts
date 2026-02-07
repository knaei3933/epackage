/**
 * Save Quotation PDF API
 *
 * Saves the generated PDF to Supabase Storage and updates the quotation's pdf_url
 *
 * POST /api/member/quotations/[id]/save-pdf
 *
 * Request body:
 * - pdfData: Base64 encoded PDF data
 *
 * Returns:
 * - pdf_url: The public URL of the saved PDF
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get x-user-id header from middleware (already authenticated)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No session found' },
        { status: 401 }
      );
    }

    // Create service client for all operations
    const serviceClient = createServiceClient();

    // Await params in Next.js 15
    const { id: quotationId } = await params;

    // Parse request body
    const body = await request.json();
    const { pdfData } = body;

    if (!pdfData) {
      return NextResponse.json(
        { error: 'PDF data is required' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = pdfData.split(',')[1] || pdfData;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    // Get quotation details for filename
    const { data: quotation, error: quoteError } = await serviceClient
      .from('quotations')
      .select('quotation_number, user_id')
      .eq('id', quotationId)
      .single();

    if (quoteError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Verify ownership (middleware doesn't set admin info, so just check user_id)
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Generate filename: {quotation_number}.pdf
    const fileName = `${quotation.quotation_number}.pdf`;
    const storagePath = `${quotation.user_id}/${fileName}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('quotation-pdfs')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload PDF', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
      .from('quotation-pdfs')
      .getPublicUrl(storagePath);

    const pdfUrl = urlData.publicUrl;

    // Update quotation with pdf_url
    const { error: updateError } = await serviceClient
      .from('quotations')
      .update({ pdf_url: pdfUrl })
      .eq('id', quotationId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quotation', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pdf_url: pdfUrl,
      message: 'PDF saved successfully'
    });

  } catch (error) {
    console.error('Save PDF API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
