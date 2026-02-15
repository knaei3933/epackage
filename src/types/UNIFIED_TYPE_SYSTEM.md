# Unified Order Status Type System

## Overview

A comprehensive type system for order status management across the B2B order workflow. This system bridges the database schema (10-step workflow) and UI requirements (7-step display) while providing type safety, validation, and multilingual support.

## Files Created/Modified

### 1. **`src/types/order-status.ts`** (NEW)
   - **Purpose**: Single source of truth for all order status types
   - **Size**: ~570 lines
   - **Exports**:
     - Types: `OrderStatus`, `OrderStatusLegacy`, `ProductionSubStatus`
     - Constants: `ORDER_STATUS_LABELS`, `PRODUCTION_SUB_STATUS_LABELS`
     - Mapping: `OrderStatusMapping`
     - Validation: `VALID_STATUS_TRANSITIONS`, `isValidStatusTransition()`
     - Type guards: `isOrderStatus()`, `isProductionStatus()`, etc.
     - Utilities: `getStatusLabel()`, `getStatusProgress()`, etc.

### 2. **`src/types/database.ts`** (MODIFIED)
   - **Changes**:
     - Removed inline `OrderStatus` type definition (~110 lines)
     - Removed inline `OrderStatusLegacy` type definition
     - Removed inline `OrderStatusLabels` constant
     - Removed inline `OrderStatusMapping` utilities
     - **Added**: Import/re-export from `order-status.ts`
   - **Backward Compatibility**: Maintained via re-exports

### 3. **`src/types/dashboard.ts`** (MODIFIED)
   - **Changes**:
     - Updated import to use `order-status.ts` instead of `database.ts`
     - Re-exported all types and utilities for convenience
   - **Backward Compatibility**: Full

### 4. **`src/types/order-status.demo.ts`** (NEW - Optional)
   - **Purpose**: Usage examples and documentation
   - **Can be deleted**: After reviewing examples

## Key Features

### 1. **Type-Safe Status Definitions**

```typescript
// 10-step B2B workflow
export type OrderStatus =
  | 'PENDING'           // 登録待
  | 'QUOTATION'         // 見積作成
  | 'DATA_RECEIVED'     // データ入稿
  | 'WORK_ORDER'        // 作業標準書
  | 'CONTRACT_SENT'     // 契約書送付
  | 'CONTRACT_SIGNED'   // 契約署名完了
  | 'PRODUCTION'        // 製造中
  | 'STOCK_IN'          // 入庫完了
  | 'SHIPPED'           // 出荷完了
  | 'DELIVERED'         // 配送完了
  | 'CANCELLED';        // キャンセル

// Legacy 7-step UI (backward compatibility)
export type OrderStatusLegacy =
  | 'pending' | 'processing' | 'manufacturing'
  | 'ready' | 'shipped' | 'delivered' | 'cancelled';

// Production sub-stages (9 steps)
export type ProductionSubStatus =
  | 'design_received' | 'work_order_created' | 'material_prepared'
  | 'printing' | 'lamination' | 'slitting' | 'pouch_making'
  | 'qc_passed' | 'packaged';
```

### 2. **Multilingual UI Labels**

```typescript
ORDER_STATUS_LABELS['PRODUCTION'] = {
  ja: '製造中',
  ko: '생산 중',
  en: 'Production',
  description: '製造工程中（9段階）',
  category: 'production',
};

// Usage
getStatusLabel('PRODUCTION', 'ja'); // "製造中"
getStatusLabel('PRODUCTION', 'ko'); // "생산 중"
getStatusLabel('PRODUCTION', 'en'); // "Production"
```

### 3. **Status Transition Validation**

```typescript
// Check if transition is valid
isValidStatusTransition('PENDING', 'QUOTATION'); // true
isValidStatusTransition('DELIVERED', 'PRODUCTION'); // false

// Get allowed next statuses
getNextStatuses('PRODUCTION'); // ['STOCK_IN', 'CANCELLED']
```

### 4. **Progress Calculation**

```typescript
getStatusProgress('PENDING');   // 0
getStatusProgress('QUOTATION'); // 10
getStatusProgress('PRODUCTION');// 70
getStatusProgress('DELIVERED'); // 100
```

### 5. **Type Guards**

```typescript
isProductionStatus('PRODUCTION');  // true
isContractStatus('CONTRACT_SIGNED'); // true
isTerminalStatus('DELIVERED');     // true
isInitialPhase('QUOTATION');       // true
isFulfillmentPhase('SHIPPED');     // true
```

## Usage Examples

### Basic Status Handling

```typescript
import type { OrderStatus } from '@/types/order-status';
import { isValidStatusTransition, getStatusLabel } from '@/types/order-status';

function updateOrderStatus(current: OrderStatus, next: OrderStatus) {
  if (isValidStatusTransition(current, next)) {
    // Update database
    // Send notification
    console.log(`Status: ${getStatusLabel(next, 'ja')}`);
  }
}
```

### Legacy Compatibility

```typescript
import { OrderStatusMapping } from '@/types/order-status';

// Convert legacy to new
const newStatus = OrderStatusMapping.toUppercase('pending'); // 'PENDING'

// Convert new to legacy
const legacyStatus = OrderStatusMapping.toLowercase('PRODUCTION'); // 'manufacturing'
```

### Production Sub-Status

```typescript
import type { ProductionSubStatus } from '@/types/order-status';
import { getProductionSubStatusLabel } from '@/types/order-status';

const subStatus: ProductionSubStatus = 'printing';
console.log(getProductionSubStatusLabel(subStatus, 'ja')); // "印刷"
```

## Migration Guide

### For New Code

```typescript
// Import from unified source
import type { OrderStatus } from '@/types/order-status';
import { getStatusLabel, isValidStatusTransition } from '@/types/order-status';
```

### For Existing Code

No changes required! The system maintains backward compatibility:

```typescript
// Still works (imports from database.ts)
import type { OrderStatus } from '@/types/database';

// Also works (imports from dashboard.ts)
import { getStatusLabel } from '@/types/dashboard';

// Best practice (direct import)
import { getStatusLabel } from '@/types/order-status';
```

## Benefits

1. **Single Source of Truth**: All status definitions in one place
2. **Type Safety**: Compile-time checking of status values
3. **Validation**: Runtime validation of status transitions
4. **Internationalization**: Built-in Japanese/Korean/English labels
5. **Backward Compatibility**: No breaking changes to existing code
6. **Extensibility**: Easy to add new statuses or labels
7. **Documentation**: Self-documenting with JSDoc comments

## Validation

All TypeScript compilation errors are pre-existing (in `specsheet.ts`) and unrelated to these changes. The unified type system compiles successfully and maintains full compatibility with existing code.

## Next Steps

1. Review `order-status.demo.ts` for usage examples
2. Update components to import directly from `order-status.ts` where appropriate
3. Consider removing the demo file after review
4. Test status transitions in your order workflow
5. Extend with additional utilities as needed
