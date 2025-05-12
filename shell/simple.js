/**
 * Simple Mini OS
 * 
 * A simplified version of Mini OS that doesn't rely on external modules.
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

// Simulated file system
const fileSystem = {
  '/': {
    type: 'directory',
    name: '/',
    children: new Map()
  }
};

// Initialize file system
fileSystem['/'].children.set('bin', {
  type: 'directory',
  name: 'bin',
  children: new Map()
});

fileSystem['/'].children.set('home', {
  type: 'directory',
  name: 'home',
  children: new Map()
});

fileSystem['/'].children.set('tmp', {
  type: 'directory',
  name: 'tmp',
  children: new Map()
});

// Current directory
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
    return '';
  },
  
  info: () => {
    return 'Mini OS Simple Version 0.1.0';
  },
  
  ls: (args) => {
    const path = args[0] || currentDirectory;
    
    // Get the directory
    const dir = getNodeAtPath(path);
    
    if (!dir) {
      return `Error: Directory not found: ${path}`;
    }
    
    if (dir.type !== 'directory') {
      return `Error: Not a directory: ${path}`;
    }
    
    if (dir.children.size === 0) {
      return 'Directory is empty';
    }
    
    let result = `Contents of ${path}:\n`;
    
    // Sort children alphabetically
    const sortedChildren = Array.from(dir.children.keys()).sort();
    
    // List directories first, then files
    for (const childName of sortedChildren) {
      const child = dir.children.get(childName);
      
      if (child.type === 'directory') {
        result += `d ${childName}/\n`;
      }
    }
    
    for (const childName of sortedChildren) {
      const child = dir.children.get(childName);
      
      if (child.type === 'file') {
        result += `f ${childName} (${child.content.length} bytes)\n`;
      }
    }
    
    return result;
  },
  
  cd: (args) => {
    if (!args[0]) {
      return 'Error: Missing directory path';
    }
    
    const path = args[0];
    const dir = getNodeAtPath(path);
    
    if (!dir) {
      return `Error: Directory not found: ${path}`;
    }
    
    if (dir.type !== 'directory') {
      return `Error: Not a directory: ${path}`;
    }
    
    currentDirectory = normalizePath(path);
    return `Changed directory to ${currentDirectory}`;
  },
  
  pwd: () => {
    return currentDirectory;
  },
  
  mkdir: (args) => {
    if (!args[0]) {
      return 'Error: Missing directory path';
    }
    
    const path = args[0];
    const normalizedPath = normalizePath(path);
    
    // Check if the directory already exists
    if (getNodeAtPath(normalizedPath)) {
      return `Directory already exists: ${normalizedPath}`;
    }
    
    // Get parent directory
    const lastSlash = normalizedPath.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : normalizedPath.substring(0, lastSlash);
    const dirName = normalizedPath.substring(lastSlash + 1);
    
    const parent = getNodeAtPath(parentPath);
    
    if (!parent) {
      return `Error: Parent directory not found: ${parentPath}`;
    }
    
    if (parent.type !== 'directory') {
      return `Error: Parent is not a directory: ${parentPath}`;
    }
    
    // Create the directory
    parent.children.set(dirName, {
      type: 'directory',
      name: dirName,
      children: new Map()
    });
    
    return `Directory created: ${normalizedPath}`;
  },
  
  touch: (args) => {
    if (!args[0]) {
      return 'Error: Missing file path';
    }
    
    const path = args[0];
    const content = args.slice(1).join(' ');
    const normalizedPath = normalizePath(path);
    
    // Check if the file already exists
    const existingNode = getNodeAtPath(normalizedPath);
    if (existingNode) {
      if (existingNode.type === 'file') {
        // Update the file content
        existingNode.content = content;
        return `File updated: ${normalizedPath}`;
      } else {
        return `Error: A directory with that name already exists: ${normalizedPath}`;
      }
    }
    
    // Get parent directory
    const lastSlash = normalizedPath.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : normalizedPath.substring(0, lastSlash);
    const fileName = normalizedPath.substring(lastSlash + 1);
    
    const parent = getNodeAtPath(parentPath);
    
    if (!parent) {
      return `Error: Parent directory not found: ${parentPath}`;
    }
    
    if (parent.type !== 'directory') {
      return `Error: Parent is not a directory: ${parentPath}`;
    }
    
    // Create the file
    parent.children.set(fileName, {
      type: 'file',
      name: fileName,
      content: content
    });
    
    return `File created: ${normalizedPath}`;
  },
  
  cat: (args) => {
    if (!args[0]) {
      return 'Error: Missing file path';
    }
    
    const path = args[0];
    const file = getNodeAtPath(path);
    
    if (!file) {
      return `Error: File not found: ${path}`;
    }
    
    if (file.type !== 'file') {
      return `Error: Not a file: ${path}`;
    }
    
    return file.content;
  }
};

// Helper functions

/**
 * Get a node at the specified path
 * @param {string} path - Path to the node
 * @returns {Object|null} - Node at the path, or null if not found
 */
function getNodeAtPath(path) {
  const normalizedPath = normalizePath(path);
  
  if (normalizedPath === '/') {
    return fileSystem['/'];
  }
  
  // Split path into components
  const components = normalizedPath.split('/').filter(c => c !== '');
  
  // Start at root
  let current = fileSystem['/'];
  
  // Traverse path
  for (const component of components) {
    if (!current || current.type !== 'directory') {
      return null;
    }
    
    current = current.children.get(component);
    
    if (!current) {
      return null;
    }
  }
  
  return current;
}

/**
 * Normalize a path (resolve . and .. components)
 * @param {string} path - Path to normalize
 * @returns {string} - Normalized path
 */
function normalizePath(path) {
  if (!path) {
    return currentDirectory;
  }
  
  // Handle absolute vs. relative path
  let normalizedPath = path.startsWith('/') ? path : joinPaths(currentDirectory, path);
  
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
function joinPaths(base, relative) {
  if (relative.startsWith('/')) {
    return relative;
  }
  
  if (base === '/') {
    return '/' + relative;
  }
  
  return base + '/' + relative;
}

// Main function
function main() {
  console.log(logo);
  console.log('Mini OS Simple Version 0.1.0');
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
