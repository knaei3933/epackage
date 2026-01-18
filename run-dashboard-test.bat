@echo off
echo Running Member Dashboard Test...
echo.
npx playwright test tests/e2e/phase-3-member/01-dashboard.spec.ts --reporter=list
pause
