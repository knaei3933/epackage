#!/bin/bash
# Monitoring Setup Script for Epackage Lab Web
# 모니터링 시스템 설정 스크립트

set -e

# Configuration
APP_NAME="epackage-lab-web"
APP_DIR="/var/www/$APP_NAME"
LOG_DIR="/var/log/$APP_NAME"
MONITORING_DIR="/opt/monitoring"

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

# Create log directories
create_log_directories() {
    log "Creating log directories..."

    mkdir -p "$LOG_DIR"
    mkdir -p "$LOG_DIR/nginx"
    mkdir -p "$LOG_DIR/pm2"
    mkdir -p "$LOG_DIR/application"
    mkdir -p "$LOG_DIR/monitoring"

    chown -R www-data:www-data "$LOG_DIR"
    chmod -R 755 "$LOG_DIR"

    log "Log directories created"
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."

    # Nginx log rotation
    cat > "/etc/logrotate.d/$APP_NAME-nginx" << EOF
$LOG_DIR/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

    # PM2 log rotation
    cat > "/etc/logrotate.d/$APP_NAME-pm2" << EOF
$LOG_DIR/pm2/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

    # Application log rotation
    cat > "/etc/logrotate.d/$APP_NAME-app" << EOF
$LOG_DIR/application/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF

    log "Log rotation configured"
}

# Install monitoring tools
install_monitoring_tools() {
    log "Installing monitoring tools..."

    # Update package list
    apt-get update

    # Install basic monitoring tools
    apt-get install -y htop iotop nethogs sysstat

    # Install Node.js monitoring tools
    npm install -g pm2-logrotate

    # Configure PM2 log rotation
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 30
    pm2 set pm2-logrotate:compress true

    log "Monitoring tools installed"
}

# Setup Uptime monitoring (local)
setup_uptime_monitoring() {
    log "Setting up uptime monitoring..."

    # Create uptime monitoring script
    cat > "$MONITORING_DIR/uptime-check.sh" << EOF
#!/bin/bash
# Uptime monitoring script

SITE_URL="https://epackage-lab.com"
LOG_FILE="$LOG_DIR/monitoring/uptime.log"

# Check if site is accessible
if curl -f -s --max-time 30 "$SITE_URL" > /dev/null; then
    echo "\$(date '+%Y-%m-%d %H:%M:%S') - UP - $SITE_URL" >> "\$LOG_FILE"
else
    echo "\$(date '+%Y-%m-%d %H:%M:%S') - DOWN - $SITE_URL" >> "\$LOG_FILE"
    # Send alert (you can integrate with your preferred alerting system)
    # Example: send email, Slack notification, etc.
fi
EOF

    chmod +x "$MONITORING_DIR/uptime-check.sh"

    # Add to crontab (every 5 minutes)
    (crontab -l 2>/dev/null; echo "*/5 * * * * $MONITORING_DIR/uptime-check.sh") | crontab -

    log "Uptime monitoring configured"
}

# Setup performance monitoring
setup_performance_monitoring() {
    log "Setting up performance monitoring..."

    # Create performance monitoring script
    cat > "$MONITORING_DIR/performance-check.sh" << EOF
#!/bin/bash
# Performance monitoring script

LOG_FILE="$LOG_DIR/monitoring/performance.log"

# Check system resources
CPU_USAGE=\$(top -bn1 | grep "Cpu(s)" | awk '{print \$2}' | sed 's/%us,//')
MEMORY_USAGE=\$(free | grep Mem | awk '{printf "%.2f", \$3/\$2 * 100.0}')
DISK_USAGE=\$(df -h / | awk 'NR==2 {print \$5}' | sed 's/%//')

# Check application response time
RESPONSE_TIME=\$(curl -o /dev/null -s -w '%{time_total}' https://epackage-lab.com)

# Log performance metrics
echo "\$(date '+%Y-%m-%d %H:%M:%S') - CPU: \$CPU_USAGE%, Memory: \$MEMORY_USAGE%, Disk: \$DISK_USAGE%, Response: \$RESPONSE_TIME" >> "\$LOG_FILE"

# Alert if thresholds are exceeded
if (( \$(echo "\$CPU_USAGE > 80" | bc -l) )); then
    echo "High CPU usage: \$CPU_USAGE%" >> "\$LOG_FILE"
fi

if (( \$(echo "\$MEMORY_USAGE > 80" | bc -l) )); then
    echo "High memory usage: \$MEMORY_USAGE%" >> "\$LOG_FILE"
fi

if [ "\$DISK_USAGE" -gt 80 ]; then
    echo "High disk usage: \$DISK_USAGE%" >> "\$LOG_FILE"
fi

if (( \$(echo "\$RESPONSE_TIME > 5" | bc -l) )); then
    echo "Slow response time: \$RESPONSE_TIME seconds" >> "\$LOG_FILE"
fi
EOF

    chmod +x "$MONITORING_DIR/performance-check.sh"

    # Add to crontab (every 10 minutes)
    (crontab -l 2>/dev/null; echo "*/10 * * * * $MONITORING_DIR/performance-check.sh") | crontab -

    log "Performance monitoring configured"
}

# Setup error monitoring
setup_error_monitoring() {
    log "Setting up error monitoring..."

    # Create error monitoring script
    cat > "$MONITORING_DIR/error-check.sh" << EOF
#!/bin/bash
# Error monitoring script

ERROR_LOG="$LOG_DIR/application/error.log"
ALERT_THRESHOLD=5
ALERT_EMAIL="admin@epackage-lab.com"

# Check for recent errors
RECENT_ERRORS=\$(find "$ERROR_LOG" -mmin -10 -type f 2>/dev/null | wc -l)

if [ "\$RECENT_ERRORS" -gt "\$ALERT_THRESHOLD" ]; then
    echo "High error rate detected: \$RECENT_ERRORS errors in last 10 minutes" | \
        mail -s "Alert: High Error Rate on $APP_NAME" "\$ALERT_EMAIL" 2>/dev/null || \
        echo "Failed to send email alert"
fi

# Check nginx error log
NGINX_ERRORS=\$(grep -c "error" /var/log/nginx/error.log 2>/dev/null || echo "0")
if [ "\$NGINX_ERRORS" -gt 0 ]; then
    echo "Nginx errors detected: \$NGINX_ERRORS" >> "$LOG_DIR/monitoring/nginx_errors.log"
fi
EOF

    chmod +x "$MONITORING_DIR/error-check.sh"

    # Add to crontab (every 15 minutes)
    (crontab -l 2>/dev/null; echo "*/15 * * * * $MONITORING_DIR/error-check.sh") | crontab -

    log "Error monitoring configured"
}

# Setup monitoring dashboard (simple web interface)
setup_monitoring_dashboard() {
    log "Setting up monitoring dashboard..."

    # Create simple HTML dashboard
    cat > "$MONITORING_DIR/dashboard.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>$APP_NAME Monitoring Dashboard</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
        .up { background-color: #d4edda; color: #155724; }
        .down { background-color: #f8d7da; color: #721c24; }
        .warning { background-color: #fff3cd; color: #856404; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metric-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
        h1, h2 { color: #333; }
        .refresh-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
        .refresh-btn:hover { background: #0056b3; }
    </style>
</head>
<body>
    <h1>$APP_NAME Monitoring Dashboard</h1>
    <button class="refresh-btn" onclick="location.reload()">Refresh</button>

    <div class="metrics">
        <div class="metric-card">
            <h2>Uptime Status</h2>
            <div id="uptime-status"></div>
        </div>

        <div class="metric-card">
            <h2>Performance Metrics</h2>
            <div id="performance-metrics"></div>
        </div>

        <div class="metric-card">
            <h2>Recent Errors</h2>
            <div id="recent-errors"></div>
        </div>

        <div class="metric-card">
            <h2>System Resources</h2>
            <div id="system-resources"></div>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setInterval(() => location.reload(), 30000);

        // Load monitoring data (this would normally come from API endpoints)
        document.addEventListener('DOMContentLoaded', function() {
            // Placeholder content - in a real implementation, you'd fetch from APIs
            document.getElementById('uptime-status').innerHTML = '<div class="status up">✅ Service is UP</div>';
            document.getElementById('performance-metrics').innerHTML = '<p>Last response time: 245ms</p>';
            document.getElementById('recent-errors').innerHTML = '<p>No recent errors</p>';
            document.getElementById('system-resources').innerHTML = '<p>CPU: 15%, Memory: 45%, Disk: 62%</p>';
        });
    </script>
</body>
</html>
EOF

    # Setup nginx to serve the dashboard (optional, on a different port)
    cat > "/etc/nginx/sites-available/$APP_NAME-monitoring" << EOF
server {
    listen 8080;
    server_name localhost;

    location / {
        root $MONITORING_DIR;
        index dashboard.html;
        try_files \$uri \$uri/ =404;
    }

    # Basic auth for security (optional)
    auth_basic "Monitoring Dashboard";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
EOF

    log "Monitoring dashboard setup completed"
}

# Create monitoring service user
create_monitoring_user() {
    log "Creating monitoring service user..."

    if ! id "monitoring" &>/dev/null; then
        useradd -r -s /bin/false monitoring
        usermod -a -G www-data monitoring
    fi

    chown -R monitoring:monitoring "$MONITORING_DIR"
    chmod -R 755 "$MONITORING_DIR"

    log "Monitoring user created"
}

# Setup backup for monitoring data
setup_monitoring_backup() {
    log "Setting up monitoring data backup..."

    cat > "$MONITORING_DIR/backup-monitoring.sh" << EOF
#!/bin/bash
# Backup monitoring data

BACKUP_DIR="/var/backups/$APP_NAME/monitoring"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p "\$BACKUP_DIR"

# Backup logs
tar -czf "\$BACKUP_DIR/monitoring-logs-\$DATE.tar.gz" "$LOG_DIR/monitoring/"

# Keep only last 30 days of backups
find "\$BACKUP_DIR" -name "monitoring-logs-*.tar.gz" -mtime +30 -delete

echo "Monitoring data backup completed: \$DATE"
EOF

    chmod +x "$MONITORING_DIR/backup-monitoring.sh"

    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * $MONITORING_DIR/backup-monitoring.sh") | crontab -

    log "Monitoring backup configured"
}

# Main function
main() {
    log "Setting up monitoring system for $APP_NAME..."

    check_root
    create_log_directories
    setup_log_rotation
    install_monitoring_tools
    setup_uptime_monitoring
    setup_performance_monitoring
    setup_error_monitoring
    setup_monitoring_dashboard
    create_monitoring_user
    setup_monitoring_backup

    log "🎉 Monitoring system setup completed!"
    log "📊 Dashboard available at: http://your-server-ip:8080"
    log "📋 Logs location: $LOG_DIR"
    log "⚙️  Monitoring scripts: $MONITORING_DIR"
}

# Run main function
main "$@"