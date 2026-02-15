#!/bin/bash
# GROUP D: Admin Portal - Parallel After Auth
# 10 files, 5 workers, ~6 minutes
# Parallel execution: ✅ After authentication (shared ADMIN session)

set -e

echo "========================================="
echo "GROUP D: Admin Portal (Chromium Only)"
echo "========================================="
echo "Files: 10"
echo "Workers: 5"
echo "Estimated time: ~6 minutes"
echo "Requires: ADMIN authentication"
echo ""

npx playwright test \
    tests/e2e/phase-4-admin/ \
    admin-approval-flow.spec.ts \
    --project=chromium \
    --workers=5

echo ""
echo "========================================="
echo "GROUP D Complete!"
echo "========================================="
