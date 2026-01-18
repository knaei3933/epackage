@echo off
REM GROUP B: Authentication - Sequential Execution Only
REM 5 files, 1 worker, ~5 minutes

echo =========================================
echo GROUP B: Authentication (Chromium Only)
echo =========================================
echo Files: 5
echo Workers: 1 (Sequential)
echo Estimated time: ~5 minutes
echo.

npx playwright test tests/e2e/phase-2-auth/ --project=chromium --workers=1

if errorlevel 1 (
    echo.
    echo ERROR: Group B tests failed!
    exit /b 1
)

echo.
echo =========================================
echo GROUP B Complete!
echo =========================================
exit /b 0
