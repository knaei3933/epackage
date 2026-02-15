# Supabase SMTP Configuration with SendGrid

This guide explains how to configure Supabase Auth to use SendGrid SMTP for sending Japanese authentication emails.

## Prerequisites

- Active SendGrid account with API key
- SendGrid sender domain authenticated (epackage-lab.com)
- Supabase project access

## Step 1: Get SendGrid SMTP Credentials

SendGrid provides SMTP relay credentials. The values are standard:

| Setting | Value |
|---------|-------|
| **SMTP Host** | `smtp.sendgrid.net` |
| **SMTP Port** | `587` (TLS) |
| **Username** | `apikey` |
| **Password** | Your SendGrid API Key (same as `SENDGRID_API_KEY`) |

## Step 2: Configure Supabase SMTP Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `ijlgpzjdfipzmjvawofp`
3. Navigate to: **Authentication** → **Settings** → **SMTP Settings**

4. Fill in the following values:

   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   Username: apikey
   Password: SG.your-actual-api-key-here
   Sender Email: noreply@epackage-lab.com
   Sender Name: Epackage Lab
   ```

5. Click **"Test SMTP"** to verify the connection
6. Click **"Save"** to apply the settings

## Step 3: Verify Email Templates

After configuring SMTP, verify that Japanese email templates are registered:

1. Navigate to: **Authentication** → **Email Templates**

2. Check the following templates:
   - **Confirm Signup** (登録確認メール)
   - **Reset Password** (パスワード再設定メール)
   - **Email Change** (メール変更確認メール)

3. Each template should include:
   - Japanese subject lines
   - Japanese body content
   - Supabase variables (`{{ .Email }}`, `{{ .ConfirmationURL }}`)

## Step 4: Test Email Delivery

### Method 1: Supabase Dashboard Test

1. In **SMTP Settings**, click **"Send Test Email"**
2. Enter your test email address
3. Check your inbox for the test email

### Method 2: Registration Test

1. Go to your application: `http://localhost:3000/auth/register`
2. Register a new test user with a real email address
3. Check your inbox for the confirmation email
4. Verify the Japanese content is displayed correctly

## Step 5: Monitor with SendGrid Dashboard

1. Go to [SendGrid Dashboard](https://sendgrid.com/)
2. Navigate to: **Email Activity**
3. Verify emails are being sent successfully
4. Check for any bounces or delivery issues

## Environment Variables Reference

The following environment variables are configured in `.env.local`:

```bash
# SendGrid API Key (primary)
SENDGRID_API_KEY=SG.your-actual-api-key-here

# Email Configuration
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Supabase SMTP Configuration (for reference)
SUPABASE_SMTP_HOST=smtp.sendgrid.net
SUPABASE_SMTP_PORT=587
SUPABASE_SMTP_USER=apikey
SUPABASE_SMTP_PASSWORD=SG.your-actual-api-key-here
SUPABASE_SENDER_NAME=Epackage Lab
SUPABASE_SENDER_EMAIL=noreply@epackage-lab.com
```

**Note:** The `SUPABASE_SMTP_*` variables are for documentation purposes. The actual SMTP configuration must be done in the Supabase Dashboard.

## Troubleshooting

### SMTP Test Fails

**Issue**: "Test SMTP" fails with authentication error

**Solution**:
1. Verify SendGrid API Key is correct
2. Ensure API Key has "Mail Send" permissions
3. Check that the username is exactly `apikey` (lowercase)

### Emails Not Delivered

**Issue**: Registration complete but no email received

**Solution**:
1. Check spam/junk folder
2. Verify sender domain (epackage-lab.com) is authenticated in SendGrid
3. Check SendGrid Email Activity for delivery status
4. Verify email address is valid

### Japanese Characters Display Incorrectly

**Issue**: Email shows garbled Japanese characters

**Solution**:
1. Verify email templates use UTF-8 encoding
2. Test in multiple email clients (Gmail, Outlook, iOS Mail)
3. Ensure templates use HTML entities for special characters if needed

## Next Steps

After SMTP configuration is complete:

1. ✅ Test user registration flow
2. ✅ Test password reset flow
3. ✅ Test email change flow
4. ✅ Verify Japanese email display in major clients
5. ✅ Run E2E tests (`tests/auth-email.spec.ts`)

## Related Documentation

- [SendGrid DNS Setup Guide](./SENDGRID_DNS_SETUP.md)
- [Japanese Email Templates](./EMAIL_TEMPLATES_JA.md)
- [E2E Testing Guide](../tests/auth-email.spec.ts)
