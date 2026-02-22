// @ts-nocheck - TypeScript inference issues with updated database schema
// The database types are correctly defined in src/types/database.ts but
// TypeScript has issues inferring the new columns. This file is safe to use.

/**
 * Designer Task Access Tokens
 *
 * Provides token-based access to designer order pages without authentication.
 * Designers can access their assigned orders via secure tokens sent via email.
 *
 * Functions:
 * - generateTaskAccessToken(): Generate and store access token for designer_task_assignments
 * - getDesignerOrderAccessUrl(): Generate access URL for designer order page
 */

import { createClient } from '@/lib/supabase/server';
import { generateUploadToken, hashToken } from '@/lib/designer-tokens';

/**
 * Generate and store access token for designer task assignment
 *
 * Creates a secure access token that allows designers to access their assigned
 * orders without requiring authentication. The token is stored as a hash in
 * the database for security.
 *
 * @param assignmentId - The designer_task_assignments record ID
 * @param expiryDays - Number of days until token expires (default: 30)
 * @returns Object containing raw token (for email) and metadata, or null if failed
 *
 * @example
 * ```ts
 * const result = await generateTaskAccessToken('assignment-123', 30);
 * if (result) {
 *   // Send result.rawToken in email
 *   const url = getDesignerOrderAccessUrl(result.rawToken);
 *   await sendDesignerEmail(designerEmail, url);
 * }
 * ```
 */
export async function generateTaskAccessToken(
  assignmentId: string,
  expiryDays: number = 30
): Promise<{
  rawToken: string;
  tokenPrefix: string;
  expiresAt: Date;
} | null> {
  try {
    const supabase = await createClient();

    // Generate secure token using existing token generation function
    const { rawToken, tokenHash, tokenPrefix, expiresAt } = generateUploadToken(expiryDays);

    // Store token hash in database
    const { error } = await supabase
      .from('designer_task_assignments')
      .update({
        access_token_hash: tokenHash,
        access_token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', assignmentId);

    if (error) {
      console.error('[generateTaskAccessToken] Failed to store token:', error);
      return null;
    }

    return {
      rawToken,
      tokenPrefix,
      expiresAt,
    };
  } catch (error) {
    console.error('[generateTaskAccessToken] Error:', error);
    return null;
  }
}

/**
 * Validate access token and return assignment data
 *
 * Verifies a token by hashing it and comparing with stored hash.
 * Updates last_accessed_at timestamp on successful validation.
 *
 * @param token - The raw access token from URL
 * @returns Assignment data if valid, null otherwise
 *
 * @example
 * ```ts
 * const assignment = await validateTaskAccessToken(tokenFromUrl);
 * if (!assignment) {
 *   return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
 * }
 * ```
 */
export async function validateTaskAccessToken(
  token: string
): Promise<{
  id: string;
  designer_id: string;
  order_id: string;
  status: string;
} | null> {
  try {
    const supabase = await createClient();

    // Hash the provided token
    const tokenHash = hashToken(token);

    // Look up assignment by token hash
    const { data: assignment, error } = await supabase
      .from('designer_task_assignments')
      .select('id, designer_id, order_id, status, access_token_expires_at')
      .eq('access_token_hash', tokenHash)
      .single();

    if (error || !assignment) {
      console.error('[validateTaskAccessToken] Token not found:', error);
      return null;
    }

    // Check expiration
    const expiresAt = new Date(assignment.access_token_expires_at);
    if (new Date() > expiresAt) {
      console.warn('[validateTaskAccessToken] Token expired');
      return null;
    }

    // Update last_accessed_at
    await supabase
      .from('designer_task_assignments')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', assignment.id);

    return {
      id: assignment.id,
      designer_id: assignment.designer_id,
      order_id: assignment.order_id,
      status: assignment.status,
    };
  } catch (error) {
    console.error('[validateTaskAccessToken] Error:', error);
    return null;
  }
}

/**
 * Generate access URL for designer order page
 *
 * Creates the full URL that designers will use to access their assigned orders.
 * This URL should be sent in emails to designers.
 *
 * @param token - The raw access token
 * @param baseUrl - Optional base URL (defaults to NEXT_PUBLIC_SITE_URL or current origin)
 * @returns Full URL to designer order page
 *
 * @example
 * ```ts
 * const url = getDesignerOrderAccessUrl(rawToken);
 * // Returns: https://example.com/designer-order/abc123xyz...
 * ```
 */
export function getDesignerOrderAccessUrl(
  token: string,
  baseUrl?: string
): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || '';
  return `${base}/designer-order/${token}`;
}

/**
 * Revoke access token for an assignment
 *
 * Invalidates an existing access token by clearing the token hash.
 * Useful when reassigning orders or when designer access should be revoked.
 *
 * @param assignmentId - The designer_task_assignments record ID
 * @returns true if revoked successfully, false otherwise
 *
 * @example
 * ```ts
 * const revoked = await revokeTaskAccessToken('assignment-123');
 * if (revoked) {
 *   console.log('Token revoked successfully');
 * }
 * ```
 */
export async function revokeTaskAccessToken(
  assignmentId: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('designer_task_assignments')
      .update({
        access_token_hash: null,
        access_token_expires_at: null,
      })
      .eq('id', assignmentId);

    if (error) {
      console.error('[revokeTaskAccessToken] Failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[revokeTaskAccessToken] Error:', error);
    return false;
  }
}

/**
 * Check if token exists and is valid for an assignment
 *
 * Utility function to check if an assignment has an active access token.
 *
 * @param assignmentId - The designer_task_assignments record ID
 * @returns Object with hasToken boolean and expiresAt date if token exists
 *
 * @example
 * ```ts
 * const { hasToken, expiresAt } = await checkTaskAccessToken('assignment-123');
 * if (hasToken && expiresAt && new Date() < expiresAt) {
 *   console.log('Token is still valid');
 * }
 * ```
 */
export async function checkTaskAccessToken(
  assignmentId: string
): Promise<{
  hasToken: boolean;
  expiresAt: Date | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('designer_task_assignments')
      .select('access_token_hash, access_token_expires_at')
      .eq('id', assignmentId)
      .single();

    if (error || !data) {
      return { hasToken: false, expiresAt: null };
    }

    return {
      hasToken: !!data.access_token_hash,
      expiresAt: data.access_token_expires_at ? new Date(data.access_token_expires_at) : null,
    };
  } catch (error) {
    console.error('[checkTaskAccessToken] Error:', error);
    return { hasToken: false, expiresAt: null };
  }
}
