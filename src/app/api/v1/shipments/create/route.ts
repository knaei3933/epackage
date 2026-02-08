/**
 * V1 API: Create Shipment
 *
 * Re-exports the existing shipment creation endpoint
 * POST /api/v1/shipments/create
 *
 * @deprecated Use /api/v2/shipments/create in the future
 * @see /api/shipments/create
 */

// Re-export all HTTP methods from the existing route
export { POST } from '../../../shipments/create/route';
