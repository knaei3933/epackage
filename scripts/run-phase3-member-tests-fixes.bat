@echo off
REM Test script to run Group C (Member) tests with fixes
echo Running Group C (Member Portal) Tests...
echo.

cd /d "%~dp0.."

echo Running tests...
npx playwright test tests/e2e/phase-3-member --reporter=list --workers=4

echo.
echo Test run complete.
pause
