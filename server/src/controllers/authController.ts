import { Request, Response } from 'express';
import pool from '@/config/database';
import { generateTokens, hashPassword, comparePassword, hashToken } from '@/utils/jwt';
import { sendSuccessResponse, sendErrorResponse } from '@/utils/response';
import { AuthenticatedRequest } from '@/middleware/auth';

export const register = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, companyName, phone } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return sendErrorResponse(res, 409, 'User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, company_name, phone)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, company_name, role, created_at`,
      [email, passwordHash, firstName, lastName, companyName, phone]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Store refresh token hash in database
    const refreshTokenHash = await hashToken(refreshToken);
    await pool.query(
      `INSERT INTO user_sessions (user_id, token_hash, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [user.id, await hashToken(accessToken), refreshTokenHash]
    );

    sendSuccessResponse(res, 201, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        companyName: user.company_name,
        role: user.role
      },
      accessToken,
      refreshToken
    }, 'User registered successfully');

  } catch (error) {
    console.error('Registration error:', error);
    sendErrorResponse(res, 500, 'Registration failed');
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find user
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, company_name, role, is_active
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 401, 'Invalid credentials');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return sendErrorResponse(res, 401, 'Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return sendErrorResponse(res, 401, 'Invalid credentials');
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Store refresh token hash in database
    const refreshTokenHash = await hashToken(refreshToken);
    await pool.query(
      `INSERT INTO user_sessions (user_id, token_hash, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
      [user.id, await hashToken(accessToken), refreshTokenHash]
    );

    sendSuccessResponse(res, 200, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        companyName: user.company_name,
        role: user.role
      },
      accessToken,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    sendErrorResponse(res, 500, 'Login failed');
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token && req.user) {
      // Invalidate session
      await pool.query(
        'UPDATE user_sessions SET is_active = false WHERE user_id = $1',
        [req.user.userId]
      );
    }

    sendSuccessResponse(res, 200, null, 'Logout successful');

  } catch (error) {
    console.error('Logout error:', error);
    sendErrorResponse(res, 500, 'Logout failed');
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, company_name, phone, role,
              email_verified, created_at, last_login
       FROM users WHERE id = $1`,
      [req.user?.userId]
    );

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    const user = result.rows[0];

    sendSuccessResponse(res, 200, {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      companyName: user.company_name,
      phone: user.phone,
      role: user.role,
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      lastLogin: user.last_login
    });

  } catch (error) {
    console.error('Get profile error:', error);
    sendErrorResponse(res, 500, 'Failed to get profile');
  }
};