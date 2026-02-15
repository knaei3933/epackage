# Dashboard Components

<!-- Parent: ../AGENTS.md -->

## Purpose

Dashboard components for both admin and member portals. Provides unified navigation, statistics display, and form management for B2B packaging operations.

## Key Files

| File | Purpose |
|------|---------|
| `menuItems.ts` | Hierarchical navigation structure with badge notifications |
| `SidebarNavigation.tsx` | Responsive sidebar with collapse/expand, keyboard navigation |
| `UnifiedDashboard.tsx` | Unified stats dashboard for admin/member roles |
| `DashboardCards.tsx` | Statistics cards, announcements, recent orders/quotations/samples |
| `DeliveryAddressForm.tsx` | Japanese address form with postal code auto-fill |
| `BillingAddressForm.tsx` | Billing address management form |
| `OrderList.tsx` | Order listing with filters and pagination |
| `DashboardHeader.tsx` | Dashboard header component |
| `index.ts` | Barrel export for all dashboard components |

## Component Patterns

### Navigation Structure

```typescript
// menuItems.ts - Hierarchical menu with badges
interface MenuItem {
  id: string;
  label: string;
  icon: ComponentType;
  href: string;
  badge?: number;
  subMenu?: MenuItem[];
  requiresB2B?: boolean;
}

// Badge notification system
addBadgesToMenu(items: MenuItem[], notifications: object): MenuItem[]
```

### Form Patterns

```typescript
// Address forms use consistent validation
interface FormData {
  name: string;
  postalCode: string;      // XXX-XXXX format with validation
  prefecture: string;      // 47 Japanese prefectures dropdown
  city: string;
  address: string;
  phone: string;           // XXX-XXXX-XXXX format
  isDefault?: boolean;
}

// Auto-fill from Japanese postal code API
handlePostalCodeChange(value: string): Promise<void>
// Fetches from https://zipcloud.ibsnet.co.jp/api/search
```

### Dashboard Stats

```typescript
// UnifiedDashboard supports both roles
interface UnifiedDashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  activeUsers?: number;      // Admin only
  pendingQuotations?: number;
  quotations?: {             // Admin only
    conversionRate: number;
    approved: number;
    total: number;
  };
  samples?: {                // Both roles
    total: number;
    processing: number;
  };
  contracts?: {              // Member only
    signed: number;
    pending: number;
  };
}
```

## For AI Agents

### When Adding Menu Items

1. Add to `menuItems.ts` export array
2. Include appropriate icon from `lucide-react`
3. Set `requiresB2B: true` for B2B-only features
4. Add badge support if notifications needed

### When Creating Dashboard Cards

1. Follow the pattern in `DashboardCards.tsx`
2. Use consistent color classes (blue, green, orange, purple, indigo)
3. Include dark mode variants
4. Add date formatting with `date-fns` and `ja` locale

### Form Validation Patterns

```typescript
// Japanese postal code: XXX-XXXX
/^\d{3}-\d{4}$/

// Japanese phone: XXX-XXXX-XXXX
/^0\d{1,4}-\d{1,4}-\d{3,4}$/

// All address forms use:
- required field indicators (red asterisk)
- inline error messages
- data-testid attributes for testing
```

### Status Color Mappings

```typescript
// Order statuses
pending: yellow (受付待)
processing: blue (処理中)
manufacturing: indigo (製造中)
ready: purple (発送待)
shipped: green (発送完了)
delivered: gray (配送完了)
cancelled: red (キャンセル)

// Quotation statuses
draft: gray (作成中)
sent: blue (送信済)
approved: green (承認済)
rejected: red (却下)
expired: orange (期限切れ)
```

## Dependencies

### External
- `lucide-react` - Icons
- `date-fns` - Date formatting with Japanese locale
- `swr` - Data fetching and caching (UnifiedDashboard)
- `@supabase/supabase-js` - Authentication types

### Internal
- `@/types/dashboard` - All dashboard type definitions
- `@/types/order-status` - Order status types and utilities
- `@/components/ui` - Card, Input, Button components
- `@/contexts/AuthContext` - User profile and B2B status
- `@/lib/dashboard` - UnifiedDashboardStats type

## State Management

- **Sidebar collapse**: `localStorage.getItem('sidebar-collapsed')`
- **Mobile menu**: React useState with body scroll lock
- **Dashboard stats**: SWR with 30s refresh interval
- **Form data**: Controlled components with validation state

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Space, Esc)
- Focus trap in mobile menu
- Focus management on menu open/close
- Proper heading hierarchy
- aria-current for active routes
- aria-expanded for submenu states

## Testing

All forms include `data-testid` attributes:
- `delivery-name-input`
- `postal-code-input`
- `prefecture-select`
- `save-delivery-button`
- etc.

## Routing Structure

```
/member/dashboard         -マイページトップ
/member/samples          - サンプル依頼
/member/inquiries        - お問い合わせ
/member/quotations       - 見積管理
/member/orders/new       - 新規注文
/member/orders/reorder   - 再注文
/member/orders/history   - 注文履歴
/member/deliveries       - 納品先管理
/member/billing-addresses - 請求先管理
/member/invoices         - 請求書
/member/contracts        - 契約管理
/member/profile          - プロフィール
/member/edit             - 会員情報編集
/member/settings         - 設定
```
