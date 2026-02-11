/**
 * JWT Utilities
 *
 * JWT token validation and utilities for Supabase authentication
 * Bypasses Supabase SSR for direct JWT handling
 */

import { jwtVerify } from 'jose';

// =====================================================
// Types
// =====================================================

export interface JWTPayload {
  exp: number;
  ref?: string;
  role?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export interface TokenValidationResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

// =====================================================
// Constants
// =====================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';

// =====================================================
// Verify JWT Token
// =====================================================

/**
 * Verify and decode a JWT token using Supabase JWT secret
 * This bypasses Supabase SSR and directly validates tokens
 */
export async function verifyToken(token: string): Promise<TokenValidationResult> {
  try {
    if (!JWT_SECRET) {
      // Fallback: fetch JWKS from Supabase
      return await verifyTokenWithSupabase(token);
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));

    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return {
        valid: false,
        error: 'Token expired',
      };
    }

    return {
      valid: true,
      payload: payload as JWTPayload,
    };
  } catch (error) {
    console.error('[JWT] Verification error:', error);
    return {
      valid: false,
      error: 'Invalid token',
    };
  }
}

/**
 * Verify token using Supabase API
 * Fallback when JWT_SECRET is not available
 */
async function verifyTokenWithSupabase(token: string): Promise<TokenValidationResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: 'Token validation failed',
      };
    }

    const data = await response.json();

    return {
      valid: true,
      payload: {
        exp: Math.floor(Date.now() / 1000) + 3600, // Default 1 hour
        email: data.email,
        user_metadata: data.user_metadata,
      },
    };
  } catch (error) {
    console.error('[JWT] Supabase verification error:', error);
    return {
      valid: false,
      error: 'Token verification failed',
    };
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Remove 'Bearer ' prefix if present
  const match = authHeader.match(/^Bearer\s+(.+)$/);
  return match ? match[1] : authHeader;
}

/**
 * Extract token from Cookie header
 */
export function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  // Extract Supabase auth token cookie
  // Format: sb-[project-ref]-auth-token.0
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const tokenCookie = cookies.find(c => c.includes('-auth-token.0='));

  if (!tokenCookie) {
    return null;
  }

  // Extract cookie value
  const match = tokenCookie.match(/-auth-token\.0=(.+?)(;|$)/);
  if (!match) {
    return null;
  }

  const tokenValue = match[1];

  // Decode base64 if it's base64-encoded JSON (Supabase format)
  try {
    const decoded = Buffer.from(tokenValue, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed.access_token) {
      return parsed.access_token;
    }
    return tokenValue;
  } catch {
    // Not base64-encoded, return as-is
    return tokenValue;
  }
}
