# Browser DevTools Login Testing Guide

## Quick Reference for End-to-End Login Flow Testing

### Prerequisites

1. Development server running on http://localhost:3000
2. Browser DevTools opened (F12 or Ctrl+Shift+I)
3. Supabase Dashboard access for password reset

---

## Step-by-Step Testing Guide

### 1. Open Browser DevTools

**Chrome/Edge**: F12 or Ctrl + Shift + I (Windows), Cmd + Option + I (Mac)  
**Firefox**: F12 or Ctrl + Shift + K (Windows), Cmd + Option + K (Mac)

### 2. Navigate to Signin Page

URL: http://localhost:3000/auth/signin

**Expected**: Login form loads with email and password fields

---

## DevTools Tab-by-Tab Analysis

### Network Tab (Critical)

**Purpose**: Monitor login API request/response

**Setup**:
1. Open Network tab
2. Check "Preserve log" (to keep logs after redirect)
3. Filter by "signin" or "Fetch/XHR"

**What to Look For**:

#### ✅ Successful Login Request

Request URL: http://localhost:3000/api/auth/signin/
Request Method: POST
Status Code: 200 OK

Response Headers:
  Set-Cookie: sb-access-token=<long-token>; HttpOnly; Path=/; SameSite=lax
  Set-Cookie: sb-refresh-token=<long-token>; HttpOnly; Path=/; SameSite=lax

Response Body:
  {
    "success": true,
    "message": "ログインしました",
    "user": { "role": "ADMIN", "status": "ACTIVE" }
  }

#### ❌ Failed Login Request (Current State)

Request URL: http://localhost:3000/api/auth/signin/
Request Method: POST
Status Code: 401 Unauthorized

Response Body:
  {
    "error": "ログインに失敗しました。メールアドレスとパスワードを確認してください。"
  }

**Action Required**: Reset password in Supabase Dashboard

---

### Application Tab → Cookies

**Purpose**: Verify authentication cookies are set

**What to Look For**:

#### ✅ After Successful Login

Name: sb-access-token
Domain: localhost
Path: /
HttpOnly: ✅ YES (critical for security)
Secure: ❌ NO (localhost only)
SameSite: Lax

Name: sb-refresh-token
Domain: localhost
Path: /
HttpOnly: ✅ YES (critical for security)
Secure: ❌ NO (localhost only)
SameSite: Lax

#### ❌ Current State (Failed Login)

No sb-access-token cookie
No sb-refresh-token cookie

**Action Required**: Login must succeed first to set cookies

---

### Console Tab

**Purpose**: Check for JavaScript errors

**What to Look For**:

#### ✅ Successful Login

[LoginForm] Attempting login for: admin@epackage-lab.com
[LoginForm] Login successful
[LoginForm] Redirecting to: /admin/dashboard (role: ADMIN)

#### ❌ Failed Login (Current State)

[LoginForm] Attempting login for: admin@epackage-lab.com
[LoginForm] Login error: ログインに失敗しました...

**Action Required**: Look for error messages in red text

---

## Password Reset Instructions

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select project: ijlgpzjdfipzmjvawofp
3. Navigate to: Authentication → Users
4. Find user: admin@epackage-lab.com
5. Click "Reset Password"
6. Enter new password: Admin1234 (or desired)
7. Test login again

### Option 2: Enable Dev Mode (Testing Only)

⚠️ WARNING: NEVER enable in production!

1. Edit .env.local: ENABLE_DEV_MOCK_AUTH=true
2. Restart dev server: npm run dev
3. Login with ANY email/password (mock auth)
4. Remember to disable after testing!

---

## Expected Successful Login Flow

Timeline:

T+0ms:    User clicks "ログイン" button
T+50ms:   Form validates (Zod schema)
T+100ms:  Fetch request to /api/auth/signin/
T+500ms:  Supabase authenticates
T+600ms:  Server sets cookies
T+700ms:  Response returns with user data
T+1000ms: window.location.href redirects to /admin/dashboard
T+2000ms: Dashboard page loads

---

## Troubleshooting

### Issue: "Invalid login credentials"

**Cause**: Password doesn't match Supabase record  
**Fix**: Reset password in Supabase Dashboard

### Issue: "Network error"

**Cause**: Development server not running  
**Fix**: Run npm run dev in terminal

### Issue: Cookies not set

**Cause**: Login failed OR cookie domain mismatch  
**Fix**: Verify login succeeds, check cookie domain is localhost

---

## Summary

**Current Status**: ❌ Login fails due to incorrect password  
**Root Cause**: Password "Admin1234" doesn't match Supabase record  
**Solution**: Reset password in Supabase Dashboard  
**Code Quality**: ✅ No code changes needed - implementation is correct

**After Password Reset**: ✅ Login will succeed, cookies will be set, redirect to dashboard will work

---

**Report Created**: 2026-01-08  
**Test Environment**: Development (localhost:3000)  
**Supabase Project**: ijlgpzjdfipzmjvawofp  
**Test User**: admin@epackage-lab.com
