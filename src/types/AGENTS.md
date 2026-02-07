# src/types/ - TypeScript Type Definitions

<!-- Parent: ../AGENTS.md -->

## Purpose

Centralized TypeScript type definitions for the entire application. This directory provides the single source of truth for all data structures, database schemas, API contracts, and domain models used across the B2B ordering system.

## Architecture Overview

```
src/types/
├── database.ts          # Supabase database schema (generated + manual)
├── auth.ts              # Authentication & user management types
├── dashboard.ts         # Dashboard & order management types
├── order-status.ts      # Unified order status system
├── portal.ts            # B2B portal-specific types
├── archives.ts          # Archive/case study types
├── email.ts             # Email template types
└── AGENTS.md           # This file
```

## Key Files

### database.ts
**Primary database schema definition** - 1,535 lines

- **Supabase-generated types**: Complete table definitions for `public` schema
- **Core tables**: `profiles`, `orders`, `quotations`, `order_items`, `delivery_addresses`, `billing_addresses`
- **B2B workflow tables**: `companies`, `contracts`, `work_orders`, `production_logs`, `files`
- **Production system**: `production_jobs`, `production_data`, `spec_sheets`, `inventory`
- **Signature system**: `signatures`, `signature_events`, `hanko_images`
- **Enums**: 30+ enums for status types, categories, and workflow states

**Key Patterns**:
```typescript
export interface Database {
  public: {
    Tables: {
      [table_name]: {
        Row: { /* Database row structure */ }
        Insert: { /* Insertable fields */ }
        Update: { /* Updatable fields */ }
      }
    }
    Views: { /* View definitions */ }
    Functions: { /* Function definitions */ }
    Enums: { /* Enum definitions */ }
  }
}
```

### order-status.ts
**Unified order status system** - 689 lines

- **OrderStatus**: 13-step workflow (QUOTATION_PENDING → SHIPPED)
- **OrderStatusLegacy**: Backward compatibility (7-step)
- **ProductionSubStatus**: 9-stage production breakdown
- **Multilingual labels**: Japanese/Korean/English display names
- **Type-safe transitions**: `VALID_STATUS_TRANSITIONS` mapping
- **Utility functions**: Status guards, progress calculation, label lookup

**Key Patterns**:
```typescript
export type OrderStatus =
  | 'QUOTATION_PENDING'
  | 'QUOTATION_APPROVED'
  | 'DATA_UPLOAD_PENDING'
  | 'DATA_UPLOADED'
  | 'MODIFICATION_REQUESTED'
  | 'MODIFICATION_APPROVED'
  | 'MODIFICATION_REJECTED'
  | 'CORRECTION_IN_PROGRESS'
  | 'CORRECTION_COMPLETED'
  | 'CUSTOMER_APPROVAL_PENDING'
  | 'PRODUCTION'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'CANCELLED';

export const ORDER_STATUS_LABELS: Record<OrderStatus, {
  ja: string;
  ko: string;
  en: string;
  description: string;
  category: 'initial' | 'active' | 'production' | 'final' | 'terminated';
}>;

export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean;
export function getStatusProgress(status: OrderStatus): number; // 0-100
```

### auth.ts
**Authentication & user management** - 353 lines

- **Zod schemas**: `registrationSchema`, `loginSchema`, `forgotPasswordSchema`, `resetPasswordSchema`
- **Business types**: `BusinessType.INDIVIDUAL | CORPORATION`
- **User roles**: `UserRole.ADMIN | MEMBER`
- **User status**: `UserStatus.PENDING | ACTIVE | SUSPENDED | DELETED`
- **Japanese name validation**: Separate kanji/kana fields with regex patterns
- **Phone validation**: At least one phone number required (corporate OR personal)

**Key Patterns**:
```typescript
export const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  kanjiLastName: z.string().regex(/^[\u4E00-\u9FFF\s]+$/),
  kanaLastName: z.string().regex(/^[\u3040-\u309F\s]+$/),
  // ...at least one phone required
}).refine((data) => data.password === data.passwordConfirm)
  .refine((data) => data.corporatePhone || data.personalPhone);

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  // ...profile fields
}
```

### dashboard.ts
**Dashboard & order management** - 381 lines

- **Order types**: `Order`, `OrderItem`, `OrderStatusHistory`
- **Address types**: `DeliveryAddress`, `BillingAddress`
- **Quotation types**: `Quotation`, `QuotationItem`, `QuotationStatus`
- **Sample requests**: `DashboardSampleRequest`, `SampleItem`
- **Inquiries**: `Inquiry`, `InquiryType`, `InquiryStatus`
- **Statistics**: `DashboardStats`, `NotificationBadge`, `PaginatedResponse`
- **Re-exports**: All order-status types and utilities

**Key Patterns**:
```typescript
export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus; // From order-status.ts
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  billingAddress?: BillingAddress;
  // ...timestamps, customer info
}

export interface DashboardStats {
  orders: {
    new: Order[];
    processing: Order[];
    total: number;
  };
  quotations: { pending: Quotation[]; total: number };
  samples: { pending: DashboardSampleRequest[]; total: number };
  // ...B2B integration: contracts, notifications
}
```

### portal.ts
**B2B portal-specific types**

- Portal navigation structures
- Admin panel types
- Member dashboard types
- Workflow-specific interfaces

### archives.ts
**Archive/case study types**

- `Archive`: Product case studies
- `ArchiveCategory`: Category definitions
- `ArchiveTag`: Tag system

### email.ts
**Email template types**

- `EmailTemplate`: Base email structure
- `EmailContext`: Template variables
- Provider-specific types (SendGrid, etc.)

## For AI Agents

### Type System Philosophy

1. **Single Source of Truth**: Database schema is the authoritative source
2. **Type Safety**: All database operations use generated types
3. **Backward Compatibility**: Legacy types maintained during migration
4. **Internationalization**: Multilingual labels for UI display
5. **Validation**: Zod schemas mirror TypeScript types for runtime validation

### Common Type Patterns

#### Database Row Types
```typescript
// Supabase table structure
export interface TableName {
  Row: { /* What you SELECT */ }
  Insert: { /* What you INSERT */ }
  Update: { /* What you UPDATE */ }
}
```

#### Enum Type Definitions
```typescript
// String literal union types
export type StatusType = 'ACTIVE' | 'INACTIVE' | 'PENDING';

// With labels
export const STATUS_LABELS: Record<StatusType, { ja: string; en: string }> = {
  ACTIVE: { ja: 'アクティブ', en: 'Active' },
  // ...
};
```

#### Validation Schema Pattern
```typescript
// Zod schema with custom refinements
export const schema = z.object({
  field: z.string().min(1).max(100),
}).refine((data) => customValidation(data), {
  message: 'Custom error message',
  path: ['field'],
});

export type SchemaType = z.infer<typeof schema>;
```

#### JSON Field Types
```typescript
// Flexible JSON fields with inline documentation
export interface JsonField {
  size?: { width: number; height: number; depth?: number };
  material?: string[];
  printing?: { method: string; colors: number };
  // ...always document expected structure
}
```

### Working with Order Status

The `order-status.ts` module provides a unified type system for all order states:

```typescript
import {
  OrderStatus,
  ORDER_STATUS_LABELS,
  isValidStatusTransition,
  getStatusLabel,
  getStatusProgress,
} from '@/types/order-status';

// Type-safe status transitions
function updateOrderStatus(current: OrderStatus, newStatus: OrderStatus) {
  if (!isValidStatusTransition(current, newStatus)) {
    throw new Error(`Invalid transition: ${current} → ${newStatus}`);
  }
  // Apply transition
}

// Get localized label
const label = getStatusLabel(order.status, 'ja'); // Japanese
const progress = getStatusProgress(order.status); // 0-100
```

### Database Type Imports

When working with Supabase:

```typescript
import type { Database } from '@/types/database';
import type {
  Orders,
  Quotations,
  OrderItems,
  Profile,
} from '@/types/database';

// Type-safe database queries
type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];

// With Supabase client
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .eq('id', orderId)
  .single<OrderRow>();
```

### Adding New Types

1. **Database changes**: Update `database.ts` after schema migration
2. **Domain types**: Add to appropriate domain file (auth, dashboard, etc.)
3. **Shared types**: Use `database.ts` for cross-cutting concerns
4. **Zod schemas**: Keep validation schemas in sync with types
5. **Documentation**: Always add JSDoc comments for complex types

### Type Maintenance

- **After migrations**: Regenerate database types from Supabase
- **Status changes**: Update `order-status.ts` (single source of truth)
- **Validation sync**: Keep Zod schemas aligned with TypeScript types
- **Deprecation**: Use `@deprecated` JSDoc tags for legacy types

## Dependencies

### Internal
- `@/types/order-status`: Order status system (used by database, dashboard)
- `@/lib/pricing`: Pricing calculation types (shared with pricing engine)
- `@/lib/supabase`: Supabase client utilities

### External
- `zod`: Runtime validation schemas
- `@supabase/supabase-js`: Supabase client types
- `next/navigation`: Next.js navigation types

## Type Safety Guarantees

1. **Database operations**: Generated types prevent SQL errors
2. **API responses**: Typed API contracts
3. **Form validation**: Zod schemas match TypeScript types
4. **Status transitions**: Type-safe workflow progression
5. **Internationalization**: Localized labels for all user-facing strings

## Related Files

- **Schema migrations**: `supabase/migrations/` - Source of database types
- **API routes**: `src/app/api/` - Uses these types for request/response
- **Components**: `src/components/` - Consumes types for props/state
- **Libraries**: `src/lib/` - Utility functions using these types

## Conventions

- **Naming**: PascalCase for interfaces, camelCase for properties
- **Timestamps**: `created_at`, `updated_at` (PostgreSQL convention)
- **JSON fields**: `Json` type from database.ts
- **Enums**: String literal unions, not `enum` keyword
- **Optional fields**: Use `| null` for database NULL, not `undefined`
- **IDs**: Always `string` (UUID format)
