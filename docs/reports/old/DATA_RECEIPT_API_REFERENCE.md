# Data Receipt API - Quick Reference

## Endpoint
```
POST /api/member/orders/[id]/data-receipt
GET /api/member/orders/[id]/data-receipt
DELETE /api/member/orders/[id]/data-receipt/[fileId]
```

## Authentication Pattern

### ✅ CORRECT Pattern (Current Implementation)
```typescript
import { createServerClient } from '@supabase/ssr';

// 1. Create SSR client with proper cookie handling
const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    get(name: string) {
      return request.cookies.get(name)?.value;
    },
    set(_name: string, _value: string, _options: unknown) {
      // Cookie setting if needed
    },
    remove(_name: string, _options: unknown) {
      // Cookie removal if needed
    },
  },
});

// 2. Get user (validates JWT on every request)
const { data: { user }, error: userError } = await supabase.auth.getUser();

// 3. Check authentication
if (userError || !user?.id) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

// 4. Use user ID
const userId = user.id;
```

### ❌ WRONG Pattern (What NOT to do)
```typescript
// ❌ NEVER DO THIS - access_token is a string, not an object
const session = await supabase.auth.getSession();
const userId = session.data.session?.access_token?.user; // ERROR!

// ❌ NEVER access cookies directly
const cookieStore = await cookies();
const token = cookieStore.get('sb-access-token')?.value;
const userId = JSON.parse(token).user.id; // WRONG!
```

## JWT Token Structure

### What is a JWT Token?
```typescript
// JWT tokens are STRINGS, not objects
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// NOT objects like this:
// ❌ { access_token: { user: {...} } }
```

### How Supabase Handles JWTs
```typescript
// 1. Supabase SDK stores JWT as string in cookies
// 2. getUser() reads and validates the JWT
// 3. Extracts user info from JWT payload
// 4. Returns validated user object

const { data: { user } } = await supabase.auth.getUser();
// user = { id: "...", email: "...", user_metadata: {...} }
```

## DEV_MODE Support

### Middleware Headers
```typescript
// Check for DEV_MODE headers
const devModeUserId = request.headers.get('x-user-id');
const isDevMode = request.headers.get('x-dev-mode') === 'true';

let userId: string;

if (isDevMode && devModeUserId) {
  // DEV_MODE: Use header from middleware
  userId = devModeUserId;
} else {
  // Production: Validate JWT
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  userId = user.id;
}
```

## File Upload Flow

### POST Request
```typescript
// 1. Authenticate (see above)

// 2. Validate order ownership
const { data: order } = await supabase
  .from('orders')
  .select('id, user_id')
  .eq('id', orderId)
  .single();

if (order.user_id !== userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// 3. Parse form data
const formData = await request.formData();
const file = formData.get('file') as File;

// 4. Validate file security
const validationResult = await quickValidateFile(file, MAX_FILE_SIZE);
if (!validationResult.isValid) {
  return NextResponse.json(
    { error: validationResult.errors[0].message_ja },
    { status: 400 }
  );
}

// 5. Upload to storage
const storagePath = `order_data_receipt/${userId}/${orderId}/${timestamp}_${file.name}`;
const { data: uploadData } = await supabase.storage
  .from('production-files')
  .upload(storagePath, fileBuffer);

// 6. Save file metadata
const { data: fileRecord } = await supabase
  .from('files')
  .insert({
    order_id: orderId,
    file_type: 'PDF',
    original_filename: file.name,
    file_url: publicUrl,
    file_path: storagePath,
    uploaded_by: userId,
  })
  .select()
  .single();
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "file_name": "document.pdf",
    "file_type": "pdf",
    "file_url": "https://...",
    "uploaded_at": "2026-01-09T...",
    "validation_status": "PENDING"
  }
}
```

### Error Response
```json
{
  "error": "認証されていません。",
  "errorEn": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

## Security Features

1. **JWT Validation**: Every request validates JWT via `getUser()`
2. **File Security**: Magic number validation, 10MB limit
3. **Ownership Check**: Verifies order belongs to authenticated user
4. **Type Safety**: Full TypeScript coverage
5. **Error Logging**: All errors logged with context

## Common Issues

### Issue: "Cannot read property 'user' of undefined"
```typescript
// ❌ WRONG
const session = await supabase.auth.getSession();
const userId = session.data.session.access_token.user.id;

// ✅ CORRECT
const { data: { user } } = await supabase.auth.getUser();
const userId = user.id;
```

### Issue: "Auth session missing or invalid"
```typescript
// Make sure to use createServerClient with proper cookie handling
const supabase = createServerClient(url, key, {
  cookies: {
    get(name) {
      return request.cookies.get(name)?.value;
    },
  },
});
```

### Issue: Middleware headers not working
```typescript
// Check middleware is setting headers
return NextResponse.next({
  headers: {
    'x-user-id': user.id,
    'x-dev-mode': 'true',
  },
});
```

## Testing

### Manual Testing
```bash
# With DEV_MODE enabled
curl -X POST http://localhost:3000/api/member/orders/123/data-receipt \
  -H "x-dev-mode: true" \
  -H "x-user-id: dev-user-123" \
  -F "file=@test.pdf"

# Without DEV_MODE (requires valid JWT cookie)
curl -X POST http://localhost:3000/api/member/orders/123/data-receipt \
  -H "Cookie: sb-access-token=valid-jwt-token" \
  -F "file=@test.pdf"
```

### Automated Testing
```typescript
// Unit test example
test('should authenticate user', async () => {
  const request = new NextRequest('http://localhost:3000/api/member/orders/123/data-receipt');
  request.headers.set('x-dev-mode', 'true');
  request.headers.set('x-user-id', 'test-user');

  const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
  expect(response.status).toBe(200);
});
```

## Related Documentation

- Supabase SSR: https://supabase.com/docs/guides/auth/server-side/rendering
- Next.js App Router: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- JWT Best Practices: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
