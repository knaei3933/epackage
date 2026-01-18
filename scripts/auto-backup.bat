@echo off
REM Auto Backup Script for Epackage Lab
REM This file is used by Windows Task Scheduler

PowerShell -ExecutionPolicy Bypass -File "%~dp0auto-backup.ps1"
