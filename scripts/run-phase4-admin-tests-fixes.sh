#!/bin/bash

# ========================================
# Phase 4 Admin Pages Test Runner
# ========================================

echo ""
echo "========================================"
echo "Phase 4 Admin Pages Test Suite"
echo "========================================"
echo ""
echo "This script runs the fixed admin page tests:"
echo "  - TC-4.3.1: Order list loads"
echo "  - TC-4.4.1: Quotation list loads"
echo "  - TC-4.5.1: Contract list loads"
echo ""
echo "Make sure the dev server is running on port 3000"
echo "  npm run dev"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "ERROR: Dev server is not running on port 3000"
    echo "Please start the dev server first:"
    echo "  npm run dev"
    exit 1
fi

echo "Dev server detected. Running tests..."
echo ""

# Run the three fixed tests
npx playwright test tests/e2e/phase-4-admin/03-orders.spec.ts --grep "TC-4.3.1"
if [ $? -ne 0 ]; then
    echo ""
    echo "TEST FAILED: TC-4.3.1"
    exit 1
fi

npx playwright test tests/e2e/phase-4-admin/04-quotations.spec.ts --grep "TC-4.4.1"
if [ $? -ne 0 ]; then
    echo ""
    echo "TEST FAILED: TC-4.4.1"
    exit 1
fi

npx playwright test tests/e2e/phase-4-admin/05-contracts.spec.ts --grep "TC-4.5.1"
if [ $? -ne 0 ]; then
    echo ""
    echo "TEST FAILED: TC-4.5.1"
    exit 1
fi

echo ""
echo "========================================"
echo "All Phase 4 Admin Tests Passed!"
echo "========================================"
echo ""
