import { NextResponse, type NextRequest } from 'next/server';

/**
 * Minimal middleware - redirects only.
 *
 * All functionality moved to config files:
 * - Security headers → next.config.ts (headers)
 * - Canonical redirect → vercel.json (redirects)
 * - Trailing slash redirect → vercel.json (redirects)
 * - HTTPS redirect → Vercel handles automatically
 *
 * This middleware is kept empty as a placeholder.
 * To completely remove, delete this file and remove middleware reference if any.
 */
export async function middleware(req: NextRequest) {
  // All functionality moved to config files
  // This middleware is now essentially a no-op
  return NextResponse.next();
}

/**
 * Empty matcher - middleware runs on NO routes
 * All processing handled by next.config.ts and vercel.json
 */
export const config = {
  matcher: [],
};
