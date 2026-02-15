# DocuSign Integration Setup Guide

## Overview

This guide covers setting up DocuSign integration for electronic contract signatures in the Epackage Lab system.

## Prerequisites

1. DocuSign Developer Account
2. Admin access to your DocuSign account
3. Project administrator access to Epackage Lab codebase

## Step 1: Create DocuSign Developer Account

1. Go to [https://developers.docusign.com/](https://developers.docusign.com/)
2. Click "Sign Up" for a free developer sandbox account
3. Verify your email address
4. Log in to the DocuSign Admin Console

## Step 2: Create Integration App

1. In DocuSign Admin Console, go to **Apps and Keys**
2. Click **Add App** / **Create App**
3. Configure the app:
   - **App Name**: Epackage Lab
   - **App Type**: "User Application" or "Service Integration"
   - **Redirect URIs**: Add your callback URL
     ```
     https://yourdomain.com/signature/callback
     https://localhost:3000/signature/callback (for development)
     ```
4. Select **Scopes/Permissions**:
   - `signature` - Basic signature operations
   - `impersonation` - For JWT grant authentication (if using service account)
5. Save and note the following:
   - **Integration Key** (Client ID)
   - **Secret Key** (Client Secret)
   - **Account ID** (found in Account Settings)

## Step 3: Generate RSA Key Pair (for JWT Authentication)

For production use with JWT grant:

```bash
# Generate private key
openssl genrsa -out docusign_private_key.pem 2048

# Generate public key
openssl rsa -in docusign_private_key.pem -pubout -out docusign_public_key.pem

# Get the public key in base64 format (for DocuSign config)
cat docusign_public_key.pem | base64 | tr -d '\n'
```

1. In DocuSign Admin Console, edit your integration app
2. Add the generated public key under **RSA Key Pair**
3. Keep the private key (`docusign_private_key.pem`) secure

## Step 4: Configure Environment Variables

Add the following variables to your `.env.local` file:

```bash
# =====================================================
# DocuSign Configuration
# =====================================================

# DocuSign OAuth Credentials (from Step 2)
DOCUSIGN_CLIENT_ID=your_integration_key_here
DOCUSIGN_CLIENT_SECRET=your_secret_key_here
DOCUSIGN_ACCOUNT_ID=your_account_id_here

# DocuSign User ID (for JWT authentication)
# Find this in DocuSign Admin > Users > API Username
DOCUSIGN_USER_ID=your_user_id_here

# Environment: 'demo' for sandbox, 'production' for live
DOCUSIGN_ENVIRONMENT=demo

# Webhook Secret (for signature verification)
# Generate a random secret for webhook HMAC validation
DOCUSIGN_WEBHOOK_SECRET=your_random_webhook_secret_here

# Private key path (for JWT authentication)
# In production, store this in a secure vault like AWS Secrets Manager
DOCUSIGN_PRIVATE_KEY_PATH=./docusign_private_key.pem
```

### Development vs Production

```bash
# Development (Sandbox)
DOCUSIGN_ENVIRONMENT=demo
DOCUSIGN_ACCOUNT_ID=your_sandbox_account_id

# Production
DOCUSIGN_ENVIRONMENT=production
DOCUSIGN_ACCOUNT_ID=your_production_account_id
```

## Step 5: Configure Webhooks

1. In DocuSign Admin Console, go to **Connect** (Webhooks)
2. Create a new webhook configuration:
   - **URL**: `https://yourdomain.com/api/signature/webhook`
   - **Events to log**:
     - Envelope Sent
     - Envelope Delivered
     - Envelope Signed
     - Envelope Completed
     - Envelope Declined
     - Envelope Voided
   - **Include**:
     - Envelope data
     - Recipients data
   - **Authentication**: Use HMAC signature with your webhook secret

## Step 6: Test the Integration

### Test Signature Request

```bash
curl -X POST https://yourdomain.com/api/signature/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test-doc-001",
    "documentName": "Test Contract",
    "documentContent": "BASE64_ENCODED_PDF",
    "documentType": "pdf",
    "signers": [
      {
        "email": "test@example.com",
        "name": "Test User",
        "order": 1
      }
    ],
    "subject": "Please sign this test contract",
    "signatureType": "handwritten"
  }'
```

### Test Webhook

DocuSign sends webhook POST requests to your endpoint with this format:

```json
{
  "envelopeId": "envelope-id-here",
  "status": "completed",
  "event": "signing_complete",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

## Step 7: Verify Database Setup

Ensure the following tables exist (from migration `20250101000000_create_signatures_table.sql`):

```sql
-- Check tables
SELECT * FROM signatures;
SELECT * FROM signature_events;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'signatures';
```

## Security Considerations

### 1. Private Key Storage
- **NEVER** commit private keys to Git
- Use environment variables or secure vaults (AWS Secrets Manager, Azure Key Vault)
- Set proper file permissions: `chmod 600 docusign_private_key.pem`

### 2. Webhook Verification
- Always verify HMAC signatures in production
- Use `DOCUSIGN_WEBHOOK_SECRET` for signature validation
- Reject unsigned/invalid webhooks

### 3. Access Control
- Use DocuSign's permission model
- Implement role-based access in your application
- Log all signature activities for audit

## Troubleshooting

### Common Errors

#### "AUTHORIZATION_INVALID_TOKEN"
- Access token expired
- Solution: Implement token refresh logic

#### "USER_AUTHORIZATION_FAILED"
- User lacks permission for the account
- Solution: Check DocuSign user permissions

#### "INVALID_CERTIFICATE"
- Invalid JWT or RSA key
- Solution: Regenerate key pair and update in DocuSign Admin

#### Webhook not received
- Check firewall rules
- Verify webhook URL is publicly accessible
- Check DocuSign Connect logs

## Advanced Configuration

### Custom Branding

1. Go to DocuSign Admin > Branding
2. Create custom branding with your company logo
3. Apply to templates and envelopes

### Template Management

Create reusable contract templates in DocuSign:
1. Go to **Templates** in DocuSign
2. Upload PDF with anchor tags (`\sSignature\`)
3. Define roles and tabs
4. Use template ID when sending envelopes

### Embedded Signing

For in-app signing experience:
```typescript
const signingUrl = await signatureIntegration.getSigningUrl(
  envelopeId,
  signerEmail
);
// Embed in iframe
```

## Reference Links

- [DocuSign REST API Reference](https://developers.docusign.com/docs/esign-rest-api/reference/)
- [JWT Grant Authentication](https://developers.docusign.com/platform/auth/jwt/)
- [Connect Webhooks Guide](https://developers.docusign.com/docs/esign-rest-api/esign101/concepts/connect/)
- [eSignature Java SDK](https://github.com/docusign/docusign-esign-java-client) (for reference)

## Support

For issues or questions:
1. Check DocuSign Developer Forums
2. Review [DocuSign Support](https://support.docusign.com/)
3. Check application logs in `/var/log/epackage/signature.log`
