# Email Verification API

## Overview
Email verification callback endpoint for Supabase authentication. Handles email verification tokens from registration emails and updates user status from `PENDING` to `PENDING_APPROVAL`.

## Endpoint
```
GET /api/auth/verify-email?token=xxx
```

## Flow

### 1. Email Verification Process
```
User Registration
    ↓
Supabase sends verification email
    ↓
User clicks email link (contains token)
    ↓
Redirects to: /api/auth/verify-email?token=xxx
    ↓
Token verification & status update
    ↓
Redirects to appropriate page
```

### 2. Status Transitions
```
PENDING → Email Verification → PENDING (verified) → Admin Approval → ACTIVE
```

**Note**: The current implementation keeps the status as `PENDING` after email verification. The email verification is tracked in Supabase Auth (`email_confirmed_at`). If you need to distinguish between "email not verified" and "awaiting admin approval", add a `PENDING_APPROVAL` status to the database enum and an `email_confirmed_at` timestamp to the profiles table.

## Query Parameters

| Parameter | Type   | Required | Description                        |
|-----------|--------|----------|------------------------------------|
| token     | string | Yes      | Supabase email verification token   |

## Response Behavior

### Success (HTTP 302 Redirect)
- **Redirect**: `/auth/pending?message=<success_message>`
- **User Email**: Marked as verified in Supabase Auth
- **User Status**: Remains `PENDING` (awaiting admin approval)
- **Logging**: Verification attempt logged to console

### Error (HTTP 302 Redirect)
- **Redirect**: `/auth/error?error=verification_failed&message=<error_message>`
- **No Status Change**: User status remains unchanged

## Error Messages (Japanese)

| Code              | Message                              |
|-------------------|--------------------------------------|
| MISSING_TOKEN     | 認証トークンが指定されていません。     |
| INVALID_TOKEN     | 無効な認証トークンです。             |
| EXPIRED_TOKEN     | 認証トークンの有効期限が切れています。|
| USER_NOT_FOUND    | ユーザーが見つかりませんでした。     |
| VERIFICATION_FAILED | メール認証に失敗しました。       |
| UPDATE_FAILED     | ステータス更新に失敗しました。       |

## Logging

All verification attempts are logged with:
- Timestamp
- User ID
- Status (success/error)
- Error details (if applicable)

Example log output:
```json
{
  "timestamp": "2025-12-31T10:30:00.000Z",
  "event": "email_verification",
  "userId": "user-uuid-here",
  "status": "success",
  "message": "Email verified successfully",
  "error": null,
  "data": {
    "email": "user@example.com",
    "currentStatus": "PENDING",
    "note": "User email verified in Supabase Auth, awaiting admin approval"
  }
}
```

## DEV MODE Behavior

When `NEXT_PUBLIC_DEV_MODE=true`:
- Bypasses Supabase verification
- Simulates 500ms delay
- Redirects to `/auth/pending?message=dev_mock_verification`

## Implementation Notes

### Supabase Auth Flow
1. Registration creates auth user with `emailConfirm: true`
2. Supabase sends verification email with `token_hash`
3. User clicks link → redirect to this endpoint
4. Endpoint verifies token using `supabase.auth.verifyOtp()`
5. Email is marked as verified in Supabase Auth
6. User status remains `PENDING` (awaiting admin approval)
7. Redirects to pending page

### Service Client Usage
- Uses service role key to bypass RLS policies
- Required to fetch user profile after verification
- Admin-level privileges for database access

### Optional: Database Enhancement
To track email verification in the database, add these fields:

```sql
-- Add to profiles table
ALTER TABLE profiles
ADD COLUMN email_confirmed_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN verification_token TEXT DEFAULT NULL,
ADD COLUMN verification_expires_at TIMESTAMPTZ DEFAULT NULL;

-- Update verification logic
UPDATE profiles
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE id = :userId;
```

## Security Considerations

1. **Token Validation**: All tokens verified through Supabase Auth
2. **Service Role**: Only server-side can use service role key
3. **Rate Limiting**: Consider adding rate limiting for production
4. **Error Messages**: Generic messages to prevent information leakage
5. **Logging**: All attempts logged for security monitoring

## Testing

### Manual Testing (DEV MODE)
1. Set `NEXT_PUBLIC_DEV_MODE=true`
2. Visit: `http://localhost:3000/api/auth/verify-email?token=test`
3. Should redirect to `/auth/pending`

### Production Testing
1. Complete registration flow
2. Check email for verification link
3. Click verification link
4. Verify redirect to `/auth/pending`
5. Check database for status update

### Integration with Registration
```typescript
// In /api/auth/register
await supabase.auth.signUp({
  email: validatedData.email,
  password: validatedData.password,
  options: {
    emailRedirectTo: `${APP_URL}/api/auth/verify-email`
  }
})
```

## Related Files
- `/api/auth/register` - Creates user and sends verification email
- `/auth/pending` - Page shown after successful verification
- `/auth/error` - Error page for failed verification
- `/types/database.ts` - Profile status types

## Future Enhancements

1. **Resend Verification**: Allow users to request new verification email
2. **Token Expiry Handling**: Better UX for expired tokens
3. **Analytics**: Track verification completion rates
4. **Email Templates**: Custom verification email templates
5. **Multi-language**: Support for English/Korean error messages
