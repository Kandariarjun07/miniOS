#include "memory_manager.h"
#include <iostream>
#include <sstream>
#include <algorithm>
#include <iomanip>

// Default memory size: 1 MB
constexpr size_t DEFAULT_MEMORY_SIZE = 1024 * 1024;

MemoryManager::MemoryManager() 
    : totalMemory(DEFAULT_MEMORY_SIZE), freeMemory(DEFAULT_MEMORY_SIZE), isInitialized(false) {
    std::cout << "Memory manager constructor called" << std::endl;
}

MemoryManager::~MemoryManager() {
    if (isInitialized) {
        shutdown();
    }
    std::cout << "Memory manager destructor called" << std::endl;
}

bool MemoryManager::initialize() {
    std::cout << "Initializing memory manager..." << std::endl;
    
    try {
        // Create a single free block representing all memory
        memoryBlocks.clear();
        memoryBlocks.emplace_back(0, totalMemory, false, -1);
        
        freeMemory = totalMemory;
        isInitialized = true;
        
        std::cout << "Memory manager initialized successfully with " 
                  << totalMemory << " bytes of memory" << std::endl;
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Exception during memory manager initialization: " << e.what() << std::endl;
        return false;
    }
}

size_t MemoryManager::allocate(size_t size, int pid) {
    if (!isInitialized) {
        std::cerr << "Memory manager not initialized" << std::endl;
        return 0;
    }
    
    if (size == 0) {
        std::cerr << "Cannot allocate 0 bytes" << std::endl;
        return 0;
    }
    
    if (size > freeMemory) {
        std::cerr << "Not enough memory available" << std::endl;
        return 0;
    }
    
    // Find a suitable free block
    int blockIndex = findFreeBlock(size);
    if (blockIndex == -1) {
        std::cerr << "No suitable memory block found" << std::endl;
        return 0;
    }
    
    MemoryBlock& block = memoryBlocks[blockIndex];
    
    // If the block is larger than needed, split it
    if (block.size > size) {
        splitBlock(blockIndex, size);
    }
    
    // Allocate the block
    block.allocated = true;
    block.pid = pid;
    
    freeMemory -= block.size;
    
    std::cout << "Allocated " << block.size << " bytes at address " 
              << block.address << " for process " << pid << std::endl;
    
    return block.address;
}

bool MemoryManager::free(size_t address) {
    if (!isInitialized) {
        std::cerr << "Memory manager not initialized" << std::endl;
        return false;
    }
    
    // Find the block with the given address
    int blockIndex = findBlockByAddress(address);
    if (blockIndex == -1) {
        std::cerr << "No memory block found at address " << address << std::endl;
        return false;
    }
    
    MemoryBlock& block = memoryBlocks[blockIndex];
    
    // Check if the block is allocated
    if (!block.allocated) {
        std::cerr << "Memory block at address " << address << " is already free" << std::endl;
        return false;
    }
    
    // Free the block
    block.allocated = false;
    block.pid = -1;
    
    freeMemory += block.size;
    
    std::cout << "Freed " << block.size << " bytes at address " << address << std::endl;
    
    // Merge adjacent free blocks
    mergeBlocks();
    
    return true;
}

size_t MemoryManager::freeProcessMemory(int pid) {
    if (!isInitialized) {
        std::cerr << "Memory manager not initialized" << std::endl;
        return 0;
    }
    
    size_t freedMemory = 0;
    
    // Find all blocks allocated to the process
    for (auto& block : memoryBlocks) {
        if (block.allocated && block.pid == pid) {
            block.allocated = false;
            block.pid = -1;
            
            freedMemory += block.size;
            freeMemory += block.size;
            
            std::cout << "Freed " << block.size << " bytes at address " 
                      << block.address << " for process " << pid << std::endl;
        }
    }
    
    // Merge adjacent free blocks
    mergeBlocks();
    
    return freedMemory;
}

std::string MemoryManager::getMemoryStats() const {
    if (!isInitialized) {
        return "Error: Memory manager not initialized";
    }
    
    std::stringstream ss;
    ss << "Memory Statistics:\n";
    ss << "Total memory: " << totalMemory << " bytes\n";
    ss << "Free memory: " << freeMemory << " bytes (" 
       << std::fixed << std::setprecision(2) 
       << (static_cast<double>(freeMemory) / totalMemory * 100) << "%)\n";
    ss << "Used memory: " << (totalMemory - freeMemory) << " bytes ("
       << std::fixed << std::setprecision(2)
       << (static_cast<double>(totalMemory - freeMemory) / totalMemory * 100) << "%)\n";
    ss << "Memory blocks: " << memoryBlocks.size() << "\n\n";
    
    ss << "Block details:\n";
    ss << "Address\t\tSize\t\tStatus\t\tProcess\n";
    ss << "-------\t\t----\t\t------\t\t-------\n";
    
    for (const auto& block : memoryBlocks) {
        ss << block.address << "\t\t" << block.size << "\t\t"
           << (block.allocated ? "Allocated" : "Free") << "\t\t"
           << (block.allocated ? std::to_string(block.pid) : "-") << "\n";
    }
    
    return ss.str();
}

std::string MemoryManager::handleCommand(const std::string& command, const std::vector<std::string>& args) {
    if (!isInitialized) {
        return "Error: Memory manager not initialized";
    }
    
    std::string cmd = command;
    std::transform(cmd.begin(), cmd.end(), cmd.begin(), ::tolower);
    
    if (cmd == "mem-stats" || cmd == "mem-info") {
        return getMemoryStats();
    } else if (cmd == "mem-alloc") {
        if (args.size() < 2) {
            return "Error: Missing arguments. Usage: mem-alloc <size> <pid>";
        }
        
        try {
            size_t size = std::stoull(args[0]);
            int pid = std::stoi(args[1]);
            
            size_t address = allocate(size, pid);
            return (address != 0) ? 
                   "Memory allocated at address " + std::to_string(address) : 
                   "Failed to allocate memory";
        } catch (const std::exception& e) {
            return "Error: Invalid arguments";
        }
    } else if (cmd == "mem-free") {
        if (args.empty()) {
            return "Error: Missing address. Usage: mem-free <address>";
        }
        
        try {
            size_t address = std::stoull(args[0]);
            return free(address) ? "Memory freed successfully" : "Failed to free memory";
        } catch (const std::exception& e) {
            return "Error: Invalid address";
        }
    } else if (cmd == "mem-free-proc") {
        if (args.empty()) {
            return "Error: Missing process ID. Usage: mem-free-proc <pid>";
        }
        
        try {
            int pid = std::stoi(args[0]);
            size_t freedMemory = freeProcessMemory(pid);
            
            return "Freed " + std::to_string(freedMemory) + " bytes for process " + std::to_string(pid);
        } catch (const std::exception& e) {
            return "Error: Invalid process ID";
        }
    }
    
    return "Unknown memory command: " + command;
}

void MemoryManager::shutdown() {
    if (!isInitialized) {
        return;
    }
    
    std::cout << "Shutting down memory manager..." << std::endl;
    
    // Clear all memory blocks
    memoryBlocks.clear();
    freeMemory = 0;
    
    isInitialized = false;
    std::cout << "Memory manager shutdown complete" << std::endl;
}

int MemoryManager::findFreeBlock(size_t size) const {
    // First-fit algorithm: return the first block that is large enough
    for (size_t i = 0; i < memoryBlocks.size(); ++i) {
        if (!memoryBlocks[i].allocated && memoryBlocks[i].size >= size) {
            return static_cast<int>(i);
        }
    }
    
    return -1;
}

void MemoryManager::splitBlock(int index, size_t size) {
    MemoryBlock& block = memoryBlocks[index];
    
    // Only split if the remaining size is significant
    if (block.size - size < 64) {
        return;  // Not worth splitting for small fragments
    }
    
    // Create a new block for the remaining memory
    size_t newAddress = block.address + size;
    size_t newSize = block.size - size;
    
    // Resize the current block
    block.size = size;
    
    // Insert the new block after the current one
    memoryBlocks.insert(memoryBlocks.begin() + index + 1, 
                        MemoryBlock(newAddress, newSize, false, -1));
}

void MemoryManager::mergeBlocks() {
    bool merged;
    
    do {
        merged = false;
        
        for (size_t i = 0; i < memoryBlocks.size() - 1; ++i) {
            MemoryBlock& current = memoryBlocks[i];
            MemoryBlock& next = memoryBlocks[i + 1];
            
            // If both blocks are free and adjacent, merge them
            if (!current.allocated && !next.allocated && 
                current.address + current.size == next.address) {
                
                current.size += next.size;
                memoryBlocks.erase(memoryBlocks.begin() + i + 1);
                
                merged = true;
                break;  // Start over since the vector has been modified
            }
        }
    } while (merged);
}

int MemoryManager::findBlockByAddress(size_t address) const {
    for (size_t i = 0; i < memoryBlocks.size(); ++i) {
        if (memoryBlocks[i].address == address) {
            return static_cast<int>(i);
        }
    }
    
    return -1;
}
