#ifndef MEMORY_MANAGER_H
#define MEMORY_MANAGER_H

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <functional>

/**
 * @brief Memory block structure
 * 
 * Represents a block of memory in the system
 */
struct MemoryBlock {
    size_t address;     // Starting address of the block
    size_t size;        // Size of the block in bytes
    bool allocated;     // Whether the block is allocated or free
    int pid;            // Process ID that owns the block, or -1 if free
    
    MemoryBlock(size_t addr, size_t blockSize, bool alloc = false, int processId = -1)
        : address(addr), size(blockSize), allocated(alloc), pid(processId) {}
};

/**
 * @brief Memory manager class
 * 
 * Manages memory allocation and deallocation
 */
class MemoryManager {
public:
    /**
     * @brief Construct a new Memory Manager object
     */
    MemoryManager();
    
    /**
     * @brief Destroy the Memory Manager object
     */
    ~MemoryManager();
    
    /**
     * @brief Initialize the memory manager
     * 
     * @return true if initialization was successful
     * @return false if initialization failed
     */
    bool initialize();
    
    /**
     * @brief Allocate memory for a process
     * 
     * @param size Size of memory to allocate in bytes
     * @param pid Process ID to allocate memory for
     * @return size_t Address of allocated memory, or 0 if allocation failed
     */
    size_t allocate(size_t size, int pid);
    
    /**
     * @brief Free memory allocated to a process
     * 
     * @param address Address of memory to free
     * @return true if memory was freed successfully
     * @return false if memory freeing failed
     */
    bool free(size_t address);
    
    /**
     * @brief Free all memory allocated to a process
     * 
     * @param pid Process ID to free memory for
     * @return size_t Amount of memory freed in bytes
     */
    size_t freeProcessMemory(int pid);
    
    /**
     * @brief Get memory usage statistics
     * 
     * @return std::string Formatted memory usage statistics
     */
    std::string getMemoryStats() const;
    
    /**
     * @brief Handle a memory-related command
     * 
     * @param command Command to handle
     * @param args Command arguments
     * @return std::string Result of the command
     */
    std::string handleCommand(const std::string& command, const std::vector<std::string>& args);
    
    /**
     * @brief Shutdown the memory manager
     */
    void shutdown();

private:
    std::vector<MemoryBlock> memoryBlocks;
    size_t totalMemory;
    size_t freeMemory;
    bool isInitialized;
    
    /**
     * @brief Find a free block of memory of the specified size
     * 
     * @param size Size of memory needed in bytes
     * @return int Index of the free block, or -1 if no suitable block found
     */
    int findFreeBlock(size_t size) const;
    
    /**
     * @brief Split a memory block
     * 
     * @param index Index of the block to split
     * @param size Size of the first part after splitting
     */
    void splitBlock(int index, size_t size);
    
    /**
     * @brief Merge adjacent free blocks
     */
    void mergeBlocks();
    
    /**
     * @brief Find a memory block by its address
     * 
     * @param address Address to find
     * @return int Index of the block, or -1 if not found
     */
    int findBlockByAddress(size_t address) const;
};

#endif // MEMORY_MANAGER_H
