@echo off
REM ====================================================================
REM Group C (Member) E2E Tests - Quick Test Runner
REM ====================================================================
REM
REM This script runs the Group C member E2E tests to verify that
REM the DEV_MODE authentication fix is working correctly.
REM
REM Usage:
REM   run-group-c-tests.bat           - Run all Group C tests
REM   run-group-c-tests.bat dashboard - Run dashboard tests only
REM   run-group-c-tests.bat orders    - Run orders tests only
REM   run-group-c-tests.bat quotes    - Run quotations tests only
REM   run-group-c-tests.bat profile   - Run profile tests only
REM   run-group-c-tests.bat other     - Run other member tests
REM
REM ====================================================================

echo ====================================================================
echo Group C (Member) E2E Tests - DEV_MODE Authentication Fix
echo ====================================================================
echo.

REM Check if dev server is running
echo Checking if dev server is running on port 3000...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Dev server is not running on port 3000
    echo Please start the dev server first: npm run dev
    echo.
    pause
    exit /b 1
)
echo OK: Dev server is running
echo.

REM Determine which tests to run
set TEST_PATTERN=tests/e2e/group-c-member/
if "%1"=="dashboard" set TEST_PATTERN=tests/e2e/group-c-member/01-dashboard.spec.ts
if "%1"=="orders" set TEST_PATTERN=tests/e2e/group-c-member/02-orders.spec.ts
if "%1"=="quotes" set TEST_PATTERN=tests/e2e/group-c-member/03-quotations.spec.ts
if "%1"=="profile" set TEST_PATTERN=tests/e2e/group-c-member/04-profile.spec.ts
if "%1"=="other" set TEST_PATTERN=tests/e2e/group-c-member/05-other.spec.ts

echo Running tests: %TEST_PATTERN%
echo.
echo ====================================================================
echo.

REM Run the tests
npx playwright test %TEST_PATTERN% --workers=1

echo.
echo ====================================================================
echo Test run completed!
echo ====================================================================
echo.
echo Check the results above to see if all tests passed.
echo.

pause
