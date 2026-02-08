/**
 * V1 API: Order Detail
 *
 * Re-exports the existing order detail endpoint
 * GET /api/v1/orders/[id] - Get order details
 * PUT /api/v1/orders/[id] - Update order
 *
 * @deprecated Use /api/v2/orders/[id] in the future
 * @see /api/orders/[id]
 */

// Re-export all HTTP methods from the existing route
export { GET, PUT, OPTIONS } from '../../../orders/[id]/route';
