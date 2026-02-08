/**
 * V1 API: Create Order
 *
 * Re-exports the existing order creation endpoint
 * POST /api/v1/orders/create
 *
 * @deprecated Use /api/v2/orders/create in the future
 * @see /api/orders/create
 */

// Re-export all HTTP methods from the existing route
export { POST } from '../../../orders/create/route';
