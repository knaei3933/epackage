# SendGrid Domain Authentication & DNS Setup Guide

This guide covers complete DNS configuration for SendGrid domain authentication to ensure high email deliverability for Epackage Lab.

## Overview

Domain authentication (also known as domain verification or custom domain) proves to email providers that you're authorized to send email from your domain. This is achieved through:

1. **SPF (Sender Policy Framework)** - Specifies which mail servers are authorized to send email for your domain
2. **DKIM (DomainKeys Identified Mail)** - Adds a digital signature to verify email hasn't been tampered with
3. **DMARC (Domain-based Message Authentication, Reporting, and Conformance)** - Tells receiving servers what to do with emails that fail SPF/DKIM checks

## Prerequisites

- **Domain**: `epackage-lab.com` (already registered)
- **DNS Provider Access**: Where your domain's DNS is hosted (e.g., Route53, Cloudflare, GoDaddy, etc.)
- **SendGrid Account**: With sender authentication enabled

---

## Step 1: Configure Domain Authentication in SendGrid

### 1.1 Access Sender Authentication

1. Log in to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **Sender Authentication**
3. Click **Authenticate Your Domain** (Domain Authentication)

### 1.2 Enter Domain Information

```
Domain: epackage-lab.com
Subdomain: em (This creates em.epackage-lab.com for automated security)
```

**Why use a subdomain?**
- Using `em.epackage-lab.com` for automated security allows you to maintain separate reputation for marketing vs transactional emails
- Recommended configuration: `em` (email marketing) or `mail` or leave blank

### 1.3 Generate DNS Records

After entering the domain, SendGrid will generate three types of DNS records:

1. **CNAME** for automated security
2. **TXT** for SPF
3. **TXT** for DKIM

---

## Step 2: Add DNS Records

### DNS Record Summary for `epackage-lab.com`

| Type | Name/Host | Value | TTL |
|------|-----------|-------|-----|
| CNAME | `em1._domainkey` | `em1.epackage-lab.com.sendgrid.net` | 3600 |
| CNAME | `em2._domainkey` | `em2.epackage-lab.com.sendgrid.net` | 3600 |
| CNAME | `em3._domainkey` | `em3.epackage-lab.com.sendgrid.net` | 3600 |
| TXT | `@` (root) | `v=spf1 include:sendgrid.net -all` | 3600 |

### 2.1 Add DKIM CNAME Records

These three CNAME records verify that SendGrid is authorized to send email on your behalf:

```
Type: CNAME
Name/Host: em1._domainkey
Value/Points to: em1.epackage-lab.com.sendgrid.net
TTL: 3600 (or 1 hour)

Type: CNAME
Name/Host: em2._domainkey
Value/Points to: em2.epackage-lab.com.sendgrid.net
TTL: 3600

Type: CNAME
Name/Host: em3._domainkey
Value/Points to: em3.epackage-lab.com.sendgrid.net
TTL: 3600
```

**Note**: The exact names may vary based on your chosen subdomain. Use the records provided in your SendGrid dashboard.

### 2.2 Add SPF TXT Record

The SPF record specifies that only SendGrid can send email from your domain:

```
Type: TXT
Name/Host: @ (or leave blank for root domain)
Value: v=spf1 include:sendgrid.net -all
TTL: 3600
```

**SPF Record Explained**:
- `v=spf1` - SPF version 1
- `include:sendgrid.net` - Authorize SendGrid's mail servers
- `-all` - Reject all email from unauthorized servers (strict)

**Multiple SPF Records Warning**: If you already have an SPF record (e.g., for Google Workspace), you need to merge them:

```
v=spf1 include:sendgrid.net include:_spf.google.com ~all
```

Use `~all` (softfail) instead of `-all` (fail) if you have other services.

### 2.3 Add DMARC TXT Record (Optional but Recommended)

DMARC tells receiving servers what to do with emails that fail authentication:

```
Type: TXT
Name/Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@epackage-lab.com; ruf=mailto:dmarc@epackage-lab.com
TTL: 3600
```

**DMARC Policy Explained**:
- `v=DMARC1` - DMARC version 1
- `p=none` - Monitoring mode (doesn't block failing emails, just reports)
- `rua` - Send aggregate reports to this email
- `ruf` - Send forensic reports to this email

**DMARC Policy Progression**:
1. Start with `p=none` for 1-2 weeks (monitor only)
2. Move to `p=quarantine` for 1-2 weeks (spam folder for failures)
3. Finally `p=reject` (bounce failures) - highest security

---

## Step 3: Verify DNS Records

### 3.1 Wait for DNS Propagation

DNS changes can take anywhere from **5 minutes to 48 hours** to propagate worldwide.

**Quick check**: After 5-10 minutes, verification should work for most providers.

### 3.2 Verify in SendGrid Dashboard

1. Go back to **Settings** → **Sender Authentication** in SendGrid
2. Click **Verify** next to your domain
3. SendGrid will check DNS records and show status:
   - ✅ **Verified** - All records correct
   - ❌ **Not Found** - DNS record not found or not propagated
   - ⚠️ **Invalid** - Record found but value doesn't match

### 3.3 Manual DNS Verification

You can verify DNS records manually using command line:

#### Windows (Command Prompt)
```cmd
nslookup -type=CNAME em1._domainkey.epackage-lab.com
nslookup -type=TXT epackage-lab.com
```

#### Windows (PowerShell)
```powershell
Resolve-DnsName -Name em1._domainkey.epackage-lab.com -Type CNAME
Resolve-DnsName -Name epackage-lab.com -Type TXT
```

#### Linux/Mac
```bash
dig CNAME em1._domainkey.epackage-lab.com
dig TXT epackage-lab.com
```

#### Online Tools
- https://mxtoolbox.com/
- https://www.whatsmydns.net/
- https://www.dmarcanalyzer.com/dmarc/dmarc-check

---

## Step 4: Common DNS Provider Instructions

### AWS Route 53

1. Go to **Hosted Zones** → Select `epackage-lab.com`
2. Click **Create Record Set**
3. Add each record:
   - **Type**: CNAME or TXT
   - **Name**: e.g., `em1._domainkey`
   - **Value**: Paste the SendGrid value
   - **TTL**: 300 (5 minutes)
4. Click **Create**

### Cloudflare

1. Go to **DNS** → Select `epackage-lab.com`
2. Click **Add Record**
3. For CNAME records:
   - **Type**: CNAME
   - **Name**: `em1._domainkey`
   - **Target**: `em1.epackage-lab.com.sendgrid.net`
   - **Proxy status**: DNS only (gray cloud)
   - **TTL**: Auto
4. For TXT records:
   - **Type**: TXT
   - **Name**: `@`
   - **Content**: `v=spf1 include:sendgrid.net -all`
   - **Proxy status**: DNS only (gray cloud)

### GoDaddy

1. Go to **DNS Management** → Select `epackage-lab.com`
2. Scroll to **Records** section
3. Click **Add** → Select record type
4. For TXT records, ensure quotes are NOT included in the value

### Namecheap

1. Go to **Advanced DNS** → Select `epackage-lab.com`
2. Click **Add New Record**
3. Enter record details
4. Click **Save All Changes**

---

## Step 5: Test Email Deliverability

### 5.1 Send Test Email

After verification is complete:

1. In SendGrid Dashboard, go to **Email Activity** or **Settings** → **Sender Authentication**
2. Click **Send Test Email**
3. Send to multiple test addresses:
   - Gmail address
   - Outlook address
   - Corporate email address
   - Personal email address

### 5.2 Check Email Headers

Open the test email and check headers:

**Gmail**:
1. Open email
2. Click **More** (three dots) → **Show original**
3. Look for:
   - `Received-SPF: pass`
   - `DKIM-Signature: pass`
   - `Authentication-Results: pass`

**Outlook**:
1. Open email
2. Click **File** → **Properties**
3. Look for authentication results in **Internet Headers**

### 5.3 Use Email Testing Tools

- **Mail-Tester.com**: https://www.mail-tester.com/ - Spam score check
- **GlockApps**: https://glockapps.com/ - Inbox placement testing
- **MXToolbox**: https://mxtoolbox.com/ - DNS and blacklist check

---

## Step 6: Monitoring and Maintenance

### 6.1 SendGrid Reputation Score

Monitor your sender reputation at:
https://app.sendgrid.com/settings/sender_reputation

**Good reputation indicators**:
- Score: 90-100
- Low spam complaint rate (< 0.1%)
- High engagement rate

### 6.2 DMARC Reports

If you configured DMARC with `rua` parameter, you'll receive aggregate XML reports. Use tools to analyze:
- **DMARC Analyzer**: https://www.dmarcanalyzer.com/
- **Postmark DMARC**: https://dmarc.postmarkapp.com/ (free)

### 6.3 Regular Checks

**Monthly**:
- Check sender reputation
- Review email delivery rates
- Monitor spam complaints

**Quarterly**:
- Review DMARC reports
- Update SPF records if adding new services
- Audit DNS records for accuracy

---

## Troubleshooting

### Issue: DNS verification fails in SendGrid

**Possible causes**:
1. **DNS not propagated** - Wait up to 48 hours
2. **Incorrect record name** - Check for typos in hostname
3. **TTL too high** - Previous DNS records cached
4. **Wrong DNS zone** - Adding to subdomain instead of root domain

**Solutions**:
- Verify record names match exactly (including trailing dots if required)
- Check that records are in the root domain zone, not a subdomain
- Use `dig` or `nslookup` to verify records are publicly visible

### Issue: SPF record exists but needs merge

**Solution**: Merge multiple SPF records into one:
```
v=spf1 include:sendgrid.net include:_spf.google.com include:service.com -all
```

You cannot have multiple SPF TXT records for the same domain.

### Issue: Emails going to spam

**Checklist**:
1. ✅ SPF and DKIM passing
2. ✅ Domain reputation good
3. ✅ Email content not spam-like
4. ✅ From address authenticated
5. ✅ Reply-to address configured

**Quick fixes**:
- Reduce image-to-text ratio
- Avoid spam trigger words
- Include physical address in footer
- Use double opt-in for marketing emails

### Issue: "550 5.7.1 Unauthenticated email" error

**Cause**: SPF record not configured or incorrect

**Solution**: Verify SPF record:
```
v=spf1 include:sendgrid.net -all
```

---

## Production Checklist

Before going to production, ensure:

- [ ] All 3 DKIM CNAME records verified
- [ ] SPF TXT record verified
- [ ] DMARC TXT record configured (optional but recommended)
- [ ] DNS fully propagated (check with multiple DNS tools)
- [ ] SendGrid shows "Verified" status
- [ ] Test emails sent to multiple providers (Gmail, Outlook, Yahoo)
- [ ] Email headers show SPF/DKIM pass
- [ ] DMARC policy monitoring in place
- [ ] Sender reputation score is good (90+)
- [ ] Spam rate is low (< 0.1%)

---

## Security Considerations

### Protect Your Domain Reputation

1. **Never** share your SendGrid API keys publicly
2. **Always** use environment variables for API keys
3. **Monitor** email delivery rates and spam complaints
4. **Implement** rate limiting on your application
5. **Use** separate subdomains for transactional vs marketing emails

### Domain Keys Rotation

SendGrid automatically handles DKIM key rotation. No manual action required.

### Account Security

- Enable 2FA on SendGrid account
- Use API keys with specific permissions only
- Regularly audit API key usage
- Set up alerts for unusual activity

---

## Additional Resources

### Official Documentation
- [SendGrid Domain Authentication](https://docs.sendgrid.com/for-developers/sending-email/sender-identity/domain-authentication)
- [SPF Record Syntax](https://www.openspf.org/SPF_Record_Syntax)
- [DMARC.org](https://dmarc.org/)
- [M3AAWG Sender Best Practices](https://www.m3aawg.org/)

### DNS Tools
- [MXToolbox DNS Lookup](https://mxtoolbox.com/DNSLookup.aspx)
- [WhatsMyDNS DNS Propagation](https://www.whatsmydns.net/)
- [DNS Checker](https://dnschecker.org/)
- [DMARC Inspector](https://dmarc.inspector.redcanary.com/)

### Email Testing
- [Mail-Tester](https://www.mail-tester.com/)
- [Email on Acid](https://www.emailonacid.com/)
- [Litmus](https://litmus.com/)

---

## Cost Considerations

Domain authentication via SendGrid is **free**. No additional costs beyond your SendGrid plan.

**SendGrid Free Tier**:
- 100 emails/day
- Domain authentication included
- Basic analytics

**For Production**:
- Estimate: < 1000 emails/month for B2B
- Free tier sufficient for MVP
- Consider Basic plan ($19/month) if exceeding free tier

---

## Support Contacts

### SendGrid Support
- Email: support@sendgrid.com
- Documentation: https://docs.sendgrid.com/
- Status Page: https://status.sendgrid.com/

### Epackage Lab Contacts
- Technical: admin@epackage-lab.com
- DNS Management: Contact your DNS provider
