#ifndef PROCESS_H
#define PROCESS_H

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <functional>

/**
 * @brief Process Control Block (PCB) structure
 * 
 * Represents the metadata for a process in the system
 */
struct PCB {
    int pid;                    // Process ID
    std::string name;           // Process name
    int priority;               // Process priority
    enum State {                // Process state
        NEW,
        READY,
        RUNNING,
        WAITING,
        TERMINATED
    } state;
    size_t memoryAllocated;     // Memory allocated to the process
    
    PCB(int id, const std::string& processName, int processPriority = 1)
        : pid(id), name(processName), priority(processPriority), 
          state(NEW), memoryAllocated(0) {}
};

/**
 * @brief Process management class
 * 
 * Handles process creation, scheduling, and termination
 */
class Process {
public:
    /**
     * @brief Construct a new Process Manager object
     */
    Process();
    
    /**
     * @brief Destroy the Process Manager object
     */
    ~Process();
    
    /**
     * @brief Initialize the process manager
     * 
     * @return true if initialization was successful
     * @return false if initialization failed
     */
    bool initialize();
    
    /**
     * @brief Create a new process
     * 
     * @param name Process name
     * @param priority Process priority
     * @return int Process ID of the created process, or -1 if creation failed
     */
    int createProcess(const std::string& name, int priority = 1);
    
    /**
     * @brief Terminate a process
     * 
     * @param pid Process ID to terminate
     * @return true if process was terminated successfully
     * @return false if process termination failed
     */
    bool terminateProcess(int pid);
    
    /**
     * @brief Get information about a process
     * 
     * @param pid Process ID
     * @return std::string Information about the process
     */
    std::string getProcessInfo(int pid) const;
    
    /**
     * @brief List all processes
     * 
     * @return std::string Formatted list of all processes
     */
    std::string listProcesses() const;
    
    /**
     * @brief Handle a process-related command
     * 
     * @param command Command to handle
     * @param args Command arguments
     * @return std::string Result of the command
     */
    std::string handleCommand(const std::string& command, const std::vector<std::string>& args);
    
    /**
     * @brief Shutdown the process manager
     */
    void shutdown();

private:
    std::map<int, std::unique_ptr<PCB>> processes;
    int nextPid;
    bool isInitialized;
    
    /**
     * @brief Get a process by its ID
     * 
     * @param pid Process ID
     * @return PCB* Pointer to the process, or nullptr if not found
     */
    PCB* getProcess(int pid);
};

#endif // PROCESS_H
