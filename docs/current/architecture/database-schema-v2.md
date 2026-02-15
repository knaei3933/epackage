# Database Schema Documentation (Updated 2026-01-03)

Complete database schema documentation for Epackage Lab Web.

## Table of Contents

- [Overview](#overview)
- [Core Tables](#core-tables)
- [Enums](#enums)
- [Performance Indexes](#performance-indexes)
- [Foreign Key Relationships](#foreign-key-relationships)
- [Database Triggers](#database-triggers)
- [Entity Relationships](#entity-relationships)

---

## Overview

The database is built on Supabase (PostgreSQL) with the following design principles:

- **Normalization**: Third normal form (3NF)
- **Security**: Row Level Security (RLS) on all tables
- **Audit Trail**: Timestamps and user tracking on all records
- **Performance**: 28+ composite indexes for query optimization
- **Integrity**: 19 foreign key constraints with proper cascade behaviors

---

## Core Tables

### profiles

User profile information linked to Supabase Auth.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key (references auth.users) |
| email | text | NO | User email |
| kanji_last_name | text | NO | Japanese kanji last name |
| kanji_first_name | text | NO | Japanese kanji first name |
| kana_last_name | text | NO | Japanese hiragana last name |
| kana_first_name | text | NO | Japanese hiragana first name |
| corporate_phone | text | YES | Corporate phone number |
| personal_phone | text | YES | Personal phone number |
| business_type | business_type | NO | INDIVIDUAL or CORPORATION |
| company_name | text | YES | Company name |
| legal_entity_number | text | YES | Japanese corporate number (13 digits) |
| position | text | YES | Job position |
| department | text | YES | Department |
| company_url | text | YES | Company website |
| product_category | product_category | NO | COSMETICS, CLOTHING, ELECTRONICS, etc. |
| acquisition_channel | text | YES | How they found the service |
| postal_code | text | YES | Postal code (XXX-XXXX) |
| prefecture | text | YES | Japanese prefecture |
| city | text | YES | City name |
| street | text | YES | Street address |
| role | user_role | NO | ADMIN or MEMBER |
| status | user_status | NO | PENDING, ACTIVE, SUSPENDED, DELETED |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |
| last_login_at | timestamptz | YES | Last login timestamp |

**Indexes:**
- `idx_profiles_id` on (id)
- `idx_profiles_pending_approval` on (created_at DESC) WHERE status = 'PENDING'

---

### orders

Customer orders for packaging products.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| user_id | uuid | NO | References auth.users |
| order_number | text | NO | Unique order identifier |
| status | order_status | NO | Order status |
| total_amount | numeric | NO | Total order amount |
| notes | text | YES | Customer notes |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |
| shipped_at | timestamptz | YES | Shipment timestamp |
| delivered_at | timestamptz | YES | Delivery timestamp |

**Indexes:**
- `idx_orders_user_status_created` on (user_id, status, created_at DESC) WHERE status != 'cancelled'
- `idx_orders_active` on (user_id, created_at DESC) WHERE status != 'cancelled'
- `idx_orders_admin_dashboard` on (status, created_at DESC) INCLUDE (total_amount, order_number, user_id)
- `idx_orders_recent` on (created_at DESC)

---

### quotations

Price quotations for customers.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| user_id | uuid | YES | References auth.users (nullable for guest quotes) |
| quotation_number | text | NO | Unique quotation identifier |
| status | quotation_status | NO | draft, sent, approved, rejected, expired |
| total_amount | numeric | NO | Total quotation amount |
| valid_until | timestamptz | YES | Quote expiration date |
| notes | text | YES | Customer notes |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |
| sent_at | timestamptz | YES | Sent timestamp |
| approved_at | timestamptz | YES | Approval timestamp |

**Indexes:**
- `idx_quotations_user_status_created` on (user_id, status, created_at DESC) WHERE user_id IS NOT NULL AND status != 'expired'
- `idx_quotations_active` on (user_id, created_at DESC) WHERE user_id IS NOT NULL AND status NOT IN ('expired', 'rejected')
- `idx_quotations_member_list` on (user_id, status, created_at DESC) INCLUDE (quotation_number, total_amount, valid_until) WHERE user_id IS NOT NULL
- `idx_quotations_expired` on (valid_until, status) WHERE status IN ('sent', 'approved') AND valid_until IS NOT NULL
- `idx_quotations_recent` on (created_at DESC)

---

### order_items

Individual items within an order.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| order_id | uuid | NO | References orders |
| product_id | text | YES | Product identifier |
| product_name | text | NO | Product name |
| quantity | integer | NO | Item quantity |
| unit_price | numeric | NO | Price per unit |
| total_price | numeric | NO | Generated total price |
| specifications | jsonb | YES | Custom specifications |
| created_at | timestamptz | NO | Creation timestamp |

**Indexes:**
- `idx_order_items_order_product` on (order_id, product_id) WHERE product_id IS NOT NULL

---

### quotation_items

Individual items within a quotation.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| quotation_id | uuid | NO | References quotations |
| product_id | text | YES | Product identifier |
| product_name | text | NO | Product name |
| quantity | integer | NO | Item quantity |
| unit_price | numeric | NO | Price per unit |
| total_price | numeric | NO | Generated total price |
| specifications | jsonb | YES | Custom specifications |
| created_at | timestamptz | NO | Creation timestamp |

**Indexes:**
- `idx_quotation_items_quotation_created` on (quotation_id, created_at)

---

### production_orders

Production workflow tracking with 9-stage process.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| order_id | uuid | NO | References orders |
| current_stage | production_stage | NO | Current production stage |
| stage_data | jsonb | NO | Data for all 9 stages |
| started_at | timestamptz | YES | Production start |
| estimated_completion_date | date | YES | Estimated completion |
| actual_completion_date | timestamptz | YES | Actual completion |
| progress_percentage | integer | YES | Progress (0-100) |
| priority | varchar | YES | low, normal, high, urgent |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |

**Indexes:**
- `idx_production_orders_stage_completion` on (current_stage, estimated_completion_date) WHERE current_stage IN ('data_received', 'inspection', 'design', 'plate_making')

---

### shipments

Shipping information for orders.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| shipment_number | text | NO | Unique shipment identifier |
| order_id | uuid | YES | References orders |
| tracking_number | text | YES | Carrier tracking number |
| carrier_code | text | YES | Carrier code |
| carrier_name | text | YES | Carrier name |
| status | text | YES | Shipment status |
| shipped_at | timestamptz | YES | Shipment timestamp |
| estimated_delivery_date | date | YES | Estimated delivery |
| delivered_at | timestamptz | YES | Delivery timestamp |
| tracking_url | text | YES | Tracking URL |
| shipping_cost | numeric | YES | Shipping cost |
| shipping_method | text | YES | Shipping method |
| service_level | text | YES | Service level |
| package_details | jsonb | YES | Package information |
| shipping_notes | text | YES | Shipping notes |
| delivery_notes | text | YES | Delivery notes |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |

**Indexes:**
- `idx_shipments_tracking_status` on (tracking_number, status) WHERE tracking_number IS NOT NULL

---

### sample_requests

Sample product requests from customers.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| user_id | uuid | YES | References auth.users |
| request_number | text | NO | Unique request identifier |
| status | sample_request_status | NO | Request status |
| delivery_address_id | uuid | YES | References delivery_addresses |
| tracking_number | text | YES | Tracking number |
| notes | text | YES | Customer notes |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |
| shipped_at | timestamptz | YES | Shipment timestamp |

**Indexes:**
- `idx_sample_requests_user_created` on (user_id, created_at DESC) WHERE user_id IS NOT NULL

---

### sample_items

Individual items within a sample request.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| sample_request_id | uuid | NO | References sample_requests |
| product_id | text | YES | Product identifier |
| product_name | text | NO | Product name |
| category | text | NO | Product category |
| quantity | integer | NO | Sample quantity |
| created_at | timestamptz | NO | Creation timestamp |

**Indexes:**
- `idx_sample_items_request_created` on (sample_request_id, created_at)

---

### inquiries

Contact form submissions and customer inquiries.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| user_id | uuid | YES | References auth.users |
| inquiry_number | text | NO | Unique inquiry identifier |
| type | inquiry_type | NO | Inquiry type |
| status | inquiry_status | NO | Inquiry status |
| subject | text | NO | Inquiry subject |
| message | text | NO | Inquiry message |
| response | text | YES | Admin response |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |
| responded_at | timestamptz | YES | Response timestamp |
| request_number | text | YES | Request number |
| customer_name | text | NO | Customer name (Kanji) |
| customer_name_kana | text | NO | Customer name (Kana) |
| company_name | text | YES | Company name |
| email | text | NO | Email address |
| phone | text | NO | Phone number |
| fax | text | YES | Fax number |
| postal_code | text | YES | Postal code |
| prefecture | text | YES | Prefecture |
| city | text | YES | City |
| street | text | YES | Street address |
| urgency | text | YES | Urgency level |
| preferred_contact | text | YES | Preferred contact method |
| privacy_consent | boolean | NO | Privacy consent |
| admin_notes | text | YES | Internal admin notes |

**Indexes:**
- `idx_inquiries_type_status_created` on (type, status, created_at DESC)
- `idx_inquiries_active` on (type, created_at DESC) WHERE status IN ('open', 'pending', 'in_progress')
- `idx_inquiries_search` on inquiries USING gin(to_tsvector('simple', subject || ' ' || message || ' ' || customer_name || ' ' || COALESCE(company_name, '')))

---

### files

File attachments for orders and quotations.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| order_id | uuid | YES | References orders |
| quotation_id | uuid | YES | References quotations |
| file_type | file_type | NO | AI, PDF, PSD, PNG, JPG, EXCEL, OTHER |
| original_filename | text | NO | Original filename |
| file_url | text | NO | Storage URL |
| file_path | text | NO | Storage path |
| file_size_bytes | integer | YES | File size in bytes |
| version | integer | NO | File version |
| is_latest | boolean | NO | Is latest version flag |
| validation_status | file_validation_status | NO | PENDING, VALID, INVALID |
| validation_results | jsonb | YES | Validation results |
| uploaded_by | uuid | YES | References profiles |
| uploaded_at | timestamptz | NO | Upload timestamp |
| validated_at | timestamptz | YES | Validation timestamp |

**Indexes:**
- `idx_files_order_quotation` on (order_id, quotation_id, is_latest) WHERE is_latest = true
- `idx_files_uploaded_by_created` on (uploaded_by, uploaded_at DESC) WHERE uploaded_by IS NOT NULL

---

### design_revisions

Design revision tracking for orders.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| order_id | uuid | YES | References orders |
| quotation_id | uuid | YES | References quotations |
| revision_number | integer | NO | Revision number |
| revision_name | text | NO | Revision name |
| status | text | NO | Revision status |
| revision_reason | text | YES | Reason for revision |
| revision_description | text | YES | Revision description |
| change_summary | jsonb | YES | Summary of changes |
| ai_extracted_data | jsonb | YES | AI-extracted data |
| ai_extraction_confidence | numeric | YES | AI confidence score |
| korean_corrected_data | jsonb | YES | Korea-corrected data |
| correction_notes | text | YES | Correction notes |
| data_diff | jsonb | YES | Data difference |
| changed_fields | text[] | YES | Changed field list |
| original_files | text[] | YES | Original file list |
| corrected_files | text[] | YES | Corrected file list |
| spec_sheet_url | text | YES | Spec sheet URL |
| submitted_by | uuid | YES | References profiles |
| submitted_at | timestamptz | YES | Submission timestamp |
| reviewed_by | uuid | YES | References profiles |
| reviewed_at | timestamptz | YES | Review timestamp |
| review_decision | text | YES | Review decision |
| review_notes | text | YES | Review notes |
| customer_action | text | YES | Customer action |
| customer_action_at | timestamptz | YES | Customer action timestamp |
| customer_notes | text | YES | Customer notes |
| priority | text | YES | Revision priority |
| estimated_completion_date | date | YES | Estimated completion |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |
| completed_at | timestamptz | YES | Completion timestamp |

**Indexes:**
- `idx_design_revisions_order_created` on (order_id, created_at DESC) WHERE order_id IS NOT NULL

---

### korea_corrections

Korea correction workflow tracking.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| order_id | uuid | NO | References orders |
| quotation_id | uuid | YES | References quotations |
| correction_source | correction_source | NO | Email, phone, portal, manual |
| correction_reference | text | YES | Reference identifier |
| correction_date | timestamptz | NO | Correction date |
| issue_description | text | YES | Issue description |
| issue_category | text | YES | Issue category |
| urgency | text | NO | Urgency level |
| corrected_data | jsonb | YES | Corrected data |
| correction_notes | text | YES | Correction notes |
| assigned_to | uuid | YES | Assigned user |
| status | correction_status | NO | Correction status |
| admin_notes | text | YES | Admin notes |
| corrected_files | text[] | YES | Corrected file list |
| customer_notified | boolean | NO | Customer notified flag |
| customer_notification_date | timestamptz | YES | Notification date |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |
| completed_at | timestamptz | YES | Completion timestamp |

**Indexes:**
- `idx_korea_corrections_status_urgency` on (status, urgency, created_at) WHERE status IN ('pending', 'in_progress')

---

### announcements

System announcements for users.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| title | text | NO | Announcement title |
| content | text | NO | Announcement content |
| category | text | NO | maintenance, update, notice, promotion |
| priority | text | NO | low, medium, high |
| is_published | boolean | NO | Published flag |
| published_at | timestamptz | YES | Publication timestamp |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |

**Indexes:**
- `idx_announcements_published` on (is_published, published_at DESC) WHERE is_published = true

---

### delivery_addresses

Customer delivery addresses.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| user_id | uuid | NO | References auth.users |
| name | text | NO | Address name |
| postal_code | text | NO | Postal code |
| prefecture | text | NO | Prefecture |
| city | text | NO | City |
| address | text | NO | Street address |
| building | text | YES | Building name |
| phone | text | NO | Contact phone |
| contact_person | text | YES | Contact person |
| is_default | boolean | NO | Default address flag |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |

**Indexes:**
- `idx_delivery_addresses_user_default` on (user_id, is_default, created_at DESC)

---

### billing_addresses

Customer billing addresses.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| user_id | uuid | NO | References auth.users |
| company_name | text | NO | Company name |
| postal_code | text | NO | Postal code |
| prefecture | text | NO | Prefecture |
| city | text | NO | City |
| address | text | NO | Street address |
| building | text | YES | Building name |
| tax_number | text | YES | Tax number |
| email | text | YES | Billing email |
| phone | text | YES | Billing phone |
| is_default | boolean | NO | Default address flag |
| created_at | timestamptz | NO | Creation timestamp |
| updated_at | timestamptz | NO | Last update timestamp |

**Indexes:**
- `idx_billing_addresses_user_default` on (user_id, is_default, created_at DESC)

---

### stage_action_history

Audit log for production stage transitions.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| production_order_id | uuid | NO | References production_orders |
| stage | production_stage | NO | Production stage |
| action | varchar | NO | Action performed |
| performed_by | uuid | NO | References profiles |
| performed_at | timestamptz | YES | Action timestamp |
| notes | text | YES | Action notes |
| metadata | jsonb | YES | Additional metadata |
| created_at | timestamptz | NO | Creation timestamp |

**Indexes:**
- `idx_stage_action_history_production_created` on (production_order_id, performed_at DESC)

---

### shipment_tracking_events

Shipment tracking event history.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| shipment_id | uuid | YES | References shipments |
| status | text | NO | Event status |
| event_time | timestamptz | YES | Event timestamp |
| location | text | YES | Event location |
| description | text | YES | Event description |
| raw_data | jsonb | YES | Raw carrier data |
| created_at | timestamptz | NO | Creation timestamp |

**Indexes:**
- `idx_shipment_tracking_events_shipment_created` on (shipment_id, event_time DESC) WHERE shipment_id IS NOT NULL

---

### korea_transfer_log

Korea transfer tracking log.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| order_id | uuid | NO | References orders |
| sent_by | uuid | NO | References auth.users |
| sent_to | text | NO | Recipient |
| files_count | integer | NO | Files transferred |
| urgency | text | NO | Transfer urgency |
| message_id | text | YES | Message ID |
| status | text | NO | Transfer status |
| created_at | timestamptz | NO | Creation timestamp |

---

## Enums

### order_status
```
pending, processing, manufacturing, ready, shipped, delivered, cancelled
```

### quotation_status
```
draft, sent, approved, rejected, expired
```

### production_stage
```
data_received, inspection, design, plate_making, printing,
surface_finishing, die_cutting, lamination, final_inspection
```

### sample_request_status
```
received, processing, shipped, delivered, cancelled
```

### inquiry_type
```
product, quotation, sample, order, billing, other, general,
technical, sales, support
```

### inquiry_status
```
open, responded, resolved, closed, pending, in_progress
```

### user_role
```
ADMIN, MEMBER
```

### user_status
```
PENDING, ACTIVE, SUSPENDED, DELETED
```

### business_type
```
INDIVIDUAL, CORPORATION
```

### product_category
```
COSMETICS, CLOTHING, ELECTRONICS, KITCHEN, FURNITURE, OTHER
```

### file_type
```
AI, PDF, PSD, PNG, JPG, EXCEL, OTHER
```

### file_validation_status
```
PENDING, VALID, INVALID
```

### correction_source
```
email, phone, portal, manual
```

### correction_status
```
pending, in_progress, completed, rejected
```

---

## Performance Indexes

### Core Query Patterns (Priority 1)

| Index | Tables | Purpose |
|-------|--------|---------|
| idx_quotations_user_status_created | quotations(user_id, status, created_at DESC) | Member quotation list queries |
| idx_orders_user_status_created | orders(user_id, status, created_at DESC) | Customer order dashboard |
| idx_production_orders_stage_completion | production_orders(current_stage, estimated_completion_date) | Production scheduling |
| idx_shipments_tracking_status | shipments(tracking_number, status) | Shipment tracking lookup |

### N+1 Query Prevention (Priority 2)

| Index | Tables | Purpose |
|-------|--------|---------|
| idx_quotation_items_quotation_created | quotation_items(quotation_id, created_at) | Quotation detail queries |
| idx_order_items_order_product | order_items(order_id, product_id) | Order item queries |
| idx_sample_requests_user_created | sample_requests(user_id, created_at DESC) | Sample request history |
| idx_inquiries_type_status_created | inquiries(type, status, created_at DESC) | Inquiry filtering |

### Monitoring & Alerting (Priority 3)

| Index | Tables | Purpose |
|-------|--------|---------|
| idx_quotations_expired | quotations(valid_until, status) | Expired quotation cleanup |
| idx_orders_recent | orders(created_at DESC) | Recent activity feeds |
| idx_quotations_recent | quotations(created_at DESC) | Recent quotation activity |
| idx_design_revisions_order_created | design_revisions(order_id, created_at DESC) | Design revision tracking |
| idx_files_order_quotation | files(order_id, quotation_id, is_latest) | Latest file lookup |

### Partial Indexes (Priority 4)

| Index | Tables | Filter | Purpose |
|-------|--------|--------|---------|
| idx_quotations_active | quotations(user_id, created_at DESC) | status NOT IN ('expired', 'rejected') | Active quotations only |
| idx_orders_active | orders(user_id, created_at DESC) | status != 'cancelled' | Active orders only |
| idx_profiles_pending_approval | profiles(created_at DESC) | status = 'PENDING' | Pending approvals |
| idx_inquiries_active | inquiries(type, created_at DESC) | status IN ('open', 'pending', 'in_progress') | Active inquiries |

### Covering Indexes

| Index | Tables | INCLUDE Columns | Purpose |
|-------|--------|-----------------|---------|
| idx_orders_admin_dashboard | orders(status, created_at DESC) | total_amount, order_number, user_id | Admin dashboard widget |
| idx_quotations_member_list | quotations(user_id, status, created_at DESC) | quotation_number, total_amount, valid_until | Member quotation list |

### Full-Text Search

| Index | Tables | Configuration | Purpose |
|-------|--------|----------------|---------|
| idx_inquiries_search | inquiries USING gin(...) | simple | Japanese text search on inquiries |

### Additional Indexes

| Index | Tables | Purpose |
|-------|--------|---------|
| idx_sample_items_request_created | sample_items(sample_request_id, created_at) | Sample item queries |
| idx_files_uploaded_by_created | files(uploaded_by, uploaded_at DESC) | User file uploads |
| idx_billing_addresses_user_default | billing_addresses(user_id, is_default, created_at DESC) | Billing address lookup |
| idx_delivery_addresses_user_default | delivery_addresses(user_id, is_default, created_at DESC) | Delivery address lookup |
| idx_announcements_published | announcements(is_published, published_at DESC) | Published announcements |
| idx_stage_action_history_production_created | stage_action_history(production_order_id, performed_at DESC) | Production audit trail |
| idx_korea_corrections_status_urgency | korea_corrections(status, urgency, created_at) | Correction workflow |
| idx_shipment_tracking_events_shipment_created | shipment_tracking_events(shipment_id, event_time DESC) | Tracking event history |

---

## Foreign Key Relationships

### Total: 19 Foreign Key Constraints

| From Table | From Column | To Table | To Column | On Delete |
|------------|-------------|----------|-----------|-----------|
| design_revisions | order_id | orders | id | - |
| design_revisions | quotation_id | quotations | id | - |
| design_revisions | reviewed_by | profiles | id | - |
| design_revisions | submitted_by | profiles | id | - |
| files | order_id | orders | id | - |
| files | quotation_id | quotations | id | - |
| files | uploaded_by | profiles | id | - |
| korea_corrections | order_id | orders | id | - |
| korea_corrections | quotation_id | quotations | id | - |
| order_items | order_id | orders | id | CASCADE |
| production_orders | order_id | orders | id | - |
| quotation_items | quotation_id | quotations | id | - |
| sample_items | sample_request_id | sample_requests | id | - |
| sample_requests | delivery_address_id | delivery_addresses | id | - |
| shipments | order_id | orders | id | - |
| stage_action_history | performed_by | profiles | id | - |
| stage_action_history | production_order_id | production_orders | id | - |

---

## Database Triggers

### Total: 19 Triggers

| Trigger | Table | Event | Function | Purpose |
|---------|-------|-------|----------|---------|
| update_announcements_updated_at | announcements | UPDATE | update_updated_at_column() | Auto-update timestamp |
| update_billing_addresses_updated_at | billing_addresses | UPDATE | update_updated_at_column() | Auto-update timestamp |
| update_delivery_addresses_updated_at | delivery_addresses | UPDATE | update_updated_at_column() | Auto-update timestamp |
| generate_inquiry_number_trigger | inquiries | INSERT | set_inquiry_number() | Auto-generate inquiry number |
| update_inquiries_updated_at | inquiries | UPDATE | update_updated_at_column() | Auto-update timestamp |
| korea_corrections_updated_at | korea_corrections | UPDATE | update_korea_corrections_updated_at() | Auto-update timestamp |
| generate_order_number_trigger | orders | INSERT | set_order_number() | Auto-generate order number |
| update_orders_updated_at | orders | UPDATE | update_updated_at_column() | Auto-update timestamp |
| trigger_auto_update_progress | production_orders | INSERT/UPDATE | auto_update_progress_percentage() | Auto-calculate progress |
| trigger_initialize_stage_data | production_orders | INSERT | initialize_production_stage_data() | Initialize stage data |
| trigger_log_stage_actions | production_orders | UPDATE | log_stage_action() | Log stage changes |
| update_production_orders_updated_at | production_orders | UPDATE | update_updated_at_column() | Auto-update timestamp |
| profiles_updated_at | profiles | UPDATE | update_updated_at_column() | Auto-update timestamp |
| generate_quotation_number_trigger | quotations | INSERT | set_quotation_number() | Auto-generate quotation number |
| update_quotations_updated_at | quotations | UPDATE | update_updated_at_column() | Auto-update timestamp |
| generate_sample_request_number_trigger | sample_requests | INSERT | set_sample_request_number() | Auto-generate request number |
| update_sample_requests_updated_at | sample_requests | UPDATE | update_updated_at_column() | Auto-update timestamp |

---

## Entity Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│  profiles   │
│  (users)    │
└──────┬──────┘
       │
       ├───(1:N)───┬─────────────────┬──────────────────┬──────────────┐
       │           │                 │                  │              │
       ▼           ▼                 ▼                  ▼              ▼
  ┌─────────┐ ┌─────────┐     ┌──────────┐     ┌──────────┐    ┌───────────────┐
  │ orders  │ │quotations│     │  files   │     │ inquiries│    │delivery_      │
  └────┬────┘ └────┬────┘     └────┬─────┘     └────┬─────┘    │_addresses     │
       │           │               │                │          └───────────────┘
       │           │               │                │
       ├───(1:N)───┤               │                │
       │           │               │                │
       ▼           ▼               │                │
  ┌─────────────┬───────────┐     │                │
  │order_items  │quotation_  │     │                │
  │             │_items      │     │                │
  └─────────────┴───────────┘     │                │
                                 │                │
       ┌─────────────────────────┴────────────────┘
       │
       ▼
┌──────────────────┐
│  design_revisions │
└─────────┬─────────┘
          │
          ▼
   ┌──────────────────┐
   │ production_orders│
   └─────────┬─────────┘
             │
             ├───(1:N)───┬─────────────────────┐
             │           │                     │
             ▼           ▼                     ▼
      ┌──────────────┐ ┌──────────────┐ ┌────────────────┐
      │stage_action_ │ │ shipments    │ │ korea_         │
      │_history      │ └──────────────┘ │corrections     │
      └──────────────┘                  └────────────────┘
```

### Table Groups

**Customer Management:**
- profiles, delivery_addresses, billing_addresses

**Order Management:**
- orders, order_items, quotations, quotation_items

**Production Workflow:**
- production_orders, stage_action_history, design_revisions, files

**Shipping:**
- shipments, shipment_tracking_events

**Customer Service:**
- inquiries, sample_requests, sample_items, announcements

**Korea Integration:**
- korea_corrections, korea_transfer_log

---

## Performance Notes

### Expected Improvements

- **Quotation list queries**: 60-80% faster
- **Order dashboard**: 50-70% faster
- **Admin dashboard widgets**: 40-60% faster
- **N+1 query elimination**: Significant improvement on join-heavy queries

### Index Strategy

1. **Partial indexes** for filtered queries (e.g., active only)
2. **Covering indexes** to prevent table lookups
3. **Composite indexes** for multi-column filtering/sorting
4. **Full-text search** using simple tokenization for Japanese text

---

For database administration:
- Supabase Dashboard: https://supabase.com/dashboard
- PostgreSQL Documentation: https://www.postgresql.org/docs/
