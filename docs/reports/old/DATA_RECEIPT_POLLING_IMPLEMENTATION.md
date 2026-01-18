# Data Receipt Upload Polling Implementation

**Date:** 2026-01-09
**Component:** `DataReceiptUploadClient.tsx`
**Status:** ✅ Complete

## Overview

Added automatic status polling to the DataReceiptUploadClient component to display AI extraction results in real-time after file upload.

## Changes Made

### 1. New State Variables

```typescript
const [isPolling, setIsPolling] = useState(false);
const [pollingRetries, setPollingRetries] = useState(0);
const [extractionResults, setExtractionResults] = useState<Record<string, any>>({});
```

### 2. Polling Configuration

- **POLLING_INTERVAL:** 5000ms (5 seconds)
- **MAX_POLL_RETRIES:** 60 attempts (5 minutes maximum)
- **Triggers:** Files with status 'pending' or 'processing'
- **Auto-stop:** When all extractions complete or max retries reached

### 3. Polling Logic

Added `useEffect` hook that:
- Checks for files with pending/processing AI extraction status
- Automatically polls the API every 5 seconds
- Fetches updated file list from `/api/member/orders/${order.id}/data-receipt`
- Detects status changes from processing/pending to completed
- Automatically fetches extraction details when completed
- Stops polling when all extractions are done or max retries reached
- Cleans up interval on component unmount

### 4. Extraction Details Fetching

New function `fetchExtractionDetails(fileId: string)`:
- Fetches extraction results from `/api/member/orders/${order.id}/data-receipt/files/${fileId}/extraction`
- Stores results in state keyed by file ID
- Called automatically when file status changes to 'completed'

### 5. UI Enhancements

#### Polling Status Indicator
```tsx
{isPolling && (
  <div className="flex items-center space-x-2 text-sm text-blue-600">
    <svg className="h-4 w-4 animate-spin">...</svg>
    <span>AI抽出結果を確認中...</span>
  </div>
)}
```

#### Enhanced Status Badges
- **Pending:** Gray badge (待機中)
- **Processing:** Yellow badge with pulse animation (AI抽出中)
- **Completed:** Green badge (AI抽出完了)
- **Failed:** Red badge (AI抽出失敗)

#### Extraction Results Preview
Shows compact preview of extracted specifications:
- Dimensions (サイズ)
- Material (素材)
- Quantity (数量)
- Confidence score (信頼度)

## User Experience Flow

1. **User uploads file** → Status shows "待機中" (Pending)
2. **Polling starts** → "AI抽出結果を確認中..." indicator appears
3. **Processing** → Status changes to "AI抽出中" with pulse animation
4. **Extraction completes** → Status changes to "AI抽出完了" (green badge)
5. **Results displayed** → Compact preview appears below file info
6. **Auto-stop** → Polling indicator disappears, user can view full results

## API Endpoints Used

### Polling Endpoint
```
GET /api/member/orders/${order.id}/data-receipt
```
Returns list of files with updated `aiExtractionStatus`

### Extraction Details Endpoint
```
GET /api/member/orders/${order.id}/data-receipt/files/${fileId}/extraction
```
Returns detailed extraction results with specifications

## Performance Considerations

- **Polling interval:** 5 seconds balances responsiveness with server load
- **Max retries:** 5-minute timeout prevents indefinite polling
- **Cleanup:** Interval cleared on component unmount to prevent memory leaks
- **Conditional polling:** Only polls when files need processing

## Accessibility

- Semantic status badges with clear Japanese labels
- Animated loading indicator for active polling
- Visual feedback for all status changes
- Keyboard-accessible action buttons

## Testing Checklist

- [x] No TypeScript errors
- [x] Polling starts when files have pending/processing status
- [x] Polling stops when all extractions complete
- [x] Polling stops after max retries (60 attempts)
- [x] Extraction results fetched and displayed
- [x] UI updates correctly with status changes
- [x] Component cleanup works on unmount

## Future Enhancements

Possible improvements:
- WebSocket integration for real-time updates (instead of polling)
- Configurable polling interval via user preferences
- Retry logic with exponential backoff on network errors
- Progress percentage for extraction processing
- Batch processing status for multiple files

## Files Modified

- `src/components/orders/DataReceiptUploadClient.tsx`

## Dependencies

No new dependencies added - uses existing React hooks and fetch API.
