# Console Errors - Fixed

## 2026-02-16 Status: ✅ RESOLVED

### Previous Issue
- `POST /api/member/quotations 500 (Internal Server Error)`
- `PATCH /profiles 400 (Bad Request)` - markup_rate constraint violation

### Root Cause
Database constraint `profiles_markup_rate_check` was set to `0 <= markup_rate <= 2`, rejecting negative discount rates.

### Solution Applied
1. Updated database constraint to `-0.5 <= markup_rate <= 0`
2. Reset existing markup_rate values from 0.5 to 0.0 (25 records)
3. Verified customer discount rate functionality works correctly

### Verification
- ✅ Tested saving -10% discount for member@test.com
- ✅ Database verified: markup_rate = -0.1, markup_rate_note = "VIP 고객 10% 할인"
- ✅ API log shows: `PATCH | 200` (success)
- ✅ Browser console: 0 errors
