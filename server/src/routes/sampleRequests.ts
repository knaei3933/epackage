import { Router } from 'express';
import * as sampleRequestController from '@/controllers/sampleRequestController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateSampleRequest } from '@/middleware/validation';
import { rateLimitMiddleware } from '@/middleware/rateLimiter';

const router = Router();

// Protected routes
router.post('/', rateLimitMiddleware, authenticateToken, validateSampleRequest, sampleRequestController.createSampleRequest);
router.get('/', rateLimitMiddleware, authenticateToken, sampleRequestController.getSampleRequests);
router.get('/:id', rateLimitMiddleware, authenticateToken, sampleRequestController.getSampleRequest);
router.put('/:id/status', rateLimitMiddleware, authenticateToken, requireAdmin, sampleRequestController.updateSampleRequestStatus);

export default router;