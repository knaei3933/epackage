#!/bin/bash
# Comprehensive API Endpoint Testing Script
# Tests all API endpoints and generates verification report

BASE_URL="http://localhost:3000"
REPORT_FILE="docs/API_ENDPOINTS_VERIFICATION_REPORT.md"
TEMP_FILE="/tmp/api_response.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize counters
TOTAL=0
PASSED=0
FAILED=0

# Create arrays to store results
declare -a RESULTS

# Function to test an endpoint
test_endpoint() {
  local endpoint=$1
  local method=$2
  local category=$3
  local auth=$4

  TOTAL=$((TOTAL + 1))

  echo -n "Testing $method $endpoint... "

  # Build curl command
  local curl_cmd="curl -s -L -w '%{http_code}' -X $method '${BASE_URL}${endpoint}'"
  curl_cmd="$curl_cmd -H 'Content-Type: application/json'"
  curl_cmd="$curl_cmd -o '$TEMP_FILE'"
  curl_cmd="$curl_cmd --max-time 10"

  # Execute
  local output=$(eval $curl_cmd 2>/dev/null)
  local status_code=$(echo "$output" | tail -1)

  # Read response body
  local body=$(cat "$TEMP_FILE" 2>/dev/null)

  # Determine result
  local result="FAILED"
  local notes=""

  if [ "$status_code" = "000" ]; then
    notes="Connection failed"
  elif [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
    result="PASSED"
    PASSED=$((PASSED + 1))
    echo -e "${GREEN}✓${NC} ($status_code)"
  elif [ "$status_code" = "401" ] || [ "$status_code" = "403" ]; then
    result="PASSED"
    notes="Auth required (expected)"
    PASSED=$((PASSED + 1))
    echo -e "${GREEN}✓${NC} ($status_code - Auth required)"
  elif [ "$status_code" = "404" ]; then
    notes="Not found"
    FAILED=$((FAILED + 1))
    echo -e "${RED}✗${NC} ($status_code - Not found)"
  elif [ "$status_code" = "405" ]; then
    notes="Method not allowed"
    FAILED=$((FAILED + 1))
    echo -e "${RED}✗${NC} ($status_code - Method not allowed)"
  else
    notes="HTTP $status_code"
    FAILED=$((FAILED + 1))
    echo -e "${RED}✗${NC} ($status_code)"
  fi

  # Store result
  RESULTS+=("$category|$endpoint|$method|$auth|$result|$status_code|$notes")
}

# Function to generate markdown report
generate_report() {
  cat > "$REPORT_FILE" << 'EOF'
# API Endpoints Verification Report

Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Summary

- **Total APIs Tested**: TOTAL
- **Passed**: PASSED (PERCENT%)
- **Failed**: FAILED (PERCENT%)

## Public APIs

| Endpoint | Method | Auth | Status | Code | Notes |
|----------|--------|------|--------|------|-------|
EOF

  # Group results by category
  echo "" > "$REPORT_FILE.tmp"

  echo "## Public APIs (No Authentication)" >> "$REPORT_FILE.tmp"
  echo "" >> "$REPORT_FILE.tmp"
  echo "| Endpoint | Method | Status | Code | Notes |" >> "$REPORT_FILE.tmp"
  echo "|----------|--------|--------|------|-------|" >> "$REPORT_FILE.tmp"

  for result in "${RESULTS[@]}"; do
    IFS='|' read -r category endpoint method auth result status_code notes <<< "$result"

    if [ "$category" = "public" ] || [ "$category" = "products" ]; then
      local status_icon="✅"
      if [ "$result" = "FAILED" ]; then
        status_icon="❌"
      fi
      echo "| $endpoint | $method | $status_icon | $status_code | $notes |" >> "$REPORT_FILE.tmp"
    fi
  done
  echo "" >> "$REPORT_FILE.tmp"

  echo "## Auth APIs" >> "$REPORT_FILE.tmp"
  echo "" >> "$REPORT_FILE.tmp"
  echo "| Endpoint | Method | Status | Code | Notes |" >> "$REPORT_FILE.tmp"
  echo "|----------|--------|--------|------|-------|" >> "$REPORT_FILE.tmp"

  for result in "${RESULTS[@]}"; do
    IFS='|' read -r category endpoint method auth result status_code notes <<< "$result"

    if [ "$category" = "auth" ]; then
      local status_icon="✅"
      if [ "$result" = "FAILED" ]; then
        status_icon="❌"
      fi
      echo "| $endpoint | $method | $status_icon | $status_code | $notes |" >> "$REPORT_FILE.tmp"
    fi
  done
  echo "" >> "$REPORT_FILE.tmp"

  echo "## Public Form APIs" >> "$REPORT_FILE.tmp"
  echo "" >> "$REPORT_FILE.tmp"
  echo "| Endpoint | Method | Status | Code | Notes |" >> "$REPORT_FILE.tmp"
  echo "|----------|--------|--------|------|-------|" >> "$REPORT_FILE.tmp"

  for result in "${RESULTS[@]}"; do
    IFS='|' read -r category endpoint method auth result status_code notes <<< "$result"

    if [ "$category" = "public-forms" ]; then
      local status_icon="✅"
      if [ "$result" = "FAILED" ]; then
        status_icon="❌"
      fi
      echo "| $endpoint | $method | $status_icon | $status_code | $notes |" >> "$REPORT_FILE.tmp"
    fi
  done
  echo "" >> "$REPORT_FILE.tmp"

  echo "## Member APIs (Authentication Required)" >> "$REPORT_FILE.tmp"
  echo "" >> "$REPORT_FILE.tmp"
  echo "| Endpoint | Method | Auth | Status | Code | Notes |" >> "$REPORT_FILE.tmp"
  echo "|----------|--------|------|--------|------|-------|" >> "$REPORT_FILE.tmp"

  for result in "${RESULTS[@]}"; do
    IFS='|' read -r category endpoint method auth result status_code notes <<< "$result"

    if [ "$category" = "member" ] || [ "$category" = "quotations" ]; then
      local status_icon="✅"
      if [ "$result" = "FAILED" ]; then
        status_icon="❌"
      fi
      echo "| $endpoint | $method | Yes | $status_icon | $status_code | $notes |" >> "$REPORT_FILE.tmp"
    fi
  done
  echo "" >> "$REPORT_FILE.tmp"

  echo "## Admin APIs (Admin Role Required)" >> "$REPORT_FILE.tmp"
  echo "" >> "$REPORT_FILE.tmp"
  echo "| Endpoint | Method | Status | Code | Notes |" >> "$REPORT_FILE.tmp"
  echo "|----------|--------|--------|------|-------|" >> "$REPORT_FILE.tmp"

  for result in "${RESULTS[@]}"; do
    IFS='|' read -r category endpoint method auth result status_code notes <<< "$result"

    if [[ "$category" == admin-* ]]; then
      local status_icon="✅"
      if [ "$result" = "FAILED" ]; then
        status_icon="❌"
      fi
      echo "| $endpoint | $method | $status_icon | $status_code | $notes |" >> "$REPORT_FILE.tmp"
    fi
  done
  echo "" >> "$REPORT_FILE.tmp"

  # Combine with header
  local percent_passed=$((PASSED * 100 / TOTAL))
  local percent_failed=$((FAILED * 100 / TOTAL))

  sed "s/TOTAL/$TOTAL/g; s/PASSED/$PASSED/g; s/PERCENT/$percent_passed/g" "$REPORT_FILE" > "$REPORT_FILE.final"
  cat "$REPORT_FILE.tmp" >> "$REPORT_FILE.final"
  mv "$REPORT_FILE.final" "$REPORT_FILE"
  rm -f "$REPORT_FILE.tmp"

  echo ""
  echo "📊 Report generated: $REPORT_FILE"
  echo "   Total: $TOTAL | ✅ Passed: $PASSED | ❌ Failed: $FAILED"
}

# Check if server is running
echo "🔍 Checking if server is running..."
curl -s "${BASE_URL}/api/robots" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Server is not running at $BASE_URL"
  echo "Please start with: npm run dev"
  exit 1
fi
echo "✅ Server is running"
echo ""

# Test all endpoints
echo "🧪 Testing API endpoints..."
echo ""

# Public APIs
echo "=== Public APIs ==="
test_endpoint "/api/robots" "GET" "public" "no"
test_endpoint "/api/sitemap" "GET" "public" "no"

# Product APIs
echo ""
echo "=== Product APIs ==="
test_endpoint "/api/products" "GET" "products" "no"
test_endpoint "/api/products/categories" "GET" "products" "no"
test_endpoint "/api/products/filter" "GET" "products" "no"
test_endpoint "/api/products/search" "GET" "products" "no"

# Auth APIs
echo ""
echo "=== Auth APIs ==="
test_endpoint "/api/auth/session" "GET" "auth" "no"
test_endpoint "/api/auth/signin" "POST" "auth" "no"
test_endpoint "/api/auth/register" "POST" "auth" "no"
test_endpoint "/api/auth/signout" "POST" "auth" "no"
test_endpoint "/api/auth/forgot-password" "POST" "auth" "no"
test_endpoint "/api/auth/reset-password" "POST" "auth" "no"
test_endpoint "/api/auth/verify-email" "POST" "auth" "no"

# Contact & Sample APIs
echo ""
echo "=== Contact & Sample APIs ==="
test_endpoint "/api/contact" "POST" "public-forms" "no"
test_endpoint "/api/samples" "POST" "public-forms" "no"
test_endpoint "/api/samples/request" "POST" "public-forms" "no"

# Quotation APIs
echo ""
echo "=== Quotation APIs ==="
test_endpoint "/api/quotations/submit" "POST" "quotations" "yes"
test_endpoint "/api/quotations/save" "POST" "quotations" "yes"

# Member APIs
echo ""
echo "=== Member APIs ==="
test_endpoint "/api/member/dashboard" "GET" "member" "yes"
test_endpoint "/api/member/orders" "GET" "member" "yes"
test_endpoint "/api/member/quotations" "GET" "member" "yes"
test_endpoint "/api/member/invoices" "GET" "member" "yes"
test_endpoint "/api/member/inquiries" "GET" "member" "yes"
test_endpoint "/api/member/samples" "GET" "member" "yes"
test_endpoint "/api/member/settings" "GET" "member" "yes"

# Admin Dashboard APIs
echo ""
echo "=== Admin Dashboard APIs ==="
test_endpoint "/api/admin/dashboard/statistics" "GET" "admin-dashboard" "admin"
test_endpoint "/api/admin/approve-member" "GET" "admin-dashboard" "admin"
test_endpoint "/api/admin/users" "GET" "admin-dashboard" "admin"

# Admin Production APIs
echo ""
echo "=== Admin Production APIs ==="
test_endpoint "/api/admin/production/jobs" "GET" "admin-production" "admin"
test_endpoint "/api/admin/production/update-status" "POST" "admin-production" "admin"

# Admin Contract APIs
echo ""
echo "=== Admin Contract APIs ==="
test_endpoint "/api/admin/contracts/workflow" "GET" "admin-contracts" "admin"
test_endpoint "/api/admin/contracts/request-signature" "POST" "admin-contracts" "admin"
test_endpoint "/api/admin/contracts/send-reminder" "POST" "admin-contracts" "admin"

# Admin Inventory APIs
echo ""
echo "=== Admin Inventory APIs ==="
test_endpoint "/api/admin/inventory/items" "GET" "admin-inventory" "admin"
test_endpoint "/api/admin/inventory/adjust" "POST" "admin-inventory" "admin"
test_endpoint "/api/admin/inventory/update" "POST" "admin-inventory" "admin"
test_endpoint "/api/admin/inventory/record-entry" "POST" "admin-inventory" "admin"
test_endpoint "/api/admin/inventory/receipts" "GET" "admin-inventory" "admin"

# Admin Shipping APIs
echo ""
echo "=== Admin Shipping APIs ==="
test_endpoint "/api/admin/shipping/shipments" "GET" "admin-shipping" "admin"
test_endpoint "/api/admin/shipping/tracking" "GET" "admin-shipping" "admin"
test_endpoint "/api/admin/shipping/deliveries/complete" "POST" "admin-shipping" "admin"

# Admin Notification APIs
echo ""
echo "=== Admin Notification APIs ==="
test_endpoint "/api/admin/notifications" "GET" "admin-notifications" "admin"
test_endpoint "/api/admin/notifications/unread-count" "GET" "admin-notifications" "admin"

# Admin Order APIs
echo ""
echo "=== Admin Order APIs ==="
test_endpoint "/api/admin/convert-to-order" "POST" "admin-orders" "admin"
test_endpoint "/api/admin/orders/statistics" "GET" "admin-orders" "admin"
test_endpoint "/api/admin/generate-work-order" "POST" "admin-orders" "admin"

# AI Parser APIs
echo ""
echo "=== AI Parser APIs ==="
test_endpoint "/api/ai-parser/upload" "POST" "ai-parser" "yes"
test_endpoint "/api/ai-parser/extract" "POST" "ai-parser" "yes"
test_endpoint "/api/ai-parser/validate" "POST" "ai-parser" "yes"
test_endpoint "/api/ai-parser/approve" "POST" "ai-parser" "yes"
test_endpoint "/api/ai-parser/reprocess" "POST" "ai-parser" "yes"

# AI Service APIs
echo ""
echo "=== AI Service APIs ==="
test_endpoint "/api/ai/parse" "POST" "ai-services" "yes"
test_endpoint "/api/ai/review" "POST" "ai-services" "yes"
test_endpoint "/api/ai/specs" "POST" "ai-services" "yes"

# Analytics APIs
echo ""
echo "=== Analytics APIs ==="
test_endpoint "/api/analytics/vitals" "POST" "analytics" "no"

# Generate report
echo ""
echo "📊 Generating report..."
generate_report

# Exit with proper code
if [ $FAILED -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}⚠️  Some endpoints failed. Check the report for details.${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}🎉 All API endpoints are working correctly!${NC}"
  exit 0
fi
