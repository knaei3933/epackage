@echo off
REM Test only the samples form validation
npx playwright test tests/e2e/phase-1-public/07-samples.spec.ts --project=chromium --reporter=list
