#!/bin/bash
# Backup and Recovery System for Epackage Lab Web
# 백업 및 복구 시스템 스크립트

set -e

# Configuration
APP_NAME="epackage-lab-web"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/var/backups/$APP_NAME"
S3_BUCKET="${S3_BUCKET:-epackage-lab-backups}"
RETENTION_DAYS=30
LOG_FILE="/var/log/$APP_NAME/backup.log"

# Database Configuration (if using PostgreSQL)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-epackage_lab}"
DB_USER="${DB_USER:-postgres}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] [WARN]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN] $1" >> "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $1" >> "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO] $1" >> "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
        exit 1
    fi
}

# Create backup directories
create_backup_directories() {
    log "Creating backup directories..."
    mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly,database,files,config}
    mkdir -p "/var/log/$APP_NAME"
    chown -R root:root "$BACKUP_DIR"
    chmod -R 755 "$BACKUP_DIR"
    log "Backup directories created"
}

# Backup application files
backup_files() {
    local backup_type="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/files/${backup_type}_${APP_NAME}_${timestamp}.tar.gz"

    log "Starting $backup_type file backup..."

    # Create application backup
    tar -czf "$backup_file" \
        --exclude="$APP_DIR/node_modules" \
        --exclude="$APP_DIR/.next/cache" \
        --exclude="$APP_DIR/.git" \
        --exclude="$APP_DIR/logs" \
        -C "$(dirname "$APP_DIR")" "$(basename "$APP_DIR")"

    # Verify backup
    if [[ -f "$backup_file" ]]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log "File backup completed: $backup_file ($size)"
    else
        error "File backup failed"
        return 1
    fi
}

# Backup database (if configured)
backup_database() {
    local backup_type="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/database/${backup_type}_database_${timestamp}.sql.gz"

    log "Starting $backup_type database backup..."

    # Skip if database not configured
    if [[ -z "$DB_NAME" ]]; then
        warn "Database not configured, skipping database backup"
        return 0
    fi

    # Check if PostgreSQL is available
    if command -v pg_dump &> /dev/null; then
        # Export password if provided
        if [[ -n "$DB_PASSWORD" ]]; then
            export PGPASSWORD="$DB_PASSWORD"
        fi

        # Create database backup
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" | gzip > "$backup_file"

        # Verify backup
        if [[ -f "$backup_file" ]]; then
            local size=$(du -h "$backup_file" | cut -f1)
            log "Database backup completed: $backup_file ($size)"
        else
            error "Database backup failed"
            return 1
        fi

        # Clear password
        unset PGPASSWORD
    else
        warn "PostgreSQL not available, skipping database backup"
    fi
}

# Backup configuration files
backup_config() {
    local backup_type="$1"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/config/${backup_type}_config_${timestamp}.tar.gz"

    log "Starting $backup_type configuration backup..."

    tar -czf "$backup_file" \
        /etc/nginx/sites-available/"$APP_NAME" \
        /etc/nginx/sites-enabled/"$APP_NAME" \
        "$APP_DIR/.env.local" \
        "$APP_DIR/pm2.config.js" \
        "$APP_DIR/package.json" \
        "$APP_DIR/next.config.ts" \
        /etc/systemd/system/nginx.service \
        /etc/cron.d/*"$APP_NAME"* 2>/dev/null || true

    if [[ -f "$backup_file" ]]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log "Configuration backup completed: $backup_file ($size)"
    else
        error "Configuration backup failed"
        return 1
    fi
}

# Backup to cloud storage (if AWS CLI is available)
backup_to_cloud() {
    local backup_file="$1"

    if command -v aws &> /dev/null && [[ -n "$S3_BUCKET" ]]; then
        log "Uploading backup to S3: $S3_BUCKET"

        aws s3 cp "$backup_file" "s3://$S3_BUCKET/$(basename "$backup_file")" \
            --storage-class STANDARD_IA \
            --server-side-encryption AES256

        if [[ $? -eq 0 ]]; then
            log "Cloud backup completed: $(basename "$backup_file")"
        else
            warn "Cloud backup failed: $(basename "$backup_file")"
        fi
    else
        warn "AWS CLI not configured, skipping cloud backup"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    local backup_type="$1"
    local retention_days="$2"

    log "Cleaning up old $backup_type backups (older than $retention_days days)..."

    find "$BACKUP_DIR" -name "${backup_type}_*" -type f -mtime +$retention_days -delete
    find "$BACKUP_DIR" -name "${backup_type}_*" -type f -mtime +$retention_days -print0 | \
        xargs -0 -I {} aws s3 rm "s3://$S3_BUCKET/$(basename {})" 2>/dev/null || true

    log "Old backups cleanup completed"
}

# Generate backup report
generate_backup_report() {
    local report_file="$BACKUP_DIR/backup_report_$(date +%Y%m%d).txt"

    {
        echo "Backup Report - $(date)"
        echo "========================="
        echo ""
        echo "Application: $APP_NAME"
        echo "Backup Directory: $BACKUP_DIR"
        echo ""
        echo "Recent Backups:"
        echo "--------------"
        find "$BACKUP_DIR" -name "*.tar.gz" -o -name "*.sql.gz" | \
            sort -r | head -20 | while read file; do
            local size=$(du -h "$file" | cut -f1)
            local date=$(stat -c %y "$file" | cut -d' ' -f1,2 | cut -d'.' -f1)
            echo "$date - $(basename "$file") ($size)"
        done
        echo ""
        echo "Disk Usage:"
        echo "----------"
        du -sh "$BACKUP_DIR"/* 2>/dev/null || echo "No backup directories found"
        echo ""
        echo "Total Backup Size:"
        echo "-----------------"
        du -sh "$BACKUP_DIR" 2>/dev/null || echo "Cannot determine size"
    } > "$report_file"

    log "Backup report generated: $report_file"
}

# Daily backup function
daily_backup() {
    log "Starting daily backup process..."

    backup_files "daily"
    backup_database "daily"
    backup_config "daily"

    # Upload recent backups to cloud
    find "$BACKUP_DIR" -name "daily_*" -type f -mmin -60 | while read file; do
        backup_to_cloud "$file"
    done

    cleanup_old_backups "daily" 7
    generate_backup_report

    log "Daily backup completed successfully"
}

# Weekly backup function
weekly_backup() {
    log "Starting weekly backup process..."

    backup_files "weekly"
    backup_database "weekly"
    backup_config "weekly"

    # Upload recent backups to cloud
    find "$BACKUP_DIR" -name "weekly_*" -type f -mmin -60 | while read file; do
        backup_to_cloud "$file"
    done

    cleanup_old_backups "weekly" 30

    log "Weekly backup completed successfully"
}

# Monthly backup function
monthly_backup() {
    log "Starting monthly backup process..."

    backup_files "monthly"
    backup_database "monthly"
    backup_config "monthly"

    # Upload recent backups to cloud
    find "$BACKUP_DIR" -name "monthly_*" -type f -mmin -60 | while read file; do
        backup_to_cloud "$file"
    done

    cleanup_old_backups "monthly" 365

    log "Monthly backup completed successfully"
}

# Restore function
restore_backup() {
    local backup_file="$1"
    local restore_type="$2"

    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi

    log "Starting restore from: $backup_file"

    case "$restore_type" in
        "files")
            # Stop application first
            systemctl stop nginx || true
            pm2 stop "$APP_NAME" || true

            # Backup current files
            if [[ -d "$APP_DIR" ]]; then
                mv "$APP_DIR" "$APP_DIR.backup.$(date +%Y%m%d_%H%M%S)"
            fi

            # Restore files
            tar -xzf "$backup_file" -C "$(dirname "$APP_DIR")"

            # Restore permissions
            chown -R www-data:www-data "$APP_DIR"

            # Restart services
            pm2 start "$APP_DIR/pm2.config.js" --env production
            systemctl start nginx

            log "File restore completed"
            ;;
        "database")
            if [[ -n "$DB_NAME" ]]; then
                if [[ -n "$DB_PASSWORD" ]]; then
                    export PGPASSWORD="$DB_PASSWORD"
                fi

                # Restore database
                gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME"

                unset PGPASSWORD
                log "Database restore completed"
            else
                warn "Database not configured, skipping restore"
            fi
            ;;
        "config")
            # Restore configuration files
            tar -xzf "$backup_file" -C /

            # Reload services
            systemctl reload nginx

            log "Configuration restore completed"
            ;;
        *)
            error "Unknown restore type: $restore_type"
            return 1
            ;;
    esac
}

# List available backups
list_backups() {
    echo "Available Backups:"
    echo "=================="
    echo ""
    echo "File Backups:"
    find "$BACKUP_DIR/files" -name "*.tar.gz" | sort -r | head -10
    echo ""
    echo "Database Backups:"
    find "$BACKUP_DIR/database" -name "*.sql.gz" | sort -r | head -10
    echo ""
    echo "Configuration Backups:"
    find "$BACKUP_DIR/config" -name "*.tar.gz" | sort -r | head -10
}

# Setup backup cron jobs
setup_cron_jobs() {
    log "Setting up backup cron jobs..."

    # Daily backup at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * $0 daily >> $LOG_FILE 2>&1") | crontab

    # Weekly backup on Sunday at 3 AM
    (crontab -l 2>/dev/null; echo "0 3 * * 0 $0 weekly >> $LOG_FILE 2>&1") | crontab

    # Monthly backup on 1st at 4 AM
    (crontab -l 2>/dev/null; echo "0 4 1 * * $0 monthly >> $LOG_FILE 2>&1") | crontab

    log "Cron jobs configured"
}

# Main function
main() {
    case "${1:-daily}" in
        "daily")
            check_root
            create_backup_directories
            daily_backup
            ;;
        "weekly")
            check_root
            create_backup_directories
            weekly_backup
            ;;
        "monthly")
            check_root
            create_backup_directories
            monthly_backup
            ;;
        "restore")
            check_root
            if [[ $# -ne 3 ]]; then
                error "Usage: $0 restore <backup_file> <files|database|config>"
                exit 1
            fi
            restore_backup "$2" "$3"
            ;;
        "list")
            list_backups
            ;;
        "setup")
            check_root
            create_backup_directories
            setup_cron_jobs
            log "Backup system setup completed"
            ;;
        *)
            echo "Usage: $0 {daily|weekly|monthly|restore|list|setup}"
            echo "  daily   - Run daily backup"
            echo "  weekly  - Run weekly backup"
            echo "  monthly - Run monthly backup"
            echo "  restore - Restore from backup: $0 restore <backup_file> <type>"
            echo "  list    - List available backups"
            echo "  setup   - Setup cron jobs and directories"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"