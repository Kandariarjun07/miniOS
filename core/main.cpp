#include "kernel/kernel.h"
#include "process/process.h"
#include "filesystem/filesystem.h"
#include "memory/memory_manager.h"
#include <iostream>
#include <string>
#include <vector>
#include <sstream>

// Function to split a string into tokens
std::vector<std::string> splitString(const std::string& input, char delimiter = ' ') {
    std::vector<std::string> tokens;
    std::stringstream ss(input);
    std::string token;
    
    while (std::getline(ss, token, delimiter)) {
        if (!token.empty()) {
            tokens.push_back(token);
        }
    }
    
    return tokens;
}

int main() {
    std::cout << "Mini OS Core Test" << std::endl;
    std::cout << "=================" << std::endl;
    
    // Create and initialize the kernel
    Kernel kernel;
    if (!kernel.initialize()) {
        std::cerr << "Failed to initialize kernel" << std::endl;
        return 1;
    }
    
    std::cout << "\nMini OS initialized successfully. Type 'help' for available commands, 'exit' to quit." << std::endl;
    
    // Main command loop
    std::string input;
    bool running = true;
    
    while (running) {
        std::cout << "\n> ";
        std::getline(std::cin, input);
        
        if (input.empty()) {
            continue;
        }
        
        // Split input into command and arguments
        std::vector<std::string> tokens = splitString(input);
        std::string command = tokens[0];
        std::vector<std::string> args(tokens.begin() + 1, tokens.end());
        
        // Handle special commands
        if (command == "exit" || command == "quit") {
            running = false;
            continue;
        } else if (command == "help") {
            std::cout << "Available commands:" << std::endl;
            std::cout << "  help                - Show this help message" << std::endl;
            std::cout << "  exit, quit          - Exit the program" << std::endl;
            std::cout << "  info                - Show kernel information" << std::endl;
            std::cout << "  shutdown            - Shutdown the kernel" << std::endl;
            std::cout << "  restart             - Restart the kernel" << std::endl;
            std::cout << std::endl;
            std::cout << "File system commands:" << std::endl;
            std::cout << "  ls [path]           - List directory contents" << std::endl;
            std::cout << "  cd <path>           - Change directory" << std::endl;
            std::cout << "  pwd                 - Print working directory" << std::endl;
            std::cout << "  mkdir <path>        - Create directory" << std::endl;
            std::cout << "  touch <path>        - Create file" << std::endl;
            std::cout << "  cat <path>          - Display file contents" << std::endl;
            std::cout << "  rm <path>           - Remove file or directory" << std::endl;
            std::cout << "  fs-info <path>      - Show file system node info" << std::endl;
            std::cout << std::endl;
            std::cout << "Process commands:" << std::endl;
            std::cout << "  ps                  - List processes" << std::endl;
            std::cout << "  proc-info <pid>     - Show process information" << std::endl;
            std::cout << "  proc-create <name>  - Create a new process" << std::endl;
            std::cout << "  kill <pid>          - Terminate a process" << std::endl;
            std::cout << std::endl;
            std::cout << "Memory commands:" << std::endl;
            std::cout << "  mem-stats           - Show memory statistics" << std::endl;
            std::cout << "  mem-alloc <size> <pid> - Allocate memory" << std::endl;
            std::cout << "  mem-free <address>  - Free memory" << std::endl;
            std::cout << "  mem-free-proc <pid> - Free all memory for a process" << std::endl;
            continue;
        }
        
        // Execute the command through the kernel
        std::string result = kernel.executeCommand(command, args);
        std::cout << result << std::endl;
    }
    
    // Shutdown the kernel
    kernel.shutdown();
    
    std::cout << "Mini OS terminated" << std::endl;
    return 0;
}
