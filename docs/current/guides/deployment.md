# Production Deployment Guide

Complete guide for deploying Epackage Lab Web to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [SendGrid Configuration](#sendgrid-configuration)
- [Vercel Deployment](#vercel-deployment)
- [Domain Configuration](#domain-configuration)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Backup Strategy](#backup-strategy)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to production, ensure you have:

### Required Accounts

- **Vercel Account**: For hosting the Next.js application
- **Supabase Account**: For database, auth, and storage
- **SendGrid Account**: For email delivery
- **Domain Name**: Custom domain for the application (optional but recommended)

### Required Tools

```bash
# Install Vercel CLI
npm install -g vercel

# Install Supabase CLI (optional, for local development)
npm install -g supabase

# Verify installations
vercel --version
node --version  # Should be 18.17+
npm --version
```

### System Requirements

- Node.js 18.17 or higher
- npm 9.0 or higher
- Git for version control

## Environment Setup

### 1. Create Production Environment Variables

Create a `.env.production` file (never commit this):

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://epackage-lab.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SendGrid
SENDGRID_API_KEY=SG.your-production-sendgrid-key
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Carrier APIs (if using shipment tracking)
YAMATO_API_KEY=your-yamato-production-key
SAGAWA_API_KEY=your-sagawa-production-key
JP_POST_API_KEY=your-jp-post-production-key

# DocuSign (if using e-signatures)
DOCUSIGN_CLIENT_ID=your-docusign-client-id
DOCUSIGN_CLIENT_SECRET=your-docusign-secret
DOCUSIGN_ACCOUNT_ID=your-docusign-account-id

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ENVIRONMENT=production
```

### 2. Secure Environment Variables

**Best Practices:**

- Never commit `.env.production` to git
- Use different API keys for development and production
- Rotate API keys regularly
- Use strong, randomly generated passwords
- Limit API key permissions to minimum required

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Configure:
   - **Name**: epackage-lab-production
   - **Database Password**: Use a strong password (save it securely)
   - **Region**: Tokyo (ap-northeast-1) for Japanese market
   - **Pricing Tier**: Pro tier for production

### 2. Apply Database Migrations

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Or apply specific migration file
supabase migration up --file supabase/migrations/001_initial_schema.sql
```

### 3. Configure Row Level Security (RLS)

Enable RLS policies in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for orders
CREATE POLICY "Customers can view own orders"
ON orders FOR SELECT
USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);
```

### 4. Set Up Storage

1. Go to Storage in Supabase dashboard
2. Create buckets:
   - `documents`: For quotations, invoices, delivery slips
   - `profiles`: For customer avatars
   - `products`: For product images
   - `temp`: For temporary file uploads

3. Configure bucket policies:

```sql
-- Documents bucket (private)
CREATE STORAGE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE STORAGE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 5. Create Database Functions

```sql
-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_number_seq')::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Calculate estimated delivery date
CREATE OR REPLACE FUNCTION calculate_estimated_delivery(postal_code TEXT, service_type TEXT)
RETURNS DATE AS $$
BEGIN
  -- Add business logic for delivery calculation
  -- Example: Tokyo area = 2 days, other areas = 3-5 days
  RETURN CURRENT_DATE + INTERVAL '2 days';
END;
$$ LANGUAGE plpgsql;
```

### 6. Set Up Database Backups

Configure automated backups in Supabase:
1. Go to Database > Backups
2. Enable daily backups
3. Set retention period (recommended: 30 days)
4. Enable point-in-time recovery

## SendGrid Configuration

### 1. Create SendGrid Account

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Complete sender verification
3. Verify your email domain

### 2. Configure Sender Authentication

**Option A: Domain Authentication (Recommended)**

1. Go to Settings > Sender Authentication
2. Click "Authenticate Your Domain"
3. Add your domain: `epackage-lab.com`
4. Add DNS records to your domain:
   ```
   TXT  @  sendgrid._domainkey.yourdomain.com
   TXT  @  v=spf1 include:sendgrid.net ~all
   CNAME  smtp._domainkey  sendgrid._domainkey.yourdomain.com
   CNAME  email1.domainuid  sendgrid.net
   ```

**Option B: Single Sender Verification**

1. Go to Settings > Sender Authentication
2. Click "Verify a Single Sender"
3. Add sender information:
   - From Email: `noreply@epackage-lab.com`
   - From Name: "Epackage Lab"
   - Reply To: `admin@epackage-lab.com`
   - Address: Your physical address
4. Verify email inbox

### 3. Create Email Templates

1. Go to Marketing > Senders > Templates
2. Create templates for:
   - Order confirmation
   - Shipment notification
   - Quotation delivery
   - Password reset
   - Sample request confirmation

### 4. Configure API Keys

1. Go to Settings > API Keys
2. Create API key with permissions:
   - Mail Send: Full Access
   - Template Engine: Read Access
3. Save the API key to environment variables

### 5. Test Email Delivery

```bash
# Send test email
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "noreply@epackage-lab.com"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "This is a test email"}]
  }'
```

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2. Deploy to Preview

```bash
# Deploy to preview environment
vercel

# Test the preview deployment
# https://your-project.vercel.app
```

### 3. Configure Project Settings

1. Go to Vercel Dashboard
2. Select your project
3. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Node.js Version**: 18.x

### 4. Add Environment Variables in Vercel

1. Go to Project Settings > Environment Variables
2. Add all environment variables from `.env.production`
3. Select applicable environments (Production, Preview, Development)

### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or use the deployment script
bash scripts/deploy-production.sh
```

### 6. Configure Build Optimization

Add to `vercel.json`:

```json
{
  "buildCommand": "npm run build:production",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hnd1"],
  "crons": [
    {
      "path": "/api/cleanup/temp-files",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### 7. Enable Analytics

1. Go to Analytics tab in Vercel
2. Enable Web Vitals Analytics
3. Add `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` to environment variables

## Domain Configuration

### 1. Add Custom Domain

1. Go to Project Settings > Domains
2. Add your domain: `epackage-lab.com`
3. Add `www.epackage-lab.com` as an alias

### 2. Configure DNS

Add DNS records at your domain registrar:

```
Type  Name  Value
A     @     76.76.21.21
CNAME www  cname.vercel-dns.com
TXT   @     v=spf1 include:_spf.google.com include:sendgrid.net ~all
```

### 3. Configure SSL

1. Vercel automatically provisions SSL certificates (Let's Encrypt)
2. Wait for certificate provisioning (usually 5-10 minutes)
3. Verify SSL certificate in Domains tab

### 4. Set Up Redirects

Configure redirects in `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    },
    {
      "source": "/about",
      "destination": "https://epackage-lab.com/about",
      "permanent": true
    }
  ]
}
```

## Post-Deployment

### 1. Run Smoke Tests

```bash
# Run smoke test script
node scripts/smoke-test.js
```

Expected output:
```
✓ Homepage loads (200)
✓ Signin page loads (200)
✓ API health check (200)
✓ Database connection (OK)
✓ SendGrid connection (OK)
```

### 2. Verify Core Functionality

Test manually:

- [ ] Homepage loads correctly
- [ ] User can sign in
- [ ] Contact form submits
- [ ] Sample request submits
- [ ] Quotation generates
- [ ] Admin dashboard accessible
- [ ] Email notifications send
- [ ] File uploads work
- [ ] PDF generation works

### 3. Check Core Web Vitals

Run Lighthouse audit:

```bash
npm run lighthouse -- https://epackage-lab.com
```

Target scores:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### 4. Set Up Monitoring

**Sentry Error Tracking:**

```bash
# Install Sentry SDK
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard@latest -i nextjs
```

**Vercel Analytics:**

Already enabled in `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 5. Configure CDN

Vercel Edge Network is automatically configured:
- Edge locations worldwide
- Tokyo edge location for Japanese market
- Automatic cache invalidation
- Image optimization CDN

## Monitoring

### 1. Application Monitoring

**Vercel Dashboard:**

- Deployments overview
- Build logs
- Function execution time
- Edge function logs
- Bandwidth usage

**Supabase Dashboard:**

- Database performance
- API request count
- Storage usage
- Auth statistics

**SendGrid Dashboard:**

- Email delivery rate
- Open rate
- Click rate
- Bounce rate
- Spam reports

### 2. Set Up Alerts

**Vercel Alerts:**
- Deployment failures
- Build errors
- Function timeout errors
- Error rate thresholds

**Supabase Alerts:**
- Database CPU usage > 80%
- API request failures
- Storage quota exceeded

**SendGrid Alerts:**
- Delivery rate < 95%
- Bounce rate > 5%
- Spam complaints

### 3. Logging

Structured logging in the application:

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service
      Sentry.captureMessage(message, { level: 'info', extra: meta });
    } else {
      console.log(JSON.stringify({ level: 'info', message, ...meta }));
    }
  },
  error: (message: string, error?: Error) => {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error || new Error(message));
    } else {
      console.error(JSON.stringify({ level: 'error', message, error }));
    }
  }
};
```

### 4. Performance Monitoring

Track key metrics:

- **Response Time**: < 200ms (p95)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to First Byte**: < 100ms
- **Error Rate**: < 0.1%

## Backup Strategy

### 1. Database Backups

**Supabase Automated Backups:**
- Daily backups enabled
- 30-day retention period
- Point-in-time recovery enabled

**Manual Backups:**
```bash
# Create backup
supabase db dump -f backup-$(date +%Y%m%d).sql

# Restore from backup
supabase db restore -f backup-20250101.sql
```

### 2. Storage Backups

- Documents stored in Supabase Storage with versioning
- Daily replication to secondary region
- Export important documents to external storage (S3, etc.)

### 3. Code Backups

- Git repository (GitHub/GitLab)
- Vercel deployment history
- Environment variables backed up securely

### 4. Backup Testing

Test backup restoration monthly:

```bash
# Test restore to staging
supabase db restore -f backup-20250101.sql --project-ref staging-project-id
```

## Rollback Procedures

### 1. Vercel Deployment Rollback

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Or rollback to previous deployment in dashboard
# Go to Deployments > Click "..." > Rollback
```

### 2. Database Rollback

```bash
# Restore from backup
supabase db restore -f backup-20250101.sql

# Or use point-in-time recovery
supabase db restore --to-timestamp "2025-01-01T12:00:00Z"
```

### 3. Emergency Rollback Procedure

1. Immediately rollback Vercel deployment
2. Verify application health
3. Assess database impact
4. Restore database if needed
5. Communicate with stakeholders
6. Investigate root cause
7. Create fix and test
8. Deploy fix

## Troubleshooting

### Common Issues

**Issue: Build Failures**

```
Solution:
1. Check build logs in Vercel dashboard
2. Verify environment variables are set
3. Test locally: npm run build
4. Check for missing dependencies
5. Verify Node.js version matches
```

**Issue: Database Connection Errors**

```
Solution:
1. Verify SUPABASE_URL and SUPABASE_ANON_KEY
2. Check Supabase status page
3. Test connection: curl https://your-project.supabase.co
4. Verify RLS policies aren't blocking access
5. Check database hasn't hit connection limit
```

**Issue: Email Not Sending**

```
Solution:
1. Verify SENDGRID_API_KEY is valid
2. Check sender authentication is complete
3. Verify email template exists
4. Check SendGrid dashboard for errors
5. Test with SendGrid API directly
```

**Issue: File Upload Failures**

```
Solution:
1. Verify Supabase Storage bucket exists
2. Check RLS policies on storage
3. Verify file size limits
4. Check allowed file types
5. Test storage upload directly
```

**Issue: Slow Performance**

```
Solution:
1. Check Vercel Analytics for slow pages
2. Optimize images (use Next.js Image)
3. Check bundle size with npm run analyze
4. Enable caching headers
5. Review database query performance
6. Check for unnecessary re-renders
```

### Getting Help

If issues persist:

1. **Check Status Pages:**
   - Vercel: https://www.vercel-status.com
   - Supabase: https://status.supabase.com
   - SendGrid: https://status.sendgrid.com

2. **Documentation:**
   - Next.js: https://nextjs.org/docs
   - Supabase: https://supabase.com/docs
   - Vercel: https://vercel.com/docs

3. **Support:**
   - Email: support@epackage-lab.com
   - GitHub Issues: Create issue in repository
   - Slack: #production-support channel

## Security Checklist

### Pre-Deployment

- [ ] Environment variables are set in Vercel (not in code)
- [ ] API keys have minimal required permissions
- [ ] CORS is configured correctly
- [ ] Rate limiting is enabled
- [ ] RLS policies are enabled on all tables
- [ ] Sensitive data is encrypted at rest
- [ ] HTTPS is enforced
- [ ] Security headers are configured

### Post-Deployment

- [ ] SSL certificates are valid
- [ ] DNS records are correct
- [ ] Email domain is authenticated
- [ ] Monitoring is active
- [ ] Backups are running
- [ ] Alerts are configured
- [ ] Access logs are reviewed
- [ ] Penetration testing is completed

## Maintenance

### Regular Tasks

**Daily:**
- Check error logs
- Monitor system health
- Review failed deliveries

**Weekly:**
- Review performance metrics
- Check storage usage
- Update dependencies

**Monthly:**
- Test backup restoration
- Review security logs
- Update documentation
- Performance optimization

**Quarterly:**
- Security audit
- Dependency updates
- Disaster recovery test
- Capacity planning

## Appendix

### Useful Commands

```bash
# Vercel
vercel logs                    # View deployment logs
vercel domains                 # List domains
vercel env ls                  # List environment variables
vercel env pull .env.local     # Pull env vars to file

# Supabase
supabase status                # Check Supabase status
supabase db reset              # Reset local database
supabase gen types typescript  # Generate TypeScript types

# Testing
npm run test                   # Run all tests
npm run lighthouse             # Run Lighthouse audit
npm run analyze                # Analyze bundle size

# Database
psql -U postgres -h db.your-project.supabase.co -p 5432 postgres
```

### Configuration Files

- `vercel.json` - Vercel configuration
- `next.config.ts` - Next.js configuration
- `.env.production` - Production environment variables
- `playwright.config.ts` - E2E test configuration

---

For additional support, contact: devops@epackage-lab.com
