@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (set PY=py) else (set PY=python)
%PY% src\build.py
if errorlevel 1 goto end
%PY% -m http.server 8000 --directory dist
:end
pause
