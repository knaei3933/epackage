#!/bin/bash

###############################################################################
# Production Deployment Script for Epackage Lab Web
#
# This script automates the production deployment process:
# 1. Runs all tests
# 2. Creates production build
# 3. Runs Lighthouse audit
# 4. Deploys to Vercel
# 5. Runs smoke tests
#
# Usage: bash scripts/deploy-production.sh
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Epackage Lab Web"
DEPLOY_URL="https://epackage-lab.com"
PREVIEW_URL=""
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/deploy-${TIMESTAMP}.log"

# Create logs directory
mkdir -p logs

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}" | tee -a "$LOG_FILE"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        exit 1
    fi
}

###############################################################################
# Pre-flight Checks
###############################################################################

print_header "🔍 Pre-flight Checks"

log_info "Checking required commands..."

check_command "node"
check_command "npm"
check_command "vercel"
check_command "git"

log_success "All required commands are available"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    log_warning "You have uncommitted changes"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment cancelled"
        exit 1
    fi
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
log_info "Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    log_warning "Not on main/master branch"
    read -p "Continue deployment from branch '$CURRENT_BRANCH'? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment cancelled"
        exit 1
    fi
fi

###############################################################################
# Step 1: Run Tests
###############################################################################

print_header "🧪 Step 1: Running Tests"

log_info "Running E2E tests with Playwright..."

if npx playwright test --reporter=line 2>&1 | tee -a "$LOG_FILE"; then
    log_success "All E2E tests passed"
else
    log_error "E2E tests failed"
    log_info "Check logs at: $LOG_FILE"
    exit 1
fi

###############################################################################
# Step 2: Production Build
###############################################################################

print_header "🏗️  Step 2: Production Build"

log_info "Creating production build..."

# Set production environment
export NODE_ENV=production

# Clean previous build
log_info "Cleaning previous build..."
rm -rf .next

# Run production build
if npm run build:production 2>&1 | tee -a "$LOG_FILE"; then
    log_success "Production build completed"
else
    log_error "Production build failed"
    log_info "Check logs at: $LOG_FILE"
    exit 1
fi

# Check build output
if [ ! -d ".next" ]; then
    log_error "Build output directory not found"
    exit 1
fi

log_info "Build size:"
du -sh .next 2>&1 | tee -a "$LOG_FILE"

###############################################################################
# Step 3: Lighthouse Audit
###############################################################################

print_header "⚡ Step 3: Lighthouse Audit"

log_info "Running Lighthouse audit..."

if npm run lighthouse 2>&1 | tee -a "$LOG_FILE"; then
    log_success "Lighthouse audit passed"
else
    log_warning "Lighthouse audit found issues"
    log_info "Review the report for details"
fi

###############################################################################
# Step 4: Deploy to Vercel
###############################################################################

print_header "🚀 Step 4: Deploying to Vercel"

log_info "Deploying to production..."

# Deploy to Vercel production
if vercel --prod --yes 2>&1 | tee -a "$LOG_FILE"; then
    # Extract deployment URL from output
    PREVIEW_URL=$(grep "Production:" "$LOG_FILE" | tail -1 | awk '{print $2}')

    if [ -z "$PREVIEW_URL" ]; then
        PREVIEW_URL=$DEPLOY_URL
    fi

    log_success "Deployment successful!"
    log_info "Production URL: $PREVIEW_URL"
else
    log_error "Vercel deployment failed"
    log_info "Check logs at: $LOG_FILE"
    exit 1
fi

###############################################################################
# Step 5: Smoke Tests
###############################################################################

print_header "🔥 Step 5: Running Smoke Tests"

log_info "Running post-deployment smoke tests..."

if [ -f "scripts/smoke-test.js" ]; then
    if node scripts/smoke-test.js "$PREVIEW_URL" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "All smoke tests passed"
    else
        log_error "Smoke tests failed"
        log_info "Check logs at: $LOG_FILE"
        log_warning "Deployment may have issues. Please verify manually."
        exit 1
    fi
else
    log_warning "Smoke test script not found. Skipping..."
    log_info "Create scripts/smoke-test.js to enable automated smoke tests"
fi

###############################################################################
# Step 6: Verify Deployment
###############################################################################

print_header "✅ Step 6: Verifying Deployment"

log_info "Waiting for deployment to propagate..."
sleep 10

# Test homepage
log_info "Testing homepage..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    log_success "Homepage is accessible (HTTP $HTTP_STATUS)"
else
    log_error "Homepage returned HTTP $HTTP_STATUS"
fi

# Test API health
log_info "Testing API health..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${PREVIEW_URL}/api/health" || echo "000")

if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ]; then
    log_success "API is responding (HTTP $API_STATUS)"
else
    log_warning "API health check returned HTTP $API_STATUS"
fi

###############################################################################
# Deployment Summary
###############################################################################

print_header "📊 Deployment Summary"

log_success "Deployment completed successfully!"
echo ""
log_info "Deployment Details:"
log_info "  - Production URL: $PREVIEW_URL"
log_info "  - Timestamp: $TIMESTAMP"
log_info "  - Log file: $LOG_FILE"
log_info "  - Branch: $CURRENT_BRANCH"
echo ""

log_info "Next Steps:"
log_info "  1. Monitor Vercel dashboard for any issues"
log_info "  2. Check application logs for errors"
log_info "  3. Verify core functionality is working"
log_info "  4. Monitor error tracking (Sentry)"
log_info "  5. Announce deployment to team"
echo ""

log_info "Monitoring Links:"
log_info "  - Vercel Dashboard: https://vercel.com/dashboard"
log_info "  - Vercel Logs: https://vercel.com/[org]/[project]/logs"
log_info "  - Supabase Dashboard: https://supabase.com/dashboard"
log_info "  - SendGrid Dashboard: https://sendgrid.com/dashboard"
echo ""

# Optional: Open deployment URL
read -p "Open deployment URL in browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "$PREVIEW_URL"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$PREVIEW_URL"
    else
        log_info "Manually open: $PREVIEW_URL"
    fi
fi

log_success "Done! 🎉"

###############################################################################
# Rollback Instructions (in case of issues)
###############################################################################

cat << EOF

${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}
${YELLOW}ROLLBACK INSTRUCTIONS${NC}
${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

If you discover issues with this deployment, you can rollback:

1. Rollback Vercel deployment:
   vercel rollback

2. Or rollback to specific deployment:
   vercel ls
   vercel rollback <deployment-url>

3. For database changes, restore from backup:
   supabase db restore -f backup-YYYYMMDD.sql

${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}

EOF

exit 0
