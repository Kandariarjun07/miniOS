/**
 * Simulated Core
 * 
 * This module provides a simulated version of the C++ core components
 * for development and testing purposes.
 */

class SimulatedCore {
  constructor() {
    this.initialized = false;
    this.processes = new Map();
    this.fileSystem = new Map();
    this.memory = new Map();
    this.currentDirectory = '/';
  }
  
  /**
   * Initialize the simulated core
   * @returns {boolean} - True if initialization was successful
   */
  initialize() {
    console.log('Initializing simulated core...');
    
    // Initialize process manager
    this.processes.set(1, {
      pid: 1,
      name: 'init',
      priority: 0,
      state: 'RUNNING',
      memoryAllocated: 0
    });
    
    this.nextPid = 2;
    
    // Initialize file system
    this.fileSystem.set('/', {
      type: 'directory',
      name: '/',
      children: new Set(['bin', 'home', 'tmp'])
    });
    
    this.fileSystem.set('/bin', {
      type: 'directory',
      name: 'bin',
      children: new Set()
    });
    
    this.fileSystem.set('/home', {
      type: 'directory',
      name: 'home',
      children: new Set()
    });
    
    this.fileSystem.set('/tmp', {
      type: 'directory',
      name: 'tmp',
      children: new Set()
    });
    
    // Initialize memory manager
    this.totalMemory = 1024 * 1024;  // 1 MB
    this.freeMemory = this.totalMemory;
    this.nextMemoryAddress = 0;
    
    this.initialized = true;
    console.log('Simulated core initialized successfully');
    
    return true;
  }
  
  /**
   * Execute a command in the simulated core
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @returns {string} - Result of the command
   */
  executeCommand(command, args) {
    if (!this.initialized) {
      return 'Error: Simulated core not initialized';
    }
    
    const cmd = command.toLowerCase();
    
    // Handle basic kernel commands
    if (cmd === 'info') {
      return 'Mini OS Simulated Core v0.1.0';
    } else if (cmd === 'shutdown') {
      this.shutdown();
      return 'Simulated core shutdown initiated';
    } else if (cmd === 'restart') {
      this.shutdown();
      this.initialize();
      return 'Simulated core restarted successfully';
    }
    
    // Handle file system commands
    if (cmd === 'ls' || cmd === 'dir') {
      return this.listDirectory(args[0] || this.currentDirectory);
    } else if (cmd === 'cd') {
      return this.changeDirectory(args[0] || '/');
    } else if (cmd === 'pwd') {
      return this.currentDirectory;
    } else if (cmd === 'mkdir') {
      return this.createDirectory(args[0]);
    } else if (cmd === 'touch') {
      return this.createFile(args[0], args[1] || '');
    } else if (cmd === 'rm' || cmd === 'del') {
      return this.deleteNode(args[0]);
    } else if (cmd === 'cat' || cmd === 'type') {
      return this.readFile(args[0]);
    } else if (cmd === 'fs-info') {
      return this.getNodeInfo(args[0] || this.currentDirectory);
    }
    
    // Handle process commands
    if (cmd === 'ps') {
      return this.listProcesses();
    } else if (cmd === 'proc-info') {
      return this.getProcessInfo(parseInt(args[0]));
    } else if (cmd === 'proc-create') {
      return this.createProcess(args[0], parseInt(args[1]) || 1);
    } else if (cmd === 'kill') {
      return this.terminateProcess(parseInt(args[0]));
    }
    
    // Handle memory commands
    if (cmd === 'mem-stats' || cmd === 'mem-info') {
      return this.getMemoryStats();
    } else if (cmd === 'mem-alloc') {
      return this.allocateMemory(parseInt(args[0]), parseInt(args[1]));
    } else if (cmd === 'mem-free') {
      return this.freeMemory(parseInt(args[0]));
    } else if (cmd === 'mem-free-proc') {
      return this.freeProcessMemory(parseInt(args[0]));
    }
    
    return `Unknown command: ${command}`;
  }
  
  /**
   * Shutdown the simulated core
   */
  shutdown() {
    if (!this.initialized) {
      return;
    }
    
    console.log('Shutting down simulated core...');
    
    // Clear all data
    this.processes.clear();
    this.fileSystem.clear();
    this.memory.clear();
    
    this.initialized = false;
    console.log('Simulated core shutdown complete');
  }
  
  // File system operations
  
  /**
   * List the contents of a directory
   * @param {string} path - Path to the directory
   * @returns {string} - Formatted list of directory contents
   */
  listDirectory(path) {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.fileSystem.has(normalizedPath)) {
      return `Error: Directory not found: ${normalizedPath}`;
    }
    
    const node = this.fileSystem.get(normalizedPath);
    
    if (node.type !== 'directory') {
      return `Error: Not a directory: ${normalizedPath}`;
    }
    
    if (node.children.size === 0) {
      return 'Directory is empty';
    }
    
    let result = `Contents of ${normalizedPath}:\n`;
    
    // Sort children alphabetically
    const sortedChildren = Array.from(node.children).sort();
    
    // List directories first, then files
    for (const childName of sortedChildren) {
      const childPath = this.joinPaths(normalizedPath, childName);
      const child = this.fileSystem.get(childPath);
      
      if (child && child.type === 'directory') {
        result += `d ${childName}/\n`;
      }
    }
    
    for (const childName of sortedChildren) {
      const childPath = this.joinPaths(normalizedPath, childName);
      const child = this.fileSystem.get(childPath);
      
      if (child && child.type === 'file') {
        result += `f ${childName} (${child.content.length} bytes)\n`;
      }
    }
    
    return result;
  }
  
  /**
   * Change the current directory
   * @param {string} path - Path to change to
   * @returns {string} - Result message
   */
  changeDirectory(path) {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.fileSystem.has(normalizedPath)) {
      return `Error: Directory not found: ${normalizedPath}`;
    }
    
    const node = this.fileSystem.get(normalizedPath);
    
    if (node.type !== 'directory') {
      return `Error: Not a directory: ${normalizedPath}`;
    }
    
    this.currentDirectory = normalizedPath;
    return `Changed directory to ${normalizedPath}`;
  }
  
  /**
   * Create a directory
   * @param {string} path - Path to create
   * @returns {string} - Result message
   */
  createDirectory(path) {
    if (!path) {
      return 'Error: Missing directory path';
    }
    
    const normalizedPath = this.normalizePath(path);
    
    if (this.fileSystem.has(normalizedPath)) {
      return `Directory already exists: ${normalizedPath}`;
    }
    
    // Get parent directory
    const lastSlash = normalizedPath.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : normalizedPath.substring(0, lastSlash);
    const dirName = normalizedPath.substring(lastSlash + 1);
    
    if (!this.fileSystem.has(parentPath)) {
      return `Error: Parent directory not found: ${parentPath}`;
    }
    
    const parent = this.fileSystem.get(parentPath);
    
    if (parent.type !== 'directory') {
      return `Error: Parent is not a directory: ${parentPath}`;
    }
    
    // Create the directory
    this.fileSystem.set(normalizedPath, {
      type: 'directory',
      name: dirName,
      children: new Set()
    });
    
    // Update parent
    parent.children.add(dirName);
    
    return `Directory created: ${normalizedPath}`;
  }
  
  /**
   * Create a file
   * @param {string} path - Path to create
   * @param {string} content - Initial content
   * @returns {string} - Result message
   */
  createFile(path, content = '') {
    if (!path) {
      return 'Error: Missing file path';
    }
    
    const normalizedPath = this.normalizePath(path);
    
    if (this.fileSystem.has(normalizedPath)) {
      return `File already exists: ${normalizedPath}`;
    }
    
    // Get parent directory
    const lastSlash = normalizedPath.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : normalizedPath.substring(0, lastSlash);
    const fileName = normalizedPath.substring(lastSlash + 1);
    
    if (!this.fileSystem.has(parentPath)) {
      return `Error: Parent directory not found: ${parentPath}`;
    }
    
    const parent = this.fileSystem.get(parentPath);
    
    if (parent.type !== 'directory') {
      return `Error: Parent is not a directory: ${parentPath}`;
    }
    
    // Create the file
    this.fileSystem.set(normalizedPath, {
      type: 'file',
      name: fileName,
      content: content
    });
    
    // Update parent
    parent.children.add(fileName);
    
    return `File created: ${normalizedPath}`;
  }
  
  /**
   * Delete a file or directory
   * @param {string} path - Path to delete
   * @returns {string} - Result message
   */
  deleteNode(path) {
    if (!path) {
      return 'Error: Missing path';
    }
    
    const normalizedPath = this.normalizePath(path);
    
    if (normalizedPath === '/') {
      return 'Error: Cannot delete root directory';
    }
    
    if (!this.fileSystem.has(normalizedPath)) {
      return `Error: Path not found: ${normalizedPath}`;
    }
    
    // Get parent directory
    const lastSlash = normalizedPath.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : normalizedPath.substring(0, lastSlash);
    const nodeName = normalizedPath.substring(lastSlash + 1);
    
    const parent = this.fileSystem.get(parentPath);
    
    // Delete the node
    this.fileSystem.delete(normalizedPath);
    
    // Update parent
    parent.children.delete(nodeName);
    
    return `Deleted: ${normalizedPath}`;
  }
  
  /**
   * Read a file
   * @param {string} path - Path to read
   * @returns {string} - File content or error message
   */
  readFile(path) {
    if (!path) {
      return 'Error: Missing file path';
    }
    
    const normalizedPath = this.normalizePath(path);
    
    if (!this.fileSystem.has(normalizedPath)) {
      return `Error: File not found: ${normalizedPath}`;
    }
    
    const node = this.fileSystem.get(normalizedPath);
    
    if (node.type !== 'file') {
      return `Error: Not a file: ${normalizedPath}`;
    }
    
    return node.content;
  }
  
  /**
   * Get information about a file system node
   * @param {string} path - Path to the node
   * @returns {string} - Formatted node information
   */
  getNodeInfo(path) {
    const normalizedPath = this.normalizePath(path);
    
    if (!this.fileSystem.has(normalizedPath)) {
      return `Error: Path not found: ${normalizedPath}`;
    }
    
    const node = this.fileSystem.get(normalizedPath);
    
    if (node.type === 'directory') {
      return `Directory: ${normalizedPath}\nChildren: ${node.children.size}`;
    } else {
      return `File: ${normalizedPath}\nSize: ${node.content.length} bytes`;
    }
  }
  
  /**
   * Normalize a path (resolve . and .. components)
   * @param {string} path - Path to normalize
   * @returns {string} - Normalized path
   */
  normalizePath(path) {
    if (!path) {
      return this.currentDirectory;
    }
    
    // Handle absolute vs. relative path
    let normalizedPath = path.startsWith('/') ? path : this.joinPaths(this.currentDirectory, path);
    
    // Split path into components
    const components = normalizedPath.split('/').filter(c => c !== '');
    const result = [];
    
    for (const component of components) {
      if (component === '.') {
        continue;
      } else if (component === '..') {
        if (result.length > 0) {
          result.pop();
        }
      } else {
        result.push(component);
      }
    }
    
    return '/' + result.join('/');
  }
  
  /**
   * Join two paths
   * @param {string} base - Base path
   * @param {string} relative - Relative path
   * @returns {string} - Joined path
   */
  joinPaths(base, relative) {
    if (relative.startsWith('/')) {
      return relative;
    }
    
    if (base === '/') {
      return '/' + relative;
    }
    
    return base + '/' + relative;
  }
  
  // Process operations
  
  /**
   * List all processes
   * @returns {string} - Formatted list of processes
   */
  listProcesses() {
    if (this.processes.size === 0) {
      return 'No processes running';
    }
    
    let result = 'PID\tName\t\tState\t\tPriority\n';
    result += '---\t----\t\t-----\t\t--------\n';
    
    for (const [pid, process] of this.processes) {
      result += `${pid}\t${process.name}\t\t${process.state}\t\t${process.priority}\n`;
    }
    
    return result;
  }
  
  /**
   * Get information about a process
   * @param {number} pid - Process ID
   * @returns {string} - Formatted process information
   */
  getProcessInfo(pid) {
    if (!this.processes.has(pid)) {
      return `Error: Process with PID ${pid} not found`;
    }
    
    const process = this.processes.get(pid);
    
    let result = `PID: ${process.pid}\n`;
    result += `Name: ${process.name}\n`;
    result += `Priority: ${process.priority}\n`;
    result += `State: ${process.state}\n`;
    result += `Memory allocated: ${process.memoryAllocated} bytes`;
    
    return result;
  }
  
  /**
   * Create a new process
   * @param {string} name - Process name
   * @param {number} priority - Process priority
   * @returns {string} - Result message
   */
  createProcess(name, priority = 1) {
    if (!name) {
      return 'Error: Missing process name';
    }
    
    const pid = this.nextPid++;
    
    this.processes.set(pid, {
      pid,
      name,
      priority,
      state: 'READY',
      memoryAllocated: 0
    });
    
    return `Process created with PID ${pid}`;
  }
  
  /**
   * Terminate a process
   * @param {number} pid - Process ID
   * @returns {string} - Result message
   */
  terminateProcess(pid) {
    if (pid === 1) {
      return 'Error: Cannot terminate the init process';
    }
    
    if (!this.processes.has(pid)) {
      return `Error: Process with PID ${pid} not found`;
    }
    
    // Free process memory
    this.freeProcessMemory(pid);
    
    // Remove the process
    this.processes.delete(pid);
    
    return `Process terminated successfully`;
  }
  
  // Memory operations
  
  /**
   * Get memory usage statistics
   * @returns {string} - Formatted memory statistics
   */
  getMemoryStats() {
    const usedMemory = this.totalMemory - this.freeMemory;
    const usedPercentage = (usedMemory / this.totalMemory * 100).toFixed(2);
    const freePercentage = (this.freeMemory / this.totalMemory * 100).toFixed(2);
    
    let result = 'Memory Statistics:\n';
    result += `Total memory: ${this.totalMemory} bytes\n`;
    result += `Free memory: ${this.freeMemory} bytes (${freePercentage}%)\n`;
    result += `Used memory: ${usedMemory} bytes (${usedPercentage}%)\n`;
    result += `Memory blocks: ${this.memory.size}`;
    
    return result;
  }
  
  /**
   * Allocate memory for a process
   * @param {number} size - Size to allocate
   * @param {number} pid - Process ID
   * @returns {string} - Result message
   */
  allocateMemory(size, pid) {
    if (!size) {
      return 'Error: Missing size';
    }
    
    if (!pid) {
      return 'Error: Missing process ID';
    }
    
    if (!this.processes.has(pid)) {
      return `Error: Process with PID ${pid} not found`;
    }
    
    if (size > this.freeMemory) {
      return 'Error: Not enough memory available';
    }
    
    const address = this.nextMemoryAddress;
    this.nextMemoryAddress += size;
    
    this.memory.set(address, {
      address,
      size,
      pid
    });
    
    this.freeMemory -= size;
    
    // Update process memory allocation
    const process = this.processes.get(pid);
    process.memoryAllocated += size;
    
    return `Memory allocated at address ${address}`;
  }
  
  /**
   * Free memory
   * @param {number} address - Memory address
   * @returns {string} - Result message
   */
  freeMemory(address) {
    if (!this.memory.has(address)) {
      return `Error: No memory block found at address ${address}`;
    }
    
    const block = this.memory.get(address);
    
    // Update process memory allocation
    if (this.processes.has(block.pid)) {
      const process = this.processes.get(block.pid);
      process.memoryAllocated -= block.size;
    }
    
    // Free the memory
    this.freeMemory += block.size;
    this.memory.delete(address);
    
    return 'Memory freed successfully';
  }
  
  /**
   * Free all memory allocated to a process
   * @param {number} pid - Process ID
   * @returns {string} - Result message
   */
  freeProcessMemory(pid) {
    if (!this.processes.has(pid)) {
      return `Error: Process with PID ${pid} not found`;
    }
    
    let freedMemory = 0;
    const addressesToFree = [];
    
    // Find all memory blocks allocated to the process
    for (const [address, block] of this.memory) {
      if (block.pid === pid) {
        freedMemory += block.size;
        addressesToFree.push(address);
      }
    }
    
    // Free the memory blocks
    for (const address of addressesToFree) {
      this.memory.delete(address);
    }
    
    // Update process memory allocation
    const process = this.processes.get(pid);
    process.memoryAllocated = 0;
    
    // Update free memory
    this.freeMemory += freedMemory;
    
    return `Freed ${freedMemory} bytes for process ${pid}`;
  }
}

module.exports = SimulatedCore;
