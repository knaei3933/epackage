$lockFile = "C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\.next\dev\lock"
if (Test-Path $lockFile) {
    Remove-Item -Path $lockFile -Force
    Write-Host "Lock file deleted"
} else {
    Write-Host "Lock file not found"
}
