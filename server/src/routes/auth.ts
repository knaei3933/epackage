import { Router } from 'express';
import * as authController from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';
import { validateLogin, validateRegister } from '@/middleware/validation';
import { rateLimitMiddleware, authLimiter } from '@/middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);

// Protected routes
router.post('/logout', rateLimitMiddleware(authLimiter), authenticateToken, authController.logout);
router.get('/profile', rateLimitMiddleware(authLimiter), authenticateToken, authController.getProfile);

export default router;