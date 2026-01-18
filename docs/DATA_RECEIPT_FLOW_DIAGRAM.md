# Data Receipt Upload Flow - Visual Diagram

## Current Flow (BROKEN)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User navigates to /member/orders/[id]/data-receipt              │
│     │                                                                │
│     ├─► Authentication check (requireAuth)                          │
│     ├─► Order validation (getOrderById)                             │
│     └─► Permission check (order status)                             │
│                                                                      │
│  2. User uploads file                                               │
│     │                                                                │
│     ├─► Select file (drag-drop or picker)                           │
│     ├─► Select data type (design_file, production_data, etc.)       │
│     ├─► Click "アップロード" (Upload)                               │
│     │                                                                │
│     └─► POST /api/member/orders/[id]/data-receipt                   │
│         FormData: { file, data_type, description }                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINT                                    │
│  POST /api/member/orders/[id]/data-receipt                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Authentication                                                   │
│     ├─► Cookie-based auth                                           │
│     └─► DEV_MODE header support                                     │
│                                                                      │
│  2. Authorization                                                   │
│     ├─► Verify order exists                                         │
│     └─► Check user owns order                                       │
│                                                                      │
│  3. Validation                                                      │
│     ├─► quickValidateFile(file, 10MB)                               │
│     │   ├─► Magic number check                                      │
│     │   ├─► File size check                                         │
│     │   ├─► Malicious content scan                                  │
│     │   ├─► Executable file detection                               │
│     │   └─► Suspicious extension check                              │
│     └─► Return error if invalid                                     │
│                                                                      │
│  4. Storage Upload                                                  │
│     ├─► Generate path: order_data_receipt/{userId}/{orderId}/...    │
│     ├─► Upload to production-files bucket                           │
│     └─► Get public URL                                              │
│                                                                      │
│  5. Database Insert                                                 │
│     ├─► Insert into files table:                                    │
│     │   {                                                            │
│     │     order_id, file_type, original_filename,                   │
│     │     file_url, file_path, file_size_bytes,                     │
│     │     uploaded_by, validation_status: 'PENDING',                │
│     │     ai_extraction_status: NULL  ← NOT SET!                    │
│     │   }                                                            │
│     └─► Return file metadata                                        │
│                                                                      │
│  ❌ AI EXTRACTION NOT TRIGGERED!                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (UPDATED)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  3. Display success                                                 │
│     └─► "ファイルをアップロードしました"                             │
│                                                                      │
│  4. Update file list                                                │
│     ├─► Load files via GET /api/member/orders/[id]/data-receipt     │
│     └─► Display file with:                                           │
│         ├─► File name                                               │
│         ├─► Size, type, date                                        │
│         ├─► Download link                                           │
│         └─► "AI抽出結果" button  ← CLICKABLE                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ User clicks "AI抽出結果"
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AI EXTRACTION PREVIEW MODAL                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Load extraction results                                         │
│     │                                                                │
│     └─► GET /api/ai-parser/extract?fileId={id}                      │
│         │                                                            │
│         ├─► Query ai_uploads table  ← WRONG TABLE!                  │
│         │   (should query files table)                              │
│         │                                                            │
│         └─► Return 404 Not Found  ← ERROR!                          │
│                                                                      │
│  2. Display error                                                   │
│     └─► "読み込みに失敗しました" (Failed to load)                   │
│                                                                      │
│  ❌ CANNOT DISPLAY EXTRACTION RESULTS!                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Fixed Flow (PROPOSED)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User navigates to /member/orders/[id]/data-receipt              │
│  2. User uploads file (.ai, .pdf, .psd)                             │
│  3. User selects data type: "design_file"                           │
│  4. User clicks "アップロード" (Upload)                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API ENDPOINT (UPDATED)                          │
│  POST /api/member/orders/[id]/data-receipt                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1-4. Same as before (Auth, Validation, Storage, DB)                │
│                                                                      │
│  5. ⭐ NEW: Trigger AI Extraction (background)                      │
│     │                                                                │
│     └─► triggerAIExtraction(fileId, orderId, file)                  │
│         │                                                            │
│         ├─► Update files.ai_extraction_status = 'processing'        │
│         │                                                            │
│         ├─► engine.extractFromFile(file, orderId, fileId)           │
│         │   ├─► Parse .ai file structure                            │
│         │   ├─► Extract dimensions, material, colors                │
│         │   ├─► Extract print specs                                 │
│         │   ├─► Calculate confidence score                          │
│         │   └─► Validate extracted data                             │
│         │                                                            │
│         ├─► Update files table:                                     │
│         │   {                                                        │
│         │     ai_extraction_status: 'completed',                    │
│         │     ai_extraction_data: { specs... },                     │
│         │     ai_confidence_score: 0.85,                            │
│         │     ai_extraction_method: 'ai_parser',                    │
│         │     ai_extracted_at: NOW(),                               │
│         │     ai_validation_errors: []                              │
│         │   }                                                        │
│         │                                                            │
│         └─► Return file metadata immediately (async extraction)     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (UPDATED)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  3. Display success                                                 │
│     └─► "ファイルをアップロードしました"                             │
│                                                                      │
│  4. Update file list (auto-refresh)                                 │
│     └─► Show file with:                                             │
│         ├─► File metadata                                           │
│         ├─► "AI抽出中" badge (yellow) ← PROCESSING                  │
│         └─► "AI抽出完了" badge (green) ← COMPLETED                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ User waits ~30 seconds
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   AI EXTRACTION PREVIEW MODAL                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Load extraction results                                         │
│     │                                                                │
│     └─► GET /api/ai-parser/extract?fileId={id}                      │
│         │                                                            │
│         ├─► Query files table  ← CORRECT TABLE!                     │
│         │                                                            │
│         └─► Return:                                                 │
│             {                                                        │
│               success: true,                                        │
│               data: {                                               │
│                 specs: {                                            │
│                   dimensions: { width, height, depth, unit },       │
│                   material: { type, thickness, layers },            │
│                   colors: [{ name, pantone, hex, cmyk }],           │
│                   quantity: 1000,                                   │
│                   features: [...],                                  │
│                   printSpecs: { method, colors, coating }           │
│                 },                                                   │
│                 validation: {                                        │
│                   valid: true,                                      │
│                   confidence: 0.85,                                 │
│                   errors: [],                                       │
│                   warnings: []                                      │
│                 }                                                    │
│               }                                                      │
│             }                                                        │
│                                                                      │
│  2. Display extraction results                                      │
│     ├─► Confidence score: 85% (高)                                  │
│     ├─► Dimensions: 200 × 300 × 50 mm                               │
│     ├─► Material: Corrugated cardboard, E-flute                     │
│     ├─► Colors: Black (#000000), Red (PANTONE 186 C)               │
│     ├─► Print: Offset printing, 4 colors, UV coating                │
│     └─► Quantity: 1,000 sheets                                      │
│                                                                      │
│  3. User actions                                                    │
│     ├─► "承認して作業指示書を作成" (Approve & Create Work Order)     │
│     │   └─► POST /api/ai-parser/approve                             │
│     │       ├─► Validate extraction data                            │
│     │       ├─► Create production_data record                       │
│     │       ├─► Update files.validation_status = 'APPROVED'        │
│     │       └─► Redirect to work order                              │
│     │                                                                │
│     ├─► "拒否" (Reject)                                             │
│     │   └─► POST /api/ai-parser/reject                              │
│     │       ├─► Update files.ai_extraction_status = 'rejected'     │
│     │       └─► Close modal, show reason prompt                     │
│     │                                                                │
│     └─► "再抽出" (Re-extract)                                       │
│         └─► POST /api/ai-parser/reprocess                           │
│             ├─► Trigger extraction again                            │
│             └─► Reload extraction results                           │
│                                                                      │
│  ✅ EXTRACTION WORKS!                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Changes

### Current (BROKEN)

```sql
-- Files table (data receipt uploads)
CREATE TABLE files (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  file_type VARCHAR(10),
  original_filename TEXT,
  file_url TEXT,
  file_path TEXT,
  file_size_bytes BIGINT,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  validation_status VARCHAR(20) DEFAULT 'PENDING',

  -- These fields are NOT populated by data receipt upload!
  ai_extraction_status VARCHAR(20),  -- NULL
  ai_extraction_data JSONB,          -- NULL
  ai_confidence_score DECIMAL,       -- NULL
  ai_extraction_method VARCHAR(50),  -- NULL
  ai_extracted_at TIMESTAMPTZ,       -- NULL
  ai_validation_errors JSONB         -- NULL
);

-- AI uploads table (standalone parser)
CREATE TABLE ai_uploads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  file_name TEXT,
  file_path TEXT,
  file_size BIGINT,
  file_type VARCHAR(10),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Populated by standalone parser only
  extraction_status VARCHAR(20),
  extraction_data JSONB,
  confidence_score DECIMAL
);
```

### Proposed (FIXED)

**Option A: Use files table only (RECOMMENDED)**

```sql
-- No schema changes needed!
-- Just populate the existing fields in the files table

-- When AI extraction completes:
UPDATE files SET
  ai_extraction_status = 'completed',
  ai_extraction_data = '{
    "dimensions": { "width": 200, "height": 300, "unit": "mm" },
    "material": { "type": "Corrugated cardboard", "thickness": "E-flute" },
    "colors": [
      { "name": "Black", "hex": "#000000" },
      { "name": "Red", "pantone": "186 C" }
    ],
    "quantity": 1000,
    "printSpecs": {
      "method": "Offset",
      "colors": 4,
      "coating": "UV"
    }
  }',
  ai_confidence_score = 0.85,
  ai_extraction_method = 'ai_parser_v1',
  ai_extracted_at = NOW(),
  ai_validation_errors = '[]'
WHERE id = 'file_id';
```

**Option B: Bridge tables (if keeping both systems)**

```sql
-- Create view to unify access
CREATE VIEW ai_extraction_results AS
SELECT
  id,
  'files' as source_table,
  ai_extraction_status as status,
  ai_extraction_data as data,
  ai_confidence_score as confidence_score
FROM files
WHERE ai_extraction_status IS NOT NULL

UNION ALL

SELECT
  id,
  'ai_uploads' as source_table,
  extraction_status as status,
  extraction_data as data,
  confidence_score
FROM ai_uploads
WHERE extraction_status IS NOT NULL;
```

---

## API Endpoint Changes

### Current (BROKEN)

```typescript
// GET /api/ai-parser/extract?fileId={id}
export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId');

  // ❌ Queries wrong table!
  const { data } = await supabase
    .from('ai_uploads')  // ← WRONG!
    .select('*')
    .eq('id', fileId)
    .single();

  return NextResponse.json({ data });
}
```

### Proposed (FIXED)

```typescript
// GET /api/ai-parser/extract?fileId={id}
export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId');

  // ✅ Query files table (where data receipt uploads are stored)
  const { data: file } = await supabase
    .from('files')  // ← CORRECT!
    .select('*')
    .eq('id', fileId)
    .single();

  if (!file) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  // Return extraction data in expected format
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

---

## Component Integration

### DataReceiptUploadClient.tsx

```typescript
// Add polling for extraction status
useEffect(() => {
  if (uploadedFiles.some(f => f.aiExtractionStatus === 'processing')) {
    const interval = setInterval(async () => {
      await loadUploadedFiles();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }
}, [uploadedFiles]);
```

### AIExtractionPreview.tsx

```typescript
// Add auto-retry on initial load
useEffect(() => {
  if (isLoading && !extractedData) {
    const timeout = setTimeout(async () => {
      await loadExtractionResults();
    }, 5000); // Retry after 5 seconds

    return () => clearTimeout(timeout);
  }
}, [isLoading, extractedData]);
```

---

**End of Diagram**
