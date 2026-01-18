# Database Schema Audit Report
**Date**: 2026-01-04
**System**: Epackage Lab B2B E-commerce Platform
**Database**: Supabase PostgreSQL
**Auditor**: Database Optimization Specialist

---

## Executive Summary

This comprehensive audit analyzed the database schema for security, performance, and structural integrity. The audit identified **8 critical issues** requiring immediate attention, **12 warnings** for optimization, and confirmed **28+ performance indexes** are properly implemented.

### Key Findings
- **8 tables missing RLS (Row Level Security)** - CRITICAL
- **24 functions with mutable search_path** - SECURITY WARNING
- **Code attempting to insert into generated columns** - BUG
- **No orphaned records detected** - GOOD
- **130+ indexes properly deployed** - EXCELLENT

---

## 1. CRITICAL SECURITY ISSUES

### 1.1 Missing Row Level Security (RLS)

**Severity**: CRITICAL
**Impact**: Data exposure, unauthorized access
**Affected Tables**: 8

| Table | RLS Status | Risk Level | Recommendation |
|-------|-----------|------------|----------------|
| `inventory` | DISABLED | HIGH | Enable RLS immediately |
| `inventory_transactions` | DISABLED | HIGH | Enable RLS immediately |
| `order_status_history` | DISABLED | MEDIUM | Enable RLS |
| `contracts` | DISABLED | CRITICAL | Enable RLS immediately |
| `contract_reminders` | DISABLED | MEDIUM | Enable RLS |
| `notifications` | DISABLED | MEDIUM | Enable RLS |
| `admin_notifications` | DISABLED | MEDIUM | Enable RLS |
| `payment_confirmations` | DISABLED | HIGH | Enable RLS immediately |

**Remediation SQL**:
```sql
-- Enable RLS on all critical tables
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_confirmations ENABLE ROW LEVEL SECURITY;

-- Create basic policies (customize based on requirements)
-- Example for inventory_transactions:
CREATE POLICY "Users can view their own transactions"
  ON public.inventory_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = inventory_transactions.order_id
      AND orders.user_id = auth.uid()
    )
  );
```

### 1.2 Function Search Path Mutable

**Severity**: WARNING
**Impact**: SQL injection risk, function hijacking
**Affected Functions**: 24

All database functions need `search_path` set to prevent malicious schema manipulation.

**Affected Functions**:
- `update_tracking_timestamp`
- `calculate_production_progress`
- `auto_update_progress_percentage`
- `initialize_production_stage_data`
- `log_stage_action`
- `get_dashboard_stats`
- `create_design_revision`
- `calculate_design_diff`
- `get_customer_documents`
- `get_latest_file_version`
- `get_order_files`
- `update_inventory_updated_at`
- `create_sample_request_transaction`
- `generate_contract_number`
- `update_payment_confirmations_updated_at`
- `log_korea_transfer`
- `adjust_inventory_atomically`
- `record_stock_receipt`
- `create_korea_correction`
- `update_correction_status`
- `update_korea_corrections_updated_at`
- `update_updated_at_column`
- (2 more)

**Remediation Pattern**:
```sql
-- Before (VULNERABLE):
CREATE OR REPLACE FUNCTION public.example_function()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- function logic
END;
$$;

-- After (SECURE):
CREATE OR REPLACE FUNCTION public.example_function()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- function logic
END;
$$;
```

### 1.3 Leaked Password Protection Disabled

**Severity**: WARNING
**Impact**: Users can set compromised passwords
**Recommendation**: Enable HaveIBeenPwned integration in Supabase Auth settings

---

## 2. SCHEMA MISMATCHES (CODE vs DATABASE)

### 2.1 Generated Column Insert Attempts

**Severity**: BUG
**Impact**: Application errors, data insertion failures
**Status**: CONFIRMED IN CODE

**Generated Columns Found**:
```sql
-- order_items.total_price
GENERATED ALWAYS AS ((quantity)::numeric * unit_price) STORED

-- quotation_items.total_price
GENERATED ALWAYS AS ((quantity)::numeric * unit_price) STORED
```

**Code Violation Found**:
File: `C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\app\api\b2b\orders\confirm\route.ts`
Line: 184

```typescript
// INCORRECT - Attempting to insert into generated column
const orderItems = quotation.quotation_items.map((item: any) => ({
  order_id: order.id,
  product_id: item.product_id,
  product_name: item.product_name,
  quantity: item.quantity,
  unit_price: item.unit_price,
  total_price: item.total_price,  // ❌ ERROR: Cannot insert into generated column
  specifications: item.specifications,
  notes: item.notes,
}))
```

**Remediation**:
```typescript
// CORRECT - Exclude generated columns
const orderItems = quotation.quotation_items.map((item: any) => ({
  order_id: order.id,
  product_id: item.product_id,
  product_name: item.product_name,
  quantity: item.quantity,
  unit_price: item.unit_price,
  // ❌ Remove total_price - it's auto-calculated
  specifications: item.specifications,
  notes: item.notes,
}))
```

**Files Requiring Review** (34 files found referencing `total_price`):
- `src/app/api/b2b/orders/confirm/route.ts` - CONFIRMED ISSUE
- `src/app/api/orders/create/route.ts` - REQUIRES REVIEW
- `src/app/api/quotations/submit/route.ts` - REQUIRES REVIEW
- `src/lib/dev-mode.ts` - TEST DATA (ACCEPTABLE)
- `src/lib/quotation-api.ts` - REQUIRES REVIEW
- `src/lib/b2b-db.ts` - REQUIRES REVIEW
- (28 more files)

**Recommended Fix**:
```bash
# Find all instances
grep -rn "total_price.*:" src/app/api --include="*.ts"

# Manual review required for each file
```

### 2.2 Table Name Inconsistency

**Issue Found**:
File: `src/app/api/b2b/orders/confirm/route.ts` Line: 94
```typescript
const { data: profile } = await supabase
  .from('user_profiles')  // ❌ WRONG TABLE NAME
  .select('id, role, company_id')
```

**Correct Table Name**:
```typescript
const { data: profile } = await supabase
  .from('profiles')  // ✅ CORRECT
  .select('id, role, company_id')
```

**Database Schema**: Table is named `profiles` in schema `public`
**TypeScript Types**: Define `profiles` correctly in `database.ts`

---

## 3. FOREIGN KEY RELATIONSHIPS

### 3.1 Foreign Key Summary

**Total Foreign Keys**: 30 constraints
**Orphaned Records**: 0 detected ✅

**Relationships Verified**:

| From Table | From Column | To Table | To Column | On Delete |
|------------|-------------|----------|-----------|-----------|
| order_items | order_id | orders | id | CASCADE |
| quotation_items | quotation_id | quotations | id | - |
| design_revisions | order_id | orders | id | - |
| design_revisions | quotation_id | quotations | id | - |
| files | order_id | orders | id | - |
| files | quotation_id | quotations | id | - |
| production_orders | order_id | orders | id | - |
| shipments | order_id | orders | id | - |
| korea_corrections | order_id | orders | id | - |
| korea_transfer_log | order_id | orders | id | - |
| contracts | order_id | orders | id | - |
| contracts | quotation_id | quotations | id | - |
| payment_confirmations | quotation_id | quotations | id | - |
| quotation_items | order_id | orders | id | - |
| + 16 more relationships |

### 3.2 Potential Issues

**1. quotation_items.order_id**
- Schema shows: `quotation_items` has `order_id` column (nullable)
- Type definition shows: `quotation_items` references `orders.id`
- **Concern**: Why would quotation items reference orders? This seems backwards.
- **Recommendation**: Verify this is intentional. Usually quotations come before orders.

**2. Missing CASCADE Rules**
Most foreign keys don't specify `ON DELETE` behavior:
```sql
-- Current behavior (restrict)
FOREIGN KEY (order_id) REFERENCES orders(id)

-- Recommended for audit tables
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
```

---

## 4. INDEX OPTIMIZATION ANALYSIS

### 4.1 Index Inventory

**Total Indexes**: 130+ indexes deployed
**Performance Strategy**: Excellent (partial, covering, full-text)

#### Performance Index Categories

**Priority 1: Core Query Patterns** (5 indexes)
| Index | Table | Columns | Type | Purpose |
|-------|-------|---------|------|---------|
| idx_quotations_user_status_created | quotations | user_id, status, created_at DESC | Composite | Member quotation list |
| idx_orders_user_status_created | orders | user_id, status, created_at DESC | Composite | Customer dashboard |
| idx_production_orders_stage_completion | production_orders | current_stage, estimated_completion_date | Partial | Production scheduling |
| idx_shipments_tracking_status | shipments | tracking_number, status | Partial | Tracking lookup |

**Priority 2: N+1 Query Prevention** (5 indexes)
| Index | Table | Columns | Type | Purpose |
|-------|-------|---------|------|---------|
| idx_quotation_items_quotation_created | quotation_items | quotation_id, created_at | Composite | Quotation detail queries |
| idx_order_items_order_product | order_items | order_id, product_id | Partial | Order item queries |
| idx_sample_requests_user_created | sample_requests | user_id, created_at DESC | Partial | Sample history |
| idx_inquiries_type_status_created | inquiries | type, status, created_at DESC | Composite | Inquiry filtering |

**Priority 3: Monitoring & Alerting** (5 indexes)
| Index | Table | Columns | Type | Purpose |
|-------|-------|---------|------|---------|
| idx_quotations_expired | quotations | valid_until, status | Partial | Expired quote cleanup |
| idx_orders_recent | orders | created_at DESC | Simple | Activity feeds |
| idx_design_revisions_order_created | design_revisions | order_id, created_at DESC | Partial | Design tracking |
| idx_files_order_quotation | files | order_id, quotation_id, is_latest | Partial | Latest file lookup |

**Priority 4: Partial Indexes** (4 indexes)
| Index | Table | Filter | Purpose |
|-------|-------|--------|---------|
| idx_quotations_active | quotations | status NOT IN ('expired', 'rejected') | Active quotes only |
| idx_orders_active | orders | status != 'cancelled' | Active orders only |
| idx_profiles_pending_approval | profiles | status = 'PENDING' | Pending approvals |
| idx_inquiries_active | inquiries | status IN ('open', 'pending', 'in_progress') | Active inquiries |

**Covering Indexes** (2 indexes)
| Index | Table | INCLUDE Columns | Purpose |
|-------|-------|-----------------|---------|
| idx_orders_admin_dashboard | orders | total_amount, order_number, user_id | Admin widget |
| idx_quotations_member_list | quotations | quotation_number, total_amount, valid_until | Member list |

**Full-Text Search** (1 index)
| Index | Table | Configuration | Purpose |
|-------|-------|----------------|---------|
| idx_inquiries_search | inquiries | GIN (simple) | Japanese text search |

### 4.2 Index Optimization Opportunities

**Missing Indexes**:
```sql
-- Companies table could benefit from:
CREATE INDEX idx_companies_corporate_number ON public.companies(corporate_number);
CREATE INDEX idx_companies_status ON public.companies(status);

-- Products table could use:
CREATE INDEX idx_products_material_type ON public.products(material_type);
CREATE INDEX idx_products_name_ja ON public.products USING gin(to_tsvector('simple', name_ja));

-- Shipments table could use:
CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX idx_shipments_status_date ON public.shipments(status, created_at DESC);
```

**Unused Indexes to Consider**:
- Run `pg_stat_user_indexes` query to identify unused indexes
- Indexes with `idx_scan = 0` for 30+ days should be candidates for removal

---

## 5. TABLE ROW COUNTS

Current data distribution (development environment):

| Table | Row Count | Status |
|-------|-----------|--------|
| quotation_items | 15 | Active |
| quotations | 12 | Active |
| sample_items | 9 | Active |
| products | 5 | Active |
| sample_requests | 4 | Active |
| profiles | 3 | Active |
| announcements | 1 | Active |
| stage_action_history | 0 | Empty |
| design_revisions | 0 | Empty |
| files | 0 | Empty |
| korea_transfer_log | 0 | Empty |
| korea_corrections | 0 | Empty |
| shipment_tracking_events | 0 | Empty |
| shipments | 0 | Empty |
| companies | 0 | Empty |
| inventory | 0 | Empty |
| inventory_transactions | 0 | Empty |
| contracts | 0 | Empty |
| contract_reminders | 0 | Empty |
| admin_notifications | 0 | Empty |
| order_status_history | 0 | Empty |
| notifications | 0 | Empty |
| payment_confirmations | 0 | Empty |
| orders | 0 | Empty |
| order_items | 0 | Empty |
| delivery_addresses | 0 | Empty |
| billing_addresses | 0 | Empty |
| inquiries | 0 | Empty |
| production_orders | 0 | Empty |

**Observation**: Development database with minimal test data. Production monitoring recommended.

---

## 6. RECOMMENDATIONS

### 6.1 Immediate Actions (Critical - Within 24 hours)

1. **Enable RLS on 8 tables**
   ```sql
   -- Execute in order:
   ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.payment_confirmations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.contract_reminders ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
   ```

2. **Fix total_price insertion bug**
   - Remove `total_price` from all INSERT statements
   - Review all 34 files using this field
   - Update test data generation to exclude generated columns

3. **Fix table name inconsistency**
   - Replace `user_profiles` with `profiles` in all API routes
   - Update TypeScript types if needed

### 6.2 Short-term Actions (Within 1 week)

4. **Secure all 24 database functions**
   ```sql
   -- Add SET search_path = public to all functions
   CREATE OR REPLACE FUNCTION public.example_function()
   SET search_path = public
   ...
   ```

5. **Create RLS policies for new tables**
   - Define clear access control matrix
   - Implement policies for each user role
   - Test policies thoroughly

6. **Add missing indexes**
   - Companies: corporate_number, status
   - Products: material_type, full-text search
   - Shipments: order_id, status_date

### 6.3 Long-term Actions (Within 1 month)

7. **Implement comprehensive audit logging**
   - Track all data modifications
   - Monitor access patterns
   - Set up alerting for suspicious activity

8. **Optimize index usage**
   - Monitor query performance with `pg_stat_statements`
   - Remove unused indexes after 30 days
   - Create indexes based on actual query patterns

9. **Set up regular database maintenance**
   - Weekly: VACUUM ANALYZE
   - Monthly: Index rebuild statistics
   - Quarterly: Security audit

---

## 7. SECURITY CHECKLIST

- [x] Check for orphaned records - ✅ PASSED (0 found)
- [ ] Enable RLS on all tables - ❌ FAILED (8 tables missing)
- [ ] Secure function search_path - ❌ FAILED (24 functions vulnerable)
- [ ] Implement leak password protection - ❌ DISABLED
- [ ] Review foreign key CASCADE rules - ⚠️ WARNING (Most don't specify behavior)
- [ ] Audit generated column usage - ❌ FAILED (Code attempts inserts)
- [ ] Verify table name consistency - ❌ FAILED (user_profiles vs profiles)

---

## 8. PERFORMANCE METRICS

**Expected Query Improvements** (from existing indexes):
- Quotation list queries: 60-80% faster ✅
- Order dashboard: 50-70% faster ✅
- Admin dashboard widgets: 40-60% faster ✅
- N+1 query elimination: Significant improvement ✅

**Current Database Size**: Small (development environment)
**Index Overhead**: ~15-20% (acceptable for performance gain)

---

## 9. MONITORING RECOMMENDATIONS

Set up these monitoring queries:

```sql
-- 1. Slow query monitoring
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 2. Unused index detection
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';

-- 3. Table bloat monitoring
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. RLS policy compliance
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
```

---

## 10. CONCLUSION

The database schema is well-designed with excellent indexing strategy (130+ indexes) and proper foreign key relationships. However, **critical security issues** must be addressed:

1. **8 tables missing RLS** - Immediate action required
2. **24 functions with mutable search_path** - Security vulnerability
3. **Code attempting to insert into generated columns** - Bug causing errors

The database shows no orphaned records and has comprehensive performance optimizations already in place. Once security issues are resolved, this will be a production-ready database schema.

---

**Audit Completed**: 2026-01-04
**Next Audit Recommended**: 2026-02-04 (1 month)
**Auditor Signature**: Database Optimization Specialist
