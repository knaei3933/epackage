/**
 * V1 API: Quotation Save
 *
 * Re-exports the existing quotation save endpoint
 * POST /api/v1/quotations/save
 *
 * @deprecated Use /api/v2/quotations in the future
 * @see /api/quotations/save
 */

// Re-export all HTTP methods from the existing route
export { POST } from '../../../quotations/save/route';
