@echo off
rem Label agent - place a shortcut to this file in shell:startup
cd /d %~dp0
set PYTHONIOENCODING=utf-8
rem Auto-update: restart pulls the latest renderer fixes (safe if offline).
git pull --ff-only >> agent_update.log 2>&1
python main.py >> agent_run.log 2>> agent_err.log
