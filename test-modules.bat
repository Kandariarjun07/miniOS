@echo on
echo Testing Node.js modules...

echo Creating test directory...
mkdir test-modules
cd test-modules

echo Creating package.json...
echo { > package.json
echo   "name": "test-modules", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "Test modules", >> package.json
echo   "main": "index.js", >> package.json
echo   "dependencies": { >> package.json
echo     "chalk": "^4.1.2", >> package.json
echo     "commander": "^9.4.0", >> package.json
echo     "inquirer": "^8.2.4" >> package.json
echo   } >> package.json
echo } >> package.json

echo Installing modules...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing modules!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)

echo Creating test script...
echo const chalk = require('chalk'); > index.js
echo const commander = require('commander'); >> index.js
echo const inquirer = require('inquirer'); >> index.js
echo console.log(chalk.green('Chalk is working!')); >> index.js
echo console.log('Commander version:', commander.VERSION); >> index.js
echo console.log('Inquirer version:', inquirer.prompt.prompts.input.name); >> index.js

echo Running test script...
node index.js
if %ERRORLEVEL% NEQ 0 (
    echo Error running test script!
    cd ..
    pause
    exit /b %ERRORLEVEL%
)

echo Cleaning up...
cd ..
rmdir /s /q test-modules

echo All modules are working correctly!
pause
