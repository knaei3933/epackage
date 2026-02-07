<!-- Parent: ../AGENTS.md -->
# src/components/member/ Directory

## Purpose

Member portal components for authenticated customer dashboard functionality. These components handle order viewing, design workflow management, specification approvals, and modification requests.

## Directory Structure

```
member/
├── index.ts                          # Public API exports
├── orders/                           # Order-related sub-components
│   ├── PriceDifferenceSummary.tsx    # Price change comparison display
│   └── SpecificationEditModal.tsx    # Specification change modal
├── OrderInfoAccordion.tsx            # Order information accordion (3-column layout)
├── OrderAddressInfo.tsx              # Order delivery address display
├── OrderItemsSummary.tsx             # Order items summary with specifications
├── SpecApprovalModal.tsx             # Specification approval before order conversion
├── SpecApprovalClient.tsx            # Client-side spec approval wrapper
├── DesignWorkflowSection.tsx         # Design workflow visualization (2-column)
├── DesignRevisionsSection.tsx        # Design revision/approval interface
├── ModificationApprovalSection.tsx   # Admin modification approval UI
└── AddressSelectModal.tsx            # Address selection modal
```

## Key Files

### Main Exports (`index.ts`)
```
Order Components:
- OrderInfoAccordion
- OrderAddressInfo
- DesignWorkflowSection
- OrderItemsSummary

Design Components:
- DesignRevisionsSection

Approval Components:
- SpecApprovalClient
- ModificationApprovalSection
```

### Order Display Components

**OrderInfoAccordion.tsx**
- 3-column responsive grid layout (mobile: 1 column, tablet+: 3 columns)
- Displays: order information, customer info, status history
- Integrates: `OrderStatusTimeline`, `OrderStatusBadge`
- Date formatting with Japanese locale using `date-fns`

**OrderItemsSummary.tsx**
- Compact order items display with expandable specifications
- Handles both camelCase and snake_case property names (Admin/Member compatibility)
- Includes bank info for invoice payments
- Specification parsing for materials, printing, post-processing

**OrderAddressInfo.tsx**
- Delivery address display for orders

### Design Workflow Components

**DesignWorkflowSection.tsx**
- 2-column step-by-step workflow visualization
- Step 1: Design file upload (via `OrderFileUploadSection`)
- Step 2: Design proof review (via `DesignRevisionsSection`)
- Automatic step detection based on file/revision status
- Integrated comments section in each step

**DesignRevisionsSection.tsx**
- Design revision viewing and approval
- Status tracking: pending, approved, rejected
- Comment integration for feedback

### Approval & Modification Components

**SpecApprovalModal.tsx**
- Final specification confirmation before quotation-to-order conversion
- Comprehensive specification parsing and display
- Handles material mapping (PET/AL, PET/NY/AL, etc.)
- Post-processing option display with Japanese labels
- Price calculation with tax (10%)

**ModificationApprovalSection.tsx**
- Admin modification request approval interface
- Only visible when `order.status === 'MODIFICATION_REQUESTED'`
- Approve/reject functionality with reason input
- Displays modification reason and comparison

**SpecApprovalClient.tsx**
- Client-side wrapper for specification approval

### Order Subdirectory

**PriceDifferenceSummary.tsx**
- Price change comparison display
- Shows original price, new price, difference amount and percentage
- Color-coded: red for increase, green for decrease
- Optional specification change details
- Warning notices about price changes

**SpecificationEditModal.tsx**
- Post-order specification editing interface
- Supports both admin and customer modes (`isAdmin` flag)
- Real-time price recalculation on specification changes
- API endpoint switching: `/api/admin/orders/...` vs `/api/member/orders/...`
- Dynamic import of auth helpers to avoid circular dependencies
- Comprehensive specification inputs: size, material, printing, post-processing, thickness

## Component Patterns

### Data Compatibility Layer
Many components handle both Admin and Member API responses:

```typescript
// Helper for property name differences
function getOrderValue(order: any, camelCaseKey: string, snakeCaseKey: string): any {
  return order[camelCaseKey] ?? order[snakeCaseKey];
}
```

### Specification Parsing
Complex specification parsing with multiple fallback paths:

```typescript
// Example from SpecApprovalModal.tsx
const width = pattern.width || pattern.bag?.width || pattern.size?.width ||
              pattern.dimensions?.width || pattern.quotationItem?.width || '-';
```

### Responsive Layout Patterns
- Mobile-first approach with `md:` and `lg:` breakpoints
- Grid-based layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Consistent spacing: `gap-4`, `gap-6`

### State Management
- Local component state with `useState`
- Callback props for parent updates (`onFileUploaded`, `onRevisionResponded`)
- API calls in `useEffect` for initial data loading

### Internationalization
- Japanese as primary language
- Material/bag type mapping with Japanese labels
- Date formatting with `ja` locale

## For AI Agents

### Member Component-Specific Patterns

**Order Data Handling:**
- Always handle both camelCase and snake_case properties
- Order items have nested `specifications` object
- Status types: `MODIFICATION_REQUESTED`, `pending`, `approved`, etc.

**Design Workflow:**
- File upload → Revision review → Approval
- Status tracking determines active step
- Comments integrated into each workflow step

**Specification Editing:**
- Requires price recalculation on any change
- Different API endpoints for admin vs customer
- Must provide change reason for audit trail

**Approvals:**
- Spec approval: Before quotation → order conversion
- Modification approval: After admin modifies order
- Both require user confirmation with price impact shown

### Common Member Component Props

```typescript
interface OrderComponentProps {
  order: Order;                    // Order from dashboard types
  onApprovalComplete?: () => void; // Callback after approval
}

interface DesignComponentProps {
  orderId: string;
  onFileUploaded?: () => void;
  onRevisionResponded?: () => void;
}
```

### API Routes Used

Member-specific endpoints:
- `/api/member/orders/{id}/data-receipt` - File upload status
- `/api/member/orders/{id}/design-revisions` - Design revisions
- `/api/member/orders/{id}/approve-modification` - Modification approval
- `/api/member/quotations/{id}/invoice` - Bank info for payment
- `/api/member/orders/{id}/specification-change` - Price recalculation

Admin endpoints (via `isAdmin` flag):
- `/api/admin/orders/{id}/specification-change`

### Styling Tokens

Member components use:
- Border colors: `border-border-secondary`
- Text colors: `text-text-primary`, `text-text-muted`
- Status colors: `bg-blue-50` (info), `bg-green-50` (success), `bg-orange-50` (warning)
- Card backgrounds: `bg-muted/10` for subtle grouping

### When Adding Member Components

1. **Handle dual API format**: Support both camelCase and snake_case
2. **Include responsive design**: Mobile-first with breakpoints
3. **Add loading states**: Use `useState` for isProcessing/loading
4. **Error handling**: Try/catch with user-friendly error messages
5. **Japanese labels**: Use Japanese for all user-facing text
6. **Export via index.ts**: Maintain clean import interface
7. **Type safety**: Import types from `@/types/dashboard`

## Dependencies

### Internal
- `@/components/ui/Card` - Base card component
- `@/components/ui/Button` - Button variants
- `@/components/orders/*` - Shared order components (OrderStatusTimeline, OrderStatusBadge)
- `@/components/orders/OrderCommentsSection` - Comment integration
- `@/app/member/orders/[id]/OrderFileUploadSection` - File upload widget
- `@/types/dashboard` - Order, Quotation type definitions
- `@/lib/utils` - `cn()` className merge utility
- `@/lib/unified-pricing-engine` - Material specification helper
- `@/lib/auth-client` - Dynamic import for API helpers (avoid circular deps)

### External
- `date-fns` - Date formatting with Japanese locale
- `lucide-react` - Icon components (CheckCircle, Upload, AlertCircle, etc.)
- `react` - useState, useEffect, useCallback hooks

### Component Relationships

```
OrderInfoAccordion
├── OrderStatusTimeline (from ../orders/)
├── OrderStatusBadge (from ../orders/)
└── date-fns formatting

DesignWorkflowSection
├── OrderFileUploadSection (from pages)
├── DesignRevisionsSection (sibling)
└── OrderCommentsSectionWrapper (from ../orders/)

OrderItemsSummary
└── BankInfoCard (implicit, via API fetch)

SpecApprovalModal
└── getMaterialSpecification (from unified-pricing-engine)

SpecificationEditModal
└── PriceDifferenceSummary (from ./orders/)
```

## Related Files

- **../orders/** - Shared order management components
- **../admin/** - Admin dashboard equivalents
- **../../app/member/orders/** - Member order pages using these components
- **../../types/dashboard.ts** - Order and Quotation type definitions
- **../../lib/unified-pricing-engine.ts** - Price calculation logic
