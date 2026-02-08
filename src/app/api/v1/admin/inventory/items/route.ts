/**
 * V1 API: Inventory Items
 *
 * Re-exports the existing inventory items endpoint
 * GET /api/v1/admin/inventory/items
 * POST /api/v1/admin/inventory/items
 *
 * @deprecated Use /api/v2/admin/inventory/items in the future
 * @see /api/admin/inventory/items
 */

// Re-export all HTTP methods from the existing route
export { GET, POST, PUT, DELETE } from '../../../admin/inventory/items/route';
