/**
 * V1 API: Shipment Detail
 *
 * Re-exports the existing shipment detail endpoint
 * GET /api/v1/shipments/[id]
 *
 * @deprecated Use /api/v2/shipments/[id] in the future
 * @see /api/shipments/[id]
 */

// Re-export all HTTP methods from the existing route
export { GET, PUT, DELETE } from '../../../shipments/[id]/route';
