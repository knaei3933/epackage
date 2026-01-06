# Production Tracking System Implementation

## Summary

Complete implementation of a 9-stage production workflow tracking system for Epackage Lab's B2B packaging manufacturing process.

## Files Created

### 1. Types (`src/types/production.ts`)
- `ProductionStage` enum with 9 stages
- `ProductionStageData` interface for individual stage data
- `ProductionOrder` interface for main tracking entity
- `StageAction` interface for audit logging
- Multilingual labels (Japanese/Korean/English)
- Helper functions for stage navigation and progress calculation

### 2. Database Migration (`supabase`)
Created via MCP:
- `production_stage` enum type
- `stage_status` enum type
- `production_orders` table with JSONB stage_data
- `stage_action_history` audit table
- Storage bucket `production-photos`
- Auto-calculation triggers for progress percentage
- RLS policies for admin access
- Helper functions for initialization and logging

### 3. Production Actions (`src/lib/production-actions.ts`)
Server-side functions:
- `advanceToNextStage()` - Move workflow forward
- `rollbackToPreviousStage()` - Revert to previous stage
- `updateStageNotes()` - Add notes to stages
- `uploadStagePhoto()` - Upload stage photos to Supabase storage
- `deleteStagePhoto()` - Remove photos
- `assignStageToStaff()` - Assign staff to stages
- `getProductionOrderByOrderId()` - Fetch tracking data
- `getProductionOrders()` - List with filters
- `getStageActionHistory()` - Audit log
- `createProductionOrder()` - Initialize tracking

### 4. API Routes (`src/app/api/admin/production/[orderId]/route.ts`)
- `GET` - Fetch production order details and action history
- `PATCH` - Update stage (advance/rollback), priority, dates
- `POST` - Add notes, upload photos, assign staff

### 5. UI Components

#### ProductionProgressVisualizer (`src/components/admin/ProductionProgressVisualizer.tsx`)
- Horizontal stepper with 9 stages
- Color-coded status indicators
- Animated progress bar
- Stage icons for visual clarity
- Hover tooltips with stage details
- Clickable stages (if admin)
- Compact variant for mobile

#### StageDetailPanel (`src/components/admin/StageDetailPanel.tsx`)
- Stage header with icon and status
- Estimated vs actual dates
- Notes display/add functionality
- Photo gallery with upload
- Staff assignment display
- Action history timeline
- Stage action buttons (advance/rollback)
- Photo modal for full-size viewing

### 6. Main Page (`src/app/admin/production/[id]/page.tsx`)
- Production tracking dashboard
- Progress overview (9 stages)
- Order summary card
- Current stage detail panel
- Action history timeline
- Real-time updates via SWR
- Compact/detailed view toggle

## Production Stages (9-Stage Workflow)

1. **データ受領** (data_received) - Data receipt
2. **検品** (inspection) - Inspection
3. **設計** (design) - Design
4. **製版** (plate_making) - Plate making
5. **印刷** (printing) - Printing
6. **表面加工** (surface_finishing) - Surface finishing
7. **打ち抜き** (die_cutting) - Die cutting
8. **貼り合わせ** (lamination) - Lamination
9. **検品・出荷** (final_inspection) - Final inspection & shipping

## Stage Status Types

- `pending` - Not started (gray)
- `in_progress` - Currently active (blue)
- `completed` - Finished (green)
- `delayed` - Behind schedule (red)

## Database Schema

### production_orders Table
```sql
- id: UUID (primary key)
- order_id: UUID (FK to orders)
- current_stage: production_stage
- stage_data: JSONB (all 9 stages data)
- started_at: TIMESTAMPTZ
- estimated_completion_date: DATE
- actual_completion_date: TIMESTAMPTZ
- progress_percentage: INTEGER (0-100, auto-calculated)
- priority: VARCHAR (low/normal/high/urgent)
- created_at/updated_at: TIMESTAMPTZ
```

### stage_action_history Table
```sql
- id: UUID (primary key)
- production_order_id: UUID (FK)
- stage: production_stage
- action: VARCHAR (20)
- performed_by: UUID (FK to profiles)
- performed_at: TIMESTAMPTZ
- notes: TEXT
- metadata: JSONB
```

## Key Features

### Automatic Progress Calculation
- Database trigger calculates progress percentage based on completed stages
- In-progress stages count as 50% complete

### Stage Data Structure
Each stage in `stage_data` contains:
```json
{
  "status": "completed",
  "completed_at": "2025-01-15T10:00:00Z",
  "completed_by": "user_id",
  "notes": "Stage notes",
  "photos": ["photo_url_1", "photo_url_2"],
  "assigned_to": "staff_id",
  "estimated_date": "2025-01-15",
  "actual_date": "2025-01-15",
  "started_at": "2025-01-15T09:00:00Z",
  "metadata": {}
}
```

### Photo Upload
- Files stored in Supabase storage bucket `production-photos`
- Path structure: `{production_order_id}/{stage}/{timestamp}.{ext}`
- Public URLs generated and stored in stage data

### Audit Trail
- All stage transitions logged to `stage_action_history`
- Includes action type, timestamp, performer, notes
- Provides complete history of production workflow

## Usage

### Creating a Production Order
```typescript
import { productionActions } from '@/lib/production-actions';

const productionOrder = await productionActions.createProductionOrder(
  orderId,
  'normal',
  '2025-02-15'
);
```

### Advancing to Next Stage
```typescript
await productionActions.advanceToNextStage(orderId, userId);
```

### Adding Stage Notes
```typescript
await productionActions.updateStageNotes(
  orderId,
  'printing',
  'Color adjustment needed',
  userId
);
```

### Uploading Stage Photo
```typescript
const photoUrl = await productionActions.uploadStagePhoto(
  orderId,
  'printing',
  file,
  userId
);
```

## Page Access

Production tracking page available at:
```
/admin/production/[orderId]
```

Where `[orderId]` is the UUID of the order to track.

## API Endpoints

### GET `/api/admin/production/[orderId]`
Fetch production order details, action history, and related order info.

### PATCH `/api/admin/production/[orderId]`
Update production order:
```json
{
  "action": "advance" | "rollback" | "update_priority" | "update_estimated_date",
  "stage": "production_stage",  // for advance/rollback
  "reason": "rollback reason",  // for rollback
  "priority": "high",           // for update_priority
  "estimated_completion_date": "2025-02-15"  // for update_estimated_date
}
```

### POST `/api/admin/production/[orderId]`
Add notes, upload photos, or assign staff:
```json
{
  "action": "add_note" | "assign_staff",
  "stage": "production_stage",
  "notes": "Note text",           // for add_note
  "staffId": "user_id"            // for assign_staff
}
```

For photo upload, use `multipart/form-data`:
```javascript
const formData = new FormData();
formData.append('file', photoFile);
formData.append('stage', 'printing');
fetch('/api/admin/production/[orderId]', {
  method: 'POST',
  body: formData
});
```

## Multilingual Support

All labels support Japanese (ja), Korean (ko), and English (en):
```typescript
PRODUCTION_STAGE_LABELS['printing'].ja  // "印刷"
PRODUCTION_STAGE_LABELS['printing'].ko  // "인쇄"
PRODUCTION_STAGE_LABELS['printing'].en  // "Printing"
```

## Security

- RLS policies restrict access to admins only
- Server actions validate user authentication and roles
- Photo uploads restricted to authenticated admin users
- All actions logged with performer user ID

## Future Enhancements

Potential additions:
1. Email notifications on stage completion
2. SMS notifications for high-priority orders
3. Customer-facing progress portal
4. Mobile app for production floor staff
5. Integration with IoT sensors for automated stage detection
6. QR code generation for each stage
7. Analytics dashboard for production metrics
8. Machine learning for estimated date prediction

## Dependencies

- `@/lib/supabase` - Supabase client
- `swr` - Data fetching and caching
- `react` - UI framework
- `next/navigation` - Next.js routing
- Existing UI components from `@/components/ui`

## Testing Considerations

For comprehensive testing, implement:
1. Unit tests for stage transition logic
2. Integration tests for API endpoints
3. E2E tests for complete workflow
4. Photo upload/download tests
5. Permission/authorization tests
6. Progress calculation tests
7. Multilingual label tests
