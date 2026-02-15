# Epackage Lab Web - Deployment Guide

## Quick Start

### Prerequisites
- Ubuntu 20.04 LTS or later
- Node.js 18+
- Nginx
- PM2
- SSL certificate (Let's Encrypt)

### One-Click Deployment
```bash
# Clone the repository
git clone <repository-url>
cd epackage-lab-web

# Run the deployment script
sudo ./scripts/deploy.sh

# Setup SSL
sudo ./scripts/setup-ssl.sh

# Setup monitoring
sudo ./scripts/setup-monitoring.sh

# Configure backups
sudo ./scripts/backup-system.sh setup
```

### Manual Deployment

#### 1. Environment Setup
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### 2. Application Setup
```bash
# Create application directory
sudo mkdir -p /var/www/epackage-lab-web
sudo chown www-data:www-data /var/www/epackage-lab-web
cd /var/www/epackage-lab-web

# Copy application files
cp -r /path/to/source/* .

# Install dependencies
sudo -u www-data npm install --production

# Build application
sudo -u www-data npm run build

# Setup environment variables
sudo -u www-data cp .env.local.example .env.local
sudo nano .env.local  # Edit with your values
```

#### 3. Start Application
```bash
# Start with PM2
sudo -u www-data pm2 start pm2.config.js --env production
sudo -u www-data pm2 save

# Setup PM2 startup
pm2 startup
```

#### 4. Configure Nginx
```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/epackage-lab-web

# Enable site
sudo ln -s /etc/nginx/sites-available/epackage-lab-web /etc/nginx/sites-enabled/

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL
```bash
# Get SSL certificate
sudo certbot --nginx -d epackage-lab.com -d www.epackage-lab.com

# Setup auto-renewal
sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
```

## Environment Variables

Required environment variables in `.env.local`:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-actual-sendgrid-api-key
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Supabase Configuration (optional)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Application Settings
NEXT_PUBLIC_SITE_URL=https://epackage-lab.com
NODE_ENV=production
```

## Monitoring and Maintenance

### Check Application Status
```bash
# PM2 status
pm2 status

# Application logs
pm2 logs epackage-lab-web

# Nginx status
sudo systemctl status nginx
```

### View Logs
```bash
# Application logs
tail -f /var/log/epackage-lab-web/application/epackage-lab-web-out.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx
```

### Performance Monitoring
- Access monitoring dashboard: `http://your-server-ip:8080`
- Check Google Analytics: `https://analytics.google.com`
- Review performance metrics in application logs

## Backup and Recovery

### Manual Backup
```bash
# Create application backup
./scripts/backup-system.sh daily

# List available backups
./scripts/backup-system.sh list

# Restore from backup
./scripts/backup-system.sh restore /path/to/backup.tar.gz files
```

### Automatic Backups
Backups are configured automatically:
- Daily: 2 AM (7-day retention)
- Weekly: Sunday 3 AM (30-day retention)
- Monthly: 1st of month 4 AM (365-day retention)

## Troubleshooting

### Common Issues

#### Application Not Starting
```bash
# Check PM2 logs
pm2 logs epackage-lab-web

# Check environment variables
cat /var/www/epackage-lab-web/.env.local

# Check port availability
sudo netstat -tlnp | grep :3000
```

#### Nginx 502 Bad Gateway
```bash
# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Check if PM2 process is running
pm2 status

# Restart PM2
pm2 restart epackage-lab-web
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test certificate renewal
sudo certbot renew --dry-run
```

## Security Considerations

1. **Keep software updated**: Regularly run `sudo apt update && sudo apt upgrade`
2. **Monitor logs**: Check for suspicious activity in application and server logs
3. **Backup regularly**: Ensure backups are working and can be restored
4. **SSL certificates**: Monitor expiration dates and ensure auto-renewal works
5. **Firewall**: Configure UFW to allow only necessary ports
6. **User permissions**: Use least privilege principle for all accounts

## Performance Optimization

1. **Enable caching**: Configure browser and server caching headers
2. **Optimize images**: Use WebP format and appropriate sizes
3. **Minimize resources**: Use compression and minification
4. **CDN integration**: Consider CDN for static assets
5. **Database optimization**: Use connection pooling and query optimization

## Support

For technical support:
- Email: development@epackage-lab.com
- Documentation: `docs/TASK-010-Deployment.md`
- Issue tracking: Use your project management system

## Version History

- **v1.0.0** (2025-11-28): Initial production deployment
- Features: Contact forms, sample requests, catalog, quotation system
- Tech Stack: Next.js 16, React 19, TypeScript, Tailwind CSS

---

*This deployment guide covers the essential steps for deploying and maintaining the Epackage Lab web application in production.*