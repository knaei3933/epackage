#!/bin/bash
# GROUP A: Public Pages - Fully Parallel Execution
# 13 files, 12 workers, ~5 minutes
# Parallel execution: ✅ Full (no dependencies)

set -e

echo "========================================="
echo "GROUP A: Public Pages (Chromium Only)"
echo "========================================="
echo "Files: 13"
echo "Workers: 12"
echo "Estimated time: ~5 minutes"
echo ""

npx playwright test \
    tests/e2e/phase-1-public/ \
    multi-quantity-comparison.spec.ts \
    --project=chromium \
    --workers=12

echo ""
echo "========================================="
echo "GROUP A Complete!"
echo "========================================="
