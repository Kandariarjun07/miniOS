@echo on
echo Starting Simple Mini OS...

cd shell
echo Running simple version (no external dependencies)...
node simple.js
if %ERRORLEVEL% NEQ 0 (
    echo Error running Simple Mini OS!
    pause
    exit /b %ERRORLEVEL%
)

echo Mini OS terminated.
pause
