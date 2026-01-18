@echo off
REM ============================================================================
REM Phase 4 Admin Test Runner
REM ============================================================================
REM This script runs Phase 4 Admin E2E tests with DEV_MODE enabled
REM
REM Usage:
REM   run-phase4-admin-tests.bat                    - Run all Phase 4 Admin tests
REM   run-phase4-admin-tests.bat 01-dashboard       - Run specific test file
REM   run-phase4-admin-tests.bat --ui               - Run with Playwright UI
REM   run-phase4-admin-tests.bat --headed           - Run with visible browser
REM ============================================================================

echo ========================================
echo Phase 4 Admin Test Runner
echo ========================================
echo.

REM Check if server is running on port 3002
echo Checking if dev server is running on port 3002...
curl -s http://localhost:3002 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Dev server is not running on port 3002
    echo.
    echo Please start the dev server first:
    echo   PORT=3002 npm run dev
    echo.
    echo Or run with default port and update .env.test BASE_URL
    pause
    exit /b 1
)

echo [OK] Dev server is running
echo.

REM Set test file (default to all Phase 4 Admin tests)
set TEST_FILE=tests/e2e/phase-4-admin/
set EXTRA_ARGS=

REM Parse command line arguments
:parse_args
if "%~1"=="" goto :end_parse_args
if "%~1"=="--ui" (
    set EXTRA_ARGS=%EXTRA_ARGS% --ui
    shift
    goto :parse_args
)
if "%~1"=="--headed" (
    set EXTRA_ARGS=%EXTRA_ARGS% --headed
    shift
    goto :parse_args
)
if "%~1"=="--project" (
    set EXTRA_ARGS=%EXTRA_ARGS% --project=%~2
    shift
    shift
    goto :parse_args
)
REM If it's a test file name (e.g., 01-dashboard)
if "%~1"=~*- (
    set TEST_FILE=tests/e2e/phase-4-admin/%~1.spec.ts
    shift
    goto :parse_args
)
shift
goto :parse_args
:end_parse_args

echo Running: npx playwright test %TEST_FILE% %EXTRA_ARGS%
echo.
echo ========================================
echo.

REM Run the tests
npx playwright test %TEST_FILE% %EXTRA_ARGS%

echo.
echo ========================================
echo Test run completed!
echo ========================================
echo.

REM Check if tests passed
if %errorlevel% equ 0 (
    echo [SUCCESS] All tests passed!
) else (
    echo [FAILED] Some tests failed. Check the output above for details.
    echo.
    echo View HTML report:
    echo   npx playwright show-report
)

echo.
pause
