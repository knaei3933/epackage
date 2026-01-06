# Admin Dashboard Statistics - Quick Reference Guide

## Overview

The admin dashboard provides real-time statistics for all key business metrics. Data is automatically refreshed every 30 seconds and can be manually filtered by time period.

## Access

**URL**: `/admin/dashboard`
**Required Role**: ADMIN

## Statistics Categories

### 1. Orders (주문 통계)

| Metric | Description |
|--------|-------------|
| Total Orders (총 주문수) | Total number of orders in selected period |
| Total Revenue (총 매출) | Sum of all order amounts |
| Pending (대기 중) | Orders with PENDING status |
| In Progress (진행 중) | Orders in active workflow stages |
| Completed (완료) | Orders with DELIVERED status |
| By Status | Breakdown by order status for chart |

**Status Categories**:
- `PENDING` - 受付待 (Waiting)
- `QUOTATION` - 見積中 (Quoting)
- `DATA_RECEIVED` - データ受領待 (Waiting for data)
- `WORK_ORDER` - 作業標準書作成中 (Work order creation)
- `CONTRACT_SENT` - 契約書送付済 (Contract sent)
- `CONTRACT_SIGNED` - 契約署名済 (Contract signed)
- `PRODUCTION` - 製造中 (In production)
- `STOCK_IN` - 入庫済 (Stocked)
- `SHIPPED` - 発送済 (Shipped)
- `DELIVERED` - 配達完了 (Delivered)

### 2. Quotations (견적 통계)

| Metric | Description |
|--------|-------------|
| Total Quotations (총 견적수) | Total number of quotations |
| Draft (下書き) | Quotations with DRAFT status |
| Sent (送付済み) | Quotations with SENT status |
| Approved (承認済み) | Quotations with APPROVED status |
| Conversion Rate (전환율) | (Approved / Total) × 100% |

**Recent Quotations Table**: Shows last 10 quotations with:
- Quotation number
- Customer name and email
- Status badge
- Amount
- Date

### 3. Sample Requests (샘플 요청)

| Metric | Description |
|--------|-------------|
| Total Samples (총 샘플) | Total sample requests |
| Processing (처리 중) | Samples with received/processing status |
| Completed (완료) | Samples with delivered status |

### 4. Production (생산 통계)

| Metric | Description |
|--------|-------------|
| In Progress (생산 중) | Active production jobs |
| Completed (완료) | Finished production jobs |
| Avg Days (평균 기간) | Average production duration in days |

### 5. Shipments (배송 통계)

| Metric | Description |
|--------|-------------|
| Today Shipments (오늘 배송) | Shipments sent today |
| In Transit (배송 중) | Currently shipping orders |

### 6. Monthly Revenue (월별 매출)

Shows revenue trends for the last 6 months in bar chart format.

## Using the Period Filter

The dashboard supports three time periods:

- **7 days** (최근 7일) - Last week
- **30 days** (최근 30일) - Last month (default)
- **90 days** (최근 90일) - Last quarter

To change the period:
1. Click the period dropdown in the header
2. Select desired period
3. Statistics automatically refresh

## Real-time Updates

- **Auto-refresh**: Every 30 seconds
- **Manual refresh**: Click reload icon (if available)
- **Update indicator**: Shows "更新中..." during refresh

## Error Handling

If statistics fail to load:
1. Error alert displays with retry button
2. Fallback UI shows degraded information
3. Click "再試行" (Retry) to reload
4. Click "ページを再読み込み" to refresh entire page

## API Usage

### Get Statistics

```bash
GET /api/admin/dashboard/statistics?period=30
```

**Query Parameters**:
- `period`: Number of days (7, 30, 90) - Default: 30

**Response**:
```json
{
  "period": 30,
  "generatedAt": "2026-01-04T10:00:00Z",
  "orders": {
    "total": 150,
    "pending": 10,
    "inProgress": 45,
    "completed": 95,
    "totalRevenue": 15000000,
    "avgOrderAmount": 100000
  },
  "quotations": {
    "total": 200,
    "conversionRate": 35.0
  },
  "samples": {
    "total": 25,
    "processing": 8,
    "completed": 17
  },
  "production": {
    "inProgress": 12,
    "completed": 88,
    "avgDays": 7.5
  },
  "shipments": {
    "today": 5,
    "inTransit": 15
  }
}
```

## Charts and Visualizations

### Status Distribution (Pie Chart)
- Shows order status breakdown
- Color-coded by category
- Displays percentage

### Monthly Revenue (Bar Chart)
- Shows revenue trend
- Last 6 months data
- Currency formatted in JPY

## Quick Actions

The dashboard includes shortcuts to:
- **Order Management** (`/admin/orders`)
- **Quotation Management** (`/admin/quotations`)
- **Production Management** (`/admin/production`)
- **Approval Queue** (`/admin/approvals`)

## Performance Tips

1. **Use appropriate period**: Longer periods load more data
2. **Monitor refresh rate**: 30-second default balances freshness vs load
3. **Check indexes**: Ensure database indexes on date columns
4. **Cache wisely**: SWR provides automatic caching

## Troubleshooting

### Statistics Not Loading

**Symptoms**: Loading spinner, error message

**Solutions**:
1. Check network connection
2. Verify Supabase credentials
3. Check API logs: `/api/admin/dashboard/statistics`
4. Try different period
5. Clear browser cache

### Incorrect Data

**Symptoms**: Numbers don't match expectations

**Solutions**:
1. Verify selected period
2. Check database directly
3. Review query logs
4. Validate date calculations
5. Check for duplicate records

### Slow Performance

**Symptoms**: Long loading times

**Solutions**:
1. Reduce period (try 7 days)
2. Check database indexes
3. Optimize queries
4. Enable API caching
5. Monitor server resources

## Database Queries Used

### Orders
```sql
SELECT status, total_amount, created_at
FROM orders
WHERE created_at >= :start_date
```

### Quotations
```sql
SELECT status, total_amount, created_at, customer_name, customer_email, quotation_number
FROM quotations
WHERE created_at >= :start_date
ORDER BY created_at DESC
```

### Sample Requests
```sql
SELECT status, created_at
FROM sample_requests
WHERE created_at >= :start_date
```

### Production Jobs
```sql
SELECT status, started_at, completed_at, created_at
FROM production_jobs
WHERE created_at >= :start_date
```

### Shipments
```sql
SELECT shipped_at, status
FROM shipments
WHERE shipped_at >= :today_start
```

## Related Documentation

- [Task 99 Implementation Report](./TASK-099-IMPLEMENTATION.md)
- [Database Schema](../architecture/database-schema-v2.md)
- [API Documentation](./api/README.md)

## Support

For issues or questions:
1. Check this guide first
2. Review implementation report
3. Check API logs
4. Contact development team

---

**Last Updated**: 2026-01-04
**Version**: 1.0.0
**Maintainer**: Development Team
