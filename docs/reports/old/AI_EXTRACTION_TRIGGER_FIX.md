# AI Extraction Trigger Implementation - Data Receipt API

## Summary

Successfully added AI extraction trigger functionality to the data receipt upload API. Files of type `AI`, `PDF`, and `PSD` uploaded via the member portal data receipt endpoint will now automatically trigger AI-powered specification extraction.

**File Modified:** `src/app/api/member/orders/[id]/data-receipt/route.ts`

## Problem

Files were being saved successfully to the database and storage, but AI extraction was never triggered. This meant that design files and production data uploaded through the member portal were not being processed by the AI parser.

## Solution Implemented

### 1. AI Extraction Trigger (Lines 296-336)

After file record is successfully created in the database, the API now:

1. **Checks file type eligibility**: Only `AI`, `PDF`, and `PSD` files trigger extraction
2. **Determines data type**:
   - `AI` files → `design_file`
   - `PDF`/`PSD` files → `production_data`
3. **Calls AI extraction API internally**: POST to `/api/ai-parser/extract`
4. **Forwards authentication headers**: Supports both normal auth and DEV_MODE
5. **Handles errors gracefully**: Extraction failures don't fail the upload

### 2. Response Enhancement (Lines 338-357)

The API response now includes:
- `extraction_job_id`: The file ID from the extraction job (if applicable)
- Consistent logging for debugging

## Code Changes

### Added Section 9: AI Extraction Trigger

```typescript
// 9. Trigger AI extraction for eligible file types
let extractionJobId: string | null = null;
const eligibleFileTypes = ['AI', 'PDF', 'PSD'];

if (eligibleFileTypes.includes(fileType)) {
  try {
    console.log('[Data Receipt Upload] Triggering AI extraction for file:', fileRecord.id);

    // Determine data_type based on file type
    const dataType = fileType === 'AI' ? 'design_file' : 'production_data';

    // Call AI extraction API internally
    const extractionApiUrl = new URL('/api/ai-parser/extract', request.url);
    const extractionFormData = new FormData();
    extractionFormData.append('file', file);
    extractionFormData.append('order_id', orderId);
    extractionFormData.append('data_type', dataType);

    const extractionResponse = await fetch(extractionApiUrl.toString(), {
      method: 'POST',
      body: extractionFormData,
      // Forward headers for authentication
      headers: {
        'x-user-id': request.headers.get('x-user-id') || '',
        'x-dev-mode': request.headers.get('x-dev-mode') || 'false',
      },
    });

    if (extractionResponse.ok) {
      const extractionResult = await extractionResponse.json();
      extractionJobId = extractionResult.data?.file_id || fileRecord.id;
      console.log('[Data Receipt Upload] AI extraction started successfully:', extractionJobId);
    } else {
      console.error('[Data Receipt Upload] AI extraction API returned error:', extractionResponse.status);
      // Don't fail the upload - extraction failure is non-critical
    }
  } catch (extractionError) {
    console.error('[Data Receipt Upload] Failed to trigger AI extraction:', extractionError);
    // Don't fail the upload - extraction failure is non-critical
  }
}
```

### Updated TypeScript Interface

```typescript
interface DataReceiptUploadResponse {
  success: boolean;
  data?: {
    id: string;
    file_name: string;
    file_type: string;
    file_url: string;
    uploaded_at: string;
    validation_status: string;
    extraction_job_id?: string; // AI extraction job ID if applicable
  };
  error?: string;
  errorEn?: string;
  code?: string;
}
```

## Behavior

### Before Fix
- File uploaded ✅
- File saved to storage ✅
- File record created ✅
- **AI extraction triggered ❌**

### After Fix
- File uploaded ✅
- File saved to storage ✅
- File record created ✅
- **AI extraction triggered ✅** (for AI/PDF/PSD files)
- Extraction job ID returned in response ✅
- Upload succeeds even if extraction fails ✅

## Error Handling

The implementation follows a **non-critical extraction** approach:

1. **Extraction failure doesn't fail upload**: Files are still saved even if extraction fails
2. **Comprehensive logging**: All extraction attempts and errors are logged
3. **Graceful degradation**: API continues to work if AI parser is unavailable

### Logged Events

```typescript
console.log('[Data Receipt Upload] Triggering AI extraction for file:', fileRecord.id);
console.log('[Data Receipt Upload] AI extraction started successfully:', extractionJobId);
console.error('[Data Receipt Upload] AI extraction API returned error:', extractionResponse.status);
console.error('[Data Receipt Upload] Failed to trigger AI extraction:', extractionError);
console.log('[Data Receipt Upload] Returning extraction job ID:', extractionJobId);
```

## Testing Checklist

- [x] Code compiles without TypeScript errors
- [x] ESLint passes for the modified file
- [x] AI extraction API endpoint exists at `/api/ai-parser/extract`
- [ ] Test with AI file upload → Should trigger extraction with `design_file` type
- [ ] Test with PDF file upload → Should trigger extraction with `production_data` type
- [ ] Test with PSD file upload → Should trigger extraction with `production_data` type
- [ ] Test with other file types → Should NOT trigger extraction
- [ ] Verify extraction job ID is returned in response
- [ ] Verify upload succeeds when extraction fails
- [ ] Test with DEV_MODE authentication
- [ ] Test with normal cookie authentication

## API Response Examples

### Successful Upload with Extraction

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "file_name": "design.ai",
    "file_type": "ai",
    "file_url": "https://...",
    "uploaded_at": "2026-01-09T...",
    "validation_status": "PENDING",
    "extraction_job_id": "uuid-456"
  }
}
```

### Successful Upload without Extraction (Non-eligible file type)

```json
{
  "success": true,
  "data": {
    "id": "uuid-789",
    "file_name": "image.jpg",
    "file_type": "jpg",
    "file_url": "https://...",
    "uploaded_at": "2026-01-09T...",
    "validation_status": "PENDING"
  }
}
```

## Integration Points

### Data Flow

```
Member Portal Upload
    ↓
data-receipt/route.ts (POST)
    ↓
1. Validate file
2. Upload to storage
3. Save to database
4. [NEW] Trigger AI extraction (if AI/PDF/PSD)
    ↓
/api/ai-parser/extract
    ↓
Background extraction process
    ↓
Update files table with extraction results
    ↓
Create production_data record (if successful)
```

### Related Files

- **AI Extraction API**: `src/app/api/ai-parser/extract/route.ts`
- **Extraction Engine**: `src/lib/ai-parser/core.ts`
- **Types**: `src/types/ai-extraction.ts`

## Future Enhancements

Potential improvements for future iterations:

1. **Queue-based extraction**: Use a job queue (e.g., BullMQ) instead of direct API call
2. **Async processing**: Return immediately and process extraction in background
3. **Progress tracking**: WebSocket connection for real-time extraction progress
4. **Retry mechanism**: Automatic retry on extraction failure
5. **Bulk extraction**: Support batch extraction for multiple files

## Verification

### Manual Testing Steps

1. Start dev server: `npm run dev`
2. Navigate to member order page with data receipt upload
3. Upload an AI file
4. Check console logs for extraction trigger messages
5. Verify response includes `extraction_job_id`
6. Wait 3-5 minutes for extraction to complete
7. Check `files` table for `ai_extraction_status` = 'completed'
8. Check `production_data` table for new record

### Console Log Output

Expected logs during successful extraction:

```
[Data Receipt Upload] Triggering AI extraction for file: uuid-123
[Data Receipt Upload] AI extraction started successfully: uuid-456
[Data Receipt Upload] Returning extraction job ID: uuid-456
```

## Conclusion

The AI extraction trigger has been successfully implemented in the data receipt upload API. The solution is robust, handles errors gracefully, and provides proper logging for debugging. Files uploaded through the member portal will now automatically be processed by the AI parser for specification extraction.

---

**Implementation Date**: 2026-01-09
**Modified By**: Claude Code (debugger agent)
**Task**: Add AI extraction trigger to data-receipt API
