/**
 * V1 API: Quotation Guest Save
 *
 * Re-exports the existing guest quotation save endpoint
 * POST /api/v1/quotations/guest-save
 *
 * @deprecated Use /api/v2/quotations/guest in the future
 * @see /api/quotations/guest-save
 */

// Re-export all HTTP methods from the existing route
export { POST } from '../../../quotations/guest-save/route';
