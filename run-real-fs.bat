@echo on
echo Starting Mini OS with Real File System...

cd shell
echo Running real file system version...
node real-fs.js
if %ERRORLEVEL% NEQ 0 (
    echo Error running Mini OS with Real File System!
    pause
    exit /b %ERRORLEVEL%
)

echo Mini OS terminated.
pause
