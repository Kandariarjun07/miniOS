#!/usr/bin/env node

/**
 * Mini OS Shell
 * 
 * This is the main entry point for the Mini OS shell interface.
 * It provides a command-line interface to interact with the C++ core components.
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const { Command } = require('commander');
const path = require('path');
const fs = require('fs');

// Import shell components
const CoreInterface = require('./utils/core_interface');
const CommandHandler = require('./commands/command_handler');
const TextEditor = require('./apps/text_editor');

// ASCII art logo
const logo = `
 __  __ _       _    ___  ____  
|  \\/  (_)_ __ (_)  / _ \\/ ___| 
| |\\/| | | '_ \\| | | | | \\___ \\ 
| |  | | | | | | | | |_| |___) |
|_|  |_|_|_| |_|_|  \\___/|____/ 
                               
`;

// Parse command line arguments
const program = new Command();

program
  .version('0.1.0')
  .description('Mini OS - A lightweight CLI-based operating system')
  .option('-d, --debug', 'Enable debug mode')
  .option('-c, --core-path <path>', 'Path to the core library', '../core/build/libminios.so')
  .parse(process.argv);

const options = program.opts();

// Main function
async function main() {
  console.log(chalk.cyan(logo));
  console.log(chalk.yellow('Mini OS v0.1.0'));
  console.log(chalk.yellow('Type "help" for available commands, "exit" to quit.'));
  
  // Initialize core interface
  const coreInterface = new CoreInterface(options.corePath);
  
  try {
    // Initialize the core
    await coreInterface.initialize();
    console.log(chalk.green('Core system initialized successfully.'));
    
    // Initialize command handler
    const commandHandler = new CommandHandler(coreInterface);
    
    // Main command loop
    let running = true;
    
    while (running) {
      const { command } = await inquirer.prompt({
        type: 'input',
        name: 'command',
        message: chalk.green('mini-os>'),
        prefix: ''
      });
      
      // Skip empty commands
      if (!command.trim()) {
        continue;
      }
      
      // Parse the command
      const parts = command.trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);
      
      // Handle special commands
      if (cmd === 'exit' || cmd === 'quit') {
        running = false;
        continue;
      } else if (cmd === 'clear' || cmd === 'cls') {
        console.clear();
        console.log(chalk.cyan(logo));
        continue;
      } else if (cmd === 'edit') {
        if (args.length === 0) {
          console.log(chalk.red('Error: Missing file path. Usage: edit <path>'));
          continue;
        }
        
        const editor = new TextEditor(coreInterface);
        await editor.edit(args[0]);
        continue;
      }
      
      // Execute the command
      try {
        const result = await commandHandler.executeCommand(cmd, args);
        console.log(result);
      } catch (error) {
        console.log(chalk.red(`Error: ${error.message}`));
        if (options.debug) {
          console.error(error);
        }
      }
    }
    
    // Shutdown the core
    await coreInterface.shutdown();
    console.log(chalk.green('Core system shutdown complete.'));
    
  } catch (error) {
    console.error(chalk.red(`Fatal error: ${error.message}`));
    if (options.debug) {
      console.error(error);
    }
    process.exit(1);
  }
  
  console.log(chalk.yellow('Thank you for using Mini OS!'));
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`Unhandled error: ${error.message}`));
  if (options.debug) {
    console.error(error);
  }
  process.exit(1);
});
