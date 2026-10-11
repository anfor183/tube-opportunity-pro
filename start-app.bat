@echo off
title TubeOpportunity PRO - YouTube Intelligence Platform
echo ================================================================
echo Starting TubeOpportunity PRO...
echo Opening http://localhost:5000 in your browser
echo ================================================================

timeout /t 2 /nobreak >nul
start http://localhost:5000
node server/src/server.js
pause
