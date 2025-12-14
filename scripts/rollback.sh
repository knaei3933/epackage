#!/bin/bash

# Epackage Lab Multi-Quantity System Rollback Script
# 多数量システムロールバックスクリプト

set -e

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="epackage-lab-web"
BACKUP_DIR="/opt/backups/$PROJECT_NAME"
DEPLOY_DIR="/opt/$PROJECT_NAME"
HEALTH_CHECK_URL="http://localhost:3000/api/health"

# Logging
LOG_FILE="/var/log/$PROJECT_NAME-rollback.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to validate rollback parameters
validate_rollback() {
    log "Validating rollback parameters..."

    # Check if backup directory exists
    if [[ ! -d "$BACKUP_DIR" ]]; then
        error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi

    # Check if deployment directory exists
    if [[ ! -d "$DEPLOY_DIR" ]]; then
        error "Deployment directory not found: $DEPLOY_DIR"
        exit 1
    fi

    # Check available backups
    local backup_count=$(find "$BACKUP_DIR" -type d -name "backup_*" | wc -l)
    if [[ $backup_count -eq 0 ]]; then
        error "No backups found for rollback"
        exit 1
    fi

    success "Rollback validation completed"
}

# Function to list available backups
list_backups() {
    log "Available backups:"

    local backups=($(find "$BACKUP_DIR" -type d -name "backup_*" -printf "%T@ %p\n" | sort -nr | awk '{print $2}'))
    local count=1

    for backup in "${backups[@]}"; do
        local timestamp=$(basename "$backup" | sed 's/backup_//')
        local formatted_time=$(date -d "@$(echo $timestamp | sed 's/\([0-9]\{8\}\)\([0-9]\{4\}\)/\1 \2/' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)/\1:\2/')" 2>/dev/null || echo "$timestamp")

        # Get backup size
        local backup_size=$(du -sh "$backup" 2>/dev/null | cut -f1 || echo "Unknown")

        # Check if PM2 processes are running
        local processes=$(cd "$backup/.." && pm2 list 2>/dev/null | grep "$PROJECT_NAME" | wc -l || echo "0")

        echo "  $count) $formatted_time (Size: $backup_size, Processes: $processes)"
        echo "     Path: $backup"
        ((count++))
    done
}

# Function to select backup
select_backup() {
    local backup_to_restore=$1

    if [[ "$backup_to_restore" == "latest" ]]; then
        # Get latest backup
        latest_backup=$(find "$BACKUP_DIR" -type d -name "backup_*" -printf "%T@ %p\n" | sort -nr | head -1 | awk '{print $2}')
        if [[ -z "$latest_backup" ]]; then
            error "No backup found"
            exit 1
        fi
        echo "$latest_backup"
    elif [[ "$backup_to_restore" =~ ^[0-9]+$ ]]; then
        # Get backup by index
        local backups=($(find "$BACKUP_DIR" -type d -name "backup_*" -printf "%T@ %p\n" | sort -nr | awk '{print $2}'))
        local index=$((backup_to_restore - 1))

        if [[ $index -ge 0 && $index -lt ${#backups[@]} ]]; then
            echo "${backups[$index]}"
        else
            error "Invalid backup index: $backup_to_restore"
            list_backups
            exit 1
        fi
    else
        # Use backup path directly
        if [[ -d "$backup_to_restore" ]]; then
            echo "$backup_to_restore"
        else
            error "Backup directory not found: $backup_to_restore"
            list_backups
            exit 1
        fi
    fi
}

# Function to stop current processes
stop_current_processes() {
    log "Stopping current application processes..."

    # Stop PM2 processes
    if pm2 list | grep -q "$PROJECT_NAME"; then
        pm2 delete "$PROJECT_NAME"
        success "PM2 processes stopped"
    else
        warning "No PM2 processes found for $PROJECT_NAME"
    fi

    # Kill any remaining Node.js processes on port 3000
    local pids=$(lsof -ti:3000 2>/dev/null || true)
    if [[ -n "$pids" ]]; then
        kill -9 $pids 2>/dev/null || true
        success "Killed processes on port 3000"
    fi
}

# Function to backup current deployment before rollback
backup_current_before_rollback() {
    log "Creating pre-rollback backup of current deployment..."

    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local failed_backup_dir="$BACKUP_DIR/failed_deployment_$timestamp"

    if [[ -d "$DEPLOY_DIR" ]]; then
        cp -r "$DEPLOY_DIR" "$failed_backup_dir"
        success "Pre-rollback backup created at $failed_backup_dir"
    else
        warning "No current deployment to backup"
    fi
}

# Function to restore backup
restore_backup() {
    local backup_path=$1

    log "Restoring backup from $backup_path..."

    # Validate backup
    if [[ ! -d "$backup_path" ]]; then
        error "Backup directory not found: $backup_path"
        exit 1
    fi

    # Check for essential files
    local required_files=("package.json" ".next" "pm2.config.js")
    for file in "${required_files[@]}"; do
        if [[ ! -e "$backup_path/$file" ]]; then
            warning "Required file not found in backup: $file"
        fi
    done

    # Stop current processes
    stop_current_processes

    # Remove current deployment
    log "Removing current deployment..."
    rm -rf "$DEPLOY_DIR"

    # Restore backup
    log "Restoring backup files..."
    cp -r "$backup_path" "$DEPLOY_DIR"

    # Set correct permissions
    chown -R www-data:www-data "$DEPLOY_DIR"
    chmod -R 755 "$DEPLOY_DIR"

    success "Backup restored successfully"
}

# Function to restart application
restart_application() {
    log "Restarting application..."

    cd "$DEPLOY_DIR"

    # Restart PM2 processes
    if [[ -f "pm2.config.js" ]]; then
        pm2 start pm2.config.js --env production
        pm2 save
        success "Application restarted with PM2"
    else
        warning "pm2.config.js not found, attempting manual start"
        pm2 start "npm" --name "$PROJECT_NAME" -- start
        pm2 save
    fi

    # Wait for application to start
    log "Waiting for application to start..."
    sleep 30
}

# Function to perform post-rollback health check
post_rollback_health_check() {
    log "Performing post-rollback health check..."

    local max_attempts=12
    local attempt=1
    local health_passed=false

    while [[ $attempt -le $max_attempts ]]; do
        info "Health check attempt $attempt/$max_attempts..."

        if curl -f -s "$HEALTH_CHECK_URL" >/dev/null; then
            success "Health check passed"
            health_passed=true
            break
        fi

        # Check if PM2 processes are running
        if ! pm2 list | grep -q "$PROJECT_NAME"; then
            warning "PM2 processes not running, restarting..."
            cd "$DEPLOY_DIR"
            pm2 start pm2.config.js --env production
        fi

        sleep 10
        ((attempt++))
    done

    if [[ "$health_passed" == false ]]; then
        error "Health check failed after $max_attempts attempts"
        return 1
    fi

    return 0
}

# Function to verify deployment
verify_deployment() {
    log "Verifying deployment..."

    # Check PM2 status
    if pm2 list | grep -q "$PROJECT_NAME"; then
        local process_status=$(pm2 jlist | jq -r ".[] | select(.name==\"$PROJECT_NAME\") | .pm2_env.status")
        if [[ "$process_status" == "online" ]]; then
            success "PM2 process is online"
        else
            warning "PM2 process status: $process_status"
        fi
    else
        error "PM2 process not found"
        return 1
    fi

    # Check application logs
    local error_count=$(pm2 logs "$PROJECT_NAME" --err --lines 10 | grep -c "ERROR" || echo "0")
    if [[ $error_count -gt 5 ]]; then
        warning "High error count in logs: $error_count"
        pm2 logs "$PROJECT_NAME" --err --lines 5
    fi

    return 0
}

# Function to generate rollback report
generate_rollback_report() {
    local backup_path=$1
    local rollback_success=$2

    local report_file="/var/log/$PROJECT_NAME-rollback-report-$(date +%Y%m%d_%H%M%S).json"

    cat > "$report_file" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "project": "$PROJECT_NAME",
    "rollback": {
        "success": $rollback_success,
        "backup_restored": "$backup_path",
        "backup_size": "$(du -sh "$backup_path" 2>/dev/null | cut -f1 || 'Unknown')",
        "deployment_dir": "$DEPLOY_DIR"
    },
    "system": {
        "pm2_status": "$(pm2 list 2>/dev/null | grep "$PROJECT_NAME" | jq -c . 2>/dev/null || 'Unknown')",
        "disk_usage": "$(df -h "$DEPLOY_DIR" 2>/dev/null | tail -1 || 'Unknown')",
        "memory_usage": "$(free -h 2>/dev/null | tail -1 || 'Unknown')"
    }
}
EOF

    success "Rollback report generated: $report_file"
}

# Function to send rollback notification
send_rollback_notification() {
    local success=$1
    local backup_path=$2

    local status="SUCCESS"
    local message="Rollback completed successfully from backup: $backup_path"

    if [[ "$success" != "0" ]]; then
        status="FAILED"
        message="Rollback failed. Check logs for details."
    fi

    # Send to Slack (if webhook URL is configured)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🔄 Deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi

    # Send email (if configured)
    if [[ -n "$ADMIN_EMAIL" ]]; then
        echo "$message" | mail -s "Rollback $status: $PROJECT_NAME" "$ADMIN_EMAIL" 2>/dev/null || true
    fi
}

# Function to cleanup
cleanup() {
    log "Cleaning up temporary files..."
    rm -f /tmp/rollback_backup_*
}

# Main rollback function
main() {
    local backup_to_restore=${1:-"latest"}
    local skip_health_check=${2:-"false"}

    log "Starting rollback of $PROJECT_NAME"

    # Validate rollback parameters
    validate_rollback

    # List available backups
    list_backups

    # Select backup to restore
    local selected_backup=$(select_backup "$backup_to_restore")
    info "Selected backup: $selected_backup"

    # Confirm rollback
    if [[ "$AUTO_ROLLBACK" != "true" ]]; then
        echo -e "${YELLOW}This will replace the current deployment with backup from: $selected_backup${NC}"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Rollback cancelled by user"
            exit 0
        fi
    fi

    # Create pre-rollback backup
    backup_current_before_rollback

    # Restore backup
    restore_backup "$selected_backup"

    # Restart application
    restart_application

    # Perform health check
    local health_result=0
    if [[ "$skip_health_check" == "false" ]]; then
        post_rollback_health_check
        health_result=$?
    fi

    # Verify deployment
    verify_deployment
    local verify_result=$?

    # Generate report
    generate_rollback_report "$selected_backup" $health_result

    # Send notification
    send_rollback_notification $health_result "$selected_backup"

    # Final status
    if [[ $health_result -eq 0 && $verify_result -eq 0 ]]; then
        success "🎉 Rollback completed successfully!"
        log "Application has been restored to previous working state"
    else
        error "❌ Rollback completed with issues"
        log "Please check application status and logs"
        exit 1
    fi

    cleanup
}

# Command line interface
case "${1:-}" in
    --list|-l)
        list_backups
        ;;
    --help|-h)
        cat << EOF
Usage: $0 [OPTIONS] [BACKUP_IDENTIFIER]

Rollback Epackage Lab Multi-Quantity System to a previous backup.

OPTIONS:
  --list, -l           List available backups
  --help, -h           Show this help message
  --skip-health-check  Skip post-rollback health check
  --auto               Run in automatic mode (no confirmation)

BACKUP_IDENTIFIER:
  latest               Rollback to latest backup (default)
  NUMBER              Rollback to backup by index (from --list)
  PATH                Rollback to specific backup path

EXAMPLES:
  $0                  Rollback to latest backup
  $0 latest           Rollback to latest backup
  $0 1                Rollback to first backup in list
  $0 /path/to/backup  Rollback to specific backup

ENVIRONMENT VARIABLES:
  SLACK_WEBHOOK_URL    Slack webhook URL for notifications
  ADMIN_EMAIL          Admin email for notifications
  AUTO_ROLLBACK        Set to 'true' to skip confirmation

EOF
        ;;
    --auto)
        export AUTO_ROLLBACK="true"
        main "${2:-latest}" "false"
        ;;
    --skip-health-check)
        main "${2:-latest}" "true"
        ;;
    *)
        main "${1:-latest}" "false"
        ;;
esac