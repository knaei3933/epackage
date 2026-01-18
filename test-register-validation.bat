@echo off
echo Running TC-AUTH-006: 会員登録バリデーション
echo.
npx playwright test tests/e2e/group-b-auth/02-register.spec.ts --grep "TC-AUTH-006"
echo.
exit /b %ERRORLEVEL%
