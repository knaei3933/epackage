# Setup Windows Task Scheduler for Auto Backup
# Run this script as Administrator

$TaskName = "Epackage-Auto-Backup"
$ScriptPath = "C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\scripts\auto-backup.bat"
$RepoPath = "C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1"

# Check if running as Administrator
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $IsAdmin) {
    Write-Host "ERROR: Please run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'"
    exit 1
}

# Remove existing task if exists
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($ExistingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create new scheduled task (every 30 minutes)
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$ScriptPath`""
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration ([TimeSpan]::MaxValue)
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Description "Epackage Lab Auto Backup (every 30 minutes)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Auto Backup Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Task Name: $TaskName"
Write-Host "Interval:  Every 30 minutes"
Write-Host "Log File:  $RepoPath\logs\auto-backup.log"
Write-Host ""
Write-Host "To view logs:"
Write-Host "  type $RepoPath\logs\auto-backup.log"
Write-Host ""
Write-Host "To disable:"
Write-Host "  Unregister-ScheduledTask -TaskName `"$TaskName`" -Confirm:`$false"
Write-Host ""
Write-Host "To run manually:"
Write-Host "  $ScriptPath"
Write-Host ""
