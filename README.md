# Mini OS

A lightweight CLI-based operating system with real file system integration.

## Project Overview

This project implements a simple command-line operating system that interacts with your actual file system. It provides a Unix-like interface for file operations while working with real files on your Windows system.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running Mini OS](#running-mini-os)
- [Available Commands](#available-commands)
- [Command Usage Examples](#command-usage-examples)
- [Development](#development)
- [License](#license)

## Features

- Real file system integration
- Command-line interface with custom commands
- File operations (create, read, edit, delete)
- Directory navigation
- Windows Explorer integration

## Project Structure

```
mini-os/
├── core/                 # C++ core components (future implementation)
│   ├── filesystem/       # File system implementation
│   ├── kernel/           # Kernel implementation
│   ├── memory/           # Memory management
│   └── process/          # Process management
├── shell/                # JavaScript shell interface
│   ├── apps/             # Shell applications
│   ├── commands/         # Command handlers
│   ├── utils/            # Utility functions
│   ├── index.js          # Main shell entry point
│   ├── real-fs.js        # Real file system implementation
│   └── real-fs-refactored.js # Refactored file system with custom commands
├── mini-os-files/        # Root directory for file operations (created at runtime)
├── run.bat               # Windows batch file to run Mini OS
└── run.sh                # Unix shell script to run Mini OS
```

## Installation

### Prerequisites

- Node.js (v14+)
- Git (for cloning the repository)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Kandariarjun07/miniOS.git
   ```

2. Navigate to the project directory:
   ```bash
   cd miniOS
   ```

3. Install dependencies:
   ```bash
   cd shell
   npm install
   ```

## Running Mini OS

### On Windows

1. Double-click on the `run.bat` file

   OR

   Run from command prompt:
   ```bash
   run.bat
   ```

### On macOS/Unix/Linux

1. Make the run script executable:
   ```bash
   chmod +x run.sh
   ```

2. Run the script:
   ```bash
   ./run.sh
   ```

Note: On macOS, the `explorer` command will use the `open` command to open the Finder at the current directory.

### Manual Start

You can also start Mini OS manually:

```bash
cd shell
node real-fs-refactored.js
```

## Available Commands

Mini OS provides the following commands:

### File Operations

- `create <path> [content]` - Create a new file with optional content
- `show <path>` - Display file contents
- `edit <path>` - Edit file contents in a vim-like editor
- `erase <path>` - Remove a file or directory
- `trunct <path>` - Truncate a file (empty its contents)

### Directory Operations

- `ls [path]` - List directory contents
- `cd <path>` - Change directory
- `pwd` - Print working directory
- `mkdir <path>` - Create directory

### System Commands

- `help` - Show available commands
- `info` - Show system information and root directory
- `explorer` - Open current directory in Windows Explorer
- `exit` or `quit` - Exit the program
- `clear` or `cls` - Clear the screen

### Command Aliases

Mini OS also supports these command aliases for compatibility:

- `touch` → `create`
- `cat` → `show`
- `rm` → `erase`
- `cls` → `clear`

## Command Usage Examples

### Basic File Operations

```
mini-os:/> mkdir projects
mini-os:/> cd projects
mini-os:/projects> create hello.txt Hello, world!
mini-os:/projects> show hello.txt
Hello, world!
mini-os:/projects> edit hello.txt
```

When using the `edit` command, you'll enter a simple text editor:
- Type text to add new lines
- Type `EOF` on a new line to save and exit

### Directory Navigation

```
mini-os:/> ls
mini-os:/> mkdir docs
mini-os:/> cd docs
mini-os:/docs> pwd
/docs
mini-os:/docs> cd ..
mini-os:/>
```

### Using the Explorer Command

```
mini-os:/> explorer
```
This will open the current directory in Windows Explorer.

## Development

### Project Components

1. **Shell Interface**: The JavaScript-based command-line interface
2. **File System**: Integration with the real file system
3. **Command Handlers**: Processing and executing user commands

### Adding New Commands

To add a new command:

1. Open `shell/real-fs-refactored.js`
2. Add your command to the `commands` object
3. Implement the command logic as a function that takes an array of arguments

Example:
```javascript
commands.myCommand = (args) => {
  // Command implementation
  return 'Command result message';
};
```

### Modifying Existing Commands

To modify an existing command, locate its implementation in the `commands` object in `shell/real-fs-refactored.js` and update its logic.

## License

MIT
