# API Authentication Middleware Guide

**Created:** 2026-01-02
**Module:** `src/lib/api-middleware.ts`

## Overview

The API authentication middleware provides a centralized way to add authentication and authorization to API routes. It handles:
- Session verification
- Profile validation (role, status)
- Service role key protection
- Consistent error responses

## Quick Start

### Basic Authentication

```typescript
import { withAuth } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

export const POST = withAuth(async (req, session, profile, supabase) => {
  // User is authenticated
  // session.user.id - User ID
  // profile.role - User role (ADMIN, MEMBER, STAFF)
  // profile.status - User status (ACTIVE, PENDING, etc.)

  return NextResponse.json({ success: true });
});
```

### Role-Based Access Control

```typescript
import { withAdmin } from '@/lib/api-middleware';

// Only ADMIN users with ACTIVE status
export const POST = withAdmin(async (req, session, profile, supabase) => {
  // Use service role client (bypasses RLS)
  const { data } = await supabase
    .from('admin_only_table')
    .select('*');

  return NextResponse.json({ data });
});
```

### Member-Only Access

```typescript
import { withMember } from '@/lib/api-middleware';

// Only MEMBER users with ACTIVE status
export const GET = withMember(async (req, session, profile, supabase) => {
  return NextResponse.json({ userId: session.user.id });
});
```

### Custom Authorization

```typescript
import { withAuth } from '@/lib/api-middleware';

// Require ACTIVE status (any role)
export const POST = withAuth(async (req, session, profile, supabase) => {
  return NextResponse.json({ success: true });
}, {
  requireStatus: 'ACTIVE',
  useServiceRole: true
});
```

## API Reference

### `withAuth(handler, options)`

Main wrapper function that adds authentication to API handlers.

**Parameters:**
- `handler`: `(req, session, profile, supabase) => Promise<NextResponse>`
  - `req`: NextRequest object
  - `session`: Authenticated session data
  - `profile`: User profile with role and status
  - `supabase`: Supabase client (route handler or service role)

- `options`: Configuration object
  - `requireRole?: 'ADMIN' | 'MEMBER' | 'STAFF'` - Required role
  - `requireStatus?: 'ACTIVE' | 'PENDING' | 'SUSPENDED'` - Required status
  - `useServiceRole?: boolean` - Use service role client (default: false)

**Returns:**
- `(req: NextRequest) => Promise<NextResponse>` - Wrapped handler

### Convenience Functions

#### `withAdmin(handler, useServiceRole?)`
- Requires: `role === 'ADMIN'` AND `status === 'ACTIVE'`
- Service role: Enabled by default

#### `withMember(handler)`
- Requires: `role === 'MEMBER'` AND `status === 'ACTIVE'`
- Service role: Disabled (uses route handler client)

#### `withAuthAny(handler)`
- Requires: Authenticated user (any role, any status except DELETED/SUSPENDED)
- Service role: Disabled

#### `withActiveUser(handler)`
- Requires: `status === 'ACTIVE'` (any role)
- Service role: Disabled

### Utility Functions

```typescript
import { hasRole, hasAnyRole, hasStatus, isAdmin, isActiveMember } from '@/lib/api-middleware';

// Check role
if (hasRole(profile, 'ADMIN')) {
  // User is admin
}

// Check multiple roles
if (hasAnyRole(profile, ['ADMIN', 'STAFF'])) {
  // User is admin or staff
}

// Check status
if (hasStatus(profile, 'ACTIVE')) {
  // User is active
}

// Convenience checks
if (isAdmin(profile)) {
  // User is admin
}

if (isActiveMember(profile)) {
  // User is active member
}
```

### `createServiceRoleClient()`

Create a service role Supabase client. **⚠️ Only use after authentication!**

```typescript
import { createServiceRoleClient } from '@/lib/api-middleware';

const adminSupabase = createServiceRoleClient();
// Bypasses RLS - use with caution!
```

## Usage Examples

### Example 1: Protected User Data

```typescript
import { withAuth } from '@/lib/api-middleware';
import { NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return withAuth(async (req, session, profile, supabase) => {
    // Get user's own quotations
    const { data } = await supabase
      .from('quotations')
      .select('*')
      .eq('user_id', session.user.id);

    return NextResponse.json({ quotations: data });
  })(req);
}
```

### Example 2: Admin Operations

```typescript
import { withAdmin } from '@/lib/api-middleware';

export async function POST(req: NextRequest) {
  return withAdmin(async (req, session, profile, supabase) => {
    // Update any user (admin operation)
    const { userId } = await req.json();
    const { data } = await supabase
      .from('profiles')
      .update({ role: 'STAFF' })
      .eq('id', userId);

    return NextResponse.json({ success: true, data });
  })(req);
}
```

### Example 3: File Upload with Auth

```typescript
import { withActiveUser } from '@/lib/api-middleware';

export async function POST(req: NextRequest) {
  return withActiveUser(async (req, session, profile, supabase) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    // Upload to user's private folder
    const fileName = `${session.user.id}/${file.name}`;
    const { data } = await supabase.storage
      .from('user-uploads')
      .upload(fileName, file);

    return NextResponse.json({ success: true, path: data.path });
  })(req);
}
```

## Error Responses

The middleware returns consistent error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "error": "認証されていません。ログインしてください。"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "この操作には ADMIN 役割が必要です。"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "ユーザープロファイルが見つかりません。"
}
```

## Security Best Practices

1. **Always authenticate before using service role**
   - The `useServiceRole` option only enables the client AFTER authentication
   - Never expose service role endpoints without auth

2. **Check both role AND status**
   - Suspended/deleted users are automatically blocked
   - Use `requireStatus: 'ACTIVE'` for sensitive operations

3. **Use specific role requirements**
   - Prefer `withAdmin` or `withMember` over `withAuth`
   - Explicit is better than implicit

4. **Log authentication failures**
   - The middleware logs errors to console
   - Consider adding monitoring/alerting

## Migration Guide

### Before (Manual Auth)

```typescript
export async function POST(req: NextRequest) {
  // Manual auth check
  const supabaseAuth = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabaseAuth.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabaseAuth
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use service role
  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
  // ... API logic
}
```

### After (Using Middleware)

```typescript
export const POST = withAdmin(async (req, session, profile, supabase) => {
  // supabase is already a service role client
  // ... API logic
});
```

## Notes

- **Public APIs**: Don't use middleware for public endpoints (contact, samples, etc.)
- **Next.js Middleware**: This is different from `src/middleware.ts` (Edge middleware for route protection)
- **Type Safety**: The module is fully typed with TypeScript
- **Error Handling**: All errors are caught and return consistent responses

## Related Files

- `src/middleware.ts` - Next.js Edge middleware (route-level protection)
- `src/lib/supabase.ts` - Supabase client configuration
- `src/types/database.ts` - Database type definitions
