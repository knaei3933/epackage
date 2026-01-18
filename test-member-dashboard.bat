@echo off
echo =========================================
echo Testing Member Dashboard Only
echo =========================================
echo.

npx playwright test tests/e2e/phase-3-member/01-dashboard.spec.ts --project=chromium --workers=1

if errorlevel 1 (
    echo.
    echo ERROR: Dashboard tests failed!
    exit /b 1
)

echo.
echo =========================================
echo Dashboard Tests Complete!
echo =========================================
exit /b 0
