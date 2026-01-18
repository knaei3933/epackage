@echo off
REM Script to run all fixed Phase 1 and Phase 5 tests

echo ========================================
echo Running Phase 1 Public Pages Tests
echo ========================================

echo.
echo Running Home Navigation Test...
npx playwright test tests/e2e/phase-1-public/01-home-navigation.spec.ts

echo.
echo Running Catalog Test...
npx playwright test tests/e2e/phase-1-public/02-catalog.spec.ts

echo.
echo Running Quote Simulator Test...
npx playwright test tests/e2e/phase-1-public/04-quote-simulator.spec.ts

echo.
echo Running ROI Calculator Test...
npx playwright test tests/e2e/phase-1-public/06-roi-calculator.spec.ts

echo.
echo Running Samples Test...
npx playwright test tests/e2e/phase-1-public/07-samples.spec.ts

echo.
echo Running Contact Test...
npx playwright test tests/e2e/phase-1-public/08-contact.spec.ts

echo.
echo Running Guide Pages Test...
npx playwright test tests/e2e/phase-1-public/10-guide-pages.spec.ts

echo.
echo Running Compare Test...
npx playwright test tests/e2e/phase-1-public/12-compare.spec.ts

echo.
echo ========================================
echo Running Phase 5 Portal Tests
echo ========================================

echo.
echo Running Portal Home Test...
npx playwright test tests/e2e/phase-5-portal/01-portal-home.spec.ts

echo.
echo Running Portal Profile Test...
npx playwright test tests/e2e/phase-5-portal/02-portal-profile.spec.ts

echo.
echo ========================================
echo All tests completed!
echo ========================================

pause
