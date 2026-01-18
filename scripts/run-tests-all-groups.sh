#!/bin/bash
# Master Script: Run All Test Groups in Optimal Order
# Total time: ~35 minutes (vs 197 minutes sequential)

echo "========================================"
echo "E2E Test Suite - All Groups (Chromium)"
echo "========================================"
echo ""
echo "This will run all 6 test groups in optimal order:"
echo "  Group A: Public Pages      (~5 min)"
echo "  Group B: Auth              (~5 min)"
echo "  Group C: Member Portal     (~6 min)"
echo "  Group D: Admin Portal      (~6 min)"
echo "  Group E: Integration Flows (~7 min)"
echo "  Group F: Validation        (~6 min)"
echo ""
echo "Total estimated time: ~35 minutes"
echo ""
read -p "Press Ctrl+C to cancel, or any key to continue..."

START_TIME=$(date +%s)

echo ""
echo "========================================"
echo "GROUP A: Public Pages"
echo "========================================"
bash scripts/run-tests-group-a-public.sh
if [ $? -ne 0 ]; then
    echo "ERROR: Group A failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "GROUP B: Authentication"
echo "========================================"
bash scripts/run-tests-group-b-auth.sh
if [ $? -ne 0 ]; then
    echo "ERROR: Group B failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "GROUP C: Member Portal"
echo "========================================"
bash scripts/run-tests-group-c-member.sh
if [ $? -ne 0 ]; then
    echo "ERROR: Group C failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "GROUP D: Admin Portal"
echo "========================================"
bash scripts/run-tests-group-d-admin.sh
if [ $? -ne 0 ]; then
    echo "ERROR: Group D failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "GROUP E: Integration Flows"
echo "========================================"
bash scripts/run-tests-group-e-flows.sh
if [ $? -ne 0 ]; then
    echo "ERROR: Group E failed!"
    exit 1
fi

echo ""
echo "========================================"
echo "GROUP F: Validation & Security"
echo "========================================"
bash scripts/run-tests-group-f-validation.sh
if [ $? -ne 0 ]; then
    echo "ERROR: Group F failed!"
    exit 1
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "========================================"
echo "ALL TESTS PASSED!"
echo "========================================"
echo "Duration: ${MINUTES}m ${SECONDS}s"
echo "========================================"
