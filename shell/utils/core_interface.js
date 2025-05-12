/**
 * Core Interface
 * 
 * This module provides an interface to communicate with the C++ core components
 * using the Foreign Function Interface (FFI).
 */

const ffi = require('ffi-napi');
const ref = require('ref-napi');
const path = require('path');
const fs = require('fs');

class CoreInterface {
  /**
   * Create a new CoreInterface instance
   * @param {string} corePath - Path to the core library
   */
  constructor(corePath) {
    this.corePath = corePath;
    this.lib = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the core interface
   * @returns {Promise<boolean>} - True if initialization was successful
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        // Check if the core library exists
        if (!fs.existsSync(this.corePath)) {
          // If not, try to use a simulated core
          console.log('Core library not found. Using simulated core.');
          this.useSimulatedCore();
          this.initialized = true;
          resolve(true);
          return;
        }
        
        // Load the core library
        this.lib = ffi.Library(this.corePath, {
          'kernel_create': ['pointer', []],
          'kernel_destroy': ['void', ['pointer']],
          'kernel_initialize': ['bool', ['pointer']],
          'kernel_shutdown': ['void', ['pointer']],
          'kernel_execute_command': ['string', ['pointer', 'string', 'pointer', 'int']]
        });
        
        // Create a kernel instance
        this.kernel = this.lib.kernel_create();
        
        if (this.kernel.isNull()) {
          reject(new Error('Failed to create kernel instance'));
          return;
        }
        
        // Initialize the kernel
        const result = this.lib.kernel_initialize(this.kernel);
        
        if (!result) {
          reject(new Error('Failed to initialize kernel'));
          return;
        }
        
        this.initialized = true;
        resolve(true);
      } catch (error) {
        console.log('Error loading core library. Using simulated core.');
        this.useSimulatedCore();
        this.initialized = true;
        resolve(true);
      }
    });
  }
  
  /**
   * Use a simulated core instead of the C++ library
   * This is useful for development and testing
   */
  useSimulatedCore() {
    // Import the simulated core
    const SimulatedCore = require('./simulated_core');
    this.simulatedCore = new SimulatedCore();
    this.simulatedCore.initialize();
  }
  
  /**
   * Execute a command in the core
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @returns {Promise<string>} - Result of the command
   */
  async executeCommand(command, args) {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        reject(new Error('Core interface not initialized'));
        return;
      }
      
      try {
        let result;
        
        if (this.simulatedCore) {
          // Use the simulated core
          result = this.simulatedCore.executeCommand(command, args);
        } else {
          // Use the C++ core
          // Convert args to a C array
          const argsArray = new Buffer(args.length * ref.sizeof.pointer);
          
          for (let i = 0; i < args.length; i++) {
            const argBuffer = Buffer.from(args[i] + '\0');
            ref.writePointer(argsArray, i * ref.sizeof.pointer, argBuffer);
          }
          
          result = this.lib.kernel_execute_command(
            this.kernel,
            command,
            argsArray,
            args.length
          );
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Shutdown the core interface
   * @returns {Promise<void>}
   */
  async shutdown() {
    return new Promise((resolve, reject) => {
      if (!this.initialized) {
        resolve();
        return;
      }
      
      try {
        if (this.simulatedCore) {
          // Shutdown the simulated core
          this.simulatedCore.shutdown();
        } else {
          // Shutdown the C++ core
          this.lib.kernel_shutdown(this.kernel);
          this.lib.kernel_destroy(this.kernel);
        }
        
        this.initialized = false;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = CoreInterface;
