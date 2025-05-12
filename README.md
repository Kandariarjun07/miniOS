# Mini OS

A lightweight CLI-based operating system built with JavaScript and C++.

## Project Overview

This project implements a simple operating system with the following components:

- **Kernel**: Core system functionality (C++ or JavaScript simulation)
- **Shell**: Command-line interface (JavaScript)
- **File System**: Basic file operations
- **Process Management**: Create and manage processes
- **Memory Management**: Allocate and free memory
- **User Applications**: Simple utilities

## Getting Started

### Prerequisites

- Node.js (v14+)

### Installation

#### JavaScript-only Version (Windows)

1. Clone this repository
2. Run the build script: `build-windows.bat`
3. Start the OS: `run-windows.bat`

#### Full Version (Linux/macOS)

If you want to build the C++ components as well:

1. Clone this repository
2. Install prerequisites: C++ compiler and CMake
3. Build the project: `./build.sh`
4. Start the OS: `./run.sh`

## Features

- Command-line interface
- Basic file operations (create, read, write, delete)
- Process creation and management
- Memory allocation
- Simple text editor
- System information tools

## Project Structure

```
mini-os/
├── core/               # C++ core components
│   ├── kernel/         # Kernel implementation
│   ├── memory/         # Memory management
│   ├── process/        # Process management
│   └── filesystem/     # File system implementation
├── shell/              # JavaScript shell interface
│   ├── commands/       # Shell commands
│   ├── utils/          # Utility functions
│   └── apps/           # User applications
└── docs/               # Documentation
```

## License

MIT
