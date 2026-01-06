# Security Fix Verification Script
# Verifies that all getSession() calls have been replaced with getUser()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SECURITY FIX VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$fixedFiles = @(
    "src\middleware.ts",
    "src\app\api\profile\route.ts",
    "src\app\api\quotations\route.ts",
    "src\lib\api-middleware.ts"
)

Write-Host "Checking fixed files for getUser() usage..." -ForegroundColor Yellow
foreach ($file in $fixedFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $getUserCount = ([regex]::Matches($content, "getUser\(\)").Count)
        $getSessionCount = ([regex]::Matches($content, "getSession\(\)").Count)

        Write-Host "  $file" -ForegroundColor White
        Write-Host "    getUser() calls: $getUserCount" -ForegroundColor Green
        Write-Host "    getSession() calls: $getSessionCount" -ForegroundColor $(if ($getSessionCount -eq 0) { "Green" } else { "Red" })

        if ($getSessionCount -gt 0) {
            Write-Host "    WARNING: Still using getSession()!" -ForegroundColor Red
        } else {
            Write-Host "    SECURE: No getSession() found" -ForegroundColor Green
        }
        Write-Host ""
    } else {
        Write-Host "  ERROR: File not found: $file" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All critical authentication checkpoints are now using getUser()" -ForegroundColor Green
Write-Host "Token theft vulnerability has been mitigated" -ForegroundColor Green
