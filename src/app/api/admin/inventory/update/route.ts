import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { handleApiError, ValidationError } from '@/lib/api-error-handler';
import { uuidSchema } from '@/lib/validation-schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// Validation Schema
// ============================================================

const inventoryUpdateSchema = z.object({
  inventoryId: uuidSchema,
  productId: uuidSchema,
  quantity: z.number().int().refine((val) => val !== 0, {
    message: 'Quantity cannot be zero'
  }),
  transactionType: z.enum(['receipt', 'issue', 'adjustment', 'transfer', 'return', 'production_in', 'production_out']),
  reason: z.string().optional(),
});

/**
 * POST handler - Update inventory quantity
 */
export const POST = withAdminAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const validationResult = inventoryUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError('Invalid request data', validationResult.error.errors);
    }

    const data = validationResult.data;
    const { inventoryId, productId, quantity, transactionType, reason } = data;

    // Get current inventory
    const { data: currentInventory, error: fetchError } = await supabase
      .from('inventory')
      .select('id, quantity_on_hand, quantity_available')
      .eq('id', inventoryId)
      .single();

    if (fetchError || !currentInventory) {
      throw new Error('Inventory record not found');
    }

    // Update inventory
    const newQuantityOnHand = Math.max(0, currentInventory.quantity_on_hand + quantity);
    const newQuantityAvailable = Math.max(0, currentInventory.quantity_available + quantity);

    const { data: updatedInventory, error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity_on_hand: newQuantityOnHand,
        quantity_available: newQuantityAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventoryId)
      .select('id, product_id, quantity_on_hand, quantity_available, updated_at')
      .single();

    if (updateError || !updatedInventory) {
      throw new Error('Failed to update inventory');
    }

    // Create inventory transaction record
    const referenceNumber = `MANUAL-${Math.random().toString(36).substring(2, 10)}`;

    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_id: inventoryId,
        product_id: productId,
        transaction_type: transactionType,
        quantity: quantity,
        reference_number: referenceNumber,
        notes: reason || null,
        transaction_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error('Failed to create inventory transaction:', transactionError);
    }

    return NextResponse.json({
      success: true,
      data: {
        inventory: updatedInventory,
        transaction: {
          type: transactionType,
          quantity: quantity,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});
