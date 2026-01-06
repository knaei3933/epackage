# Admin Notifications System - Complete Implementation Guide

## Overview

The Admin Notifications System provides real-time notifications to administrators for all critical business events in the Epackage Lab platform. Built with Supabase MCP for database operations, it offers a complete notification infrastructure with UI components and API endpoints.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Installation](#installation)
5. [Usage](#usage)
6. [API Reference](#api-reference)
7. [Integration Guide](#integration-guide)
8. [Testing](#testing)

## Features

✅ **8 Notification Types**
- 📦 New Orders
- 💰 Quotation Requests
- 📋 Sample Requests
- 👤 User Registration Requests (B2B)
- 🏭 Production Complete
- 🚚 Shipment Complete
- ✍️ Contract Signature Requests
- 🚨 System Errors

✅ **Priority Levels**
- Low
- Normal
- High
- Urgent

✅ **Real-time Updates**
- 30-second auto-refresh for unread count
- Instant UI updates when notifications are read
- Automatic cleanup of old notifications (30+ days)

✅ **Actionable Notifications**
- Direct links to relevant admin pages
- Action buttons for quick navigation
- Metadata for additional context

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin UI Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Notification │  │ Notification │  │    Admin     │     │
│  │    Icon      │  │    List      │  │   Layout     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  GET    /api/admin/notifications                     │  │
│  │  POST   /api/admin/notifications (mark all read)     │  │
│  │  PATCH  /api/admin/notifications/[id]/read           │  │
│  │  DELETE /api/admin/notifications/[id]                │  │
│  │  GET    /api/admin/notifications/unread-count        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  lib/admin-notifications.ts                          │  │
│  │  - createAdminNotification()                         │  │
│  │  - getAdminNotifications()                           │  │
│  │  - notifyNewOrder()                                  │  │
│  │  - notifyQuotationRequest()                          │  │
│  │  - ... (8 helper functions)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Supabase MCP                                         │  │
│  │  lib/supabase-mcp.ts (executeSql)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Table: `admin_notifications`

```sql
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  related_type TEXT,
  priority TEXT DEFAULT 'normal',
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);
```

### Indexes

- `idx_admin_notifications_type` - Filter by notification type
- `idx_admin_notifications_is_read` - Filter by read status
- `idx_admin_notifications_user_id` - User-specific notifications
- `idx_admin_notifications_created_at` - Sort by creation date
- `idx_admin_notifications_related` - Join with related entities
- `idx_admin_notifications_unread` - Quick unread queries
- `idx_admin_notifications_dashboard` - Admin dashboard queries

## Installation

The system is already installed. Here's what was created:

### 1. Database Migration
```bash
# Migration applied via Supabase MCP
# supabase/migrations/20260104_create_admin_notifications.sql
```

### 2. Library Files
- `src/lib/admin-notifications.ts` - Core notification functions
- `src/lib/admin-notifications-integration.ts` - Integration examples

### 3. API Routes
- `src/app/api/admin/notifications/route.ts`
- `src/app/api/admin/notifications/[id]/read/route.ts`
- `src/app/api/admin/notifications/unread-count/route.ts`

### 4. UI Components
- `src/components/admin/Notifications/NotificationIcon.tsx`
- `src/components/admin/Notifications/NotificationList.tsx`
- `src/components/admin/Notifications/AdminNotificationCenter.tsx`
- `src/app/admin/layout.tsx` - Admin layout with notifications

### 5. Test Script
- `scripts/test-admin-notifications.ts` - System tests

## Usage

### Displaying Notifications in Admin UI

The notification center is automatically included in the admin layout:

```tsx
// Already integrated in src/app/admin/layout.tsx
import { AdminNotificationCenter } from '@/components/admin/Notifications'

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header>
        <AdminNotificationCenter />
      </header>
      <main>{children}</main>
    </div>
  )
}
```

### Creating Notifications

#### Option 1: Using Helper Functions (Recommended)

```typescript
import {
  notifyNewOrder,
  notifyQuotationRequest,
  notifySampleRequest,
  // ... other helpers
} from '@/lib/admin-notifications'

// New order notification
await notifyNewOrder(
  orderId,           // UUID
  orderNumber,       // e.g., "ORD-2026-001"
  customerName,      // string
  totalAmount        // number
)

// Quotation request notification
await notifyQuotationRequest(
  quotationId,
  quotationNumber,
  customerName
)

// Sample request notification
await notifySampleRequest(
  sampleRequestId,
  customerName,
  sampleCount
)
```

#### Option 2: Using Generic Function

```typescript
import { createAdminNotification } from '@/lib/admin-notifications'

await createAdminNotification({
  type: 'order',
  title: '新しい注文',
  message: '注文の詳細...',
  relatedId: orderId,
  relatedType: 'orders',
  priority: 'high',
  actionUrl: `/admin/orders/${orderId}`,
  actionLabel: '注文を表示',
  metadata: {
    order_number: orderNumber,
    customer_name: customerName
  }
})
```

### Retrieving Notifications

```typescript
import {
  getAdminNotifications,
  getUnreadAdminNotificationCount
} from '@/lib/admin-notifications'

// Get all notifications
const { notifications, total } = await getAdminNotifications({
  unreadOnly: false,
  limit: 20,
  offset: 0
})

// Get unread count
const unreadCount = await getUnreadAdminNotificationCount()

// Get filtered notifications
const { notifications: highPriority } = await getAdminNotifications({
  priority: 'high',
  type: 'order'
})
```

## API Reference

### GET `/api/admin/notifications`

List admin notifications with filtering and pagination.

**Query Parameters:**
- `unreadOnly` (boolean) - Filter unread only
- `type` (string) - Filter by type
- `priority` (string) - Filter by priority
- `limit` (number) - Results per page (default: 20)
- `offset` (number) - Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unread_count": 5
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 45,
    "hasMore": true
  }
}
```

### POST `/api/admin/notifications`

Mark all notifications as read.

**Request Body:**
```json
{
  "action": "mark_all_read"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "marked_count": 5 },
  "message": "すべての通知を既読にしました。"
}
```

### PATCH `/api/admin/notifications/[id]/read`

Mark a specific notification as read.

**Response:**
```json
{
  "success": true,
  "data": { ...notification },
  "message": "通知を既読にしました。"
}
```

### DELETE `/api/admin/notifications/[id]`

Delete a notification.

**Response:**
```json
{
  "success": true,
  "message": "通知を削除しました。"
}
```

### GET `/api/admin/notifications/unread-count`

Get the count of unread notifications.

**Response:**
```json
{
  "success": true,
  "data": { "count": 5 }
}
```

## Integration Guide

### Step 1: Add Notifications to Your API Routes

Copy the integration patterns from `src/lib/admin-notifications-integration.ts`:

```typescript
// Example: In your order creation API
import { notifyNewOrder, notifySystemError } from '@/lib/admin-notifications'

export async function POST(request: NextRequest) {
  try {
    // Your existing order creation logic
    const order = await createOrder(data)

    // Add notification
    await notifyNewOrder(
      order.id,
      order.orderNumber,
      order.customerName,
      order.totalAmount
    )

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    // Send error notification
    await notifySystemError(
      'order_creation_failed',
      error.message,
      { order_data: data }
    )
    throw error
  }
}
```

### Step 2: Integration Checklist

- [ ] **Orders API** - Add `notifyNewOrder()` after order creation
- [ ] **Quotations API** - Add `notifyQuotationRequest()` after quotation creation
- [ ] **Sample Requests API** - Add `notifySampleRequest()` after sample request
- [ ] **User Registration** - Add `notifyRegistrationRequest()` for B2B signups
- [ ] **Production API** - Add `notifyProductionComplete()` on production completion
- [ ] **Shipments API** - Add `notifyShipmentComplete()` after shipment creation
- [ ] **Contracts API** - Add `notifyContractSignature()` when contracts are signed
- [ ] **Error Handling** - Add `notifySystemError()` for critical errors

### Step 3: Test Your Integration

Run the test script to verify the system:

```bash
npx tsx scripts/test-admin-notifications.ts
```

## Testing

### Manual Testing

1. **Create Test Notifications**
   ```bash
   npx tsx scripts/test-admin-notifications.ts
   ```

2. **Check Admin UI**
   - Navigate to `/admin/dashboard`
   - Click the notification bell icon
   - Verify notifications are displayed

3. **Test Read/Unread**
   - Click "既読にする" on individual notifications
   - Click "すべて既読にする" to mark all as read
   - Verify unread count updates

4. **Test Deletion**
   - Click the trash icon to delete notifications
   - Verify they're removed from the list

### Automated Testing

```typescript
// Example test case
import { notifyNewOrder, getAdminNotifications } from '@/lib/admin-notifications'

test('creates and retrieves notification', async () => {
  // Create notification
  const result = await notifyNewOrder('id-1', 'ORD-001', 'Customer', 1000)
  expect(result).toBeTruthy()
  expect(result?.type).toBe('order')

  // Retrieve notification
  const { notifications } = await getAdminNotifications({ limit: 1 })
  expect(notifications).toHaveLength(1)
  expect(notifications[0].title).toContain('新しい注文')
})
```

## Maintenance

### Automatic Cleanup

Old notifications (30+ days, read) are automatically cleaned up. To manually trigger cleanup:

```typescript
import { cleanupOldAdminNotifications } from '@/lib/admin-notifications'

const deletedCount = await cleanupOldAdminNotifications()
console.log(`Deleted ${deletedCount} old notifications`)
```

### Notification Expiration

Time-sensitive notifications (e.g., system errors) can have expiration dates:

```typescript
await createAdminNotification({
  type: 'system',
  title: 'Temporary Issue',
  message: 'This notification will expire in 24 hours',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
})
```

## Troubleshooting

### Notifications Not Appearing

1. **Check database connection:**
   ```bash
   # Verify Supabase MCP is working
   npx tsx -e "import { executeSql } from './src/lib/supabase-mcp'; executeSql('SELECT 1').then(console.log)"
   ```

2. **Check API routes:**
   ```bash
   # Test API directly
   curl -X GET http://localhost:3000/api/admin/notifications
   ```

3. **Check browser console:**
   - Look for fetch errors
   - Verify authentication token

### Unread Count Not Updating

1. Verify the polling interval (default: 30 seconds)
2. Check for JavaScript errors in the browser console
3. Test the unread-count endpoint directly

## Performance

- **Indexing:** 7 optimized indexes for fast queries
- **Polling:** 30-second intervals (adjustable)
- **Pagination:** Configurable limit/offset
- **Cleanup:** Automatic removal of old notifications

## Security

- **Authentication:** All API routes require admin role
- **Authorization:** Role-based access control (RBAC)
- **SQL Injection:** Parameterized queries via Supabase MCP
- **XSS Protection:** React's built-in escaping

## Future Enhancements

Potential improvements for consideration:

- [ ] WebSocket integration for real-time updates
- [ ] Email/SMS notification fallbacks
- [ ] Notification preferences per admin
- [ ] Notification grouping/batching
- [ ] Advanced filtering and search
- [ ] Notification analytics dashboard

## Support

For issues or questions:

1. Check this documentation
2. Review `src/lib/admin-notifications-integration.ts` for examples
3. Run `scripts/test-admin-notifications.ts` for diagnostics
4. Check browser console and server logs

## Changelog

### v1.0.0 (2026-01-04)
- Initial release
- 8 notification types
- 4 priority levels
- Complete UI integration
- API endpoints
- Test suite
