import { Router } from 'express';
import * as quotationController from '@/controllers/quotationController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateQuotation } from '@/middleware/validation';
import { rateLimitMiddleware } from '@/middleware/rateLimiter';

const router = Router();

// Protected routes
router.post('/', rateLimitMiddleware, authenticateToken, validateQuotation, quotationController.createQuotation);
router.get('/', rateLimitMiddleware, authenticateToken, quotationController.getQuotations);
router.get('/:id', rateLimitMiddleware, authenticateToken, quotationController.getQuotation);
router.put('/:id/status', rateLimitMiddleware, authenticateToken, requireAdmin, quotationController.updateQuotationStatus);

export default router;