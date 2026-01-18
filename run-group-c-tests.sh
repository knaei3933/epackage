#!/bin/bash

# ====================================================================
# Group C (Member) E2E Tests - Quick Test Runner
# ====================================================================
#
# This script runs the Group C member E2E tests to verify that
# the DEV_MODE authentication fix is working correctly.
#
# Usage:
#   ./run-group-c-tests.sh           - Run all Group C tests
#   ./run-group-c-tests.sh dashboard - Run dashboard tests only
#   ./run-group-c-tests.sh orders    - Run orders tests only
#   ./run-group-c-tests.sh quotes    - Run quotations tests only
#   ./run-group-c-tests.sh profile   - Run profile tests only
#   ./run-group-c-tests.sh other     - Run other member tests
#
# ====================================================================

echo "===================================================================="
echo "Group C (Member) E2E Tests - DEV_MODE Authentication Fix"
echo "===================================================================="
echo ""

# Check if dev server is running
echo "Checking if dev server is running on port 3000..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "OK: Dev server is running"
else
    echo "ERROR: Dev server is not running on port 3000"
    echo "Please start the dev server first: npm run dev"
    echo ""
    exit 1
fi
echo ""

# Determine which tests to run
TEST_PATTERN="tests/e2e/group-c-member/"
case "$1" in
    dashboard)
        TEST_PATTERN="tests/e2e/group-c-member/01-dashboard.spec.ts"
        ;;
    orders)
        TEST_PATTERN="tests/e2e/group-c-member/02-orders.spec.ts"
        ;;
    quotes)
        TEST_PATTERN="tests/e2e/group-c-member/03-quotations.spec.ts"
        ;;
    profile)
        TEST_PATTERN="tests/e2e/group-c-member/04-profile.spec.ts"
        ;;
    other)
        TEST_PATTERN="tests/e2e/group-c-member/05-other.spec.ts"
        ;;
esac

echo "Running tests: $TEST_PATTERN"
echo ""
echo "===================================================================="
echo ""

# Run the tests
npx playwright test "$TEST_PATTERN" --workers=1

echo ""
echo "===================================================================="
echo "Test run completed!"
echo "===================================================================="
echo ""
echo "Check the results above to see if all tests passed."
echo ""
