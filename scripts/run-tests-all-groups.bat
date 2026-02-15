@echo off
REM Master Script: Run All Test Groups in Optimal Order
REM Total time: ~35 minutes (vs 197 minutes sequential)

setlocal enabledelayedexpansion

echo ========================================
echo E2E Test Suite - All Groups (Chromium)
echo ========================================
echo.
echo This will run all 6 test groups in optimal order:
echo   Group A: Public Pages      (~5 min)
echo   Group B: Auth              (~5 min)
echo   Group C: Member Portal     (~6 min)
echo   Group D: Admin Portal      (~6 min)
echo   Group E: Integration Flows (~7 min)
echo   Group F: Validation        (~6 min)
echo.
echo Total estimated time: ~35 minutes
echo.
echo Press Ctrl+C to cancel, or any key to continue...
pause > nul

set START_TIME=%time%

echo.
echo ========================================
echo GROUP A: Public Pages
echo ========================================
call scripts\run-tests-group-a-public.bat
if errorlevel 1 (
    echo ERROR: Group A failed!
    goto :error
)

echo.
echo ========================================
echo GROUP B: Authentication
echo ========================================
call scripts\run-tests-group-b-auth.bat
if errorlevel 1 (
    echo ERROR: Group B failed!
    goto :error
)

echo.
echo ========================================
echo GROUP C: Member Portal
echo ========================================
call scripts\run-tests-group-c-member.bat
if errorlevel 1 (
    echo ERROR: Group C failed!
    goto :error
)

echo.
echo ========================================
echo GROUP D: Admin Portal
echo ========================================
call scripts\run-tests-group-d-admin.bat
if errorlevel 1 (
    echo ERROR: Group D failed!
    goto :error
)

echo.
echo ========================================
echo GROUP E: Integration Flows
echo ========================================
call scripts\run-tests-group-e-flows.bat
if errorlevel 1 (
    echo ERROR: Group E failed!
    goto :error
)

echo.
echo ========================================
echo GROUP F: Validation & Security
echo ========================================
call scripts\run-tests-group-f-validation.bat
if errorlevel 1 (
    echo ERROR: Group F failed!
    goto :error
)

set END_TIME=%time%

echo.
echo ========================================
echo ALL TESTS PASSED!
echo ========================================
echo Start time: %START_TIME%
echo End time:   %END_TIME%
echo ========================================
goto :end

:error
echo.
echo ========================================
echo TESTS FAILED!
echo ========================================
echo Group with error: See above
echo Start time: %START_TIME%
echo End time:   %END_TIME%
echo ========================================
exit /b 1

:end
endlocal
