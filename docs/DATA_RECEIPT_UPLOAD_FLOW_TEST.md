# Data Receipt Upload Flow Test Report

**Date:** 2026-01-09
**Tester:** Test Runner Agent
**Test Type:** Complete File Upload Flow for AI Extraction

---

## Executive Summary

This document provides a comprehensive analysis of the data receipt upload flow for AI-powered specification extraction from design files (.ai, .pdf, .psd).

### Test Scope
- File upload interface and user experience
- Security validation using security-validator module
- AI extraction workflow integration
- API endpoint functionality
- Database storage and retrieval

---

## 1. Upload Flow Architecture

### 1.1 Component Stack

```
User Interface Layer:
├── DataReceiptUploadClient.tsx (Client Component)
│   ├── Drag & drop file selection
│   ├── Data type selection (production_data, design_file, specification, other)
│   ├── Progress tracking
│   └── Error/Success display
│
├── AIExtractionPreview.tsx (Modal Component)
│   ├── Display extracted specifications
│   ├── Confidence score visualization
│   ├── Approval/Rejection workflow
│   └── Re-extraction capability
│
└── page.tsx (Server Component)
    ├── Authentication check
    ├── Order validation
    └── Permission check

API Layer:
├── POST /api/member/orders/[id]/data-receipt
│   ├── File upload handler
│   ├── Security validation
│   ├── Storage upload
│   └── Database record creation
│
└── GET /api/member/orders/[id]/data-receipt
    ├── List uploaded files
    └── Return file metadata

AI Extraction Layer:
├── GET /api/ai-parser/extract?fileId={id}
│   └── Retrieve extraction results
│
├── POST /api/ai-parser/approve
│   └── Approve extracted specs
│
├── POST /api/ai-parser/reject
│   └── Reject extraction results
│
└── POST /api/ai-parser/reprocess
    └── Trigger re-extraction
```

---

## 2. File Upload Flow Documentation

### 2.1 Complete User Journey

```
1. User navigates to: /member/orders/[id]/data-receipt
   ├─ Server checks authentication
   ├─ Fetches order details
   └─ Validates order status (pending, processing, manufacturing)

2. User selects file via:
   ├─ Drag & drop
   └─ File picker dialog

3. Client-side validation:
   ├─ File size check (10MB limit)
   └─ File type check (.pdf, .xlsx, .xls, .jpg, .jpeg, .png, .ai, .psd, .eps)

4. User selects data type:
   ├─ 生産データ (production_data)
   ├─ デザインファイル (design_file)
   ├─ 仕様書 (specification)
   └─ その他 (other)

5. User optionally adds description

6. User clicks "アップロード" (Upload)

7. Upload to API:
   ├─ POST /api/member/orders/[id]/data-receipt
   ├─ FormData: { file, data_type, description }
   └─ Progress tracking (0% → 100%)

8. Server-side processing:
   ├─ Authentication (cookie + DEV_MODE support)
   ├─ Order ownership verification
   ├─ Security validation (magic number, malicious patterns)
   ├─ Storage upload (production-files bucket)
   ├─ Database record creation (files table)
   └─ Response with file metadata

9. Success display:
   └─ "ファイルをアップロードしました" message

10. File list updates:
    ├─ Shows uploaded file
    ├─ Displays file metadata
    ├─ Shows AI extraction status badge
    └─ Provides download link
```

### 2.2 Security Validation Flow

```
File Upload → quickValidateFile()
             ├─ Magic Number Check
             │  └─ Verifies file signature matches extension
             ├─ File Size Check
             │  └─ Enforces 10MB limit
             ├─ Malicious Content Scan
             │  ├─ XSS patterns
             │  ├─ SQL injection patterns
             │  ├─ Path traversal patterns
             │  └─ Shell command patterns
             ├─ Executable File Detection
             │  └─ Blocks EXE, ELF, Mach-O files
             └─ Suspicious Extension Check
                └─ Blocks 18 dangerous extensions

✓ Valid → Upload to Storage
✗ Invalid → Return detailed error (Japanese + English)
```

---

## 3. AI Extraction Integration

### 3.1 Extraction Trigger Points

Currently, there are TWO separate AI extraction systems:

**System A: Member Portal (Data Receipt)**
- Location: `/member/orders/[id]/data-receipt`
- Upload Endpoint: `/api/member/orders/[id]/data-receipt`
- Status: **File upload works, AI extraction NOT automatically triggered**
- Issue: Files are saved but AI extraction is not initiated

**System B: Standalone AI Parser**
- Location: `/api/ai-parser/upload`
- Upload Endpoint: `/api/ai-parser/upload`
- Status: **Triggers background extraction**
- Features:
  - Uploads to `ai-uploads` bucket
  - Saves to `ai_uploads` table
  - Calls `startParsingTask()` for background processing

### 3.2 Critical Gap Found

**Problem:** The data receipt upload flow does NOT trigger AI extraction.

**Evidence:**
1. `DataReceiptUploadClient.tsx` only uploads files and displays status
2. `/api/member/orders/[id]/data-receipt` does NOT call AI extraction
3. `AIExtractionPreview.tsx` tries to fetch from `/api/ai-parser/extract?fileId={id}`
4. **But this endpoint expects files in the `ai_uploads` table, not the `files` table**

**Root Cause:**
- Data receipt uses: `files` table (production-files bucket)
- AI parser uses: `ai_uploads` table (ai-uploads bucket)
- **These are SEPARATE systems that don't talk to each other**

---

## 4. Database Schema Analysis

### 4.1 Files Table (Data Receipt)

```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  file_type VARCHAR(10), -- 'AI', 'PDF', 'PSD', 'PNG', 'JPG', 'EXCEL', 'OTHER'
  original_filename TEXT,
  file_url TEXT,
  file_path TEXT,
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  validation_status VARCHAR(20) DEFAULT 'PENDING',

  -- AI extraction fields (NOT POPULATED by data-receipt upload)
  ai_extraction_status VARCHAR(20),
  ai_extraction_data JSONB,
  ai_confidence_score DECIMAL,
  ai_extraction_method VARCHAR(50),
  ai_extracted_at TIMESTAMPTZ,
  ai_validation_errors JSONB
);
```

### 4.2 AI Uploads Table (Standalone Parser)

```sql
CREATE TABLE ai_uploads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  file_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  file_type VARCHAR(10),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Extraction metadata populated by background task
  extraction_status VARCHAR(20),
  extraction_data JSONB,
  confidence_score DECIMAL
);
```

---

## 5. Test Results

### 5.1 Component Functionality

| Component | Status | Notes |
|-----------|--------|-------|
| DataReceiptUploadClient | ✅ Working | File upload, progress, error handling all functional |
| Page routing | ✅ Working | Authentication and order validation working |
| Security validation | ✅ Working | Uses security-validator correctly |
| Storage upload | ✅ Working | Files saved to production-files bucket |
| Database insert | ✅ Working | Records created in files table |
| AI extraction trigger | ❌ NOT WORKING | Not called after upload |
| AI extraction preview | ❌ BROKEN | Can't fetch results (wrong table/endpoint) |

### 5.2 API Endpoint Tests

| Endpoint | Method | Status | Issue |
|----------|--------|--------|-------|
| `/api/member/orders/[id]/data-receipt` | POST | ✅ Working | Upload succeeds |
| `/api/member/orders/[id]/data-receipt` | GET | ✅ Working | Lists files correctly |
| `/api/ai-parser/extract?fileId={id}` | GET | ❌ Not Found | Endpoint exists but queries wrong table |
| `/api/ai-parser/approve` | POST | ❌ Not Testable | Can't approve without extraction |
| `/api/ai-parser/reject` | POST | ❌ Not Testable | Can't reject without extraction |

### 5.3 AI File Support

| File Type | Extension | MIME Type | Magic Number | Upload | Extraction |
|-----------|-----------|-----------|--------------|--------|------------|
| Adobe Illustrator | .ai | application/illustrator | %PDF- or %!PS-Adobe | ✅ | ❌ |
| PDF | .pdf | application/pdf | %PDF- | ✅ | ❌ |
| Photoshop | .psd | application/photoshop | 8BPS | ✅ | ❌ |
| EPS | .eps | application/postscript | %!PS-Adobe | ✅ | ❌ |

---

## 6. Issues Found

### 6.1 Critical Issues

1. **AI Extraction Not Triggered**
   - **Severity:** CRITICAL
   - **Location:** `/api/member/orders/[id]/data-receipt` (POST handler)
   - **Problem:** Files are uploaded but AI extraction is never initiated
   - **Impact:** Users cannot use AI extraction feature from data receipt page
   - **Fix Required:** Add AI extraction trigger after successful upload

2. **Wrong Database Table Queried**
   - **Severity:** CRITICAL
   - **Location:** `/api/ai-parser/extract` (GET handler)
   - **Problem:** Queries `ai_uploads` table but data receipt saves to `files` table
   - **Impact:** AIExtractionPreview component cannot fetch extraction results
   - **Fix Required:** Update extraction endpoint to query `files` table

3. **No AI Extraction API for Files Table**
   - **Severity:** CRITICAL
   - **Location:** `/api/ai-parser/extract` route
   - **Problem:** No API endpoint exists to extract from `files` table records
   - **Impact:** Cannot trigger or retrieve AI extraction for uploaded files
   - **Fix Required:** Create unified extraction API or bridge the two systems

### 6.2 Medium Issues

4. **Duplicate Upload Systems**
   - **Severity:** MEDIUM
   - **Problem:** Two separate upload endpoints with different storage buckets
   - **Impact:** Code duplication, maintenance burden
   - **Recommendation:** Consolidate to single upload system

5. **Missing Error Handling for AI Extraction**
   - **Severity:** MEDIUM
   - **Location:** DataReceiptUploadClient component
   - **Problem:** No retry mechanism if AI extraction fails
   - **Impact:** User must re-upload file if extraction fails
   - **Recommendation:** Add "Retry Extraction" button

### 6.3 Minor Issues

6. **File Type Mismatch**
   - **Severity:** LOW
   - **Location:** DataReceiptUploadClient.tsx:338
   - **Problem:** Accept attribute includes `.ai` but MIME type is not standard
   - **Impact:** Some browsers may not filter .ai files correctly
   - **Recommendation:** Update accept attribute with proper MIME types

---

## 7. Recommended Fixes

### 7.1 Fix AI Extraction Trigger (Priority: CRITICAL)

**File:** `src/app/api/member/orders/[id]/data-receipt/route.ts`

**Add after line 314 (after database insert):**

```typescript
// 9. Trigger AI extraction for design files
if (dataType === 'design_file' || dataType === 'production_data') {
  // Trigger background AI extraction
  triggerAIExtraction(fileRecord.id, orderId, file)
    .catch(error => {
      console.error('[Data Receipt Upload] AI extraction trigger failed:', error);
      // Don't fail the upload if extraction fails
    });
}
```

**Create new function:**

```typescript
/**
 * Trigger AI extraction in background
 */
async function triggerAIExtraction(fileId: string, orderId: string, file: File) {
  try {
    // Import the extraction engine
    const { createExtractionEngine } = await import('@/lib/ai-parser/core');
    const engine = createExtractionEngine();

    // Update status to processing
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase
      .from('files')
      .update({ ai_extraction_status: 'processing' })
      .eq('id', fileId);

    // Perform extraction
    const result = await engine.extractFromFile(file, orderId, fileId);

    // Update with results
    await supabase
      .from('files')
      .update({
        ai_extraction_status: result.status,
        ai_extraction_data: result.data,
        ai_confidence_score: result.validation.confidence.overall,
        ai_extraction_method: result.metadata.extraction_method,
        ai_extracted_at: result.metadata.extracted_at,
        ai_validation_errors: result.validation.errors,
      })
      .eq('id', fileId);

  } catch (error) {
    console.error('AI extraction failed:', error);

    // Update status to failed
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase
      .from('files')
      .update({
        ai_extraction_status: 'failed',
        ai_validation_errors: {
          field: 'extraction',
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'critical',
        },
      })
      .eq('id', fileId);
  }
}
```

### 7.2 Fix Extraction Endpoint (Priority: CRITICAL)

**File:** `src/app/api/ai-parser/extract/route.ts`

**Update to query files table:**

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Query files table instead of ai_uploads
  const { data: file } = await supabase
    .from('files')
    .select('*')
    .eq('id', fileId)
    .single();

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  // Return extraction data
  return NextResponse.json({
    success: true,
    data: {
      specs: file.ai_extraction_data,
      validation: {
        valid: file.ai_validation_errors === null,
        confidence: file.ai_confidence_score || 0,
        errors: file.ai_validation_errors || [],
        warnings: [],
      },
    },
  });
}
```

### 7.3 Add Retry Button (Priority: MEDIUM)

**File:** `src/components/orders/DataReceiptUploadClient.tsx`

**Add to file list actions (around line 486):**

```tsx
{file.aiExtractionStatus === 'failed' && (
  <button
    onClick={() => handleRetryExtraction(file.id)}
    className="text-orange-600 hover:text-orange-800 text-sm font-medium"
  >
    再抽出
  </button>
)}
```

---

## 8. Testing Recommendations

### 8.1 Manual Testing Steps

1. **Test File Upload**
   - Login as member
   - Navigate to order detail
   - Click "データ入稿"
   - Upload .ai file
   - Verify file appears in list
   - Check database for file record

2. **Test AI Extraction (after fixes)**
   - Wait 30 seconds after upload
   - Click "AI抽出結果" button
   - Verify extraction data displays
   - Check confidence score
   - Verify approval/rejection buttons work

3. **Test Error Handling**
   - Upload invalid file (.exe)
   - Verify error message displays
   - Upload oversized file (>10MB)
   - Verify error message displays

### 8.2 Automated Testing

Create E2E test: `tests/data-receipt-upload.spec.ts`

```typescript
test('complete file upload flow with AI extraction', async ({ page }) => {
  // Login
  await page.goto('/member/orders');
  // ... login steps ...

  // Navigate to data receipt
  await page.goto('/member/orders/ORDER_ID/data-receipt');

  // Upload file
  await page.setInputFiles('input[type="file"]', 'test-files/sample.ai');
  await page.selectOption('select[name="dataType"]', 'design_file');
  await page.click('button:has-text("アップロード")');

  // Wait for upload
  await expect(page.locator('text=ファイルをアップロードしました')).toBeVisible();

  // Wait for AI extraction
  await page.waitForTimeout(30000);

  // Check extraction status
  await expect(page.locator('text=AI抽出完了')).toBeVisible();

  // View extraction results
  await page.click('text=AI抽出結果');
  await expect(page.locator('text=AI抽出プレビュー')).toBeVisible();
});
```

---

## 9. Conclusion

### Summary

The data receipt upload flow is **partially functional**:

- ✅ File upload works correctly
- ✅ Security validation is robust
- ✅ Storage and database operations work
- ❌ AI extraction is NOT triggered
- ❌ AI preview component is broken

### Critical Next Steps

1. **Implement AI extraction trigger** in data receipt upload API
2. **Fix extraction endpoint** to query correct table
3. **Test complete flow** with actual .ai files
4. **Add error handling** for extraction failures

### Estimated Fix Time

- AI extraction trigger: 2 hours
- Extraction endpoint fix: 1 hour
- Testing and validation: 2 hours
- **Total: 5 hours**

---

## 10. Appendix

### A. File Reference

| File | Location | Purpose |
|------|----------|---------|
| DataReceiptUploadClient.tsx | src/components/orders/ | Upload UI component |
| AIExtractionPreview.tsx | src/components/orders/ | Extraction results display |
| page.tsx | src/app/member/orders/[id]/data-receipt/ | Server component |
| route.ts | src/app/api/member/orders/[id]/data-receipt/ | Upload API |
| extract/route.ts | src/app/api/ai-parser/ | Extraction retrieval API |

### B. Database Tables

| Table | Purpose | Fields |
|-------|---------|--------|
| files | Data receipt uploads | ai_extraction_status, ai_extraction_data |
| ai_uploads | Standalone AI parser | extraction_status, extraction_data |
| production_data | Extracted specs | extracted_data, confidence_score |

### C. Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| production-files | Data receipt uploads | Public |
| ai-uploads | Standalone parser | Public |
| design-files | Legacy AI parser | Public |

---

**End of Report**
