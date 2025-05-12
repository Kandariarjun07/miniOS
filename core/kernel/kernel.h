#ifndef KERNEL_H
#define KERNEL_H

#include <string>
#include <vector>
#include <memory>
#include <functional>

// Forward declarations
class Process;
class FileSystem;
class MemoryManager;

/**
 * @brief Main kernel class for the Mini OS
 * 
 * This class serves as the central component of the operating system,
 * coordinating between process management, memory management, and the file system.
 */
class Kernel {
public:
    /**
     * @brief Construct a new Kernel object
     */
    Kernel();
    
    /**
     * @brief Destroy the Kernel object
     */
    ~Kernel();
    
    /**
     * @brief Initialize the kernel and all subsystems
     * 
     * @return true if initialization was successful
     * @return false if initialization failed
     */
    bool initialize();
    
    /**
     * @brief Execute a command in the kernel
     * 
     * @param command The command to execute
     * @param args Arguments for the command
     * @return std::string Result of the command execution
     */
    std::string executeCommand(const std::string& command, const std::vector<std::string>& args);
    
    /**
     * @brief Get the Process Manager object
     * 
     * @return Process* Pointer to the process manager
     */
    Process* getProcessManager() const;
    
    /**
     * @brief Get the File System object
     * 
     * @return FileSystem* Pointer to the file system
     */
    FileSystem* getFileSystem() const;
    
    /**
     * @brief Get the Memory Manager object
     * 
     * @return MemoryManager* Pointer to the memory manager
     */
    MemoryManager* getMemoryManager() const;
    
    /**
     * @brief Shutdown the kernel and all subsystems
     */
    void shutdown();

private:
    std::unique_ptr<Process> processManager;
    std::unique_ptr<FileSystem> fileSystem;
    std::unique_ptr<MemoryManager> memoryManager;
    bool isRunning;
};

#endif // KERNEL_H
