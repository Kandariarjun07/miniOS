# Mini OS

A lightweight CLI-based operating system with real file system integration.

## Project Overview

This project implements a simple command-line operating system that interacts with your actual file system. It provides a Unix-like interface for file operations while working with real files on your Windows system.

## Getting Started

### Prerequisites

- Node.js (v14+)

### Running Mini OS

1. Double-click on the `run.bat` file
2. The system will create a `mini-os-files` directory in your project folder
3. All file operations will be performed within this directory

## Custom Commands

Mini OS uses the following custom commands:

- `create <path> [content]` - Create a new file with optional content
- `show <path>` - Display file contents
- `edit <path> [new content]` - Edit file contents
- `erase <path>` - Remove a file or directory
- `trunct <path>` - Truncate a file (empty its contents)

## All Available Commands

- `help` - Show available commands
- `info` - Show system information and root directory
- `ls [path]` - List directory contents
- `cd <path>` - Change directory
- `pwd` - Print working directory
- `mkdir <path>` - Create directory
- `create <path> [content]` - Create a file with optional content
- `show <path>` - Display file contents
- `edit <path> [new content]` - Edit file contents
- `erase <path>` - Remove file or directory
- `trunct <path>` - Truncate file (empty its contents)
- `explorer` - Open current directory in Windows Explorer
- `exit` or `quit` - Exit the program

## Example Usage

```
mini-os:/> mkdir projects
mini-os:/> cd projects
mini-os:/projects> create hello.txt Hello, world!
mini-os:/projects> show hello.txt
Hello, world!
mini-os:/projects> edit hello.txt Updated content
mini-os:/projects> explorer
```

## License

MIT
