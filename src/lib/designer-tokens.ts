import * as crypto from 'crypto';

const TOKEN_EXPIRY_DAYS = 30; // 30-day token expiration
const TOKEN_BYTES = 32; // 256 bits of entropy

export interface GeneratedToken {
  rawToken: string;      // Send this in email (never stored)
  tokenHash: string;     // Store this in database
  tokenPrefix: string;   // For admin display (first 8 chars)
  expiresAt: Date;
}

/**
 * Generate a secure upload token with 30-day expiration
 * @param expiryDays Number of days until token expires (default: 30)
 * @returns Generated token object with raw token, hash, prefix, and expiry
 */
export function generateUploadToken(expiryDays: number = TOKEN_EXPIRY_DAYS): GeneratedToken {
  // Generate 256-bit random token
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('base64url');

  // Hash the token for secure storage
  const tokenHash = hashToken(rawToken);

  // Extract prefix for admin display (first 8 characters)
  const tokenPrefix = rawToken.substring(0, 8);

  // Calculate expiration date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiryDays);

  return {
    rawToken,
    tokenHash,
    tokenPrefix,
    expiresAt,
  };
}

/**
 * Hash a raw token using SHA-256 for secure database storage
 * @param rawToken The raw token string
 * @returns Hex-encoded SHA-256 hash
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Validate token format (must be URL-safe base64)
 * @param token Token string to validate
 * @returns true if token format is valid
 */
export function validateTokenFormat(token: string): boolean {
  // URL-safe base64: alphanumeric, hyphen, underscore
  const base64urlPattern = /^[A-Za-z0-9_-]+$/;

  // Check format
  if (!base64urlPattern.test(token)) {
    return false;
  }

  // Check length (32 bytes = ~43 chars in base64url)
  const expectedLength = Math.ceil(TOKEN_BYTES * 4 / 3);
  return token.length === expectedLength;
}

/**
 * Check if a token has expired
 * @param expiresAt The expiration date to check
 * @returns true if token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
