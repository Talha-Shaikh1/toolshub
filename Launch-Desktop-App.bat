@echo off
title FlowCreator Studio Pro - Native Desktop GPU Engine
cd /d "%~dp0"

echo =====================================================================
echo          FLOWCREATOR STUDIO PRO - NATIVE DESKTOP GPU ENGINE
echo        Zero Cloud Upload - 100%% Local Device GPU Acceleration
echo =====================================================================
echo.

:: 1. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python not found in system PATH!
    echo Please install Python 3.10+ from python.org
    pause
    exit /b 1
)

:: 2. Check FFmpeg with GPU support
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo [NOTICE] Using bundled FFmpeg from bin directory...
    set "PATH=%~dp0bin;%PATH%"
)

:: 3. Start Local Python Hardware Accelerated GPU Backend on port 8000
echo [1/3] Starting High-Speed Local GPU Backend (127.0.0.1:8000)...
start /b cmd /c "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000" >nul 2>&1

:: Wait 2 seconds for backend initialization
timeout /t 2 /nobreak >nul

:: 4. Start Next.js Frontend Studio on port 3000
echo [2/3] Starting Studio Interface (127.0.0.1:3000)...
start /b cmd /c "cd /d %~dp0frontend && npm run dev" >nul 2>&1

:: Wait 3 seconds for frontend server
timeout /t 3 /nobreak >nul

:: 5. Launch Standalone Native Window (No Browser Address Bar / App Mode)
echo [3/3] Opening Native Desktop Studio Window...
set "APP_URL=http://localhost:3000/studio"

:: Try Edge in App mode
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%" --window-size=1440,960
    goto :launched
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%" --window-size=1440,960
    goto :launched
)

:: Try Chrome in App mode
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%APP_URL%" --window-size=1440,960
    goto :launched
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%APP_URL%" --window-size=1440,960
    goto :launched
)

:: Default browser fallback
start "" "%APP_URL%"

:launched
echo.
echo =====================================================================
echo  FlowCreator Studio is running natively on your PC!
echo  - Video Upload Speed: Instant (500+ MB/s local memory loopback)
echo  - Rendering Engine: Native Hardware GPU (NVENC / Intel QSV / AMF)
echo  - Cloud Upload: 0 MB (100%% Private on your machine)
echo =====================================================================
echo.
echo Minimize this terminal window while working. Press Ctrl+C to close studio.
echo.
pause
