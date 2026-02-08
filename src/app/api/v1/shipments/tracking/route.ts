/**
 * V1 API: Shipment Tracking
 *
 * Re-exports the existing shipment tracking endpoint
 * GET /api/v1/shipments/tracking
 *
 * @deprecated Use /api/v2/shipments/tracking in the future
 * @see /api/shipments/tracking
 */

// Re-export all HTTP methods from the existing route
export { GET } from '../../../shipments/tracking/route';
