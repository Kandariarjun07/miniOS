/**
 * Mini OS with Real File System
 * 
 * This version of Mini OS interacts with your actual file system.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ASCII art logo
const logo = `
 __  __ _       _    ___  ____  
|  \\/  (_)_ __ (_)  / _ \\/ ___| 
| |\\/| | | '_ \\| | | | | \\___ \\ 
| |  | | | | | | | | |_| |___) |
|_|  |_|_|_| |_|_|  \\___/|____/ 
                               
`;

// Create root directory for the OS
const ROOT_DIR = path.join(__dirname, '..', 'mini-os-files');

// Ensure root directory exists
if (!fs.existsSync(ROOT_DIR)) {
  try {
    fs.mkdirSync(ROOT_DIR);
    console.log(`Created root directory: ${ROOT_DIR}`);
    
    // Create basic directory structure
    fs.mkdirSync(path.join(ROOT_DIR, 'bin'));
    fs.mkdirSync(path.join(ROOT_DIR, 'home'));
    fs.mkdirSync(path.join(ROOT_DIR, 'tmp'));
  } catch (error) {
    console.error(`Error creating root directory: ${error.message}`);
    process.exit(1);
  }
}

// Current directory (relative to ROOT_DIR)
let currentDirectory = '/';

// Available commands
const commands = {
  help: () => {
    console.log('Available commands:');
    console.log('  help              - Show this help message');
    console.log('  exit, quit        - Exit the program');
    console.log('  info              - Show system information');
    console.log('  ls [path]         - List directory contents');
    console.log('  cd <path>         - Change directory');
    console.log('  pwd               - Print working directory');
    console.log('  mkdir <path>      - Create directory');
    console.log('  touch <path>      - Create file');
    console.log('  cat <path>        - Display file contents');
    console.log('  rm <path>         - Remove file or directory');
    console.log('  explorer          - Open current directory in Windows Explorer');
    return '';
  },
  
  info: () => {
    return `Mini OS Real File System Version 0.1.0\nRoot directory: ${ROOT_DIR}`;
  },
  
  ls: (args) => {
    const dirPath = args[0] || currentDirectory;
    const realPath = getAbsolutePath(dirPath);
    
    try {
      // Check if directory exists
      if (!fs.existsSync(realPath)) {
        return `Error: Directory not found: ${dirPath}`;
      }
      
      // Check if it's a directory
      const stats = fs.statSync(realPath);
      if (!stats.isDirectory()) {
        return `Error: Not a directory: ${dirPath}`;
      }
      
      // Read directory contents
      const files = fs.readdirSync(realPath);
      
      if (files.length === 0) {
        return 'Directory is empty';
      }
      
      let result = `Contents of ${dirPath}:\n`;
      
      // Sort files alphabetically
      files.sort();
      
      // List directories first, then files
      for (const file of files) {
        const filePath = path.join(realPath, file);
        const fileStats = fs.statSync(filePath);
        
        if (fileStats.isDirectory()) {
          result += `d ${file}/\n`;
        }
      }
      
      for (const file of files) {
        const filePath = path.join(realPath, file);
        const fileStats = fs.statSync(filePath);
        
        if (!fileStats.isDirectory()) {
          result += `f ${file} (${fileStats.size} bytes)\n`;
        }
      }
      
      return result;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  
  cd: (args) => {
    if (!args[0]) {
      // Change to root directory
      currentDirectory = '/';
      return `Changed directory to ${currentDirectory}`;
    }
    
    const dirPath = args[0];
    const realPath = getAbsolutePath(dirPath);
    
    try {
      // Check if directory exists
      if (!fs.existsSync(realPath)) {
        return `Error: Directory not found: ${dirPath}`;
      }
      
      // Check if it's a directory
      const stats = fs.statSync(realPath);
      if (!stats.isDirectory()) {
        return `Error: Not a directory: ${dirPath}`;
      }
      
      // Update current directory
      currentDirectory = normalizePath(dirPath);
      return `Changed directory to ${currentDirectory}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  
  pwd: () => {
    return currentDirectory;
  },
  
  mkdir: (args) => {
    if (!args[0]) {
      return 'Error: Missing directory path';
    }
    
    const dirPath = args[0];
    const realPath = getAbsolutePath(dirPath);
    
    try {
      // Check if directory already exists
      if (fs.existsSync(realPath)) {
        return `Directory already exists: ${dirPath}`;
      }
      
      // Create the directory
      fs.mkdirSync(realPath, { recursive: true });
      return `Directory created: ${dirPath}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  
  touch: (args) => {
    if (!args[0]) {
      return 'Error: Missing file path';
    }
    
    const filePath = args[0];
    const content = args.slice(1).join(' ');
    const realPath = getAbsolutePath(filePath);
    
    try {
      // Create or update the file
      fs.writeFileSync(realPath, content);
      return `File ${fs.existsSync(realPath) ? 'updated' : 'created'}: ${filePath}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  
  cat: (args) => {
    if (!args[0]) {
      return 'Error: Missing file path';
    }
    
    const filePath = args[0];
    const realPath = getAbsolutePath(filePath);
    
    try {
      // Check if file exists
      if (!fs.existsSync(realPath)) {
        return `Error: File not found: ${filePath}`;
      }
      
      // Check if it's a file
      const stats = fs.statSync(realPath);
      if (!stats.isFile()) {
        return `Error: Not a file: ${filePath}`;
      }
      
      // Read the file
      return fs.readFileSync(realPath, 'utf8');
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  
  rm: (args) => {
    if (!args[0]) {
      return 'Error: Missing path';
    }
    
    const targetPath = args[0];
    const realPath = getAbsolutePath(targetPath);
    
    try {
      // Check if path exists
      if (!fs.existsSync(realPath)) {
        return `Error: Path not found: ${targetPath}`;
      }
      
      // Check if it's a directory or file
      const stats = fs.statSync(realPath);
      
      if (stats.isDirectory()) {
        // Remove directory recursively
        fs.rmdirSync(realPath, { recursive: true });
        return `Directory removed: ${targetPath}`;
      } else {
        // Remove file
        fs.unlinkSync(realPath);
        return `File removed: ${targetPath}`;
      }
    } catch (error) {
      return `Error: ${error.message}`;
    }
  },
  
  explorer: () => {
    const realPath = getAbsolutePath(currentDirectory);
    
    try {
      // Open directory in Windows Explorer
      require('child_process').exec(`explorer "${realPath}"`);
      return `Opening ${currentDirectory} in Windows Explorer...`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
};

// Helper functions

/**
 * Get the absolute path in the real file system
 * @param {string} virtualPath - Virtual path in the Mini OS
 * @returns {string} - Absolute path in the real file system
 */
function getAbsolutePath(virtualPath) {
  const normalized = normalizePath(virtualPath);
  
  // Convert virtual path to real path
  // Replace leading / with ROOT_DIR
  const relativePath = normalized === '/' ? '' : normalized.substring(1);
  return path.join(ROOT_DIR, relativePath);
}

/**
 * Normalize a path (resolve . and .. components)
 * @param {string} inputPath - Path to normalize
 * @returns {string} - Normalized path
 */
function normalizePath(inputPath) {
  if (!inputPath) {
    return currentDirectory;
  }
  
  // Handle absolute vs. relative path
  const isAbsolute = inputPath.startsWith('/');
  const basePath = isAbsolute ? '/' : currentDirectory;
  
  // Join with current directory if relative
  const fullPath = isAbsolute ? inputPath : path.posix.join(basePath, inputPath);
  
  // Split path into components
  const components = fullPath.split('/').filter(c => c !== '');
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

// Main function
function main() {
  console.log(logo);
  console.log('Mini OS Real File System Version 0.1.0');
  console.log(`Root directory: ${ROOT_DIR}`);
  console.log('Type "help" for available commands, "exit" to quit.');
  
  promptUser();
}

// Prompt the user for input
function promptUser() {
  rl.question(`mini-os:${currentDirectory}> `, (input) => {
    // Skip empty input
    if (!input.trim()) {
      return promptUser();
    }
    
    // Parse the input
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Handle exit command
    if (command === 'exit' || command === 'quit') {
      console.log('Mini OS terminated.');
      rl.close();
      return;
    }
    
    // Execute the command
    if (commands[command]) {
      const result = commands[command](args);
      if (result) {
        console.log(result);
      }
    } else {
      console.log(`Unknown command: ${command}`);
    }
    
    // Prompt for next command
    promptUser();
  });
}

// Start the program
main();
