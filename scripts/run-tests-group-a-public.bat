@echo off
REM GROUP A: Public Pages - Fully Parallel Execution
REM 13 files, 12 workers, ~5 minutes

echo =========================================
echo GROUP A: Public Pages (Chromium Only)
echo =========================================
echo Files: 13
echo Workers: 12
echo Estimated time: ~5 minutes
echo.

npx playwright test tests/e2e/phase-1-public/ multi-quantity-comparison.spec.ts --project=chromium --workers=12

if errorlevel 1 (
    echo.
    echo ERROR: Group A tests failed!
    exit /b 1
)

echo.
echo =========================================
echo GROUP A Complete!
echo =========================================
exit /b 0
