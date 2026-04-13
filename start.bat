@echo off
setlocal
cd /d "%~dp0"

start "Paper2Base Backend" powershell -NoExit -Command "Set-Location backend; python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8002"

timeout /t 3 /nobreak >nul

start "Paper2Base Frontend" powershell -NoExit -Command "Set-Location frontend; npm run dev"

timeout /t 5 /nobreak >nul

start "" "http://localhost:5173"

endlocal
