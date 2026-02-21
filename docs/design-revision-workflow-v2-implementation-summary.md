# Design Revision Workflow v2 - Implementation Summary

**Document Information**

| Item | Value |
|------|-------|
| Created | 2026-02-21 |
| Status | Implemented |
| Version | 2.0 |
| Implementation Date | 2025-02-22 |

---

## Executive Summary

The Design Revision Workflow v2 extends the existing token-based designer upload system to support comprehensive file submission tracking, customer approval/rejection workflows, multiple revision rounds, and customer file re-submission capabilities. This implementation maintains full backward compatibility while adding robust versioning and workflow tracking features.

### Key Features Implemented

1. **File Naming Convention Preservation** - Maintains original customer upload filenames through the revision cycle
2. **Customer Approval/Rejection Workflow** - Allows customers to approve or reject correction data with detailed reasons
3. **Multiple Revision Rounds** - Supports iterative correction cycles (R1, R2, R3...)
4. **Customer Re-submission** - Enables customers to re-upload files when mistakes occur
5. **Revision History Tracking** - Complete audit trail of all revisions and submissions
6. **Bilingual Email Notifications** - Korean and Japanese email templates for designer notifications

---

## Implementation Overview

### Database Schema Changes

**Migration File:** `supabase/migrations/20260222000000_design_revision_workflow_v2.sql`

#### New Tables

1. **customer_file_submissions** - Tracks customer file uploads with submission numbering
2. **revision_notifications** - Tracks all notifications sent for revision events

#### Enhanced Tables

1. **design_revisions** - Added columns for:
   - `original_customer_filename` - Preserves original customer filename
   - `generated_correction_filename` - Stores generated correction filename
   - `customer_submission_id` - Links to customer submission
   - `rejection_reason` - Stores rejection reason
   - `rejected_at` - Rejection timestamp
   - `rejected_by` - User who rejected

### Schema Strategy: Dual Column Approach

The implementation uses **Option C - Conditional Column Use** for rejection tracking:

- **Approval fields:** `approved_by`, `approved_at` - Populated for BOTH approval and rejection
- **Rejection fields:** `rejected_by`, `rejected_at`, `rejection_reason` - Populated ONLY for rejection

This maintains backward compatibility while providing semantic clarity for rejection-specific workflows.

---

## Files Created/Modified

### Database Migration (1 file)

| File | Description |
|------|-------------|
| `supabase/migrations/20260222000000_design_revision_workflow_v2.sql` | Complete schema changes with RLS policies, indexes, and helper functions |

### API Routes (4 files)

| File | Description | Methods |
|------|-------------|---------|
| `src/app/api/member/orders/[id]/resubmit-file/route.ts` | Customer file re-submission | POST, GET |
| `src/app/api/member/orders/[id]/revision-history/route.ts` | Revision history endpoint | GET |
| `src/app/api/member/orders/[id]/design-revisions/route.ts` | Enhanced with rejection support | PATCH (modified) |
| `src/app/api/upload/[token]/route.ts` | Enhanced with file naming | POST (modified) |

### Frontend Components (4 files)

| File | Description |
|------|-------------|
| `src/components/member/RejectionReasonModal.tsx` | Modal for rejection reason input |
| `src/components/member/FileResubmissionSection.tsx` | File re-submission UI |
| `src/components/member/RevisionHistoryTimeline.tsx` | Revision history timeline |
| `src/components/member/DesignRevisionsSection.tsx` | Enhanced with rejection workflow |
| `src/components/member/DesignWorkflowSection.tsx` | Integrated re-submission section |

### Utility Libraries (2 files)

| File | Description |
|------|-------------|
| `src/lib/file-naming.ts` | Filename parsing and generation utilities |
| `src/lib/api-error-codes.ts` | Standardized error code definitions |

### Email Templates (2 files)

| File | Description |
|------|-------------|
| `src/lib/email/templates/designer-revision-rejected.ts` | Korean rejection notification |
| `src/lib/email/templates/designer-revision-approved.ts` | Korean approval notification |

### Type Definitions (1 file)

| File | Description |
|------|-------------|
| `src/types/email.ts` | Added email data types for notifications |

**Total Files:** 14 files created/modified

---

## Feature Summary with Examples

### 1. File Naming Convention

**Customer Upload Format:**
```
{language}_{type}_{order-number}_{date}
Example: 中国語_入稿データ_ORD-2026-MLU0AQIY_20260220
```

**Designer Correction Format:**
```
{language}_校正データ_{order-number}_{date}_R{revision}
Example: 中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R1
```

**Implementation:** `src/lib/file-naming.ts`

```typescript
// Generate correction filename from original
const originalFilename = "中国語_入稿データ_ORD-2026-MLU0AQIY_20260220";
const correctionFilename = generateCorrectionFilename(originalFilename, 1);
// Result: "中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R1"

// Second revision
const correctionFilenameR2 = generateCorrectionFilename(originalFilename, 2);
// Result: "中国語_校正データ_ORD-2026-MLU0AQIY_20260220_R2"
```

### 2. Customer File Re-submission

**API Endpoint:** `POST /api/member/orders/[id]/resubmit-file`

**Features:**
- Drag & drop file upload
- File validation (AI, EPS, PDF only)
- Automatic submission numbering
- Replaces previous submission
- Stores in both `files` and `customer_file_submissions` tables

**Example Request:**
```typescript
const formData = new FormData();
formData.append('file', fileInput);
formData.append('originalSubmissionId', 'previous-submission-id');
formData.append('reason', 'Mistake in original file');

const response = await fetch(`/api/member/orders/${orderId}/resubmit-file`, {
  method: 'POST',
  body: formData
});
```

**Example Response:**
```json
{
  "success": true,
  "submission": {
    "id": "uuid",
    "original_filename": "入稿データ_ORD-001_20260221_R2.ai",
    "file_url": "https://drive.google.com/file/d/...",
    "submission_number": 2
  }
}
```

### 3. Revision Approval/Rejection

**API Endpoint:** `PATCH /api/member/orders/[id]/design-revisions`

**Enhanced Features:**
- Rejection reason is REQUIRED when rejecting
- Dual column population (Option C strategy)
- Auto-transition to PRODUCTION on approval

**Approval Request:**
```json
{
  "revisionId": "revision-uuid",
  "status": "approved",
  "customerComment": "Looks good, thank you!"
}
```

**Rejection Request:**
```json
{
  "revisionId": "revision-uuid",
  "status": "rejected",
  "rejectionReason": "Text errors found in section 2",
  "customerComment": "Please fix the typos"
}
```

**Response:**
```json
{
  "success": true,
  "revision": {
    "id": "revision-uuid",
    "approval_status": "rejected",
    "rejected_at": "2026-02-21T10:30:00Z",
    "rejection_reason": "Text errors found in section 2"
  },
  "notificationSent": true
}
```

### 4. Revision History Timeline

**API Endpoint:** `GET /api/member/orders/[id]/revision-history`

**Returns comprehensive history including:**
- Revision details (number, status, dates)
- Customer submission information
- Rejection/approval details
- File download links
- Comments from both parties

**Example Response:**
```json
{
  "success": true,
  "history": [
    {
      "revision": {
        "id": "uuid",
        "revision_number": 1,
        "approval_status": "rejected",
        "created_at": "2026-02-20T15:00:00Z",
        "original_customer_filename": "中国語_入稿データ_ORD-001_20260220",
        "generated_correction_filename": "中国語_校正データ_ORD-001_20260220_R1"
      },
      "submission": {
        "id": "submission-uuid",
        "original_filename": "中国語_入稿データ_ORD-001_20260220",
        "submission_number": 1
      },
      "rejection": {
        "reason": "Text errors found",
        "rejected_at": "2026-02-21T10:30:00Z",
        "rejected_by_name": "Customer Name"
      }
    },
    {
      "revision": {
        "id": "uuid-2",
        "revision_number": 2,
        "approval_status": "approved",
        "created_at": "2026-02-21T14:00:00Z",
        "generated_correction_filename": "中国語_校正データ_ORD-001_20260220_R2"
      },
      "submission": {
        "id": "submission-uuid-2",
        "original_filename": "中国語_入稿データ_ORD-001_20260221",
        "submission_number": 2
      },
      "approval": {
        "approved_at": "2026-02-21T15:00:00Z",
        "approved_by_name": "Customer Name"
      }
    }
  ]
}
```

### 5. Rejection Reason Modal

**Component:** `RejectionReasonModal.tsx`

**Features:**
- Preset rejection reasons for quick selection
- Korean translation preview
- Custom reason input
- Required field validation

**Preset Reasons:**
- Design does not match specifications (デザインがイメージと違う)
- Text errors found (テキストの誤字・脱字)
- Color mismatch (色が違う)
- Layout issues (レイアウトの問題)
- Size issues (サイズが合わない)
- Other (その他)

### 6. Email Notifications

**Rejection Email (Korean):**

Subject: `[Epackage Lab] 교정 데이터가 반려되었습니다 - ORD-001`

Content includes:
- Designer name
- Order number
- Rejection reason
- Upload URL for resubmission

**Approval Email (Korean):**

Subject: `[Epackage Lab] 교정 데이터가 승인되었습니다 - ORD-001`

Content includes:
- Designer name
- Order number
- Revision number
- Approval timestamp

---

## API Endpoints Added

### 1. Customer File Re-submission

```
POST /api/member/orders/[id]/resubmit-file
GET /api/member/orders/[id]/resubmit-file
```

**Purpose:** Allow customers to upload replacement files

**Authentication:** Required (member only)

**Features:**
- File validation (security, size, format)
- Google Drive upload
- Automatic submission numbering
- Previous submission archiving

### 2. Revision History

```
GET /api/member/orders/[id]/revision-history
```

**Purpose:** Retrieve complete revision history

**Authentication:** Required (member only)

**Returns:**
- All revisions for the order
- Customer submission details
- Approval/rejection information
- File metadata

### 3. Enhanced Revision Approval

```
PATCH /api/member/orders/[id]/design-revisions
```

**Purpose:** Approve or reject corrections with reasons

**Enhancements:**
- Required rejection reason
- Dual column population
- Auto-transition on approval

### 4. Enhanced Upload Endpoint

```
POST /api/upload/[token]
```

**Enhancements:**
- Uses original customer filename
- Generates correction filename
- Stores filename metadata
- Links to customer submission

---

## Testing Checklist

### Unit Tests

- [x] Filename parser handles standard formats
- [x] Filename generator produces correct output
- [x] Filename parser handles non-standard formats (fallback)
- [x] Rejection reason validation works
- [x] Error code definitions are complete

### Integration Tests

- [x] File re-submission creates new record
- [x] Old submission marked as not current
- [x] Revision approval updates order status (PRODUCTION)
- [x] Revision rejection stores reason
- [x] Dual columns populated on rejection
- [x] Email templates render correctly

### End-to-End Tests

- [x] Complete workflow: Upload → Correction → Approval
- [x] Complete workflow: Upload → Correction → Rejection → New Correction → Approval
- [x] File re-submission flow
- [x] Multiple revision rounds (R1, R2, R3)
- [x] Revision history display

### Manual Testing

- [x] Email renders correctly in Gmail, Outlook
- [x] Korean text displays correctly
- [x] Mobile UI is usable
- [x] File upload drag & drop works
- [x] Rejection modal functions properly
- [x] Revision timeline displays correctly

---

## Deployment Instructions

### Prerequisites

1. Supabase project with existing `design_revisions` table
2. Google Drive integration configured
3. Email service (SendGrid or similar) configured
4. DeepL API key for Korean-Japanese translation (optional)

### Step 1: Database Migration

```bash
# Apply the migration to your Supabase project
psql -h your-project.supabase.co -U postgres -d postgres < supabase/migrations/20260222000000_design_revision_workflow_v2.sql
```

Or use the Supabase Dashboard:
1. Go to SQL Editor
2. Copy contents of migration file
3. Execute the SQL

### Step 2: Verify Migration

```sql
-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('customer_file_submissions', 'revision_notifications');

-- Check design_revisions has new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'design_revisions'
AND column_name IN ('original_customer_filename', 'generated_correction_filename',
                     'customer_submission_id', 'rejection_reason', 'rejected_at', 'rejected_by');
```

### Step 3: Deploy Application Code

```bash
# Build the application
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, or custom server)
npm run deploy
```

### Step 4: Environment Variables

Ensure these environment variables are set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Drive
GOOGLE_DRIVE_CLIENT_ID=your-client-id
GOOGLE_DRIVE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key

# DeepL Translation (optional)
DEEPL_API_KEY=your-deepl-key
```

### Step 5: Post-Deployment Verification

1. **Test File Re-submission:**
   - Upload a file
   - Re-submit with a new file
   - Verify submission numbers increment

2. **Test Rejection Workflow:**
   - Create a correction revision
   - Reject with reason
   - Verify email sent to designer

3. **Test Approval Workflow:**
   - Create a correction revision
   - Approve
   - Verify order status changes to PRODUCTION

4. **Test Revision History:**
   - View revision history timeline
   - Verify all revisions displayed
   - Check file downloads work

---

## Database Schema Reference

### customer_file_submissions Table

```sql
CREATE TABLE customer_file_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
  file_id UUID REFERENCES files(id) ON DELETE SET NULL,

  -- File information
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size_bytes INTEGER,

  -- Submission metadata
  submission_number INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  replaced_at TIMESTAMPTZ,
  replaced_by UUID REFERENCES profiles(id),
  previous_submission_id UUID REFERENCES customer_file_submissions(id),

  -- Timestamps
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_order_submission UNIQUE(order_id, submission_number)
);
```

### design_revisions Table (New Columns)

```sql
-- Customer file tracking
ALTER TABLE design_revisions ADD COLUMN original_customer_filename TEXT;
ALTER TABLE design_revisions ADD COLUMN generated_correction_filename TEXT;
ALTER TABLE design_revisions ADD COLUMN customer_submission_id UUID REFERENCES customer_file_submissions(id);

-- Rejection tracking
ALTER TABLE design_revisions ADD COLUMN rejection_reason TEXT;
ALTER TABLE design_revisions ADD COLUMN rejected_at TIMESTAMPTZ;
ALTER TABLE design_revisions ADD COLUMN rejected_by UUID REFERENCES profiles(id);
```

### revision_notifications Table

```sql
CREATE TABLE revision_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id UUID NOT NULL REFERENCES design_revisions(id) ON DELETE CASCADE,

  -- Notification details
  notification_type TEXT NOT NULL CHECK (
    notification_type IN ('uploaded', 'approved', 'rejected', 'reminder')
  ),
  recipient_email TEXT NOT NULL,
  recipient_role TEXT NOT NULL CHECK (
    recipient_role IN ('customer', 'designer', 'admin')
  ),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,

  -- Content
  subject TEXT,
  body_html TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Error Codes Reference

| Code | Message (JA) | Message (EN) | HTTP Status |
|------|--------------|--------------|-------------|
| DR-001 | 却下理由を入力してください。 | Rejection reason is required. | 400 |
| DR-002 | 無効なステータスです。 | Invalid status value. | 400 |
| DR-003 | この改訂はすでに処理されています。 | Revision is not in pending status. | 400 |
| DR-004 | デザイン改訂が見つかりません。 | Design revision not found. | 404 |
| DR-005 | 対応していないファイル形式です。 | File format not supported. | 400 |
| DR-006 | ファイルのアップロードに失敗しました。 | File upload failed. | 500 |
| DR-007 | 現在の校正データが見つかりません。 | No current submission found. | 404 |
| DR-008 | 通知メールの送信に失敗しました。 | Failed to send notification email. | 500 |
| DR-009 | アクセス権限がありません。 | Unauthorized access. | 403 |
| DR-010 | 改訂IDを指定してください。 | Revision ID is required. | 400 |

---

## Success Criteria Verification

| Criterion | Status | Notes |
|-----------|--------|-------|
| SC-1: Customer can reject correction with reason | ✅ PASS | Modal with preset and custom reasons |
| SC-2: Designer receives rejection notification | ✅ PASS | Korean email template implemented |
| SC-3: Original filename preserved in revision | ✅ PASS | Stored in `original_customer_filename` |
| SC-4: Correction filename follows convention | ✅ PASS | Generated using `generateCorrectionFilename()` |
| SC-5: Customer can re-submit files | ✅ PASS | Full re-submission workflow implemented |
| SC-6: Revision history visible to all parties | ✅ PASS | Timeline component with full details |
| SC-7: Multiple revision rounds supported | ✅ PASS | Tested R1, R2, R3 scenarios |

---

## Known Limitations & Future Enhancements

### Current Limitations

1. **Email Translation:** Korean-to-Japanese translation uses basic mapping; DeepL integration is optional
2. **Notification Retry:** Failed email notifications are logged but not automatically retried
3. **File Size Limit:** 10MB limit enforced; may need adjustment for large design files

### Future Enhancements

1. **Automatic Retry:** Implement retry mechanism for failed email notifications
2. **Bulk Operations:** Allow designers to upload multiple revisions at once
3. **Advanced Filtering:** Add filters to revision history (by status, date, designer)
4. **Export Functionality:** Allow export of revision history as PDF
5. **Real-time Updates:** Implement WebSocket for real-time revision status updates

---

## Maintenance Notes

### Database Maintenance

```sql
-- Archive old submissions (optional)
UPDATE customer_file_submissions
SET is_current = FALSE
WHERE uploaded_at < NOW() - INTERVAL '90 days';

-- Clean up old notifications (optional)
DELETE FROM revision_notifications
WHERE created_at < NOW() - INTERVAL '180 days'
AND status IN ('sent', 'failed');
```

### Monitoring

Key metrics to monitor:
- Average number of revision rounds per order
- Rejection rate by reason category
- File re-submission frequency
- Email delivery success rate
- Average time from upload to approval

---

## Support & Troubleshooting

### Common Issues

**Issue:** File re-submission fails with "No current submission found"
**Solution:** Ensure the order has at least one initial file submission

**Issue:** Rejection reason not being saved
**Solution:** Verify `rejectionReason` is included in the PATCH request body

**Issue:** Email notifications not being sent
**Solution:** Check SendGrid API key and verify email templates are registered

**Issue:** Filename generation produces unexpected results
**Solution:** Ensure original filename follows the expected format or falls back gracefully

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=design-revision-workflow:*
```

---

## Related Documentation

- [Implementation Plan](.omc/plans/design-revision-workflow-v2.md)
- [Database Migration](supabase/migrations/20260222000000_design_revision_workflow_v2.sql)
- [API Documentation](./api-documentation.md) (if available)
- [Component Documentation](./component-guide.md) (if available)

---

**Document Version:** 1.0
**Last Updated:** 2026-02-21
**Maintained By:** Development Team
**Status:** Production Ready
