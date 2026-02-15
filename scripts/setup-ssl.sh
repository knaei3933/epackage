#!/bin/bash
# SSL Certificate Setup Script for Epackage Lab Web
# Let's Encrypt SSL 인증서 설정 스크립트

set -e

# Configuration
DOMAIN="epackage-lab.com"
WWW_DOMAIN="www.epackage-lab.com"
EMAIL="admin@epackage-lab.com"
NGINX_CONFIG_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
        exit 1
    fi
}

# Install Certbot
install_certbot() {
    log "Installing Certbot..."

    # Update package list
    apt-get update

    # Install certbot and nginx plugin
    apt-get install -y certbot python3-certbot-nginx

    log "Certbot installed successfully"
}

# Create temporary nginx config for domain validation
create_temp_nginx_config() {
    log "Creating temporary nginx configuration..."

    cat > "/etc/nginx/sites-available/$DOMAIN-temp" << EOF
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF

    # Enable temporary site
    ln -sf "/etc/nginx/sites-available/$DOMAIN-temp" "/etc/nginx/sites-enabled/"

    # Test and reload nginx
    nginx -t
    systemctl reload nginx

    log "Temporary nginx configuration created"
}

# Obtain SSL certificate
obtain_ssl_certificate() {
    log "Obtaining SSL certificate for $DOMAIN..."

    # Obtain certificate
    certbot --nginx \
        --domain $DOMAIN \
        --domain $WWW_DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive \
        --redirect \
        --hsts \
        --staple-ocsp \
        --rsa-key-size 4096 \
        --must-staple

    log "SSL certificate obtained successfully"
}

# Setup auto-renewal
setup_auto_renewal() {
    log "Setting up automatic certificate renewal..."

    # Add cron job for renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | crontab -

    # Test renewal process
    certbot renew --dry-run

    log "Auto-renewal setup completed"
}

# Cleanup temporary config
cleanup_temp_config() {
    log "Cleaning up temporary configuration..."

    # Remove temporary nginx config
    rm -f "/etc/nginx/sites-available/$DOMAIN-temp"
    rm -f "/etc/nginx/sites-enabled/$DOMAIN-temp"

    # Reload nginx
    systemctl reload nginx

    log "Cleanup completed"
}

# Create SSL configuration snippet
create_ssl_config() {
    log "Creating SSL configuration snippet..."

    cat > "/etc/nginx/snippets/ssl-$DOMAIN.conf" << EOF
# SSL configuration for $DOMAIN
ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

# SSL settings
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

# Other security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self';" always;
EOF

    log "SSL configuration snippet created"
}

# Test SSL configuration
test_ssl() {
    log "Testing SSL configuration..."

    # Wait a moment for nginx to reload
    sleep 5

    # Test HTTPS connection
    if curl -fs "https://$DOMAIN" > /dev/null 2>&1; then
        log "HTTPS connection test passed"
    else
        error "HTTPS connection test failed"
        exit 1
    fi

    # Check SSL certificate
    if openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>/dev/null | openssl x509 -noout -dates | grep -q "notAfter"; then
        log "SSL certificate validation passed"
    else
        error "SSL certificate validation failed"
        exit 1
    fi

    log "SSL tests completed successfully"
}

# Display certificate information
display_certificate_info() {
    log "SSL Certificate Information:"
    echo "----------------------------------------"
    certbot certificates | grep -A 10 "$DOMAIN"
    echo "----------------------------------------"
    echo "Certificate files location: /etc/letsencrypt/live/$DOMAIN/"
    echo "Renewal command: certbot renew"
    echo "Nginx configuration: /etc/nginx/sites-enabled/$DOMAIN"
}

# Main function
main() {
    log "Starting SSL setup for $DOMAIN..."

    check_root
    install_certbot
    create_temp_nginx_config
    obtain_ssl_certificate
    setup_auto_renewal
    cleanup_temp_config
    create_ssl_config
    test_ssl
    display_certificate_info

    log "🎉 SSL setup completed successfully!"
    log "🔒 Your website is now secured with HTTPS"
}

# Run main function
main "$@"