#!/bin/bash
# Xserver Deployment Script for Epackage Lab Web
# Xserver 배포 스크립트

set -e  # Exit on any error

echo "🚀 Starting Epackage Lab Web deployment to Xserver..."

# Configuration
APP_NAME="epackage-lab-web"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
SERVICE_USER="www-data"
NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"
PM2_CONFIG="/var/www/$APP_NAME/pm2.config.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
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

# Create backup
create_backup() {
    log "Creating backup..."
    if [ -d "$APP_DIR" ]; then
        sudo mkdir -p "$BACKUP_DIR"
        sudo cp -r "$APP_DIR" "$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/"
        log "Backup created at $BACKUP_DIR"
    fi
}

# Install dependencies
install_dependencies() {
    log "Installing system dependencies..."
    apt-get update
    apt-get install -y curl git nginx certbot python3-certbot-nginx

    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        log "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        apt-get install -y nodejs
    fi

    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2..."
        npm install -g pm2
    fi

    # Setup PM2 startup
    pm2 startup
    env PATH=$PATH:/usr/bin pm2 save
}

# Setup application directory
setup_app_directory() {
    log "Setting up application directory..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R "$SERVICE_USER:$SERVICE_USER" "$APP_DIR"
}

# Deploy application
deploy_application() {
    log "Deploying application..."

    # Navigate to app directory
    cd "$APP_DIR"

    # Copy application files (assumes files are already present)
    # In a real scenario, you might clone from git or copy from a staging area

    # Install npm dependencies
    sudo -u "$SERVICE_USER" npm install --production

    # Build the application
    sudo -u "$SERVICE_USER" npm run build

    log "Application deployed successfully"
}

# Configure Nginx
configure_nginx() {
    log "Configuring Nginx..."

    # Copy nginx configuration
    sudo cp nginx.conf "$NGINX_CONFIG"

    # Enable the site
    sudo ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/"

    # Test nginx configuration
    sudo nginx -t

    # Restart nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx

    log "Nginx configured successfully"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    log "Setting up SSL certificate..."

    # Get SSL certificate (replace with actual domain)
    sudo certbot --nginx -d epackage-lab.com -d www.epackage-lab.com --non-interactive --agree-tos --email admin@epackage-lab.com

    # Setup auto-renewal
    sudo crontab -l | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

    log "SSL certificate configured successfully"
}

# Start application with PM2
start_application() {
    log "Starting application with PM2..."

    cd "$APP_DIR"
    sudo -u "$SERVICE_USER" pm2 start pm2.config.js --env production
    sudo -u "$SERVICE_USER" pm2 save

    log "Application started successfully"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."

    # Create log directory
    sudo mkdir -p /var/log/pm2
    sudo chown -R "$SERVICE_USER:$SERVICE_USER" /var/log/pm2

    # Setup log rotation
    sudo tee /etc/logrotate.d/pm2 << EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_USER $SERVICE_USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

    log "Monitoring setup completed"
}

# Health check
health_check() {
    log "Performing health check..."

    # Wait for application to start
    sleep 10

    # Check if application is responding
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "Application health check passed"
    else
        error "Application health check failed"
        exit 1
    fi

    # Check nginx status
    if sudo systemctl is-active --quiet nginx; then
        log "Nginx is running"
    else
        error "Nginx is not running"
        exit 1
    fi
}

# Cleanup
cleanup() {
    log "Cleaning up..."
    # Remove temporary files if any
}

# Main deployment flow
main() {
    log "Starting deployment process..."

    check_root
    create_backup
    install_dependencies
    setup_app_directory
    deploy_application
    configure_nginx
    setup_ssl
    start_application
    setup_monitoring
    health_check
    cleanup

    log "🎉 Deployment completed successfully!"
    log "📱 Your application is now available at: https://epackage-lab.com"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"