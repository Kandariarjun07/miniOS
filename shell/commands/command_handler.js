/**
 * Command Handler
 * 
 * This module handles command execution in the shell.
 */

const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class CommandHandler {
  /**
   * Create a new CommandHandler instance
   * @param {CoreInterface} coreInterface - Interface to the core system
   */
  constructor(coreInterface) {
    this.coreInterface = coreInterface;
    this.commands = this.loadCommands();
  }
  
  /**
   * Load all available commands
   * @returns {Object} - Map of command names to handler functions
   */
  loadCommands() {
    const commands = {
      // Built-in commands
      'help': this.helpCommand.bind(this),
      
      // Pass-through commands (handled by the core)
      'info': this.passThroughCommand.bind(this),
      'shutdown': this.passThroughCommand.bind(this),
      'restart': this.passThroughCommand.bind(this),
      
      // File system commands
      'ls': this.passThroughCommand.bind(this),
      'dir': this.passThroughCommand.bind(this),
      'cd': this.passThroughCommand.bind(this),
      'pwd': this.passThroughCommand.bind(this),
      'mkdir': this.passThroughCommand.bind(this),
      'touch': this.passThroughCommand.bind(this),
      'rm': this.passThroughCommand.bind(this),
      'del': this.passThroughCommand.bind(this),
      'cat': this.passThroughCommand.bind(this),
      'type': this.passThroughCommand.bind(this),
      'fs-info': this.passThroughCommand.bind(this),
      
      // Process commands
      'ps': this.passThroughCommand.bind(this),
      'proc-info': this.passThroughCommand.bind(this),
      'proc-create': this.passThroughCommand.bind(this),
      'kill': this.passThroughCommand.bind(this),
      
      // Memory commands
      'mem-stats': this.passThroughCommand.bind(this),
      'mem-info': this.passThroughCommand.bind(this),
      'mem-alloc': this.passThroughCommand.bind(this),
      'mem-free': this.passThroughCommand.bind(this),
      'mem-free-proc': this.passThroughCommand.bind(this)
    };
    
    return commands;
  }
  
  /**
   * Execute a command
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @returns {Promise<string>} - Result of the command
   */
  async executeCommand(command, args) {
    // Check if the command exists
    if (this.commands[command]) {
      return this.commands[command](command, args);
    }
    
    // If not, try to execute it through the core
    return this.passThroughCommand(command, args);
  }
  
  /**
   * Pass a command through to the core
   * @param {string} command - Command to execute
   * @param {string[]} args - Command arguments
   * @returns {Promise<string>} - Result of the command
   */
  async passThroughCommand(command, args) {
    return this.coreInterface.executeCommand(command, args);
  }
  
  /**
   * Help command handler
   * @param {string} command - Command name
   * @param {string[]} args - Command arguments
   * @returns {Promise<string>} - Help text
   */
  async helpCommand(command, args) {
    let helpText = chalk.cyan('Available commands:\n\n');
    
    helpText += chalk.yellow('General commands:\n');
    helpText += '  help                - Show this help message\n';
    helpText += '  exit, quit          - Exit the program\n';
    helpText += '  clear, cls          - Clear the screen\n';
    helpText += '  info                - Show kernel information\n';
    helpText += '  shutdown            - Shutdown the kernel\n';
    helpText += '  restart             - Restart the kernel\n\n';
    
    helpText += chalk.yellow('File system commands:\n');
    helpText += '  ls, dir [path]      - List directory contents\n';
    helpText += '  cd <path>           - Change directory\n';
    helpText += '  pwd                 - Print working directory\n';
    helpText += '  mkdir <path>        - Create directory\n';
    helpText += '  touch <path>        - Create file\n';
    helpText += '  cat, type <path>    - Display file contents\n';
    helpText += '  rm, del <path>      - Remove file or directory\n';
    helpText += '  fs-info <path>      - Show file system node info\n';
    helpText += '  edit <path>         - Edit a file\n\n';
    
    helpText += chalk.yellow('Process commands:\n');
    helpText += '  ps                  - List processes\n';
    helpText += '  proc-info <pid>     - Show process information\n';
    helpText += '  proc-create <name>  - Create a new process\n';
    helpText += '  kill <pid>          - Terminate a process\n\n';
    
    helpText += chalk.yellow('Memory commands:\n');
    helpText += '  mem-stats, mem-info - Show memory statistics\n';
    helpText += '  mem-alloc <size> <pid> - Allocate memory\n';
    helpText += '  mem-free <address>  - Free memory\n';
    helpText += '  mem-free-proc <pid> - Free all memory for a process\n';
    
    return helpText;
  }
}

module.exports = CommandHandler;
