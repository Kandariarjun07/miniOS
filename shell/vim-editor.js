/**
 * Vim-like Text Editor for Mini OS
 * 
 * This module provides a simple Vim-like text editor with commands like :w, :q, and :x.
 */

const readline = require('readline');
const fs = require('fs');

/**
 * Start the Vim-like editor for a file
 * @param {string} filePath - Path to the file to edit
 * @param {Function} callback - Function to call when editor is closed
 */
function editFile(filePath, callback) {
  // Clear the screen
  console.clear();
  
  // Check if file exists and read content
  let content = '';
  let fileExists = false;
  
  try {
    if (fs.existsSync(filePath)) {
      fileExists = true;
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        content = fs.readFileSync(filePath, 'utf8');
      } else {
        console.log(`Error: ${filePath} is not a file`);
        if (callback) callback();
        return false;
      }
    } else {
      console.log(`"${filePath}" [New File]`);
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    if (callback) callback();
    return false;
  }
  
  // Split content into lines
  let lines = content.split('\n');
  if (lines.length === 0) {
    lines = [''];
  }
  
  // Editor state
  let modified = false;
  let currentLine = 0;
  let commandMode = true;
  let commandBuffer = '';
  let insertMode = false;
  
  // Create interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Disable the default readline behavior
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  
  // Display the file content
  displayContent();
  displayStatusLine();
  
  // Set up keypress listener
  process.stdin.on('keypress', handleKeypress);
  
  /**
   * Handle keypress events
   * @param {string} str - The string representation of the key
   * @param {Object} key - Key information object
   */
  function handleKeypress(str, key) {
    // Handle Ctrl+C to exit
    if (key && key.ctrl && key.name === 'c') {
      cleanup();
      process.exit();
    }
    
    if (insertMode) {
      handleInsertMode(str, key);
    } else {
      handleCommandMode(str, key);
    }
  }
  
  /**
   * Handle keypresses in insert mode
   * @param {string} str - The string representation of the key
   * @param {Object} key - Key information object
   */
  function handleInsertMode(str, key) {
    if (key && key.name === 'escape') {
      // Exit insert mode
      insertMode = false;
      displayStatusLine();
      return;
    }
    
    if (key && key.name === 'return') {
      // Insert a new line
      const currentLineContent = lines[currentLine];
      const newLine = '';
      
      // Split the current line at cursor position and insert a new line
      lines.splice(currentLine + 1, 0, newLine);
      currentLine++;
      modified = true;
      
      // Redisplay content
      displayContent();
      displayStatusLine();
      return;
    }
    
    if (key && key.name === 'backspace') {
      // Handle backspace
      if (lines[currentLine].length > 0) {
        lines[currentLine] = lines[currentLine].slice(0, -1);
        modified = true;
        displayContent();
        displayStatusLine();
      } else if (currentLine > 0) {
        // If at beginning of line, join with previous line
        const previousLine = lines[currentLine - 1];
        lines.splice(currentLine, 1);
        currentLine--;
        modified = true;
        displayContent();
        displayStatusLine();
      }
      return;
    }
    
    // Add character to current line
    if (str && !key.ctrl && !key.meta) {
      lines[currentLine] += str;
      modified = true;
      displayContent();
      displayStatusLine();
    }
  }
  
  /**
   * Handle keypresses in command mode
   * @param {string} str - The string representation of the key
   * @param {Object} key - Key information object
   */
  function handleCommandMode(str, key) {
    if (key && key.name === 'return') {
      // Execute command if it starts with :
      if (commandBuffer.startsWith(':')) {
        executeCommand(commandBuffer);
        commandBuffer = '';
        displayStatusLine();
      }
      return;
    }
    
    if (key && key.name === 'backspace') {
      // Handle backspace in command buffer
      if (commandBuffer.length > 0) {
        commandBuffer = commandBuffer.slice(0, -1);
        displayStatusLine();
      }
      return;
    }
    
    // Handle i key to enter insert mode
    if (str === 'i' && commandBuffer === '') {
      insertMode = true;
      displayStatusLine();
      return;
    }
    
    // Handle j key to move down
    if (str === 'j' && commandBuffer === '') {
      if (currentLine < lines.length - 1) {
        currentLine++;
        displayContent();
        displayStatusLine();
      }
      return;
    }
    
    // Handle k key to move up
    if (str === 'k' && commandBuffer === '') {
      if (currentLine > 0) {
        currentLine--;
        displayContent();
        displayStatusLine();
      }
      return;
    }
    
    // Add character to command buffer
    if (str && !key.ctrl && !key.meta) {
      commandBuffer += str;
      displayStatusLine();
    }
  }
  
  /**
   * Execute a command
   * @param {string} command - Command to execute
   */
  function executeCommand(command) {
    if (command === ':q') {
      // Quit without saving
      if (modified) {
        console.log('\r\nNo write since last change (add ! to override)');
      } else {
        cleanup();
        if (callback) callback();
      }
    } else if (command === ':q!') {
      // Force quit without saving
      cleanup();
      if (callback) callback();
    } else if (command === ':w') {
      // Save file
      saveFile();
    } else if (command === ':x' || command === ':wq') {
      // Save and quit
      if (saveFile()) {
        cleanup();
        if (callback) callback();
      }
    } else if (command === ':h') {
      // Show help
      console.clear();
      console.log('Vim-like Editor Help:');
      console.log('  i     - Enter insert mode');
      console.log('  ESC   - Exit insert mode');
      console.log('  j     - Move down one line');
      console.log('  k     - Move up one line');
      console.log('  :w    - Save file');
      console.log('  :q    - Quit (fails if unsaved changes)');
      console.log('  :q!   - Force quit without saving');
      console.log('  :wq   - Save and quit');
      console.log('  :x    - Save and quit');
      console.log('  :h    - Show this help');
      console.log('\nPress any key to continue...');
      
      // Wait for a keypress to continue
      const tempListener = function() {
        process.stdin.removeListener('keypress', tempListener);
        displayContent();
        displayStatusLine();
      };
      process.stdin.once('keypress', tempListener);
    } else {
      console.log(`\r\nUnknown command: ${command}`);
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
      
      // Write file
      fs.writeFileSync(filePath, lines.join('\n'));
      modified = false;
      
      // Show success message
      const lineCount = lines.length;
      console.log(`\r\n"${filePath}" ${lineCount}L, ${Buffer.byteLength(lines.join('\n'))}C written`);
      
      return true;
    } catch (error) {
      console.log(`\r\nError writing file: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Display the file content
   */
  function displayContent() {
    console.clear();
    
    // Display each line with line number
    for (let i = 0; i < lines.length; i++) {
      if (i === currentLine) {
        // Highlight current line
        process.stdout.write(`${i + 1} > ${lines[i]}\n`);
      } else {
        process.stdout.write(`${i + 1}   ${lines[i]}\n`);
      }
    }
  }
  
  /**
   * Display the status line at the bottom
   */
  function displayStatusLine() {
    // Move cursor to the bottom of the screen
    process.stdout.write('\n');
    
    // Display mode and command buffer
    if (insertMode) {
      process.stdout.write('-- INSERT --');
    } else {
      process.stdout.write(commandBuffer);
    }
  }
  
  /**
   * Clean up resources before exiting
   */
  function cleanup() {
    // Remove keypress listener
    process.stdin.removeListener('keypress', handleKeypress);
    
    // Restore terminal settings
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
    }
    
    // Close readline interface
    rl.close();
    
    // Clear screen
    console.clear();
  }
  
  return true;
}

module.exports = { editFile };
