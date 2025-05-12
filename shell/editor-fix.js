/**
 * Interactive Text Editor for Mini OS
 *
 * This module provides a Vim-like text editor with commands like :w, :q, and :x.
 */

const readline = require('readline');
const fs = require('fs');

/**
 * Start the editor for a file
 * @param {string} filePath - Path to the file to edit
 * @param {Function} callback - Function to call when editor is closed
 */
function editFile(filePath, callback) {
  // Check if file exists
  let content = '';
  let fileExists = false;

  if (fs.existsSync(filePath)) {
    fileExists = true;
    try {
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        console.log(`Error: Not a file: ${filePath}`);
        if (callback) callback();
        return false;
      }
      content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.log(`Error reading file: ${error.message}`);
      if (callback) callback();
      return false;
    }
  } else {
    console.log(`Creating new file: ${filePath}`);
  }

  // Split content into lines
  const lines = content.split('\n');

  // Create interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Track if file has been modified
  let modified = false;

  // Clear the screen
  clearScreen();

  // Display editor help
  console.log(`Editing file: ${filePath}`);
  console.log('Enter text, one line at a time.');
  console.log('Special commands:');
  console.log('  :w  - Save changes');
  console.log('  :q  - Quit without saving');
  console.log('  :x  - Save and quit');
  console.log('  :h  - Show help');
  console.log('  :l  - List file content');
  console.log('  :c  - Clear screen');
  console.log('  :d <line> - Delete a line');
  console.log('  :e <line> <text> - Edit a specific line');
  console.log('-----------------------------------');

  // Show current content
  displayContent(lines);

  // Start editor loop
  promptEditor();

  /**
   * Clear the screen
   */
  function clearScreen() {
    // Use ANSI escape codes to clear the screen
    process.stdout.write('\x1Bc');
  }

  /**
   * Display the file content with line numbers
   * @param {string[]} lines - Lines of the file
   */
  function displayContent(lines) {
    if (lines.length === 0) {
      console.log('(Empty file)');
    } else {
      for (let i = 0; i < lines.length; i++) {
        console.log(`${i + 1}| ${lines[i]}`);
      }
    }
  }

  /**
   * Save the file
   * @returns {boolean} - True if save was successful
   */
  function saveFile() {
    try {
      // Create directory if it doesn't exist
      const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
      if (dirPath && !fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`File saved: ${filePath}`);
      modified = false;
      return true;
    } catch (error) {
      console.log(`Error saving file: ${error.message}`);
      return false;
    }
  }

  /**
   * Prompt for editor input
   */
  function promptEditor() {
    rl.question('> ', (input) => {
      // Handle special commands
      if (input === ':q') {
        if (modified) {
          rl.question('File has unsaved changes. Quit anyway? (y/n) ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              console.log('Quitting without saving...');
              rl.close();
              if (callback) callback();
              return;
            } else {
              promptEditor();
            }
          });
        } else {
          console.log('Quitting editor...');
          rl.close();
          if (callback) callback();
          return;
        }
      } else if (input === ':w') {
        saveFile();
        promptEditor();
      } else if (input === ':x') {
        if (modified) {
          saveFile();
        }
        console.log('Exiting editor...');
        rl.close();
        if (callback) callback();
        return;
      } else if (input === ':h') {
        console.log('Editor commands:');
        console.log('  :w  - Save changes');
        console.log('  :q  - Quit without saving');
        console.log('  :x  - Save and quit');
        console.log('  :h  - Show this help');
        console.log('  :l  - List the file content');
        console.log('  :c  - Clear screen');
        console.log('  :d <line> - Delete a line');
        console.log('  :e <line> <text> - Edit a specific line');
        promptEditor();
      } else if (input === ':l') {
        console.log('Current file content:');
        displayContent(lines);
        promptEditor();
      } else if (input === ':c') {
        clearScreen();
        console.log(`Editing file: ${filePath}`);
        displayContent(lines);
        promptEditor();
      } else if (input.startsWith(':d ')) {
        const lineNum = parseInt(input.substring(3));
        if (isNaN(lineNum) || lineNum < 1 || lineNum > lines.length) {
          console.log(`Error: Invalid line number. File has ${lines.length} lines.`);
        } else {
          lines.splice(lineNum - 1, 1);
          console.log(`Line ${lineNum} deleted.`);
          modified = true;
        }
        promptEditor();
      } else if (input.startsWith(':e ')) {
        const parts = input.substring(3).split(' ');
        const lineNum = parseInt(parts[0]);
        if (isNaN(lineNum) || lineNum < 1 || lineNum > lines.length) {
          console.log(`Error: Invalid line number. File has ${lines.length} lines.`);
        } else {
          const newText = parts.slice(1).join(' ');
          lines[lineNum - 1] = newText;
          console.log(`Line ${lineNum} updated.`);
          modified = true;
        }
        promptEditor();
      } else {
        // Add the input as a new line
        lines.push(input);
        modified = true;
        promptEditor();
      }
    });
  }

  // Return true to indicate the editor was started successfully
  return true;
}

module.exports = { editFile };
