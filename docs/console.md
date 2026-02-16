# Console Errors - Fixed

## 2026-02-17 Status: ✅ ALL RESOLVED

### Previous Issues
1. ~~`POST /api/member/quotations 500 (Internal Server Error)`~~ ✅ Fixed
2. ~~`PATCH /profiles 400 (Bad Request)` - markup_rate constraint violation~~ ✅ Fixed
3. ~~503/504 errors on high-frequency page refresh~~ ✅ Fixed

### Root Causes & Solutions

#### Issue 1 & 2: Database Constraint
- **Root Cause**: Database constraint `profiles_markup_rate_check` was set to `0 <= markup_rate <= 2`, rejecting negative discount rates
- **Solution**:
  1. Updated database constraint to `-0.5 <= markup_rate <= 0`
  2. Reset existing markup_rate values from 0.5 to 0.0 (25 records)

#### Issue 3: 503/504 Errors
- **Root Cause**: High-frequency page refresh caused server overload
- **Solution**:
  1. Added memory cache (30 second TTL)
  2. Implemented rate limiting (100 requests/15 minutes)
  3. Added cache invalidation on data updates
  4. Updated vercel.json with cache headers

### Features Implemented
1. **Pagination**: 20 customers per page with navigation
2. **Search**: Email and company name search
3. **Cache**: 30-second memory cache for API responses
4. **Rate Limiting**: 100 requests per 15 minutes per IP

### Verification (2026-02-17)
- ✅ Tested saving -10% discount for kim@kanei-trade.co.jp
- ✅ Database verified: markup_rate = -0.1, markup_rate_note = "VIP 고객 10% 할인"
- ✅ Pagination working: 25 customers displayed across 2 pages
- ✅ High-frequency refresh tested: 4 consecutive reloads, no 503/504 errors
- ✅ Search functionality working: Email search filters correctly
- ✅ Console: Only 2 unrelated sitemap errors (no impact on functionality)
