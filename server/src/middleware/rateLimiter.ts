import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { sendErrorResponse } from '@/utils/response';
import { config } from '@/config';

// General rate limiter
export const generalLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: config.rateLimit.maxRequests,
  duration: config.rateLimit.windowMs / 1000,
});

// Auth rate limiter (stricter)
export const authLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 5,
  duration: 15 * 60, // 15 minutes
});

// Search rate limiter
export const searchLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 30,
  duration: 60, // 1 minute
});

export const rateLimitMiddleware = (limiter: RateLimiterMemory) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await limiter.consume(req.ip);
      next();
    } catch (rejRes: any) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      res.set('Retry-After', String(secs));
      sendErrorResponse(res, 429, 'Too many requests');
    }
  };
};

export default rateLimitMiddleware;