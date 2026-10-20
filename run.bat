@echo off
setlocal

where py >nul 2>nul
if %errorlevel%==0 (
    start "SCES Sprout Lab" /D "%~dp0" cmd /k "py -m http.server 4175 --directory dist"
) else (
    where python >nul 2>nul
    if errorlevel 1 (
        echo Python was not found. Install Python, then run this file again.
        pause
        exit /b 1
    )
    start "SCES Sprout Lab" /D "%~dp0" cmd /k "python -m http.server 4175 --directory dist"
)

timeout /t 2 /nobreak >nul
start "" "http://localhost:4175"
endlocal
