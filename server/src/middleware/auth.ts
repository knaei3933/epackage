import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@/utils/jwt';
import { sendErrorResponse } from '@/utils/response';
import { JwtPayload } from '@/types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return sendErrorResponse(res, 401, 'Access token required');
    }

    const user = verifyAccessToken(token);

    if (user.type !== 'access') {
      return sendErrorResponse(res, 401, 'Invalid token type');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendErrorResponse(res, 401, 'Invalid or expired token');
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendErrorResponse(res, 401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendErrorResponse(res, 403, 'Insufficient permissions');
    }

    next();
  };
};

export const requireAdmin = requireRole('admin', 'manager');
export const requireManager = requireRole('manager');
export const requireCustomer = requireRole('customer', 'admin', 'manager');