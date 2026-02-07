<!-- Parent: ../../AGENTS.md -->
# Authentication Pages

## Purpose

Authentication and user management pages for the Epackage Lab platform. Handles user registration, login, email verification, password reset, and account status states (pending approval, suspended, errors).

## Directory Structure

```
auth/
├── error/              # Authentication error page
├── forgot-password/    # Password reset request page
├── pending/            # Account approval pending page
├── register/           # User registration page
├── reset-password/     # Password reset confirmation page
├── signin/             # Login page
├── signout/            # Logout page
└── suspended/          # Account suspended page
```

## Key Files

### Page Components

| File | Purpose |
|------|---------|
| `signin/page.tsx` | Login page with email/password form |
| `register/page.tsx` | Registration page with 18-field form |
| `pending/page.tsx` | Approval pending status page |
| `pending/PendingClient.tsx` | Client-side session verification and profile creation |
| `error/page.tsx` | Authentication error display |
| `forgot-password/page.tsx` | Password reset request form |
| `reset-password/page.tsx` | New password entry form |
| `signout/page.tsx` | Logout handler with redirect |
| `suspended/page.tsx` | Suspended account notification |

### Related Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `LoginForm` | `@/components/auth/LoginForm.tsx` | Login form with validation |
| `RegistrationForm` | `@/components/auth/RegistrationForm.tsx` | 18-field registration form |
| `JapaneseNameInput` | `@/components/ui/JapaneseNameInput.tsx` | Kanji/Kana name input |
| `AuthContext` | `@/contexts/AuthContext.tsx` | Global auth state management |

### API Routes

| Route | Purpose |
|-------|---------|
| `/api/auth/signin` | Login with cookie-based session |
| `/api/auth/register` | User registration and profile creation |
| `/api/auth/register/create-profile` | Profile auto-creation after email verification |
| `/api/auth/session` | Session verification and refresh |
| `/api/auth/signout` | Logout and cookie clearing |
| `/api/auth/forgot-password` | Password reset email sending |
| `/api/auth/reset-password` | Password reset with token |
| `/api/auth/verify-email` | Email verification handler |

## Authentication Flow

```
1. Registration
   register/page.tsx → RegistrationForm → /api/auth/register
   → Email sent → User clicks email link

2. Email Verification
   Email link → pending/page.tsx (with hash tokens)
   → PendingClient parses hash → Creates profile via /api/auth/register/create-profile
   → Shows "pending approval" state

3. Admin Approval
   Admin approves user → User status changed to ACTIVE

4. Login
   signin/page.tsx → LoginForm → /api/auth/signin
   → Sets httpOnly cookies → Redirects to dashboard
   (admin → /admin/dashboard, member → /member/dashboard)

5. Session Management
   AuthContext checks /api/auth/session on page load
   → Auto-refresh every 1 minute (5 min before expiry)
   → 30-minute session duration

6. Logout
   signout/page.tsx → Calls /api/auth/signout
   → Clears cookies → Redirects to home
```

## Form Schemas

### Registration Fields (18 total)

1. **Auth Info**: email, password, passwordConfirm
2. **Names**: kanjiLastName, kanjiFirstName, kanaLastName, kanaFirstName
3. **Phones**: corporatePhone OR personalPhone (at least one required)
4. **Business Type**: INDIVIDUAL or CORPORATION
5. **Company Info** (Corporation only):
   - companyName, legalEntityNumber, position, department, companyUrl
6. **Address**: postalCode, prefecture, city, street
7. **Product Category**: COSMETICS, CLOTHING, ELECTRONICS, KITCHEN, FURNITURE, OTHER
8. **Acquisition Channel**: How they found the service
9. **Privacy Consent**: Required checkbox

### Login Fields

- email (required)
- password (required)
- remember (optional - checkbox)

### Password Reset Fields

**Forgot Password**: email (required)
**Reset Password**: password, passwordConfirm, token (from email link)

## Dependencies

### External Libraries

- `@supabase/supabase-js` - Authentication client
- `react-hook-form` - Form state management
- `@hookform/resolvers/zod` - Zod validation integration
- `zod` - Schema validation
- `next/navigation` - Routing and navigation
- `lucide-react` - Icons (Loader2 for signout)

### Internal Modules

- `@/types/auth` - Type definitions and schemas
- `@/contexts/AuthContext` - Global auth state
- `@/lib/supabase-browser` - Browser Supabase client
- `@/lib/supabase` - Supabase utilities
- `@/components/ui` - Reusable UI components (Input, Button, Card)

## State Management

### AuthContext Provider

The `AuthContext` provides:
- `user` - Current user object or null
- `session` - Session token and expiry
- `profile` - User profile data
- `isAuthenticated` - Boolean auth status
- `isAdmin` - Admin role check
- `isLoading` - Loading state during auth checks

### Session Refresh

- Auto-refreshes every 1 minute
- Extends session when 5 minutes from expiry
- 30-minute session duration
- Uses httpOnly cookies for security

## Security Features

1. **httpOnly Cookies**: Session tokens stored in httpOnly cookies
2. **Server-side Auth**: All auth operations handled server-side
3. **Email Verification**: Required before account activation
4. **Admin Approval**: New accounts require admin approval
5. **Role-based Access**: ADMIN and MEMBER roles with different dashboards
6. **Status Management**: PENDING, ACTIVE, SUSPENDED, DELETED states
7. **Password Requirements**: Min 8 chars, uppercase, lowercase, number

## Error Handling

### Error Types

- `AccessDenied` - User lacks permission
- `Configuration` - Server configuration error
- `verification_failed` - Email verification token invalid/expired
- `Default` - Generic auth error

### Error Page States

1. **No Session** - Email verification needed
2. **Email Not Verified** - Reminder to check email
3. **Pending Approval** - Admin approval required
4. **Error** - Generic error with retry option
5. **Suspended** - Account suspended notification

## Japanese UI Patterns

All pages use Japanese language with:
- Kanji for formal text (titles, labels)
- Hiragana for friendly messages
- Furigana support via `JapaneseNameInput` component
- Japanese error messages
- Japanese validation (regex for kanji/hiragana)

## AI Agent Guidelines

### When Working with Auth Pages

1. **Preserve Security**: Never bypass auth checks or validation
2. **Maintain Japanese UI**: Keep all text in Japanese
3. **Test Flows**: Verify complete auth flows (register → verify → login)
4. **Handle Edge Cases**: Account states (pending, suspended, errors)
5. **Cookie Management**: Always use `credentials: 'include'` for API calls
6. **Session Refresh**: Don't break the 1-minute refresh interval

### Common Tasks

- **Add new auth field**: Update schema in `@/types/auth.ts`, add to RegistrationForm
- **Change validation rules**: Modify Zod schemas in `@/types/auth.ts`
- **Update redirect logic**: Check LoginForm and signin API route
- **Modify session duration**: Update AuthContext refresh interval (currently 30 min)
- **Add new status state**: Update UserStatus enum and error page handling

### Files to Modify Together

When changing auth behavior, typically need to update:
1. `@/types/auth.ts` - Type definitions
2. `@/contexts/AuthContext.tsx` - Auth state management
3. `@/components/auth/*` - Form components
4. `@/app/api/auth/*` - API routes
5. `@/app/auth/*/page.tsx` - Page components

## Testing Notes

- Registration creates Supabase auth user and profile record
- Email verification tokens come via URL hash (`#access_token=...`)
- Profile creation happens after email verification via `/api/auth/register/create-profile`
- Admin approval required before login (status: PENDING → ACTIVE)
- Suspended users cannot login (status: SUSPENDED)
- Password reset uses time-limited tokens from email links
