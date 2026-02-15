# Security Best Practices Guide

# セキュリティベストプラクティスガイド

## Table of Contents / 目次

1. [File Upload Security](#file-upload-security)
2. [API Security](#api-security)
3. [Authentication & Authorization](#authentication--authorization)
4. [Data Validation](#data-validation)
5. [SQL Injection Prevention](#sql-injection-prevention)
6. [XSS Prevention](#xss-prevention)
7. [CSRF Protection](#csrf-protection)
8. [Environment Variables](#environment-variables)
9. [Dependency Security](#dependency-security)
10. [Logging & Monitoring](#logging--monitoring)

---

## File Upload Security

### Overview / 概要

File uploads are one of the most common attack vectors in web applications. This guide covers the security measures implemented in Epackage Lab Web.

---

### Core Principles

1. **Never trust file extensions** - Use magic number validation
2. **Limit file sizes** - Enforce maximum upload size
3. **Validate content** - Scan for malicious patterns
4. **Block executables** - Reject all executable file types
5. **Sanitize filenames** - Remove special characters and paths

---

### Implementation

#### Security Validator Module

Location: `src/lib/file-validator/security-validator.ts`

#### Basic Usage

```typescript
import { validateFileSecurity } from '@/lib/file-validator';

async function handleFileUpload(file: File) {
  const result = await validateFileSecurity(file);

  if (!result.isValid) {
    // Handle errors
    result.errors.forEach(error => {
      console.error(`[${error.severity}] ${error.message_en}`);
    });
    return;
  }

  // Process valid file
  await uploadFile(file);
}
```

---

### Security Layers

#### Layer 1: File Size Limits

**Default:** 10MB maximum file size

```typescript
const result = await validateFileSecurity(file, {
  maxSize: 10 * 1024 * 1024  // 10MB
});
```

**Warning Threshold:** 80% of limit (8MB)

**Why:**
- Prevents denial-of-service attacks
- Reduces server load
- Limits storage consumption

---

#### Layer 2: Magic Number Validation

**What:** Verify file signatures, not extensions

**Supported File Types:**
- Images: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO
- Documents: PDF, PSD, AI
- Office: DOC, DOCX, XLS, XLSX, PPT, PPTX

**Example Attack Prevention:**
```typescript
// Attacker renames malicious.exe to innocent.jpg
const file = new File([maliciousBytes], 'photo.jpg');

// Magic number validation detects:
// - Declared type: image/jpeg
// - Actual signature: MZ executable
// Result: REJECTED
```

**Code:**
```typescript
expect(result.fileInfo.declaredType).toBe('image/jpeg');
expect(result.fileInfo.detectedType).toContain('executable');
expect(result.warnings.some(w => w.code === 'TYPE_MISMATCH')).toBe(true);
```

---

#### Layer 3: Malicious Content Detection

**Pattern Categories:**

1. **Script Injection**
   ```javascript
   // Blocked patterns
   <script>alert('XSS')</script>
   <img src=x onerror="alert(1)">
   javascript:void(0)
   ```

2. **SQL Injection**
   ```sql
   -- Blocked patterns
   ' OR '1'='1
   ; DROP TABLE users; --
   UNION SELECT * FROM passwords
   ```

3. **Path Traversal**
   ```
   -- Blocked patterns
   ../../../etc/passwd
   ..\..\..\windows\system32\config\sam
   ```

4. **Shell Commands**
   ```bash
   -- Blocked patterns
   exec("rm -rf /")
   system("cat /etc/passwd")
   eval(base64_decode("..."))
   ```

**Implementation:**
```typescript
// Patterns are checked in file content
const patterns = [
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,  // Event handlers
  /;\s*drop\s+table/gi,
  /\.\.\/|\.\.\\/gi,  // Path traversal
  /exec\s*\(/gi,
  /eval\s*\(/gi,
];
```

---

#### Layer 4: Executable File Blocking

**Blocked Executables:**

| Platform | Signature | Extension |
|----------|-----------|-----------|
| Windows | MZ (4D 5A) | .exe, .dll, .scr, .msi |
| Linux | ELF (7F 45 4C 46) | .so, .bin |
| macOS | Mach-O (FE ED FA CF) | .dylib, .bundle |

**Blocked Extensions:**
```
.exe, .dll, .so, .dylib, .bat, .cmd, .sh, .ps1,
.vbs, .js, .jar, .scr, .msi, .com, .pif, .deb, .rpm, .app
```

**Example:**
```typescript
const exeFile = new File([exeBytes], 'document.pdf.exe');
const result = await validateFileSecurity(exeFile);

// Result: REJECTED - Suspicious extension detected
```

---

#### Layer 5: Archive File Handling

**Supported Archives:** ZIP, RAR, 7Z, TAR, GZ

**Default Behavior:** Warning

**Strict Mode:** Reject all archives

```typescript
// Normal mode - warn but allow
const result = await validateFileSecurity(zipFile);
// Result: WARNING - Archive file detected

// Strict mode - reject
const strictResult = await validateFileSecurity(zipFile, {
  strictMode: true
});
// Result: REJECTED - Archive files not allowed
```

**Why:** Archives can contain malicious files nested inside.

---

### Virus Scanning Integration

**Current Status:** Infrastructure ready, API key required

**Integration Point:** `src/lib/file-validator/security-validator.ts`

```typescript
import { fullValidateFile } from '@/lib/file-validator';

const result = await fullValidateFile(file, {
  apiKey: process.env.VIRUS_SCAN_API_KEY
});

if (result.scanResults?.infected) {
  // Handle infected file
  return;
}
```

**Recommended Services:**
- VirusTotal API
- ClamAV (self-hosted)
- AWS VirusScan (Amazon Inspector)

---

### Client-Side Validation

**Important:** Client-side validation is UX only, not security.

```typescript
'use client';

import { quickValidateFile } from '@/lib/file-validator';

async function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file) return;

  const result = await quickValidateFile(file);

  if (!result.isValid) {
    // Show user-friendly error
    alert(result.errors[0].message_ja);
    return;
  }

  // Upload to server
  await uploadToServer(file);
}
```

**Server-side validation is mandatory** for security.

---

### API Route Implementation

**Example secure upload handler:**

```typescript
// app/api/upload/route.ts
import { validateFileSecurity } from '@/lib/file-validator';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file security
    const result = await validateFileSecurity(file, {
      maxSize: 10 * 1024 * 1024,
      requireMagicNumber: true,
      strictMode: false
    });

    if (!result.isValid) {
      return Response.json({
        error: 'File validation failed',
        details: result.errors
      }, { status: 400 });
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(`${Date.now()}-${file.name}`, file);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ url: data.path });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### File Storage Best Practices

1. **Use dedicated storage service** (Supabase Storage, S3)
2. **Store uploads outside web root**
3. **Generate unique filenames** (UUID or timestamp prefix)
4. **Set appropriate content-type headers**
5. **Implement access controls** (RLS policies)
6. **Regular cleanup** of temporary uploads

```typescript
// Good filename generation
const safeFilename = `${uuidv4()}-${sanitizeFilename(file.name)}`;

// Bad
const filename = file.name;  // Could have path traversal
```

---

### Testing Security Validations

**Test Suite:** `src/lib/file-validator/__tests__/security-validator.test.ts`

**Run tests:**
```bash
npm run test -- security-validator.test.ts
```

**Key test cases:**
```typescript
// Test executable blocking
it('should block Windows executables', async () => {
  const exeBuffer = createBufferWithMagicNumber([0x4D, 0x5A]); // MZ
  const file = createMockFile(exeBuffer, 'document.pdf', 'application/pdf');
  const result = await validateFileSecurity(file);

  expect(result.isValid).toBe(false);
  expect(result.errors.some(e => e.code === 'EXECUTABLE_FILE_DETECTED')).toBe(true);
});

// Test file size limits
it('should reject files over 10MB', async () => {
  const hugeFile = Buffer.alloc(11 * 1024 * 1024);
  const file = createMockFile(hugeFile, 'large.pdf');
  const result = await validateFileSecurity(file);

  expect(result.errors.some(e => e.code === 'FILE_TOO_LARGE')).toBe(true);
});

// Test malicious pattern detection
it('should detect script injection', async () => {
  const maliciousContent = '<script>alert("XSS")</script>';
  const buffer = Buffer.concat([
    createBufferWithMagicNumber([0xFF, 0xD8, 0xFF]), // JPEG header
    Buffer.from(maliciousContent),
  ]);
  const file = createMockFile(buffer, 'image.jpg');
  const result = await validateFileSecurity(file);

  expect(result.errors.some(e => e.code === 'MALICIOUS_CONTENT_DETECTED')).toBe(true);
});
```

---

## API Security

### Authentication Required

All API routes must authenticate requests:

```typescript
// app/api/protected/route.ts
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-access-token');

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token.value);

  if (error || !user) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Process request
  return Response.json({ data: 'protected data' });
}
```

---

### Rate Limiting

**Implementation:** `src/lib/rate-limiter.ts`

```typescript
import { rateLimit } from '@/lib/rate-limiter';

export async function POST(request: Request) {
  // Apply rate limit: 10 requests per minute
  const rateLimitResult = await rateLimit({
    key: request.headers.get('x-forwarded-for') || 'unknown',
    limit: 10,
    window: 60 * 1000  // 1 minute
  });

  if (!rateLimitResult.success) {
    return Response.json({
      error: 'Too many requests',
      retryAfter: rateLimitResult.retryAfter
    }, { status: 429 });
  }

  // Process request
}
```

---

### Input Validation

**Use Zod schemas:**

```typescript
import { z } from 'zod';

const CreateQuotationSchema = z.object({
  customer_id: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1).max(10000),
    unit_price: z.number().positive()
  })).min(1).max(100),
});

export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  const result = CreateQuotationSchema.safeParse(body);

  if (!result.success) {
    return Response.json({
      error: 'Validation failed',
      details: result.error.errors
    }, { status: 400 });
  }

  // Process validated data
  const quotation = await createQuotation(result.data);
  return Response.json(quotation);
}
```

---

## Authentication & Authorization

### Supabase Auth

**Login:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

**Session Management:**
```typescript
// Middleware protection
export async function middleware(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/member/:path*', '/admin/:path*']
};
```

---

### Row Level Security (RLS)

**Enable RLS on all tables:**
```sql
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
```

**Example policies:**
```sql
-- Users can only see their own quotations
CREATE POLICY "Users can view own quotations"
ON quotations
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all quotations
CREATE POLICY "Admins can view all quotations"
ON quotations
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);
```

---

## Data Validation

### Type Safety

**Use TypeScript strict mode:**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

### Database Validation

**Check constraints:**
```sql
ALTER TABLE quotations
ADD CONSTRAINT check_status_valid
CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired'));

ALTER TABLE quotations
ADD CONSTRAINT check_total_positive
CHECK (total_amount >= 0);
```

---

## SQL Injection Prevention

### Use Parameterized Queries

**Good:**
```typescript
const { data } = await supabase
  .from('quotations')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'pending');
```

**Bad:**
```typescript
// NEVER DO THIS - SQL injection risk
const query = `SELECT * FROM quotations WHERE user_id = '${userId}'`;
const result = await db.query(query);
```

---

### Supabase Client Safety

Supabase client automatically prevents SQL injection:

```typescript
// Safe - parameters are escaped
const { data } = await supabase
  .from('products')
  .select('*')
  .ilike('name', `%${searchTerm}%`)
  .gte('price', minPrice);
```

---

## XSS Prevention

### React Auto-Escaping

React automatically escapes content:

```typescript
// Safe - React escapes HTML
const message = '<script>alert("XSS")</script>';
return <div>{message}</div>;  // Displays as text, not executed

// Dangerous - never use dangerouslySetInnerHTML with user input
return <div dangerouslySetInnerHTML={{ __html: userInput }} />;
```

---

### Sanitize User Input

**For rich text editors:**
```typescript
import DOMPurify from 'dompurify';

function RichTextDisplay({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

---

## CSRF Protection

### SameSite Cookies

**Configure in next.config.ts:**
```typescript
export default {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['localhost:3000']
    }
  }
};
```

---

### CSRF Tokens

**For state-changing operations:**
```typescript
import { getCsrfToken } from 'next-auth/react';

// In component
const csrfToken = await getCsrfToken();

// In API route
export async function POST(request: Request) {
  const body = await request.json();
  if (body.csrfToken !== csrfToken) {
    return Response.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
}
```

---

## Environment Variables

### Never Commit Secrets

**.gitignore:**
```
.env.local
.env.production
*.key
*.pem
```

**Use .env.example:**
```bash
# .env.example
SENDGRID_API_KEY=your_sendgrid_api_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

### Runtime Validation

**Validate required variables:**
```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SENDGRID_API_KEY'
] as const;

requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
```

---

## Dependency Security

### Regular Updates

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update packages
npm update
```

---

### Lockfile Commit

**Always commit package-lock.json:**
- Ensures reproducible builds
- Prevents supply chain attacks
- Allows vulnerability scanning

---

### Security Scanning

**Run security audit:**
```bash
npm audit --audit-level=moderate
```

**Use Snyk or Dependabot:**
- Automated vulnerability scanning
- PR checks for security issues
- Dependency update automation

---

## Logging & Monitoring

### Error Logging

```typescript
// lib/audit-logger.ts
export async function logSecurityEvent(event: {
  type: 'auth_failure' | 'suspicious_file' | 'rate_limit';
  userId?: string;
  details: Record<string, unknown>;
}) {
  await supabase.from('security_logs').insert({
    event_type: event.type,
    user_id: event.userId,
    details: event.details,
    ip_address: headers().get('x-forwarded-for'),
    user_agent: headers().get('user-agent'),
    created_at: new Date().toISOString()
  });
}
```

---

### Monitoring Alerts

**Key metrics to monitor:**
- Authentication failures per IP
- File upload rejection rate
- API error rates
- Unusual database query patterns
- Rate limit violations

---

## Security Checklist

### Development

- [ ] All inputs validated with Zod schemas
- [ ] File uploads validated with security validator
- [ ] SQL queries use parameterized statements
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Environment variables validated at startup
- [ ] Authentication required on protected routes
- [ ] Rate limiting on public APIs

### Deployment

- [ ] Environment variables set correctly
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Database RLS enabled
- [ ] CORS policy configured
- [ ] Logging and monitoring active
- [ ] Dependencies audited

### Ongoing

- [ ] Regular dependency updates
- [ ] Security audit reviews
- [ ] Monitor for vulnerabilities
- [ ] Review security logs
- [ ] Update documentation

---

## Security Resources

### Internal Documentation
- [Security Validator API](../api/performance-modules.md)
- [File Validation System](../file-validation-system.md)
- [Code Review Report](../reports/CODE_REVIEW_REPORT.md)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [Web Security Guidelines](https://web.dev/articles/security)

---

**Last Updated:** 2026-01-03
**Version:** 1.0
**Status:** Active
