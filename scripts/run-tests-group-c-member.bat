@echo off
REM GROUP C: Member Portal - Parallel After Auth
REM 11 files, 4 workers, ~6 minutes

echo =========================================
echo GROUP C: Member Portal (Chromium Only)
echo =========================================
echo Files: 11
echo Workers: 4
echo Estimated time: ~6 minutes
echo Requires: MEMBER authentication
echo.

npx playwright test tests/e2e/phase-3-member/ tests/e2e/phase-5-portal/ customer-portal.spec.ts --project=chromium --workers=4

if errorlevel 1 (
    echo.
    echo ERROR: Group C tests failed!
    exit /b 1
)

echo.
echo =========================================
echo GROUP C Complete!
echo =========================================
exit /b 0
