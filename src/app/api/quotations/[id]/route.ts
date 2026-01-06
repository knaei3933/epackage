/**
 * GET /api/quotations/[id] - Get a single quotation by ID
 * PATCH /api/quotations/[id] - Update quotation details
 *
 * Individual quotation CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import type { Database } from '@/types/database';

interface UpdateRequestBody {
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  notes?: string;
  validUntil?: string;
  status?: Database['public']['Tables']['quotations']['Row']['status'];
}

// ============================================================
// GET: Fetch a single quotation by ID
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;

    const supabase = createServiceClient();

    // Fetch quotation with items
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select(`
        *,
        quotation_items (
          id,
          product_id,
          product_name,
          category,
          quantity,
          unit_price,
          total_price,
          specifications,
          notes,
          display_order,
          created_at
        )
      `)
      .eq('id', quotationId)
      .single();

    if (error) {
      console.error('Error fetching quotation:', error);
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      quotation,
    });

  } catch (error: unknown) {
    console.error('Error in GET /api/quotations/[id]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH: Update quotation details
// ============================================================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const quotationId = params.id;
    const body = await request.json() as UpdateRequestBody;

    const supabase = createServiceClient();

    // Prepare update data
    const updateData: Database['public']['Tables']['quotations']['Update'] = {};

    // Update customer info if provided
    if (body.customerInfo) {
      if (body.customerInfo.name) {
        updateData.customer_name = body.customerInfo.name;
      }
      if (body.customerInfo.email) {
        updateData.customer_email = body.customerInfo.email;
      }
      if (body.customerInfo.phone) {
        updateData.customer_phone = body.customerInfo.phone;
      }
    }

    // Update other fields
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    if (body.validUntil !== undefined) {
      updateData.valid_until = body.validUntil;
    }

    // Status updates are restricted - only certain transitions are allowed
    if (body.status) {
      // First, get current quotation to check if transition is valid
      const { data: currentQuotation } = await supabase
        .from('quotations')
        .select('status')
        .eq('id', quotationId)
        .single();

      if (!currentQuotation) {
        return NextResponse.json(
          { error: 'Quotation not found' },
          { status: 404 }
        );
      }

      const currentStatus = currentQuotation.status;

      // Define valid status transitions
      const validTransitions: Record<string, string[]> = {
        'draft': ['sent', 'rejected'],
        'sent': ['approved', 'rejected', 'expired'],
        'approved': ['converted'],
        'rejected': [],
        'expired': [],
        'converted': [],
      };

      // Check if transition is valid
      if (!validTransitions[currentStatus]?.includes(body.status)) {
        return NextResponse.json(
          {
            error: 'Invalid status transition',
            currentStatus,
            requestedStatus: body.status,
            allowedTransitions: validTransitions[currentStatus] || []
          },
          { status: 400 }
        );
      }

      updateData.status = body.status;

      // Set timestamp based on status
      if (body.status === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (body.status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      } else if (body.status === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
      }
    }

    // Perform update
    const { data: updatedQuotation, error: updateError } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', quotationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating quotation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quotation' },
        { status: 500 }
      );
    }

    console.log('[API /quotations/[id]] Quotation updated:', {
      quotationId,
      updates: Object.keys(updateData),
    });

    return NextResponse.json(
      {
        success: true,
        quotation: updatedQuotation,
        message: '見積を更新しました。'
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Error in PATCH /api/quotations/[id]:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
