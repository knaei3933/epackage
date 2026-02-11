# B2B 워크플로우 수정 사항 검증 스크립트
# 2025-01-30

# =====================================================
# 검증 항목 체크리스트
# =====================================================

Write-Host "=== B2B 워크플로우 수정 사항 검증 ===" -ForegroundColor Cyan
Write-Host ""

# 1. supabase-browser.ts 검증
Write-Host "[1/6] supabase-browser.ts - autoRefreshToken 설정" -ForegroundColor Yellow
$browserPath = "src\lib\supabase-browser.ts"
if (Test-Path $browserPath) {
    $content = Get-Content $browserPath -Raw
    if ($content -match "autoRefreshToken:\s*true") {
        Write-Host "  ✅ autoRefreshToken: true 설정됨" -ForegroundColor Green
    } else {
        Write-Host "  ❌ autoRefreshToken: false (수정 필요)" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️ 파일 없음: $browserPath" -ForegroundColor Yellow
}

# 2. supabase-ssr.ts 검증
Write-Host "[2/6] supabase-ssr.ts - 쿠키 옵션 설정" -ForegroundColor Yellow
$ssrPath = "src\lib\supabase-ssr.ts"
if (Test-Path $ssrPath) {
    $content = Get-Content $ssrPath -Raw
    $hasMaxAge = $content -match "maxAge:\s*1800"
    $hasHttpOnly = $content -match "httpOnly:\s*true"
    $hasSameSite = $content -match "sameSite:\s*'lax'"

    if ($hasMaxAge -and $hasHttpOnly -and $hasSameSite) {
        Write-Host "  ✅ 쿠키 옵션 정상 설정됨 (maxAge: 1800, httpOnly, sameSite)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ 쿠키 옵션 설정 누락" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️ 파일 없음: $ssrPath" -ForegroundColor Yellow
}

# 3. middleware.ts 검증
Write-Host "[3/6] middleware.ts - response 쿠키 설정" -ForegroundColor Yellow
$middlewarePath = "src\middleware.ts"
if (Test-Path $middlewarePath) {
    $content = Get-Content $middlewarePath -Raw
    $hasResponseCookie = $content -match "response\.cookies\.set"
    $hasMaxAge = $content -match "maxAge:\s*1800"

    if ($hasResponseCookie -and $hasMaxAge) {
        Write-Host "  ✅ response 쿠키 설정 정상 (maxAge: 1800)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ response 쿠키 설정 누락" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️ 파일 없음: $middlewarePath" -ForegroundColor Yellow
}

# 4. AuthContext.tsx 검증
Write-Host "[4/6] AuthContext.tsx - 세션 리프레시 로직" -ForegroundColor Yellow
$authContextPath = "src\contexts\AuthContext.tsx"
if (Test-Path $authContextPath) {
    $content = Get-Content $authContextPath -Raw
    $hasRefreshInterval = $content -match "setInterval.*60\s*\*\s*1000"
    $hasRefreshCheck = $content -match "timeUntilExpiry.*5.*\*\s*60.*\*s*1000"

    if ($hasRefreshInterval -and $hasRefreshCheck) {
        Write-Host "  ✅ 세션 리프레시 로직 추가됨 (1분마다 확인, 5분 전 리프레시)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ 세션 리프레시 로직 누락" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️ 파일 없음: $authContextPath" -ForegroundColor Yellow
}

# 5. quotations/save/route.ts 검증
Write-Host "[5/6] quotations/save/route.ts - quotation_items 생성 로직" -ForegroundColor Yellow
$saveRoutePath = "src\app\api\quotations\save\route.ts"
if (Test-Path $saveRoutePath) {
    $content = Get-Content $saveRoutePath -Raw
    $hasItemsInsert = $content -match "quotation_items.*insert"
    $hasAuthCheck = $content -match "isAuthenticated.*!user.*401"
    $hasRollback = $content -match "delete.*quotation\.id"

    if ($hasItemsInsert -and $hasAuthCheck -and $hasRollback) {
        Write-Host "  ✅ quotation_items 생성 로직 추가됨" -ForegroundColor Green
        Write-Host "     - 인증 체크 추가" -ForegroundColor Green
        Write-Host "     - 롤백크 처리 추가" -ForegroundColor Green
    } else {
        Write-Host "  ❌ quotation_items 로직 누락" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️ 파일 없음: $saveRoutePath" -ForegroundColor Yellow
}

# 6. ResultStep.tsx 검증
Write-Host "[6/6] ResultStep.tsx - 에러 핸들링 개선" -ForegroundColor Yellow
$resultStepPath = "src\components\quote\sections\ResultStep.tsx"
if (Test-Result $resultStepPath) {
    $content = Get-Content $resultStepPath -Raw
    $hasAuthCheck = $content -match "user\?\.id.*skip"
    $hasErrorHandling = $content -match "catch.*error"
    $hasMemberQuotations = $content -match "/api/member/quotations"

    if ($hasAuthCheck -and $hasErrorHandling -and $hasMemberQuotations) {
        Write-Host "  ✅ 에러 핸들링 개선됨" -ForegroundColor Green
        Write-Host "     - 인증 체크 추가" -ForegroundColor Green
        Write-Host "     - /api/member/quotations 사용" -ForegroundColor Green
    } else {
        Write-Host "  ❌ 에러 핸들링 개선 누락" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️ 파일 없음: $resultStepPath" -ForegroundColor Yellow
}

# =====================================================
# 요약
# =====================================================

Write-Host ""
Write-Host "=== 검증 완료 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "다음 수동 테스트를 실행하여 전체 워크플로우를 검증하세요:" -ForegroundColor White
Write-Host ""
Write-Host "1. 로그인 후 30분 세션 유지 테스트" -ForegroundColor Yellow
Write-Host "   - member@test.com / Member1234! 로그인" -ForegroundColor Gray
Write-Host "   - 30분 대기 (비활성 상태)" -ForegroundColor Gray
Write-Host "   - 페이지 이동 시 세션 유지 확인" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 견적 생성 → 저장 → 조회 테스트" -ForegroundColor Yellow
Write-Host "   - 로그인 상태에서 견적 생성" -ForegroundColor Gray
Write-Host "   - PDF 다운로드 클릭" -ForegroundColor Gray
Write-Host "   - /member/quotations 페이지에서 견적 확인" -ForegroundColor Gray
Write-Host "   - DB에서 quotations + quotation_items 레코드 확인" -ForegroundColor Gray
Write-Host ""
Write-Host "DB 확인 쿼리:" -ForegroundColor Yellow
Write-Host "SELECT * FROM quotations ORDER BY created_at DESC LIMIT 1;" -ForegroundColor Gray
Write-Host "SELECT * FROM quotation_items WHERE quotation_id = '<상위 ID>';" -ForegroundColor Gray
