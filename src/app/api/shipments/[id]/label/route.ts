/**
 * Shipping Label API
 * GET /api/shipments/[id]/label
 *
 * Generates and returns shipping label PDF for a shipment
 */

import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { withMemberAuth } from '@/lib/api-auth';
import { SHIPMENTS_ALLOWED_ROLES } from '@/lib/shipments-constants';
import { ShipmentError } from '@/types/shipment';
import { generateShippingLabel } from '@/lib/shipping-carriers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET handler - Generate shipping label PDF
 */
export const GET = withMemberAuth<any>(
  async (_request, _auth, context) => {
    try {
      if (!context?.params) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Missing route context' },
          },
          { status: 400 },
        );
      }
      const { id: shipmentId } = (await context.params) as { id: string };
      const supabase = createSupabaseClient();

      // Get shipment details
      const { data: shipment, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();

      if (error || !shipment) {
        throw new ShipmentError('Shipment not found', 'SHIPMENT_NOT_FOUND');
      }

      const shipmentTyped = shipment as any;

      // Check if label already exists
      if (shipmentTyped.shipping_label_url) {
        // Return existing label URL
        return NextResponse.json({
          success: true,
          label_url: shipmentTyped.shipping_label_url,
          message: 'Using existing shipping label',
        });
      }

      // Generate new label from carrier API
      const labelBlob = await generateShippingLabel(
        shipmentId,
        shipmentTyped.carrier,
      );

      // In production, you would:
      // 1. Upload the PDF blob to storage
      // 2. Get the public URL
      // 3. Update the shipment record with the URL

      // For now, return the blob directly
      const buffer = await labelBlob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      return NextResponse.json({
        success: true,
        label_data: base64,
        content_type: 'application/pdf',
        message: 'Shipping label generated successfully',
      });
    } catch (error) {
      console.error('Generate label error:', error);

      if (error instanceof ShipmentError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to generate shipping label',
            details: error instanceof Error ? error.message : String(error),
          },
        },
        { status: 500 },
      );
    }
  },
  { allowedRoles: SHIPMENTS_ALLOWED_ROLES },
);
