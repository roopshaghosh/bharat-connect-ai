@echo off
echo ===================================================
echo Starting Bharat Connect AI Project
echo ===================================================

:: Ensure dependencies are installed in backend
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend && npm install && cd ..
)

:: Ensure dependencies are installed in frontend
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

echo Starting Backend Server on port 5000...
start "Bharat Connect Backend" cmd /k "cd backend && npm run dev"

echo Starting Frontend Server on http://localhost:5173...
start "Bharat Connect Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo Both servers are launching! 
echo Opening frontend in your browser...
echo ===================================================
timeout /t 3 >nul
start http://localhost:5173

pause
