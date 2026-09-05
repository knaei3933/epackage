@echo off
rem Label agent - place a shortcut to this file in shell:startup
cd /d %~dp0
set PYTHONIOENCODING=utf-8
python main.py >> agent_run.log 2>> agent_err.log
