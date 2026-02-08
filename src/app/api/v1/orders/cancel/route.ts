/**
 * V1 API: Cancel Order
 *
 * Re-exports the existing order cancellation endpoint
 * POST /api/v1/orders/cancel
 *
 * @deprecated Use /api/v2/orders/cancel in the future
 * @see /api/orders/cancel
 */

// Re-export all HTTP methods from the existing route
export { POST } from '../../../orders/cancel/route';
