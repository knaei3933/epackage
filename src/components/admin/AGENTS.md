<!-- Parent: ../AGENTS.md -->

# Admin Components Directory

**Purpose:** Admin dashboard components for managing orders, quotations, production, shipments, notifications, and system settings.

## Directory Structure

```
admin/
├── AdminNavigation.tsx           # Main navigation component
├── dashboard-widgets/            # Dashboard visualization widgets
├── Notifications/                # Notification system components
├── contract-workflow/            # Contract workflow management
├── DataAndCorrectionManagementTab/  # Data upload & correction workflow
├── performance/                  # Performance monitoring
├── quotation/                    # Quotation management
├── korea/                        # Korea-specific operations
└── [various admin components]
```

## Key Components

### Navigation

#### `AdminNavigation.tsx`
- **Purpose:** Horizontal navigation bar for admin pages
- **Features:**
  - Active route highlighting with `usePathname()`
  - Icons from lucide-react for each section
  - Horizontal scroll on mobile
  - Routes: Dashboard, Orders, Quotations, Shipments, Contracts, Approvals, Inventory, Notifications, Settings, Coupons
- **Dependencies:** `next/navigation`, `lucide-react`

### Dashboard Widgets (`dashboard-widgets/`)

#### `OrderStatisticsWidget.tsx`
- **Purpose:** Display order statistics with charts
- **Features:**
  - Total orders, revenue, pending quotations, active production
  - Pie chart for order status distribution (Recharts)
  - Bar chart for monthly revenue
  - Recent quotations table with status badges
  - Error state handling
- **Dependencies:** `recharts`, `@/types/admin`, `@/types/order-status`
- **Props:** `statistics?: DashboardStatistics`, `error?: string`

#### `RecentActivityWidget.tsx`
- **Purpose:** Show recent order/quotation/production activity
- **Features:**
  - Activity feed with type badges (order, quotation, production, shipment)
  - Time ago formatting (minutes, hours, days)
  - Today's shipment summary
  - Statistics grid (new orders, quotations, in production, pending)
  - Empty state component
- **Dependencies:** `@/components/ui`, `@/types/admin`, `@/types/order-status`

#### `QuickActionsWidget.tsx`
- **Purpose:** Quick action buttons for common admin tasks
#### `AlertsWidget.tsx`
- **Purpose:** Display system alerts and notifications
#### `StatsCard.tsx`
- **Purpose:** Reusable statistic display card

### Notification System (`Notifications/`)

#### `AdminNotificationCenter.tsx`
- **Purpose:** Main notification center with icon and dropdown
- **Features:**
  - Unread count badge
  - Notification list dropdown
  - Real-time polling (30s interval - currently disabled)
  - DEV_MODE header support for development
- **API Endpoints:**
  - `/api/admin/notifications/unread-count`
- **State:** `isOpen`, `unreadCount`

#### `NotificationIcon.tsx`
- **Purpose:** Bell icon with unread count badge
- **Features:** Hover effects, click to toggle dropdown

#### `NotificationList.tsx`
- **Purpose:** Dropdown list of notifications
- **Features:** Mark as read, delete all, notification type icons

### Shipment Management

#### `ShipmentCard.tsx`
- **Purpose:** Display shipment information in card format
- **Features:**
  - Carrier name normalization (YAMATO, SAGAWA, JP_POST, SEINO)
  - Tracking number with external link
  - Latest tracking event display
  - Status color coding
  - Action buttons: Refresh tracking, Download label, View details
- **Dependencies:** `@/types/shipment`, `lucide-react`
- **Status Colors:** yellow (pending), blue (picked_up), indigo (in_transit), purple (out_for_delivery), green (delivered), red (failed), gray (returned)

#### `ShipmentCreateModal.tsx`
- **Purpose:** Modal form for creating new shipments
#### `ShipmentEditModal.tsx`
- **Purpose:** Modal form for editing existing shipments
#### `CarrierSelector.tsx`
- **Purpose:** Dropdown to select shipping carrier
#### `DeliveryTimeSelector.tsx`
- **Purpose:** Time slot selector for delivery
#### `TrackingTimeline.tsx`
- **Purpose:** Visual timeline of shipment tracking events

### Production Management

#### `ProductionProgressVisualizer.tsx`
- **Purpose:** Horizontal stepper showing 9 production stages
- **Features:**
  - Stage status: completed (green), current (blue animated), delayed (red), pending (gray)
  - Progress bar with overall completion percentage
  - Tooltip on hover with stage details
  - Compact variant for mobile (`ProductionProgressCompact`)
  - Stage click handlers for navigation
- **Stages:** 9 stages from `getProductionStages()` in `@/types/production`
- **Locale Support:** Japanese, Korean, English
- **Helper:** `calculateOverallProgress()` - calculates progress based on completed/in-progress stages

#### `ProductionStatusUpdateButton.tsx`
- **Purpose:** Button to update production status
#### `StageDetailPanel.tsx`
- **Purpose:** Panel showing detailed information for a production stage

### Order Management

#### `AdminOrderItemsEditor.tsx`
- **Purpose:** Edit order item specifications
- **Features:**
  - Inline editing of size, material, thickness, quantity, unit price
  - Expandable specifications panel
  - Material thickness options based on selected material
  - Post-processing options by category
  - Editable only for specific statuses: `DATA_UPLOAD_PENDING`, `DATA_UPLOADED`, `MODIFICATION_REJECTED`, `PROOF_CREATION_PENDING`, `PROOF_SENT`, `PROOF_APPROVAL_PENDING`
  - Modification request workflow (checkbox to request customer approval)
  - Real-time total calculation
- **API Endpoint:** `PUT /api/admin/orders/${order.id}/items`
- **Request Body:** `{ items: { [itemId]: { specifications, quantity, unitPrice } }, requestModification?, modificationReason? }`
- **Dependencies:** `@/lib/unified-pricing-engine`, `@/components/quote/processingConfig`

#### `AdminOrderWorkflowTabs.tsx`
- **Purpose:** Tab-based workflow for order management

### Data & Correction Management (`DataAndCorrectionManagementTab/`)

#### `index.tsx` (main component)
- **Purpose:** Unified tab interface for data upload and correction management
- **Sub-tabs:**
  - **Receipt:** Customer data upload confirmation
  - **Send:** Send data to Korea partner
  - **Correction:** Proof data management with revision support
- **Dependencies:** `@/components/orders`, internal sub-components

#### `DataReceiptSection.tsx`
- **Purpose:** Handle customer data upload confirmation
#### `KoreaSendSection.tsx`
- **Purpose:** Send production data to Korea partner with admin notes
#### `CorrectionRevisionsManager.tsx`
- **Purpose:** Manage multiple proof correction revisions
#### `RevisionCard.tsx`
- **Purpose:** Display individual revision with status and actions
#### `types.ts`
- **Purpose:** TypeScript types for data/correction management

### Contract Management (`contract-workflow/`)

#### `ContractWorkflowList.tsx`
- **Purpose:** List and manage contract workflows
#### `ContractTimeline.tsx`
- **Purpose:** Visual timeline of contract stages
#### `ContractReminderModal.tsx`
- **Purpose:** Modal for sending contract reminders

### Other Components

#### `InventoryUpdateButton.tsx`
- **Purpose:** Update inventory quantities
#### `EntryRecordingButton.tsx`
- **Purpose:** Record inventory entries
#### `ContractSignatureRequestButton.tsx`
- **Purpose:** Request signature for contracts
#### `ContractDownloadButton.tsx`
- **Purpose:** Download contract PDF
#### `CostBreakdownPanel.tsx`
- **Purpose:** Display detailed cost breakdown
#### `FileValidationResult.tsx`
- **Purpose:** Show file upload validation results
#### `SendForSignatureModal.tsx`
- **Purpose:** Modal to send document for signature
#### `SignatureStatusBadge.tsx`
- **Purpose:** Badge showing signature request status
#### `CatalogDownloadAdmin.tsx`
- **Purpose:** Admin catalog download functionality
#### `CorrectionUploadClient.tsx`
- **Purpose:** Client-side correction file upload
#### `PaymentConfirmationClient.tsx`
- **Purpose:** Payment confirmation form

### Quotation (`quotation/`)

#### `DetailedCostBreakdown.tsx`
- **Purpose:** Display detailed cost breakdown for quotations

### Korea Operations (`korea/`)

#### `KoreaCorrectionsManager.tsx`
- **Purpose:** Manage Korea-specific correction workflows

### Performance (`performance/`)

#### `PerformanceDashboard.tsx`
- **Purpose:** System performance monitoring dashboard

## For AI Agents

### Component Patterns

1. **Client-Side Components:** All admin components use `'use client'` directive
2. **Error Handling:** Components handle API errors gracefully with fallback UI
3. **Loading States:** Use `disabled` states and loading indicators during async operations
4. **Internationalization:** Japanese primary, with Korean and English support where applicable
5. **Status Normalization:** Normalize status values (uppercase/lowercase) for display
6. **Development Mode:** Check for `localStorage.getItem('dev-mock-user-id')` for DEV_MODE headers

### Common Props

- `onUpdate?: () => void` - Callback for data refresh after mutations
- `fetchFn?: () => Promise<T>` - Custom fetch function for data fetching
- `editable?: boolean` - Enable edit mode (status-dependent)

### API Patterns

- **GET:** `/api/admin/notifications/unread-count`
- **PUT:** `/api/admin/orders/${id}/items` - Update order items
- **POST:** Various endpoints for actions (send to Korea, request signature, etc.)

### Status Constants

- **Editable Statuses:** `DATA_UPLOAD_PENDING`, `DATA_UPLOADED`, `MODIFICATION_REJECTED`, `PROOF_CREATION_PENDING`, `PROOF_SENT`, `PROOF_APPROVAL_PENDING`
- **Shipment Statuses:** `pending`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `failed`, `returned`
- **Production Stages:** 9 stages from `@/types/production`

### Styling

- Uses Tailwind CSS
- Custom variants via `cn()` utility from `@/lib/utils`
- Responsive design with mobile-first approach
- Status colors: green (success), blue (active), yellow (warning), red (error), gray (neutral)

## Dependencies

### Internal
- `@/components/ui/*` - Reusable UI components
- `@/types/admin` - Admin-specific types
- `@/types/dashboard` - Dashboard types
- `@/types/order-status` - Order status constants and labels
- `@/types/production` - Production stage types
- `@/types/shipment` - Shipment types
- `@/lib/utils` - Utility functions (`cn()`)
- `@/lib/unified-pricing-engine` - Pricing logic
- `@/components/quote/processingConfig` - Post-processing options
- `@/components/orders` - Shared order components

### External
- `next` - Next.js (Link, usePathname)
- `react` - React hooks and components
- `lucide-react` - Icons
- `recharts` - Charts (PieChart, BarChart)
- `clsx` / `tailwind-merge` - Class name utilities

## Index Exports

Main exports from `index.ts`:
- `ProductionProgressVisualizer`, `ProductionProgressCompact`
- `ShipmentCreateModal`, `ShipmentCard`, `CarrierSelector`, `DeliveryTimeSelector`, `TrackingTimeline`
- `ProductionStatusUpdateButton`
- `InventoryUpdateButton`, `EntryRecordingButton`
- `ContractSignatureRequestButton`
- All notification components (`export * from './Notifications'`)
- `AdminNavigation`

Dashboard widgets exports from `dashboard-widgets/index.ts`:
- `OrderStatisticsWidget`, `RecentActivityWidget`, `QuickActionsWidget`, `AlertsWidget`, `StatsCard`
