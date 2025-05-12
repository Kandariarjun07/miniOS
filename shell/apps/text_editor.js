/**
 * Text Editor
 * 
 * A simple text editor for the Mini OS.
 */

const inquirer = require('inquirer');
const chalk = require('chalk');

class TextEditor {
  /**
   * Create a new TextEditor instance
   * @param {CoreInterface} coreInterface - Interface to the core system
   */
  constructor(coreInterface) {
    this.coreInterface = coreInterface;
  }
  
  /**
   * Edit a file
   * @param {string} filePath - Path to the file to edit
   * @returns {Promise<void>}
   */
  async edit(filePath) {
    console.log(chalk.cyan(`Editing file: ${filePath}`));
    console.log(chalk.yellow('Type content and press Enter. Type :q to save and quit, :w to save, :x to quit without saving.'));
    
    // Try to read the file
    let content = '';
    try {
      content = await this.coreInterface.executeCommand('cat', [filePath]);
      
      // If the file doesn't exist, the content will be an error message
      if (content.startsWith('Error:')) {
        content = '';
      }
    } catch (error) {
      content = '';
    }
    
    // Split content into lines
    const lines = content.split('\n');
    
    // Display the current content
    this.displayContent(lines);
    
    // Edit loop
    let editing = true;
    while (editing) {
      const { input } = await inquirer.prompt({
        type: 'input',
        name: 'input',
        message: chalk.green(`${lines.length + 1}>`),
        prefix: ''
      });
      
      // Handle commands
      if (input === ':q') {
        // Save and quit
        await this.saveFile(filePath, lines.join('\n'));
        editing = false;
      } else if (input === ':w') {
        // Save
        await this.saveFile(filePath, lines.join('\n'));
      } else if (input === ':x') {
        // Quit without saving
        editing = false;
      } else if (input.startsWith(':d ')) {
        // Delete line
        const lineNumber = parseInt(input.substring(3));
        if (lineNumber > 0 && lineNumber <= lines.length) {
          lines.splice(lineNumber - 1, 1);
          this.displayContent(lines);
        } else {
          console.log(chalk.red(`Error: Line ${lineNumber} does not exist`));
        }
      } else if (input.startsWith(':e ')) {
        // Edit line
        const parts = input.substring(3).split(' ');
        const lineNumber = parseInt(parts[0]);
        const newContent = parts.slice(1).join(' ');
        
        if (lineNumber > 0 && lineNumber <= lines.length) {
          lines[lineNumber - 1] = newContent;
          this.displayContent(lines);
        } else {
          console.log(chalk.red(`Error: Line ${lineNumber} does not exist`));
        }
      } else if (input === ':h') {
        // Show help
        this.showHelp();
      } else {
        // Add a new line
        lines.push(input);
      }
    }
    
    console.log(chalk.green('Editor closed'));
  }
  
  /**
   * Display the content of the file
   * @param {string[]} lines - Lines of the file
   */
  displayContent(lines) {
    console.log(chalk.cyan('\n--- File Content ---'));
    
    if (lines.length === 0) {
      console.log(chalk.yellow('(Empty file)'));
    } else {
      for (let i = 0; i < lines.length; i++) {
        console.log(chalk.green(`${i + 1}> `) + lines[i]);
      }
    }
    
    console.log(chalk.cyan('-------------------\n'));
  }
  
  /**
   * Save the file
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to save
   * @returns {Promise<void>}
   */
  async saveFile(filePath, content) {
    try {
      // First try to create the file if it doesn't exist
      await this.coreInterface.executeCommand('touch', [filePath]);
      
      // Then write the content
      // In a real implementation, we would have a 'write' command in the core
      // For now, we'll simulate it by creating the file with the content
      await this.coreInterface.executeCommand('touch', [filePath, content]);
      
      console.log(chalk.green(`File saved: ${filePath}`));
    } catch (error) {
      console.log(chalk.red(`Error saving file: ${error.message}`));
    }
  }
  
  /**
   * Show editor help
   */
  showHelp() {
    console.log(chalk.cyan('\n--- Editor Help ---'));
    console.log(':q           - Save and quit');
    console.log(':w           - Save');
    console.log(':x           - Quit without saving');
    console.log(':d <line>    - Delete line');
    console.log(':e <line> <text> - Edit line');
    console.log(':h           - Show this help');
    console.log(chalk.cyan('-------------------\n'));
  }
}

module.exports = TextEditor;
