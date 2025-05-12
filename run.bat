@echo off
echo Starting Mini OS...

cd shell
node real-fs.js
if %ERRORLEVEL% NEQ 0 (
    echo Error running Mini OS!
    pause
    exit /b %ERRORLEVEL%
)

echo Mini OS terminated.
pause
