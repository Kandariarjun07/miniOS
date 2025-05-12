/**
 * Core Interface
 *
 * This module provides an interface to communicate with the core components.
 * This is a JavaScript-only version that uses the simulated core.
 */

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
        // Always use the simulated core in this JavaScript-only version
        console.log('Using simulated core.');
        this.useSimulatedCore();
        this.initialized = true;
        resolve(true);
      } catch (error) {
        reject(error);
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
        // Always use the simulated core
        const result = this.simulatedCore.executeCommand(command, args);
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
        // Shutdown the simulated core
        this.simulatedCore.shutdown();
        this.initialized = false;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = CoreInterface;
