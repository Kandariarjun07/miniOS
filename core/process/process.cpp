#include "process.h"
#include <iostream>
#include <sstream>
#include <algorithm>

Process::Process() : nextPid(1), isInitialized(false) {
    std::cout << "Process manager constructor called" << std::endl;
}

Process::~Process() {
    if (isInitialized) {
        shutdown();
    }
    std::cout << "Process manager destructor called" << std::endl;
}

bool Process::initialize() {
    std::cout << "Initializing process manager..." << std::endl;
    
    try {
        // Create the init process (PID 1)
        auto initProcess = std::make_unique<PCB>(nextPid++, "init", 0);
        initProcess->state = PCB::RUNNING;
        processes[1] = std::move(initProcess);
        
        isInitialized = true;
        std::cout << "Process manager initialized successfully" << std::endl;
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Exception during process manager initialization: " << e.what() << std::endl;
        return false;
    }
}

int Process::createProcess(const std::string& name, int priority) {
    if (!isInitialized) {
        std::cerr << "Process manager not initialized" << std::endl;
        return -1;
    }
    
    try {
        int pid = nextPid++;
        auto process = std::make_unique<PCB>(pid, name, priority);
        process->state = PCB::READY;
        processes[pid] = std::move(process);
        
        std::cout << "Created process " << name << " with PID " << pid << std::endl;
        return pid;
    } catch (const std::exception& e) {
        std::cerr << "Exception during process creation: " << e.what() << std::endl;
        return -1;
    }
}

bool Process::terminateProcess(int pid) {
    if (!isInitialized) {
        std::cerr << "Process manager not initialized" << std::endl;
        return false;
    }
    
    // Cannot terminate the init process
    if (pid == 1) {
        std::cerr << "Cannot terminate the init process" << std::endl;
        return false;
    }
    
    auto it = processes.find(pid);
    if (it == processes.end()) {
        std::cerr << "Process with PID " << pid << " not found" << std::endl;
        return false;
    }
    
    std::cout << "Terminating process " << it->second->name << " (PID " << pid << ")" << std::endl;
    it->second->state = PCB::TERMINATED;
    processes.erase(it);
    
    return true;
}

std::string Process::getProcessInfo(int pid) const {
    if (!isInitialized) {
        return "Error: Process manager not initialized";
    }
    
    auto it = processes.find(pid);
    if (it == processes.end()) {
        return "Error: Process with PID " + std::to_string(pid) + " not found";
    }
    
    const PCB& process = *(it->second);
    
    std::stringstream ss;
    ss << "PID: " << process.pid << "\n";
    ss << "Name: " << process.name << "\n";
    ss << "Priority: " << process.priority << "\n";
    
    ss << "State: ";
    switch (process.state) {
        case PCB::NEW: ss << "NEW"; break;
        case PCB::READY: ss << "READY"; break;
        case PCB::RUNNING: ss << "RUNNING"; break;
        case PCB::WAITING: ss << "WAITING"; break;
        case PCB::TERMINATED: ss << "TERMINATED"; break;
    }
    
    ss << "\nMemory allocated: " << process.memoryAllocated << " bytes";
    
    return ss.str();
}

std::string Process::listProcesses() const {
    if (!isInitialized) {
        return "Error: Process manager not initialized";
    }
    
    if (processes.empty()) {
        return "No processes running";
    }
    
    std::stringstream ss;
    ss << "PID\tName\t\tState\t\tPriority\n";
    ss << "---\t----\t\t-----\t\t--------\n";
    
    for (const auto& pair : processes) {
        const PCB& process = *(pair.second);
        
        ss << process.pid << "\t" << process.name << "\t\t";
        
        switch (process.state) {
            case PCB::NEW: ss << "NEW"; break;
            case PCB::READY: ss << "READY"; break;
            case PCB::RUNNING: ss << "RUNNING"; break;
            case PCB::WAITING: ss << "WAITING"; break;
            case PCB::TERMINATED: ss << "TERMINATED"; break;
        }
        
        ss << "\t\t" << process.priority << "\n";
    }
    
    return ss.str();
}

std::string Process::handleCommand(const std::string& command, const std::vector<std::string>& args) {
    if (!isInitialized) {
        return "Error: Process manager not initialized";
    }
    
    std::string cmd = command;
    std::transform(cmd.begin(), cmd.end(), cmd.begin(), ::tolower);
    
    if (cmd == "ps" || cmd == "proc-list") {
        return listProcesses();
    } else if (cmd == "proc-info") {
        if (args.empty()) {
            return "Error: Missing process ID";
        }
        try {
            int pid = std::stoi(args[0]);
            return getProcessInfo(pid);
        } catch (const std::exception& e) {
            return "Error: Invalid process ID";
        }
    } else if (cmd == "proc-create") {
        if (args.empty()) {
            return "Error: Missing process name";
        }
        int priority = (args.size() > 1) ? std::stoi(args[1]) : 1;
        int pid = createProcess(args[0], priority);
        return (pid != -1) ? "Process created with PID " + std::to_string(pid) : "Failed to create process";
    } else if (cmd == "kill" || cmd == "proc-terminate") {
        if (args.empty()) {
            return "Error: Missing process ID";
        }
        try {
            int pid = std::stoi(args[0]);
            return terminateProcess(pid) ? "Process terminated successfully" : "Failed to terminate process";
        } catch (const std::exception& e) {
            return "Error: Invalid process ID";
        }
    }
    
    return "Unknown process command: " + command;
}

PCB* Process::getProcess(int pid) {
    auto it = processes.find(pid);
    return (it != processes.end()) ? it->second.get() : nullptr;
}

void Process::shutdown() {
    if (!isInitialized) {
        return;
    }
    
    std::cout << "Shutting down process manager..." << std::endl;
    
    // Terminate all processes except init
    std::vector<int> pidsToTerminate;
    for (const auto& pair : processes) {
        if (pair.first != 1) {  // Skip init process
            pidsToTerminate.push_back(pair.first);
        }
    }
    
    for (int pid : pidsToTerminate) {
        terminateProcess(pid);
    }
    
    // Finally terminate init
    processes.clear();
    
    isInitialized = false;
    std::cout << "Process manager shutdown complete" << std::endl;
}
