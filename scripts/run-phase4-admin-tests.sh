#!/bin/bash

# ============================================================================
# Phase 4 Admin Test Runner
# ============================================================================
# This script runs Phase 4 Admin E2E tests with DEV_MODE enabled
#
# Usage:
#   ./run-phase4-admin-tests.sh                    - Run all Phase 4 Admin tests
#   ./run-phase4-admin-tests.sh 01-dashboard       - Run specific test file
#   ./run-phase4-admin-tests.sh --ui               - Run with Playwright UI
#   ./run-phase4-admin-tests.sh --headed           - Run with visible browser
# ============================================================================

set -e  # Exit on error

echo "========================================"
echo "Phase 4 Admin Test Runner"
echo "========================================"
echo ""

# Check if server is running on port 3002
echo "Checking if dev server is running on port 3002..."
if ! curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "[ERROR] Dev server is not running on port 3002"
    echo ""
    echo "Please start the dev server first:"
    echo "  PORT=3002 npm run dev"
    echo ""
    echo "Or run with default port and update .env.test BASE_URL"
    exit 1
fi

echo "[OK] Dev server is running"
echo ""

# Set test file (default to all Phase 4 Admin tests)
TEST_FILE="tests/e2e/phase-4-admin/"
EXTRA_ARGS=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --ui)
            EXTRA_ARGS="$EXTRA_ARGS --ui"
            shift
            ;;
        --headed)
            EXTRA_ARGS="$EXTRA_ARGS --headed"
            shift
            ;;
        --project)
            EXTRA_ARGS="$EXTRA_ARGS --project=$2"
            shift
            shift
            ;;
        01-dashboard|02-member-approval|03-orders|04-quotations|05-contracts|06-production|07-inventory|08-shipping|09-leads|admin-pages-quick-check)
            TEST_FILE="tests/e2e/phase-4-admin/$1.spec.ts"
            shift
            ;;
        *)
            echo "Unknown argument: $1"
            exit 1
            ;;
    esac
done

echo "Running: npx playwright test $TEST_FILE $EXTRA_ARGS"
echo ""
echo "========================================"
echo ""

# Run the tests
if npx playwright test "$TEST_FILE" $EXTRA_ARGS; then
    echo ""
    echo "========================================"
    echo "Test run completed!"
    echo "========================================"
    echo ""
    echo "[SUCCESS] All tests passed!"
else
    EXIT_CODE=$?
    echo ""
    echo "========================================"
    echo "Test run completed!"
    echo "========================================"
    echo ""
    echo "[FAILED] Some tests failed. Check the output above for details."
    echo ""
    echo "View HTML report:"
    echo "  npx playwright show-report"
    exit $EXIT_CODE
fi

echo ""
