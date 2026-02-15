import { Router } from 'express';
import * as inquiryController from '@/controllers/inquiryController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateInquiry } from '@/middleware/validation';
import { rateLimitMiddleware } from '@/middleware/rateLimiter';

const router = Router();

// Public and protected routes
router.post('/', rateLimitMiddleware, validateInquiry, inquiryController.createInquiry);
router.get('/', rateLimitMiddleware, authenticateToken, inquiryController.getInquiries);
router.get('/:id', rateLimitMiddleware, authenticateToken, inquiryController.getInquiry);
router.put('/:id/status', rateLimitMiddleware, authenticateToken, requireAdmin, inquiryController.updateInquiryStatus);

export default router;