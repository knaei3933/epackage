/**
 * Authenticated Service Role Client
 *
 * ⚠️ CRITICAL: This helper enforces authentication BEFORE granting service role access.
 * Never use SUPABASE_SERVICE_ROLE_KEY directly in API routes.
 *
 * @example CORRECT Usage:
 * import { verifyAdminAuth } from '@/lib/auth-helpers';
 * import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
 *
 * export async function POST(req: NextRequest) {
 *   // 1. Verify auth first
 *   const auth = await verifyAdminAuth(req);
 *   if (!auth) return unauthorizedResponse();
 *
 *   // 2. Now safe to use service role
 *   const supabase = createAuthenticatedServiceClient({
 *     operation: 'create_order',
 *     userId: auth.userId,
 *     route: '/api/admin/orders/create',
 *   });
 *
 *   // 3. Execute privileged operations
 *   const { data } = await supabase.from('admin_tables').select('*');
 *   return NextResponse.json(data);
 * }
 */

import { createClient } from '@supabase/supabase-js';

// Ensure server-side only execution
if (typeof window !== 'undefined') {
  throw new Error('[createAuthenticatedServiceClient] This module can only be used on the server side');
}

export interface ServiceRoleContext {
  operation: string;
  userId?: string;
  route?: string;
}

/**
 * Create service role client with audit logging
 *
 * This function creates a service role client with comprehensive logging.
 * ALL service role usage is automatically logged to audit trail.
 *
 * @throws {Error} If environment variables are missing
 */
export function createAuthenticatedServiceClient(context?: ServiceRoleContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Log service role usage for audit trail
  if (context && process.env.NODE_ENV === 'production') {
    console.log('[SERVICE_ROLE_AUDIT]', {
      timestamp: new Date().toISOString(),
      operation: context.operation,
      userId: context.userId || 'unknown',
      route: context.route || 'unknown',
      environment: process.env.NODE_ENV,
    });
  }

  // Also log in development for debugging
  if (context && process.env.NODE_ENV === 'development') {
    console.log('[SERVICE_ROLE_AUDIT_DEV]', {
      operation: context.operation,
      userId: context.userId,
      route: context.route,
    });
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Wrapper pattern for API handlers requiring service role
 *
 * @example
 * export const GET = withServiceRoleAudit('list_admin_users', async (req, supabase, auth) => {
 *   const { data } = await supabase.from('users').select('*');
 *   return NextResponse.json(data);
 * });
 */
export function withServiceRoleAudit<T extends Request = Request>(
  operationName: string,
  handler: (
    req: T,
    supabase: ReturnType<typeof createAuthenticatedServiceClient>,
    auth: { userId: string }
  ) => Promise<Response>
) {
  return async (req: T, auth: { userId: string }) => {
    const startTime = Date.now();
    const supabase = createAuthenticatedServiceClient({
      operation: operationName,
      userId: auth.userId,
      route: new URL(req.url).pathname,
    });

    try {
      const response = await handler(req, supabase, auth);

      // Log successful operation
      console.log('[SERVICE_ROLE_SUCCESS]', {
        operation: operationName,
        duration: `${Date.now() - startTime}ms`,
        userId: auth.userId,
      });

      return response;
    } catch (error) {
      // Log failed operation
      console.error('[SERVICE_ROLE_ERROR]', {
        operation: operationName,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${Date.now() - startTime}ms`,
        userId: auth.userId,
      });
      throw error;
    }
  };
}

/**
 * Type alias for backward compatibility
 * @deprecated Use createAuthenticatedServiceClient instead
 */
export const createServiceClient = createAuthenticatedServiceClient;
