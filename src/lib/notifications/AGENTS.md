<!-- Parent: ../AGENTS.md -->

# src/lib/notifications/ - Notification System

通知システム - 管理者・メンバー向け通知機能の統合管理

## Purpose

This directory contains a comprehensive multi-channel notification system for both admin and member notifications. It handles email, SMS, and push notifications with delivery optimization, user preferences, batch processing, and detailed tracking/history.

## Directory Structure

```
src/lib/notifications/
├── __tests__/              # Notification tests
├── index.ts                # Main entry point - unified notification manager
├── batch.ts                # Batch notification processing with retry logic
├── history.ts              # Notification history tracking (sent/opened/clicked)
├── optimization.ts         # Delivery optimization (timezone, rate limiting, costs)
├── preferences.ts          # User notification preferences & quiet hours
├── push.ts                 # FCM-based push notification service
├── sms.ts                  # Twilio-based SMS notification service
└── AGENTS.md               # This file
```

Related parent-level files:
- `../admin-notifications.ts` - Admin-specific notification functions
- `../customer-notifications.ts` - Member/customer notification functions

## Key Components

### Core Notification Manager (index.ts)

Main entry point for sending notifications across all channels.

| Function | Purpose |
|----------|---------|
| `sendNotification()` | Send multi-channel notification with channels, priority, quiet hours |
| `sendTemplatedNotification()` | Send notification using predefined templates |
| `getUserNotificationStats()` | Get user's notification statistics |
| `getUserNotificationPreferences()` | Get user's notification settings |
| `updateUserNotificationPreferences()` | Update user's notification settings |

**Template keys**: `quotation_created_admin`, `quotation_approved`, `order_confirmed`, `contract_sent`, `contract_signed`, `production_update`, `shipped`, `delivery_scheduled`, `payment_reminder`

### Admin Notifications (../admin-notifications.ts)

Admin-specific notifications stored in `admin_notifications` table.

| Type | Helper Function |
|------|----------------|
| `order` | `notifyNewOrder()` |
| `quotation` | `notifyQuotationRequest()` |
| `sample` | `notifySampleRequest()` |
| `registration` | `notifyRegistrationRequest()` |
| `production` | `notifyProductionComplete()` |
| `shipment` | `notifyShipmentComplete()` |
| `contract` | `notifyContractSignature()` |
| `system` | `notifySystemError()` |
| `data_receipt` | `notifyDataReceipt()` |
| `ai_extraction` | `notifyAIExtractionComplete()` |
| `korea_transfer` | `notifyKoreaDataTransfer()` |
| `modification` | `notifyModificationApproved()`, `notifyModificationRejected()` |

### Customer/Member Notifications (../customer-notifications.ts)

Member notifications using RPC functions for database operations.

| Type | Helper Function |
|------|----------------|
| `quote_ready` | `notifyQuoteReady()` |
| `contract_ready` | `notifyContractReady()` |
| `production_update` | `notifyProductionUpdate()` |
| `shipment_update` | `notifyShipmentUpdate()`, `notifyDeliveryComplete()` |
| `document_ready` | `notifyDocumentReady()` |
| `modification_requested` | `notifyModificationRequested()` |

**Utility functions**: `getUnreadCount()`, `markAsRead()`, `markAllAsRead()`, `cleanupExpiredNotifications()`

### Channel Services

#### Push Notifications (push.ts)

Firebase Cloud Messaging (FCM) based push notifications.

| Function | Purpose |
|----------|---------|
| `sendPushNotification()` | Send to single device token |
| `sendBulkPushNotifications()` | Send to multiple device tokens |
| `sendTemplatedPush()` | Send using predefined templates |
| `registerDeviceToken()` | Register/update device token |
| `getUserDeviceTokens()` | Get active device tokens for user |
| `removeInvalidTokens()` | Clean up invalid tokens |
| `createIOSPayload()` | Create iOS-specific payload |
| `createAndroidPayload()` | Create Android-specific payload |
| `createWebPayload()` | Create web push notification payload |

**Templates**: Japanese templates for quotation, order, contract, production, shipping events

#### SMS Service (sms.ts)

Twilio-based SMS notifications with Japanese language support.

| Function | Purpose |
|----------|---------|
| `sendSMS()` | Send single SMS |
| `sendBulkSMS()` | Send SMS to multiple recipients |
| `sendTemplatedSMS()` | Send using predefined templates |
| `validateSMSLength()` | Check message length/segments |
| `truncateSMS()` | Truncate long messages |
| `estimateSMSCost()` | Estimate cost based on segments |
| `validatePhoneNumber()` | Validate phone format |
| `canSendSMS()` | Check if user can receive SMS |

**Templates**: Japanese SMS templates with 【EPackage Lab】 prefix

### Batch Processing (batch.ts)

Handles large-scale notification campaigns with retry logic.

| Function | Purpose |
|----------|---------|
| `createBatchJob()` | Create new batch job |
| `processBatchNotifications()` | Process recipients in batches |
| `sendBatchNotifications()` | Multi-channel batch send |
| `retryFailedNotifications()` | Retry failed sends with exponential backoff |
| `getBatchJobStatus()` | Get batch job progress |
| `cancelBatchJob()` | Cancel running batch job |
| `cleanupOldJobs()` | Remove old completed jobs |

**Default options**: `batch_size: 100`, `delay_between_batches: 1000ms`, `max_retries: 3`, `retry_delay: 5000ms`

### History & Analytics (history.ts)

Tracks all notification activity for analytics and compliance.

| Function | Purpose |
|----------|---------|
| `recordNotificationSent()` | Record send event |
| `recordDelivery()` | Record delivery confirmation |
| `recordOpen()` | Track email/push opens |
| `recordClick()` | Track link clicks |
| `recordFailure()` | Record delivery failures |
| `getUserNotificationHistory()` | Get user's notification history |
| `getNotificationStatistics()` | Get comprehensive stats (delivery rate, open rate, click rate) |
| `getMostOpenedTypes()` | Analytics: most opened notification types |
| `getMostClickedCategories()` | Analytics: most clicked categories |

### User Preferences (preferences.ts)

Manages user notification settings and quiet hours.

| Function | Purpose |
|----------|---------|
| `getUserPreferences()` | Get user's notification settings |
| `updateUserPreferences()` | Update notification preferences |
| `toggleChannel()` | Enable/disable channel |
| `getEnabledChannelsForCategory()` | Get active channels for category |
| `setQuietHours()` | Configure quiet hours (timezone-aware) |
| `isInQuietHours()` | Check if currently in quiet period |
| `setSMSPhoneNumber()` | Store SMS phone number |
| `createDefaultPreferencesForExistingUsers()` | Migration helper |

**Default settings**:
- Email: enabled (quotation, order, production, shipping, payment, contract, system)
- SMS: disabled (only order, shipping when enabled)
- Push: enabled (quotation, order, production, shipping)
- Quiet hours: 22:00-08:00 Asia/Tokyo

### Delivery Optimization (optimization.ts)

Smart delivery optimization for better engagement and cost management.

| Function | Purpose |
|----------|---------|
| `calculateOptimalSendTime()` | Calculate best send time based on timezone |
| `getDeliveryTimeRecommendations()` | AI-based time recommendations from history |
| `calculateDeliveryScore()` | Calculate delivery success score (0-100) |
| `selectOptimalChannel()` | Select channels based on urgency and cost |
| `estimateNotificationCost()` | Estimate cost by channel |
| `checkRateLimit()` | Check rate limits per channel |
| `assignTestGroup()` | A/B testing group assignment |

**Rate limits**: Email: 10/hr, SMS: 5/hr, Push: 20/hr

**Cost estimation** (USD): Email: $0.001, SMS: $0.08, Push: $0.0001

## For AI Agents

### Notification Patterns

**When sending notifications:**

1. **Use the unified manager** (`sendNotification`) for multi-channel sends
2. **Use template functions** for standard business events
3. **Always check user preferences** before sending
4. **Respect quiet hours** for non-urgent notifications
5. **Handle rate limits** to avoid service disruption

**Admin notification pattern:**
```typescript
import { createAdminNotification } from '@/lib/admin-notifications';

await createAdminNotification({
  type: 'order',
  title: 'New Order',
  message: `Order #${orderNumber} received`,
  relatedId: orderId,
  relatedType: 'orders',
  priority: 'normal',
  actionUrl: `/admin/orders/${orderId}`,
  actionLabel: 'View Order',
});
```

**Member notification pattern:**
```typescript
import { createCustomerNotification } from '@/lib/customer-notifications';

await createCustomerNotification({
  userId,
  type: 'production_update',
  title: 'Production Update',
  titleJa: '製造進捗更新',
  message: `Stage: ${stage}`,
  messageJa: `ステージ: ${stageJa}`,
  orderId,
  sendEmail: true,
});
```

**Multi-channel notification pattern:**
```typescript
import { sendNotification } from '@/lib/notifications';

await sendNotification({
  userId,
  type: 'order_confirmed',
  category: 'order',
  priority: 'normal',
  subject: 'Order Confirmed',
  content: {
    text: 'Your order has been confirmed.',
    html: '<p>Your order has been confirmed.</p>',
  },
  channels: ['email', 'push'],
  data: { orderId, orderNumber },
  options: {
    skipQuietHours: false,
    scheduleFor: undefined,
  },
});
```

### Database Tables

**admin_notifications**: Admin-facing notifications
- `id`, `type`, `title`, `message`, `priority`
- `related_id`, `related_type`, `action_url`, `action_label`
- `is_read`, `read_at`, `user_id` (NULL = global)
- `metadata`, `expires_at`, `created_at`

**customer_notifications**: Member-facing notifications (via RPC)
- Uses `create_customer_notification()` RPC function
- Supports `sent_via_email`, `sent_via_sms` flags

**unified_notifications**: Unified table (newer)
- `recipient_id`, `recipient_type` ('member'/'admin')
- `type`, `title`, `message`, `priority`
- `related_id`, `related_type`, `action_url`, `action_label`
- `is_read`, `read_at`, `metadata`

**notification_preferences**: User settings
- `user_id`, `channels` (JSONB), `quiet_hours` (JSONB)
- `language`, `updated_at`

**notification_history**: Activity tracking
- `notification_id`, `user_id`, `type`, `category`, `channel`
- `status`, `subject`, `preview`, `sent_at`, `delivered_at`
- `opened_at`, `clicked_at`, `error_message`, `metadata`

**batch_notification_jobs**: Batch job tracking
- `id`, `name`, `status`, `total_recipients`
- `processed_recipients`, `successful_sends`, `failed_sends`
- `created_by`, `created_at`, `started_at`, `completed_at`

**batch_notifications**: Individual batch notifications
- `id`, `job_id`, `recipient_id`, `notification_id`
- `status`, `retry_count`, `error_message`, `processed_at`

**device_tokens**: Push notification tokens
- `id`, `user_id`, `token`, `platform`
- `app_version`, `os_version`, `is_active`

### Dependencies

External services:
- **Twilio** - SMS delivery (requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)
- **Firebase FCM** - Push notifications (requires `FCM_SERVER_KEY`, `FCM_PROJECT_ID`)
- **SendGrid/SES** - Email delivery (configured in `../email.ts`)

### Environment Variables

```bash
# Notification services
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
FCM_SERVER_KEY=
FCM_PROJECT_ID=

# App URL for tracking links
NEXT_PUBLIC_APP_URL=https://epackage-lab.com
```

### Common Tasks

**Send admin notification:**
```typescript
import { notifyNewOrder } from '@/lib/admin-notifications';
await notifyNewOrder(orderId, orderNumber, customerName, totalAmount);
```

**Send member notification with email:**
```typescript
import { notifyQuoteReady } from '@/lib/customer-notifications';
await notifyQuoteReady(userId, quotationId, quotationNumber);
```

**Check unread count:**
```typescript
import { getUnreadAdminNotificationCount } from '@/lib/admin-notifications';
const count = await getUnreadAdminNotificationCount();
```

**Mark notifications as read:**
```typescript
import { markAdminNotificationAsRead } from '@/lib/admin-notifications';
await markAdminNotificationAsRead(notificationId);
```

**Send multi-channel notification:**
```typescript
import { sendNotification } from '@/lib/notifications';
const result = await sendNotification({
  userId,
  type: 'order_confirmed',
  category: 'order',
  priority: 'normal',
  subject: 'Order Confirmed',
  content: { text: 'Your order is confirmed.' },
  channels: ['email', 'push'],
});
```

**Get user notification stats:**
```typescript
import { getUserNotificationStats } from '@/lib/notifications';
const stats = await getUserNotificationStats(userId);
// { total_sent, total_delivered, open_rate, click_rate, by_channel, ... }
```

### Testing

- Unit tests: `__tests__/` directory
- Test helpers: `sendTestSMS()`, `sendTestPush()`, `testSMSSettings()`, `testPushSettings()`

Run tests:
```bash
npm test -- notifications
```

## Important Notes

1. **Japanese Language Support**: All templates and messages include Japanese translations
2. **Timezone Awareness**: Quiet hours and send times respect user timezone (default: Asia/Tokyo)
3. **Rate Limiting**: All channels enforce per-user rate limits to prevent spam
4. **Quiet Hours**: Non-urgent notifications are deferred during quiet hours (22:00-08:00 default)
5. **Priority Levels**: `low`, `normal`, `high`, `urgent` - affects delivery behavior
6. **Category-Based Routing**: Different notification types use different default channels
7. **History Tracking**: All sends are tracked for analytics and compliance
8. **Batch Processing**: Large campaigns use batch processing with retry logic
9. **Cost Optimization**: System can select channels based on urgency and cost
10. **A/B Testing**: Support for test group assignment for notification optimization
