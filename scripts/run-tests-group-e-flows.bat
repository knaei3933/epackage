@echo off
REM GROUP E: Integration Flows - Sequential Execution Only
REM 6 files, 1 worker, ~7 minutes

echo =========================================
echo GROUP E: Integration Flows (Chromium Only)
echo =========================================
echo Files: 6
echo Workers: 1 (Sequential)
echo Estimated time: ~7 minutes
echo Note: Sequential due to database cleanup conflicts
echo.

npx playwright test contact-flow.spec.ts sample-request-flow.spec.ts member-flow.spec.ts quote-to-order.spec.ts production-tracking.spec.ts shipment-workflow.spec.ts --project=chromium --workers=1

if errorlevel 1 (
    echo.
    echo ERROR: Group E tests failed!
    exit /b 1
)

echo.
echo =========================================
echo GROUP E Complete!
echo =========================================
exit /b 0
