import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// ============================================================
// Type Definitions
// ============================================================

interface QuotationItemInput {
  productName: string
  quantity: number
  unitPrice: number
  specifications?: Record<string, unknown> | null
}

interface SaveQuotationRequestBody {
  userId: string
  quotationNumber: string
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired'
  totalAmount: number
  validUntil?: string
  notes?: string | null
  items?: QuotationItemInput[]
}

// ============================================================
// Type-safe Helper Functions
// ============================================================

/**
 * Type-safe insert helper for quotations table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertQuotation(
  supabaseClient: ReturnType<typeof createServiceClient>,
  data: Database['public']['Tables']['quotations']['Insert']
) {
  return (supabaseClient as any)
    .from('quotations')
    .insert(data)
    .select()
    .single();
}

/**
 * Type-safe insert helper for quotation_items table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertQuotationItems(
  supabaseClient: ReturnType<typeof createServiceClient>,
  items: Database['public']['Tables']['quotation_items']['Insert'][]
) {
  return (supabaseClient as any)
    .from('quotation_items')
    .insert(items);
}

/**
 * Type-safe delete helper for quotations table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function deleteQuotation(
  supabaseClient: ReturnType<typeof createServiceClient>,
  quotationId: string
) {
  return (supabaseClient as any)
    .from('quotations')
    .delete()
    .eq('id', quotationId);
}

/**
 * Type-safe select helper for quotations with items
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function selectQuotationWithItems(
  supabaseClient: ReturnType<typeof createServiceClient>,
  quotationId: string
) {
  return (supabaseClient as any)
    .from('quotations')
    .select('*, quotation_items (*)')
    .eq('id', quotationId)
    .single();
}

/**
 * POST /api/quotations/save
 *
 * Save a quotation to the database with quotation items
 *
 * Request body:
 * {
 *   userId: string;
 *   quotationNumber: string;
 *   status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
 *   totalAmount: number;
 *   validUntil: string; // ISO date
 *   notes: string | null;
 *   items: Array<{
 *     productName: string;
 *     quantity: number;
 *     unitPrice: number;
 *     specifications: Record<string, unknown>;
 *   }>;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SaveQuotationRequestBody;

    // Validate required fields (userId is no longer required - we get it from middleware)
    if (!body.quotationNumber || body.totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: quotationNumber, totalAmount' },
        { status: 400 }
      );
    }

    // Get authenticated user ID from middleware headers (SECURE: cannot be spoofed by client)
    const userIdFromHeader = request.headers.get('x-user-id');
    if (!userIdFromHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: No user ID from authentication middleware' },
        { status: 401 }
      );
    }

    // Verify the user actually exists in auth system
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name);
          return cookie?.value;
        },
        set() { /* Not needed for verification */ },
        remove() { /* Not needed for verification */ },
      },
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user || user.id !== userIdFromHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid authentication' },
        { status: 401 }
      );
    }

    // Use the authenticated user ID (ignore client-provided userId for security)
    const userIdForDb = userIdFromHeader;

    // Create service client for server-side operations (bypasses RLS)
    const supabase = createServiceClient();

    // Start a transaction by inserting the quotation
    const { data: quotation, error: quotationError } = await insertQuotation(supabase, {
      user_id: userIdForDb,
      company_id: null,
      quotation_number: body.quotationNumber,
      status: (body.status || 'draft') as Database['public']['Tables']['quotations']['Row']['status'],
      total_amount: body.totalAmount,
      valid_until: body.validUntil || null,
      notes: body.notes || null,
      // Required fields with defaults (will be updated later when customer info is available)
      customer_name: 'TBD',
      customer_email: 'tbd@example.com',
      customer_phone: null,
      subtotal_amount: body.totalAmount,
      subtotal: body.totalAmount, // Alias for subtotal_amount
      tax_amount: 0,
      pdf_url: null,
      admin_notes: null,
      sales_rep: null,
      estimated_delivery_date: null,
      sent_at: null,
      approved_at: null,
      rejected_at: null,
    });

    if (quotationError) {
      console.error('Error creating quotation:', quotationError);
      return NextResponse.json(
        { error: 'Failed to create quotation' },
        { status: 500 }
      );
    }

    const quotationTyped = quotation as Database['public']['Tables']['quotations']['Row'];

    // Insert quotation items if provided
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      const itemsToInsert = body.items.map((item, index) => ({
        quotation_id: quotationTyped.id,
        product_id: null, // No product_id for custom quotes
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        // total_price is a generated column (quantity * unit_price) - don't insert it
        specifications: item.specifications || null,
      }));

      const { error: itemsError } = await insertQuotationItems(supabase, itemsToInsert);

      if (itemsError) {
        console.error('Error creating quotation items:', itemsError);
        // Rollback: delete the quotation if items failed
        await deleteQuotation(supabase, quotationTyped.id);
        return NextResponse.json(
          { error: 'Failed to create quotation items' },
          { status: 500 }
        );
      }
    }

    // Fetch the complete quotation with items
    const { data: completeQuotation, error: fetchError } = await selectQuotationWithItems(supabase, quotationTyped.id);

    if (fetchError) {
      console.error('Error fetching complete quotation:', fetchError);
    }

    // Return the saved quotation
    const responseQuotation = completeQuotation || quotationTyped;
    return NextResponse.json(
      {
        success: true,
        quotation: responseQuotation,
        message: 'Quotation saved successfully'
      },
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Error in POST /api/quotations/save:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
