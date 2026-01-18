# Task 83: DEV_MODE Mock Data Implementation Report

**Date**: 2026-01-04  
**Status**: ✅ Completed  
**File Modified**: `src/lib/dashboard.ts`

---

## Summary

Successfully implemented realistic mock data for all DEV_MODE functions in the dashboard library. This enables developers to test the dashboard interface without requiring a live Supabase database connection.

---

## Changes Made

### 1. `getOrders()` Function (Lines 214-529)

**Before**: Returned empty array
```typescript
return {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};
```

**After**: Returns 8 realistic mock orders with complete order data including:
- Multiple order statuses (PENDING, PROCESSING, PRODUCTION, SHIPPED, DELIVERED, CONTRACT_SIGNED, WORK_ORDER, STOCK_IN)
- Full order items with specifications (size, material, printing, post-processing)
- Delivery addresses with realistic Japanese addresses
- Proper timestamps and shipping/delivery dates
- Total amounts and pricing calculations

**Sample Data**:
- 化粧箱 A4サイズ (150,000 JPY)
- 段ボール箱 (280,000 JPY)
- 透明パッケージ (95,000 JPY)
- 高級ギフトボックス (420,000 JPY)
- 簡易梱包箱 (175,000 JPY)
- 食品包装パック (320,000 JPY)
- ディスプレイボックス (195,000 JPY)
- 輸送用梱包材 (245,000 JPY)

### 2. `getQuotations()` Function (Lines 978-1203)

**Before**: No DEV_MODE handling (directly queried Supabase)

**After**: Returns 8 realistic mock quotations covering all statuses:
- `draft` (2 items)
- `sent` (2 items)
- `approved` (2 items)
- `expired` (1 item)
- `rejected` (1 item)

**Features**:
- Full quotation items with specifications
- Valid until dates
- Order ID references for approved quotations
- Proper timestamp fields (createdAt, updatedAt, sentAt, approvedAt)

### 3. `getDashboardStats()` Function (Lines 1343-1661)

**Before**: Returned empty arrays and zeros
```typescript
return {
  orders: { new: [], processing: [], total: 0 },
  quotations: { pending: [], total: 0 },
  samples: { pending: [], total: 0 },
  inquiries: { unread: [], total: 0 },
  announcements: [],
};
```

**After**: Returns comprehensive mock statistics:

#### Orders
- **New Orders**: 2 items (PENDING, PROCESSING statuses)
- **Processing Orders**: 1 item (PRODUCTION status)
- **Total**: 8 orders

#### Quotations
- **Pending**: 2 items (draft, sent statuses)
- **Total**: 8 quotations

#### Sample Requests
- **Pending**: 2 items (received, processing statuses)
- **Total**: 5 sample requests

#### Inquiries
- **Unread**: 2 items (responded status)
- **Total**: 7 inquiries

#### Announcements
- 3 announcements with different categories:
  - Notice: Year-end business hours
  - Promotion: New product announcement
  - Maintenance: System maintenance notice

---

## Data Quality

### Realistic Japanese Business Data
- **Company Names**: テスト株式会社A, テスト株式会社B, テスト倉庫
- **Addresses**: Valid Japanese postal codes and addresses
  - 東京都千代田区丸の内1-1-1 (100-0001)
  - 東京都渋谷区神宮前1-2-3 (150-0001)
  - 神奈川県横浜市鶴見区大黒町4-5 (230-0001)
- **Phone Numbers**: Valid Japanese formats (03-1234-5678, 045-123-4567)
- **Product Names**: Natural Japanese packaging terminology
- **Specifications**: Appropriate materials (紙製, 段ボール, PET, アルミ箔)

### Data Consistency
- Order IDs match quotation IDs where appropriate
- User IDs are consistent with current authenticated user
- Dates are chronologically logical
- Price calculations are correct (quantity × unitPrice = totalPrice)
- Status transitions follow realistic workflows

---

## Testing Verification

### ESLint Verification
```bash
npx eslint src/lib/dashboard.ts --max-warnings=0
```
✅ **Passed**: No linting errors

### Type Safety
All mock data structures match TypeScript type definitions from:
- `Order` interface
- `Quotation` interface
- `DashboardSampleRequest` interface
- `Inquiry` interface
- `Announcement` interface
- `DeliveryAddress` interface

### Console Logging
DEV_MODE functions now log descriptive messages:
- `[getOrders] DEV_MODE: Returning mock order data`
- `[getQuotations] DEV_MODE: Returning mock quotation data`
- `[getDashboardStats] DEV_MODE: Returning mock stats data`

---

## Benefits

1. **Development Efficiency**: No need for database setup to test UI
2. **Realistic Testing**: Data structure matches production format
3. **Complete Coverage**: All order statuses, quotation statuses represented
4. **Consistent Data**: User IDs, timestamps are logically consistent
5. **Japanese Localization**: Proper Japanese business data for testing

---

## Usage

To enable DEV_MODE:
```bash
# Set environment variable
NEXT_PUBLIC_DEV_MODE=true

# Or add to .env.local
echo "NEXT_PUBLIC_DEV_MODE=true" >> .env.local
```

Then navigate to dashboard pages to see mock data:
- `/member/orders` - Order list with 8 mock orders
- `/member/quotations` - Quotation list with 8 mock quotations
- `/member/dashboard` - Dashboard stats with realistic numbers

---

## Files Modified

- `src/lib/dashboard.ts` (3 functions updated)
  - `getOrders()` - Lines 214-529
  - `getQuotations()` - Lines 978-1203
  - `getDashboardStats()` - Lines 1343-1661

---

## Next Steps (Task 84)

Now that DEV_MODE mock data is complete, Task 84 (견적 시스템 DB 연결) can proceed with:
1. Connecting ImprovedQuotingWizard UI to Supabase
2. Testing quotation creation with real database
3. Implementing quotation → order conversion flow

The mock data structure can serve as a reference for expected database schema and data formats.

---

**Task Status**: ✅ Completed  
**Updated At**: 2026-01-04T16:25:00Z  
**Dependencies Satisfied**: Task 84 is now unblocked
