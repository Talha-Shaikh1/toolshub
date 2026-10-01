@echo off
title Reel Creator Studio & 4K-8K
cd /d "%~dp0"

:: Silence Windows symlink warning from HuggingFace
set HF_HUB_DISABLE_SYMLINKS_WARNING=1
set PYTHONWARNINGS=ignore

echo ========================================================
echo               REEL CAPTION STUDIO
echo    AI Animated Word-by-Word Subtitle Generator
echo ========================================================
echo.
echo Starting Reel Caption Studio...
echo Opening in your browser automatically...
echo (You can close this window when you're done)
echo.

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in .venv!
    echo Please make sure the installation is complete.
    pause
    exit /b 1
)

".venv\Scripts\python.exe" app.py

pause
