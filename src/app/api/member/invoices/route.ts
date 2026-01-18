/**
 * Member Invoices API (UNIFIED - Using new auth middleware)
 *
 * GET /api/member/invoices - List authenticated member's invoices with filtering
 *
 * SECURITY: Uses unified auth middleware from api-auth.ts
 * SECURITY: Uses unified error handling from api-error-handler.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { withAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';
import type { Database } from '@/types/database';

type InvoiceWithItems = Database['public']['Tables']['invoices']['Row'] & {
  invoice_items?: Database['public']['Tables']['invoice_items']['Row'][];
};

/**
 * GET /api/member/invoices
 * List authenticated member's invoices with filtering
 */
export const GET = withApiHandler(
  withAuth(async (request: NextRequest, auth) => {
    const userId = auth.userId;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const supabase = createServiceClient();

    // Build query - fetch only authenticated user's invoices
    let query = supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('user_id', userId)
      .order('issue_date', { ascending: false });

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search filter (invoice_number, customer_name, company_name)
    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%,customer_name.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Apply date range filter
    if (startDate) {
      query = query.gte('issue_date', startDate);
    }
    if (endDate) {
      query = query.lte('issue_date', endDate);
    }

    const { data: invoices, error } = await query;

    if (error) {
      console.error('[Invoices API] Error fetching invoices:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: invoices || [],
    });
  })
);
