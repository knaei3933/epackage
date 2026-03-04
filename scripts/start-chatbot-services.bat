@echo off
REM ============================================
REM LM StudioとCloudflare Tunnel 自動起動スクリプト
REM ============================================
REM このスクリプトは以下のサービスを順番に起動します：
REM 1. LM Studio (AIモデルサーバー)
REM 2. Cloudflare Tunnel (トンネリングサービス)
REM ============================================

setlocal enabledelayedexpansion

REM 色設定（Windows 10以降）
set "INFO=[92m"     %%% 緑
set "WARN=[93m"     %%% 黄
set "ERROR=[91m"    %%% 赤
set "RESET=[0m"     %%% リセット

echo.
echo %INFO%========================================%RESET%
echo %INFO%チャットボットサービス起動スクリプト%RESET%
echo %INFO%========================================%RESET%
echo.

REM ============================================
REM LM Studioのパスを検出
REM ============================================
echo [INFO] LM Studioのインストール先を検索しています...

set "LM_STUDIO_PATH="

REM 方法1: レジストリから取得
for /f "tokens=2*" %%a in ('reg query "HKEY_CURRENT_USER\Software\LM Studio" /v "InstallPath" 2^>nul') do (
    set "LM_STUDIO_PATH=%%b"
    if exist "!LM_STUDIO_PATH!\LM Studio.exe" (
        set "LM_STUDIO_PATH=!LM_STUDIO_PATH!\LM Studio.exe"
    )
)

REM 方法2: ユーザーLocalフォルダ（ Programsサブフォルダ ）
if not defined LM_STUDIO_PATH (
    if exist "%USERPROFILE%\AppData\Local\Programs\LM Studio\LM Studio.exe" (
        set "LM_STUDIO_PATH=%USERPROFILE%\AppData\Local\Programs\LM Studio\LM Studio.exe"
    )
)

REM 方法3: ユーザーLocalフォルダ（直下）
if not defined LM_STUDIO_PATH (
    if exist "%USERPROFILE%\AppData\Local\LM Studio\LM Studio.exe" (
        set "LM_STUDIO_PATH=%USERPROFILE%\AppData\Local\LM Studio\LM Studio.exe"
    )
)

REM 方法4: PATH環境変数から検索
if not defined LM_STUDIO_PATH (
    for %%e in (%PATHEXT%) do (
        for %%d in (%PATH%) do (
            if exist %%d\lm-studio%%e (
                set "LM_STUDIO_PATH=%%d\lm-studio%%e"
                goto :lm_studio_found
            )
        )
    )
)
:lm_studio_found

if not defined LM_STUDIO_PATH (
    echo %ERROR%[ERROR] LM Studioが見つかりませんでした%RESET%
    echo.
    echo 以下のいずれかの方法で対処してください：
    echo   1. LM Studioをインストールする
    echo   2. 環境変数PATHにLM Studioのパスを追加する
    echo   3. このスクリプトを編集してLM_STUDIO_PATHを直接指定する
    echo.
    pause
    exit /b 1
)

echo %INFO%[OK] LM Studio: !LM_STUDIO_PATH!%RESET%
echo.

REM ============================================
REM Cloudflare Tunnelのパスを検出
REM ============================================
echo [INFO] Cloudflare Tunnelのインストール先を検索しています...

set "CLOUDFLARED_PATH="

REM 方法1: scoopを使用している場合
if exist "%USERPROFILE%\scoop\shims\cloudflared.exe" (
    set "CLOUDFLARED_PATH=%USERPROFILE%\scoop\shims\cloudflared.exe"
    goto :cloudflared_found
)

REM 方法2: PATH環境変数から検索
for %%x in (cloudflared.exe) do (
    if not [%%~$PATH:x]==[] (
        set "CLOUDFLARED_PATH=%%~$PATH:x"
        goto :cloudflared_found
    )
)

:cloudflared_found

if not defined CLOUDFLARED_PATH (
    echo %WARN%[WARN] cloudflaredが見つかりませんでした%RESET%
    echo.
    echo Cloudflare Tunnelはスキップされます（LM Studioのみ起動）
    echo.
    set "SKIP_CLOUDFLARED=1"
) else (
    echo %INFO%[OK] Cloudflare Tunnel: !CLOUDFLARED_PATH!%RESET%
    echo.
)

REM ============================================
REM サービス起動
REM ============================================
echo %INFO%========================================%RESET%
echo %INFO%サービスを起動します...%RESET%
echo %INFO%========================================%RESET%
echo.

REM LM Studioを起動
echo [INFO] LM Studioを起動しています...
start "" "!LM_STUDIO_PATH!"

echo %INFO%[OK] LM Studioを起動しました%RESET%
echo.

REM LM Studioの起動を待機
echo [INFO] LM Studioの起動を待っています（10秒間）...
timeout /t 10 /nobreak >nul

REM Cloudflare Tunnelを起動
if not defined SKIP_CLOUDFLARED (
    echo [INFO] Cloudflare Tunnelを起動しています...
    start "" "!CLOUDFLARED_PATH!" tunnel --config "%~dp0..\cloudflared-config.yml" run
    echo %INFO%[OK] Cloudflare Tunnelを起動しました%RESET%
) else (
    echo %WARN%[SKIP] Cloudflare Tunnelは起動されませんでした%RESET%
)

echo.
echo %INFO%========================================%RESET%
echo %INFO%すべてのサービスが起動しました%RESET%
echo %INFO%========================================%RESET%
echo.
echo LM StudioとCloudflare Tunnelがバックグラウンドで実行されています。
echo 何かキーを押すとこのウィンドウを閉じます（サービスは継続実行）
echo.
pause >nul

endlocal
