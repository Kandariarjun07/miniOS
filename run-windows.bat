@echo on
echo Starting Mini OS...

cd shell
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies!
    pause
    exit /b %ERRORLEVEL%
)

echo Starting Mini OS shell...
node index.js
if %ERRORLEVEL% NEQ 0 (
    echo Error starting Mini OS!
    pause
    exit /b %ERRORLEVEL%
)

echo Mini OS terminated.
pause
