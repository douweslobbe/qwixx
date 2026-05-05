@echo off
title Qwixx App
echo Starting Qwixx App...
echo.

:: Stel het pad in naar de fnm Node installatie
set "NODE_DIR=C:\Users\DouweSlobbeSEVENP\AppData\Roaming\fnm\node-versions\v24.14.0\installation"
set "PATH=%NODE_DIR%;%NODE_DIR%\node_modules\npm\bin;%PATH%"

cd /d "%~dp0"
npm run dev -- --open

pause
