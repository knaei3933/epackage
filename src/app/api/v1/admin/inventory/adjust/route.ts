/**
 * V1 API: Inventory Adjust
 *
 * Re-exports the existing inventory adjustment endpoint
 * POST /api/v1/admin/inventory/adjust
 *
 * @deprecated Use /api/v2/admin/inventory/adjust in the future
 * @see /api/admin/inventory/adjust
 */

// Re-export all HTTP methods from the existing route
export { POST } from '../../../admin/inventory/adjust/route';
