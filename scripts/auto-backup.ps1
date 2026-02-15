# Auto Backup Script for Epackage Lab
# Runs every X minutes to commit and push changes

$ErrorActionPreference = "SilentlyContinue"

# Set repository path
$RepoPath = "C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1"

# Set log file
$LogFile = Join-Path $RepoPath "logs\auto-backup.log"

# Create logs directory if not exists
$LogsDir = Split-Path $LogFile
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}

# Function to write log
function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$Timestamp - $Message" | Add-Content -Path $LogFile
}

# Change to repository directory
Set-Location $RepoPath

# Check if there are changes
$Status = git status --porcelain

if ($Status) {
    Write-Log "Changes detected, creating backup..."

    # Get timestamp
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

    # Add all changes
    git add -A *>&1 | Out-Null

    # Commit with timestamp
    $CommitMsg = "auto-backup: $Timestamp"
    git commit -m $CommitMsg *>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        # Push to remote
        git push *>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Log "Backup successful: $CommitMsg"
        } else {
            Write-Log "ERROR: Push failed"
        }
    } else {
        Write-Log "ERROR: Commit failed"
    }
} else {
    Write-Log "No changes detected, skipping backup"
}
