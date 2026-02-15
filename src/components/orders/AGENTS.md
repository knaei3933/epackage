<!-- Parent: ../AGENTS.md -->

# Orders Components Directory

## Purpose

Order management components for the B2B ordering system. This directory provides a comprehensive set of UI components for displaying, managing, and interacting with orders throughout their lifecycle from quotation to delivery.

## Key Files

| Component | Purpose |
|-----------|---------|
| `OrderStatusTimeline.tsx` | Visual timeline showing order status change history with Japanese labels |
| `OrderManagementButtons.tsx` | Unified button container for cancel/modify/reorder actions based on order status |
| `OrderCancelButton.tsx` | Cancel request button with admin approval workflow |
| `OrderModifyButton.tsx` | Order modification dialog for quantity and delivery address changes |
| `ReorderButton.tsx` | Duplicate previous order to create new order |
| `OrderHistoryPDFButton.tsx` | Generate PDF downloads for order history (Japanese business format) |
| `OrderCommentsSection.tsx` | Comment system for order communication between admin/customer |
| `CustomerApprovalSection.tsx` | Customer approval workflow for modification requests |
| `OrderStatusBadge.tsx` | Status display badge with multilingual support (ja/ko/en) |
| `AIExtractionPreview.tsx` | AI-powered specification extraction from uploaded files |
| `DataReceiptUploadClient.tsx` | File upload component with drag-drop and validation |
| `index.ts` | Centralized exports for all order components |

## For AI Agents

### Order Status System

The components use a unified 10-step workflow status system defined in `@/types/order-status`:

```typescript
type OrderStatus =
  | 'QUOTATION_PENDING'       // 見積承認待ち
  | 'QUOTATION_APPROVED'      // 見積承認済
  | 'DATA_UPLOAD_PENDING'     // データ入稿待ち
  | 'DATA_UPLOADED'           // データ入稿完了
  | 'MODIFICATION_REQUESTED'  // 修正承認待ち
  | 'MODIFICATION_APPROVED'   // 修正承認済
  | 'MODIFICATION_REJECTED'   // 修正拒否
  | 'CORRECTION_IN_PROGRESS'  // 校正作業中
  | 'CORRECTION_COMPLETED'    // 校正完了
  | 'CUSTOMER_APPROVAL_PENDING' // 顧客承認待ち
  | 'PRODUCTION'              // 製造中
  | 'READY_TO_SHIP'           // 出荷予定
  | 'SHIPPED'                 // 出荷完了
  | 'CANCELLED';              // キャンセル
```

### Status-Based Component Visibility

Components conditionally render based on order status:

| Action | Allowed Statuses |
|--------|------------------|
| Cancel | PENDING, QUOTATION, DATA_RECEIVED, WORK_ORDER, CONTRACT_SENT |
| Modify | PENDING, QUOTATION, DATA_RECEIVED |
| Reorder | DELIVERED, CANCELLED |
| Data Upload | DATA_UPLOAD_PENDING, DATA_UPLOADED |

### Component Patterns

#### 1. Status-Guarded Actions

```typescript
// Check if action is allowed for current status
const CANCELLABLE_STATUSES = ['PENDING', 'QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER', 'CONTRACT_SENT'];
const canCancel = CANCELLABLE_STATUSES.includes(normalizedStatus);

if (!canCancel) return null; // Don't render button
```

#### 2. Supabase MCP Integration

```typescript
import { getOrderDetails, duplicateOrder, updateOrderItemQuantity } from '@/lib/supabase-mcp';

// Use MCP tools for database operations
const result = await duplicateOrder(orderId);
if (result.error) throw new Error(result.error.message);
```

#### 3. Japanese UI with Date Formatting

```typescript
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// Relative time in Japanese
formatDistanceToNow(date, { addSuffix: true, locale: ja }); // "2日前"
```

#### 4. Memoized Callbacks for Performance

```typescript
const loadComments = useCallback(async () => {
  // Load logic
}, [orderId]);

useEffect(() => {
  loadComments();
}, [loadComments]);
```

### Common Props Interface

```typescript
interface OrderComponentProps {
  orderId: string;                    // Required: Order UUID
  order?: Order;                      // Optional: Full order object
  currentStatus?: string;             // Optional: Current status string
  onActionComplete?: () => void;      // Optional: Callback after action
  fetchFn?: typeof fetch;             // Optional: Custom fetch for admin
  compact?: boolean;                  // Optional: Compact display mode
}
```

### Error Handling Pattern

```typescript
try {
  const response = await fetch(`/api/endpoint`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Operation failed');
  }
  // Success handling
} catch (error) {
  console.error('[ComponentName] Error:', error);
  setError(error instanceof Error ? error.message : 'Unexpected error');
} finally {
  setIsLoading(false);
}
```

## Dependencies

### Internal

- `@/types/order-status` - Unified order status types and labels
- `@/types/dashboard` - Order and OrderItem type definitions
- `@/lib/supabase-mcp` - Supabase MCP wrapper for database operations
- `@/contexts/AuthContext` - User authentication context
- `@/components/ui/*` - Reusable UI components (Button, Card, Badge, etc.)

### External Libraries

- `date-fns` - Date formatting with Japanese locale
- `dompurify` - HTML sanitization for user content
- `jspdf` - PDF generation (lazy loaded)
- `html2canvas` - HTML to canvas conversion (lazy loaded)
- `lucide-react` - Icon set
- `react` - useState, useEffect, useCallback, memo hooks

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/member/orders/[id]/comments` | GET/POST | Comment CRUD |
| `/api/member/orders/[id]/approvals` | GET/PATCH | Approval workflow |
| `/api/member/orders/[id]/data-receipt` | GET/POST | File upload |
| `/api/member/orders/[id]/request-cancellation` | POST | Cancel request |
| `/api/member/ai-extraction/status` | GET | AI extraction status |

## Notes

- All components are client-side (`'use client'` directive)
- Japanese UI labels are hardcoded (no i18n library)
- Status labels follow the unified 10-step workflow
- PDF generation uses dynamic imports to reduce initial bundle size
- Comments support HTML sanitization with DOMPurify
- AI extraction is polled every 5 seconds (max 60 retries = 5 minutes)
