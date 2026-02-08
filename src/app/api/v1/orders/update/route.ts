/**
 * V1 API: Update Order
 *
 * Re-exports the existing order update endpoint
 * POST /api/v1/orders/update
 *
 * @deprecated Use /api/v2/orders/update in the future
 * @see /api/orders/update
 */

// Re-export all HTTP methods from the existing route
export { POST } from '../../../orders/update/route';
