#include "kernel.h"
#include "../process/process.h"
#include "../filesystem/filesystem.h"
#include "../memory/memory_manager.h"
#include <iostream>
#include <algorithm>

Kernel::Kernel() : isRunning(false) {
    std::cout << "Kernel constructor called" << std::endl;
}

Kernel::~Kernel() {
    if (isRunning) {
        shutdown();
    }
    std::cout << "Kernel destructor called" << std::endl;
}

bool Kernel::initialize() {
    std::cout << "Initializing kernel..." << std::endl;
    
    try {
        // Initialize memory manager
        memoryManager = std::make_unique<MemoryManager>();
        if (!memoryManager->initialize()) {
            std::cerr << "Failed to initialize memory manager" << std::endl;
            return false;
        }
        
        // Initialize file system
        fileSystem = std::make_unique<FileSystem>();
        if (!fileSystem->initialize()) {
            std::cerr << "Failed to initialize file system" << std::endl;
            return false;
        }
        
        // Initialize process manager
        processManager = std::make_unique<Process>();
        if (!processManager->initialize()) {
            std::cerr << "Failed to initialize process manager" << std::endl;
            return false;
        }
        
        isRunning = true;
        std::cout << "Kernel initialized successfully" << std::endl;
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Exception during kernel initialization: " << e.what() << std::endl;
        return false;
    }
}

std::string Kernel::executeCommand(const std::string& command, const std::vector<std::string>& args) {
    if (!isRunning) {
        return "Error: Kernel is not running";
    }
    
    // Convert command to lowercase for case-insensitive comparison
    std::string cmd = command;
    std::transform(cmd.begin(), cmd.end(), cmd.begin(), ::tolower);
    
    // Handle basic kernel commands
    if (cmd == "info") {
        return "Mini OS Kernel v0.1";
    } else if (cmd == "shutdown") {
        shutdown();
        return "Kernel shutdown initiated";
    } else if (cmd == "restart") {
        shutdown();
        return initialize() ? "Kernel restarted successfully" : "Failed to restart kernel";
    }
    
    // Delegate command to appropriate subsystem
    if (cmd.substr(0, 2) == "fs" || cmd == "ls" || cmd == "cd" || cmd == "mkdir" || 
        cmd == "touch" || cmd == "rm" || cmd == "cat") {
        return fileSystem->handleCommand(cmd, args);
    } else if (cmd.substr(0, 4) == "proc" || cmd == "ps" || cmd == "kill") {
        return processManager->handleCommand(cmd, args);
    } else if (cmd.substr(0, 3) == "mem") {
        return memoryManager->handleCommand(cmd, args);
    }
    
    return "Unknown command: " + command;
}

Process* Kernel::getProcessManager() const {
    return processManager.get();
}

FileSystem* Kernel::getFileSystem() const {
    return fileSystem.get();
}

MemoryManager* Kernel::getMemoryManager() const {
    return memoryManager.get();
}

void Kernel::shutdown() {
    if (!isRunning) {
        return;
    }
    
    std::cout << "Shutting down kernel..." << std::endl;
    
    // Shutdown in reverse order of initialization
    if (processManager) {
        processManager->shutdown();
    }
    
    if (fileSystem) {
        fileSystem->shutdown();
    }
    
    if (memoryManager) {
        memoryManager->shutdown();
    }
    
    isRunning = false;
    std::cout << "Kernel shutdown complete" << std::endl;
}
