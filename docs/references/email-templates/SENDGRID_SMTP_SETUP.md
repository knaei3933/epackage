# SendGrid SMTP Setup for Supabase Auth

This guide explains how to configure SendGrid SMTP for Supabase Authentication emails (email confirmation, password reset, etc.).

## Overview

Supabase Auth sends transactional emails for:
- Email confirmation (sign up)
- Password reset
- Email change confirmation
- Magic links (if enabled)

## Prerequisites

1. **SendGrid Account** - Create account at https://sendgrid.com/
2. **Supabase Project** - Active Supabase project
3. **Verified Sender** - Email/domain verified in SendGrid

## Step 1: Configure SendGrid

### 1.1 Create API Key

1. Log in to SendGrid Dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Set permissions:
   - **Mail Send** → Full Access
   - **Mail Send** → Read Access (optional, for logging)
5. Copy the API key (starts with `SG.`)

### 1.2 Verify Sender Identity

**Option A: Single Sender** (Recommended for testing)
1. Go to **Settings** → **Sender Authentication**
2. Click **Create Single Sender**
3. Fill in:
   - From Name: `Epackage Lab`
   - From Email: `noreply@epackage-lab.com`
   - Reply To: `admin@epackage-lab.com`
4. Verify email address via confirmation email

**Option B: Domain Authentication** (Recommended for production)
1. Go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Add domain: `epackage-lab.com`
4. Configure DNS records (MX, SPF, DKIM)
5. Verify DNS records

### 1.3 Configure Email Templates (Optional)

You can create branded templates in SendGrid:
1. Go to **Email Marketing** → **Templates**
2. Create templates for:
   - Welcome email
   - Email confirmation
   - Password reset

## Step 2: Configure Supabase Auth SMTP

### 2.1 Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project

### 2.2 Configure SMTP Settings

1. Navigate to **Authentication** → **Email Templates**
2. Click **Configure SMTP** button
3. Enter SendGrid SMTP settings:

```
Host: smtp.sendgrid.net
Port: 587 (TLS) or 465 (SSL)
Username: apikey
Password: SG.your-sendgrid-api-key-here
Sender Email: noreply@epackage-lab.com
Sender Name: Epackage Lab
Reply-to: admin@epackage-lab.com
```

4. Click **Save** to apply settings

### 2.3 Test Email Configuration

1. Still in **Authentication** → **Email Templates**
2. Click **Send Test Email**
3. Enter your email address
4. Check inbox for test email

## Step 3: Customize Email Templates (Optional)

Supabase provides default email templates. You can customize them:

### 3.1 Access Templates

1. Go to **Authentication** → **Email Templates**
2. Select template type:
   - Confirm signup
   - Reset password
   - Email change
   - Magic link

### 3.2 Customize Template

1. Click on template to edit
2. Use variables like `{{ .Email }}`, `{{ .ConfirmationURL }}`
3. Customize subject and body
4. Preview and save

Example template (Email Confirmation):

```html
<h2>Epackage Labへのご登録ありがとうございます</h2>

<p>以下のリンクをクリックしてメールアドレスを確認してください：</p>

<p><a href="{{ .ConfirmationURL }}">メールアドレスを確認する</a></p>

<p>このリンクの有効期限は24時間です。</p>

<p>----------<br>
Epackage Lab<br>
https://epackage-lab.com</p>
```

## Step 4: Configure Application Environment Variables

Add to `.env.local`:

```bash
# SendGrid (Optional - mainly for custom email sending from API)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here

# Email Configuration
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Test Authentication Flow

### 5.1 Test Sign Up with Email Confirmation

```typescript
// In your registration flow
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'secure-password',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  }
})
```

Expected result:
- User receives confirmation email
- Email comes from `noreply@epackage-lab.com`
- Clicking link confirms email

### 5.2 Test Password Reset

```typescript
// In your password reset flow
const { error } = await supabase.auth.resetPasswordForEmail(
  'test@example.com',
  {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  }
)
```

Expected result:
- User receives reset email
- Email contains reset link
- Reset link redirects to your app

## Troubleshooting

### Emails not sending

1. **Check SendGrid API Key**: Verify it's active with correct permissions
2. **Check Sender Verification**: Ensure sender email/domain is verified
3. **Check Spam Folder**: Test emails may go to spam
4. **Check SMTP Configuration**: Verify credentials in Supabase dashboard

### API Key invalid

- Regenerate API key in SendGrid
- Update in Supabase dashboard
- Wait 5-10 minutes for propagation

### Rate limiting

SendGrid free tier limits:
- 100 emails/day
- May need upgrade for production

### SPF/DKIM failures

- Ensure DNS records are properly configured
- Use domain authentication instead of single sender
- Check DNS propagation

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** periodically (every 90 days)
4. **Monitor SendGrid activity** for unusual usage
5. **Set up alerts** for delivery failures
6. **Use dedicated IP** for high-volume production

## Production Checklist

- [ ] SendGrid API key configured
- [ ] Domain authenticated (not just single sender)
- [ ] SPF/DKIM DNS records verified
- [ ] SMTP settings configured in Supabase dashboard
- [ ] Email templates customized and tested
- [ ] Test email sent successfully
- [ ] Sign up flow tested
- [ ] Password reset flow tested
- [ ] Reply-to email monitored
- [ ] SendGrid activity alerts configured

## Additional Resources

- [SendGrid SMTP Documentation](https://docs.sendgrid.com/for-developers/sending-email/smtp-vs-api)
- [Supabase Auth SMTP](https://supabase.com/docs/guides/auth/social-login/auth-smtp)
- [SendGrid IP Warm-up](https://docs.sendgrid.com/for-developers/sending-email/sender-identity/ip-warmup)

## Cost Considerations

SendGrid pricing (as of 2025):
- **Free**: 100 emails/day forever
- **Basic**: $19/month for up to 50,000 emails
- **Pro**: $89/month for up to 200,000 emails

For Japanese market, consider:
- Transactional email only (no marketing)
- Expect < 1000 emails/month for B2B
- Free tier sufficient for MVP
