# SendGrid API Key Setup Guide

This guide explains how to create and configure SendGrid API keys for the Epackage Lab application.

## Prerequisites

- Active SendGrid account
- Access to SendGrid Dashboard: https://app.sendgrid.com/

---

## Step 1: Access API Keys Settings

1. Log in to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. You'll see a list of existing API keys (if any)

---

## Step 2: Create New API Key

1. Click **Create API Key** button

2. **API Key Details**:
   ```
   API Key Name: epackage-production
   ```

   **Best Practices for API Key Name**:
   - Use descriptive name (e.g., environment + application)
   - Examples: `epackage-dev`, `epackage-staging`, `epackage-production`
   - Avoid spaces and special characters

3. **API Key Permissions**:

   Select **Mail Send** with **Full Access**

   **Permissions Explained**:
   - **Mail Send**: Required for sending emails through the API
   - **Full Access**: Allows all email operations (send, schedule, view stats)

   **Optional Permissions** (not needed for current implementation):
   - ❌ Mail Send - Restricted access (not recommended)
   - ❌ Email Activity - Read-only access to email activity feed
   - ❌ Marketing Campaigns - For marketing emails only
   - ❌ Categories & Segments - For advanced email features
   - ❌ Scheduled Sends - For delayed email sending
   - ❌ Team & Member Access - For team management
   - ❌ Alerts - For webhook notifications
   - ❌ Suppression Management - For bounce/unsubscribe management
   - ❌ Templates - For email template access
   - ❌ Sender Identities - For managing verified senders
   - ❌ Stats - For viewing statistics
   - ❌ Elision - For account configuration

4. Click **Create & View** (or **Create** depending on UI version)

---

## Step 3: Save Your API Key

**⚠️ IMPORTANT**: Copy your API key immediately!

SendGrid will only show it **once** during creation.

```
SendGrid API Key Format: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Security Best Practices**:
- ✅ Store in environment variables (`.env.local`)
- ✅ Never commit to version control
- ✅ Rotate keys periodically (every 90 days recommended)
- ✅ Delete old/unused keys immediately
- ❌ Never share publicly (GitHub, forums, etc.)
- ❌ Never hardcode in source code

---

## Step 4: Configure Application

Update `.env.local` with your API key:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-actual-api-key-here

# Email Configuration
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com
```

**Current `.env.local` Status**:
```bash
SENDGRID_API_KEY=SG.placeholder  # ← Replace this with your actual key
```

---

## Step 5: Verify API Key

### Method 1: SendGrid Dashboard Check

1. Go to **Settings** → **API Keys**
2. Your new API key should appear in the list
3. Check the **Last Used** column to verify it's working

### Method 2: Application Test

1. Restart the development server:
   ```bash
   npm run dev
   ```

2. Test email functionality:
   - Visit `/contact/` page
   - Submit the contact form
   - Check if email is sent successfully

3. Check console for any API errors

---

## API Key Permissions Reference

| Permission | Description | Required |
|------------|-------------|-----------|
| **Mail Send** | Send emails via API | ✅ Yes |
| Full Access | Unlimited sending | ✅ Recommended |
| Restricted Access | Limit to specific senders | ⚠️ Only if needed |

---

## Common Issues and Solutions

### Issue: API Key Not Working

**Symptoms**:
- 401 Unauthorized error
- "The provided authorization grant is invalid"

**Solutions**:
1. ✅ Verify API key is correct (no extra spaces)
2. ✅ Check API key has "Mail Send" permission
3. ✅ Ensure `.env.local` is loaded correctly
4. ✅ Restart development server after changing `.env.local`

### Issue: API Key Already Exists

If you already have an API key for Epackage Lab:

1. Check existing key permissions:
   - Navigate to **Settings** → **API Keys**
   - Click on the key name to view details
   - Verify it has "Mail Send" permission

2. If permissions are correct, use the existing key:
   - Copy the API key (if visible)
   - Or create a new one and rotate the old one

### Issue: Forgot to Copy API Key

If you didn't copy your API key during creation:

1. You'll need to **delete the old key** and create a new one
2. SendGrid **cannot** recover existing API keys for security reasons
3. After creating a new key, update `.env.local` immediately

---

## Security Best Practices

### Key Rotation Schedule

Recommended rotation: **Every 90 days**

1. Create new API key
2. Update `.env.local` with new key
3. Restart application
4. Test email functionality
5. **Delete old API key** (only after confirming new key works)

### Access Control

- ✅ Use separate keys for dev/staging/production
- ✅ Set minimum required permissions
- ✅ Monitor key usage in SendGrid dashboard
- ✅ Set up alerts for unusual activity

### Key Storage

**✅ DO**:
- Store in `.env.local` (gitignored)
- Use environment-specific keys
- Limit access to authorized personnel only

**❌ DON'T**:
- Commit to version control
- Share in chat/communication tools
- Hardcode in source files
- Store in plain text files

---

## Testing Checklist

After configuring your API key:

- [ ] API key copied and stored in `.env.local`
- [ ] Development server restarted (`npm run dev`)
- [ ] `/contact/` form test email sent successfully
- [ ] `/samples/` form test email sent successfully
- [ ] Admin email (`ADMIN_EMAIL`) received notification
- [ ] Customer received confirmation email
- [ ] No console errors related to SendGrid
- [ ] SendGrid dashboard shows email activity

---

## Next Steps

After API key setup is complete:

1. ✅ **Task 48.3**: `.env.local` configuration
2. ✅ **Task 48.4**: Sender Domain authentication (DNS setup)
3. ✅ **Task 48.5**: Contact form email testing
4. ✅ **Task 48.6**: Sample request email testing
5. ✅ **Task 48.7**: Email template display verification

---

## Additional Resources

### SendGrid Documentation
- [API Keys Overview](https://docs.sendgrid.com/for-developers/sending-email/api-keys)
- [Mail Send API](https://docs.sendgrid.com/api-reference/)
- [Email Activity](https://docs.sendgrid.com/for-developers/sending-email/email-activity)

### Code Implementation
- Email functions: `src/lib/email.ts`
- Contact API: `src/app/api/contact/route.ts`
- Sample API: `src/app/api/samples/route.ts`

### DNS Setup
- Domain authentication: `docs/SENDGRID_DNS_SETUP.md`
- SMTP configuration: `docs/SUPABASE_SMTP_SETUP.md`
- Email templates: `docs/EMAIL_TEMPLATES_JA.md`

---

## Support

### SendGrid Support
- Email: support@sendgrid.com
- Documentation: https://docs.sendgrid.com/
- Community: https://sendgrid.com/community

### Internal Support
- Technical: admin@epackage-lab.com
- Project: https://github.com/epackage-lab
