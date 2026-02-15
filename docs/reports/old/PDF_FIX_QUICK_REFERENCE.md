# PDF Generation Fix - Quick Reference

## What Was Fixed

✅ **ESM Package Build Warning** - Removed `@react-pdf/renderer` re-export from main excel module

## The Fix

**File**: `src/lib/excel/index.ts`

```typescript
// REMOVED: export * from './pdfConverter';
// ADDED: Comment explaining why
```

## How to Use PDF Generation

### ✅ Correct: Use API Routes

```typescript
// Client-side: Call API endpoint
const response = await fetch('/api/quotation/pdf', {
  method: 'POST',
  body: JSON.stringify({ data: quotationData }),
  headers: { 'Content-Type': 'application/json' },
});

// Server-side API route: Import directly
import { generatePdfBuffer, validatePdfData } from '@/lib/excel/pdfConverter';
```

### ❌ Wrong: Import in Client Components

```typescript
// DON'T DO THIS - Causes build issues
import { generatePdfBuffer } from '@/lib/excel'; // ❌

// DON'T DO THIS - Imports ESM package
import { generatePdfBuffer } from '@/lib/excel/pdfConverter'; // ❌
```

## API Endpoints

1. **General PDF Generation**: `/api/quotation/pdf`
2. **Member Quotation Export**: `/api/member/quotations/[id]/export`

## File Locations

- **PDF Generator**: `src/lib/excel/pdfConverter.tsx`
- **API Route 1**: `src/app/api/quotation/pdf/route.ts`
- **API Route 2**: `src/app/api/member/quotations/[id]/export/route.ts`
- **Module Index**: `src/lib/excel/index.ts` (does NOT export pdfConverter)

## Why This Matters

- `@react-pdf/renderer` is ESM-only
- Re-exporting from index makes it available to client components
- Client components would fail to bundle ESM packages
- API routes are server-only and can handle ESM packages

## Build Status

✅ Build succeeds with no blocking errors
⚠️  Non-blocking warning remains (expected behavior for ESM packages in server code)

---

**Last Updated**: 2026-01-11
**Status**: Fixed and Verified
