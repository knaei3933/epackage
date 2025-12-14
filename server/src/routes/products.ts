import { Router } from 'express';
import * as productController from '@/controllers/productController';
import { validateProductQuery } from '@/middleware/validation';
import { rateLimitMiddleware, searchLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.get('/', rateLimitMiddleware(searchLimiter), validateProductQuery, productController.getProducts);
router.get('/categories', rateLimitMiddleware(searchLimiter), productController.getCategories);
router.get('/search', rateLimitMiddleware(searchLimiter), productController.searchProducts);
router.get('/:id', rateLimitMiddleware(searchLimiter), productController.getProduct);

export default router;