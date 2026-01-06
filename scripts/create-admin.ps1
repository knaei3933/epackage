$body = @{
    email = "admin@epackage-lab.com"
    password = "Admin1234"
    kanjiLastName = "管理"
    kanjiFirstName = "者"
    kanaLastName = "かんり"
    kanaFirstName = "しゃ"
    businessType = "CORPORATION"
    productCategory = "OTHER"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Success!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}
