@echo on
echo Testing Node.js installation...

node --version
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH!
    pause
    exit /b %ERRORLEVEL%
)

echo Creating test script...
echo console.log('Node.js is working!'); > test.js
echo console.log('Node version: ' + process.version); >> test.js

echo Running test script...
node test.js
if %ERRORLEVEL% NEQ 0 (
    echo Error running Node.js script!
    pause
    exit /b %ERRORLEVEL%
)

echo Deleting test script...
del test.js

echo Test completed successfully!
pause
