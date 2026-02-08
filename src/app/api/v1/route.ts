/**
 * V1 API Root
 *
 * V1 APIの情報を返すエンドポイント
 * GET /api/v1
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    version: '1.0',
    status: 'stable',
    deprecated: false,
    message: 'EpackageLab API v1',
    endpoints: {
      quotations: {
        save: 'POST /api/v1/quotations/save',
        guestSave: 'POST /api/v1/quotations/guest-save',
      },
      orders: {
        detail: 'GET /api/v1/orders/[id]',
        update: 'PUT /api/v1/orders/[id]',
        create: 'POST /api/v1/orders/create',
        cancel: 'POST /api/v1/orders/cancel',
        updateOrder: 'POST /api/v1/orders/update',
      },
      shipments: {
        detail: 'GET /api/v1/shipments/[id]',
        create: 'POST /api/v1/shipments/create',
        tracking: 'GET /api/v1/shipments/tracking',
      },
      admin: {
        inventory: {
          items: 'GET/POST /api/v1/admin/inventory/items',
          adjust: 'POST /api/v1/admin/inventory/adjust',
        },
      },
    },
    documentation: '/api/docs',
    migrationGuide: '/api/docs/v1-to-v2',
  });
}
