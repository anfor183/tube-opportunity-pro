@echo off
TITLE TubeOpportunity PRO - YouTube Intelligence Platform
cd /d "%~dp0"

echo ================================================================
echo         TubeOpportunity PRO - YouTube Intelligence Platform
echo ================================================================
echo.

:: Ensure Node is accessible
set "NODE_CMD=node"
if exist "C:\Program Files\nodejs\node.exe" set "NODE_CMD=C:\Program Files\nodejs\node.exe"

:: Check if server is already running
"%NODE_CMD%" -e "const http=require('http');http.get('http://localhost:5000/api/health',r=>process.exit(0)).on('error',()=>process.exit(1))" >nul 2>&1
if %errorlevel% EQU 0 (
    echo [*] TubeOpportunity PRO is already running on http://localhost:5000!
    echo [*] Opening the app in your browser...
    start http://localhost:5000
    ping 127.0.0.1 -n 2 >nul
    exit /b 0
)

echo [*] Starting TubeOpportunity PRO server on http://localhost:5000...
echo [*] Opening application in your web browser...
echo.

:: Open browser after 2 seconds
start "" cmd /c "ping 127.0.0.1 -n 3 >nul && start http://localhost:5000"

:: Start the server (keeps running in this window)
"%NODE_CMD%" server/src/server.js

if %errorlevel% NEQ 0 (
    echo.
    echo [!] Server exited unexpectedly.
    pause
)
