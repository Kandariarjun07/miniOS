#include "filesystem.h"
#include <iostream>
#include <sstream>
#include <algorithm>

// FSNode implementation
FSNode::FSNode(const std::string& name, Type type, FSNode* parent)
    : name(name), type(type), parent(parent) {}

std::string FSNode::getName() const {
    return name;
}

FSNode::Type FSNode::getType() const {
    return type;
}

FSNode* FSNode::getParent() const {
    return parent;
}

void FSNode::setParent(FSNode* parent) {
    this->parent = parent;
}

// FileNode implementation
FileNode::FileNode(const std::string& name, FSNode* parent)
    : FSNode(name, FSNode::FILE, parent) {}

void FileNode::setContent(const std::string& content) {
    this->content = content;
}

std::string FileNode::getContent() const {
    return content;
}

size_t FileNode::getSize() const {
    return content.size();
}

std::string FileNode::getInfo() const {
    std::stringstream ss;
    ss << "File: " << name << "\n";
    ss << "Size: " << getSize() << " bytes";
    return ss.str();
}

// DirectoryNode implementation
DirectoryNode::DirectoryNode(const std::string& name, FSNode* parent)
    : FSNode(name, FSNode::DIRECTORY, parent) {}

DirectoryNode::~DirectoryNode() {
    children.clear();
}

bool DirectoryNode::addChild(std::unique_ptr<FSNode> node) {
    if (children.find(node->getName()) != children.end()) {
        return false;  // Child with this name already exists
    }
    
    node->setParent(this);
    children[node->getName()] = std::move(node);
    return true;
}

bool DirectoryNode::removeChild(const std::string& name) {
    auto it = children.find(name);
    if (it == children.end()) {
        return false;  // Child not found
    }
    
    children.erase(it);
    return true;
}

FSNode* DirectoryNode::getChild(const std::string& name) const {
    auto it = children.find(name);
    return (it != children.end()) ? it->second.get() : nullptr;
}

std::vector<FSNode*> DirectoryNode::getChildren() const {
    std::vector<FSNode*> result;
    for (const auto& pair : children) {
        result.push_back(pair.second.get());
    }
    return result;
}

size_t DirectoryNode::getSize() const {
    size_t totalSize = 0;
    for (const auto& pair : children) {
        totalSize += pair.second->getSize();
    }
    return totalSize;
}

std::string DirectoryNode::getInfo() const {
    std::stringstream ss;
    ss << "Directory: " << name << "\n";
    ss << "Children: " << children.size() << "\n";
    ss << "Total size: " << getSize() << " bytes";
    return ss.str();
}

// FileSystem implementation
FileSystem::FileSystem() : currentDirectory(nullptr), isInitialized(false) {
    std::cout << "File system constructor called" << std::endl;
}

FileSystem::~FileSystem() {
    if (isInitialized) {
        shutdown();
    }
    std::cout << "File system destructor called" << std::endl;
}

bool FileSystem::initialize() {
    std::cout << "Initializing file system..." << std::endl;
    
    try {
        // Create root directory
        root = std::make_unique<DirectoryNode>("/");
        currentDirectory = root.get();
        
        // Create basic directory structure
        createDirectory("/bin");
        createDirectory("/home");
        createDirectory("/tmp");
        
        isInitialized = true;
        std::cout << "File system initialized successfully" << std::endl;
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Exception during file system initialization: " << e.what() << std::endl;
        return false;
    }
}

bool FileSystem::createFile(const std::string& path, const std::string& content) {
    if (!isInitialized) {
        std::cerr << "File system not initialized" << std::endl;
        return false;
    }
    
    std::string normalizedPath = normalizePath(path);
    
    // Extract file name and parent directory path
    size_t lastSlash = normalizedPath.find_last_of('/');
    std::string fileName = (lastSlash != std::string::npos) ? 
                           normalizedPath.substr(lastSlash + 1) : 
                           normalizedPath;
    
    std::string parentPath = (lastSlash != std::string::npos) ? 
                             normalizedPath.substr(0, lastSlash) : 
                             ".";
    
    DirectoryNode* parent = dynamic_cast<DirectoryNode*>(getNodeAtPath(parentPath));
    if (!parent) {
        std::cerr << "Parent directory not found: " << parentPath << std::endl;
        return false;
    }
    
    // Check if file already exists
    if (parent->getChild(fileName)) {
        std::cerr << "File already exists: " << normalizedPath << std::endl;
        return false;
    }
    
    // Create the file
    auto file = std::make_unique<FileNode>(fileName);
    file->setContent(content);
    
    return parent->addChild(std::move(file));
}

bool FileSystem::createDirectory(const std::string& path) {
    if (!isInitialized) {
        std::cerr << "File system not initialized" << std::endl;
        return false;
    }
    
    std::string normalizedPath = normalizePath(path);
    
    // Handle root directory
    if (normalizedPath == "/") {
        return true;  // Root already exists
    }
    
    // Extract directory name and parent path
    size_t lastSlash = normalizedPath.find_last_of('/');
    std::string dirName = (lastSlash != std::string::npos) ? 
                          normalizedPath.substr(lastSlash + 1) : 
                          normalizedPath;
    
    std::string parentPath = (lastSlash != std::string::npos) ? 
                             normalizedPath.substr(0, lastSlash) : 
                             ".";
    
    if (parentPath.empty()) {
        parentPath = "/";
    }
    
    DirectoryNode* parent = dynamic_cast<DirectoryNode*>(getNodeAtPath(parentPath));
    if (!parent) {
        // Try to create parent directories recursively
        if (lastSlash != std::string::npos) {
            if (!createDirectory(parentPath)) {
                return false;
            }
            parent = dynamic_cast<DirectoryNode*>(getNodeAtPath(parentPath));
        } else {
            std::cerr << "Parent directory not found: " << parentPath << std::endl;
            return false;
        }
    }
    
    // Check if directory already exists
    if (parent->getChild(dirName)) {
        return true;  // Directory already exists
    }
    
    // Create the directory
    auto dir = std::make_unique<DirectoryNode>(dirName);
    return parent->addChild(std::move(dir));
}

bool FileSystem::deleteNode(const std::string& path) {
    if (!isInitialized) {
        std::cerr << "File system not initialized" << std::endl;
        return false;
    }
    
    std::string normalizedPath = normalizePath(path);
    
    // Cannot delete root
    if (normalizedPath == "/") {
        std::cerr << "Cannot delete root directory" << std::endl;
        return false;
    }
    
    // Extract node name and parent path
    size_t lastSlash = normalizedPath.find_last_of('/');
    std::string nodeName = (lastSlash != std::string::npos) ? 
                           normalizedPath.substr(lastSlash + 1) : 
                           normalizedPath;
    
    std::string parentPath = (lastSlash != std::string::npos) ? 
                             normalizedPath.substr(0, lastSlash) : 
                             ".";
    
    if (parentPath.empty()) {
        parentPath = "/";
    }
    
    DirectoryNode* parent = dynamic_cast<DirectoryNode*>(getNodeAtPath(parentPath));
    if (!parent) {
        std::cerr << "Parent directory not found: " << parentPath << std::endl;
        return false;
    }
    
    // Check if node exists
    if (!parent->getChild(nodeName)) {
        std::cerr << "Node not found: " << normalizedPath << std::endl;
        return false;
    }
    
    // Delete the node
    return parent->removeChild(nodeName);
}

std::string FileSystem::readFile(const std::string& path) const {
    if (!isInitialized) {
        return "Error: File system not initialized";
    }
    
    FSNode* node = getNodeAtPath(path);
    if (!node) {
        return "Error: File not found: " + path;
    }
    
    if (node->getType() != FSNode::FILE) {
        return "Error: Not a file: " + path;
    }
    
    FileNode* file = dynamic_cast<FileNode*>(node);
    return file->getContent();
}

bool FileSystem::writeFile(const std::string& path, const std::string& content) {
    if (!isInitialized) {
        std::cerr << "File system not initialized" << std::endl;
        return false;
    }
    
    FSNode* node = getNodeAtPath(path);
    
    // If file doesn't exist, create it
    if (!node) {
        return createFile(path, content);
    }
    
    if (node->getType() != FSNode::FILE) {
        std::cerr << "Not a file: " << path << std::endl;
        return false;
    }
    
    FileNode* file = dynamic_cast<FileNode*>(node);
    file->setContent(content);
    
    return true;
}

std::string FileSystem::listDirectory(const std::string& path) const {
    if (!isInitialized) {
        return "Error: File system not initialized";
    }
    
    FSNode* node = getNodeAtPath(path);
    if (!node) {
        return "Error: Directory not found: " + path;
    }
    
    if (node->getType() != FSNode::DIRECTORY) {
        return "Error: Not a directory: " + path;
    }
    
    DirectoryNode* dir = dynamic_cast<DirectoryNode*>(node);
    std::vector<FSNode*> children = dir->getChildren();
    
    if (children.empty()) {
        return "Directory is empty";
    }
    
    std::stringstream ss;
    ss << "Contents of " << path << ":\n";
    
    // Sort children by name
    std::sort(children.begin(), children.end(), 
              [](const FSNode* a, const FSNode* b) { return a->getName() < b->getName(); });
    
    // List directories first, then files
    for (FSNode* child : children) {
        if (child->getType() == FSNode::DIRECTORY) {
            ss << "d " << child->getName() << "/\n";
        }
    }
    
    for (FSNode* child : children) {
        if (child->getType() == FSNode::FILE) {
            ss << "f " << child->getName() << " (" << child->getSize() << " bytes)\n";
        }
    }
    
    return ss.str();
}

std::string FileSystem::getCurrentDirectory() const {
    if (!isInitialized) {
        return "Error: File system not initialized";
    }
    
    return getAbsolutePath(currentDirectory);
}

bool FileSystem::changeDirectory(const std::string& path) {
    if (!isInitialized) {
        std::cerr << "File system not initialized" << std::endl;
        return false;
    }
    
    FSNode* node = getNodeAtPath(path);
    if (!node) {
        std::cerr << "Directory not found: " << path << std::endl;
        return false;
    }
    
    if (node->getType() != FSNode::DIRECTORY) {
        std::cerr << "Not a directory: " << path << std::endl;
        return false;
    }
    
    currentDirectory = dynamic_cast<DirectoryNode*>(node);
    return true;
}

std::string FileSystem::handleCommand(const std::string& command, const std::vector<std::string>& args) {
    if (!isInitialized) {
        return "Error: File system not initialized";
    }
    
    std::string cmd = command;
    std::transform(cmd.begin(), cmd.end(), cmd.begin(), ::tolower);
    
    if (cmd == "ls") {
        std::string path = args.empty() ? "." : args[0];
        return listDirectory(path);
    } else if (cmd == "cd") {
        if (args.empty()) {
            return "Error: Missing directory path";
        }
        return changeDirectory(args[0]) ? "Changed directory to " + getCurrentDirectory() : "Failed to change directory";
    } else if (cmd == "mkdir") {
        if (args.empty()) {
            return "Error: Missing directory path";
        }
        return createDirectory(args[0]) ? "Directory created: " + args[0] : "Failed to create directory";
    } else if (cmd == "touch") {
        if (args.empty()) {
            return "Error: Missing file path";
        }
        return createFile(args[0]) ? "File created: " + args[0] : "Failed to create file";
    } else if (cmd == "rm") {
        if (args.empty()) {
            return "Error: Missing path";
        }
        return deleteNode(args[0]) ? "Deleted: " + args[0] : "Failed to delete";
    } else if (cmd == "cat") {
        if (args.empty()) {
            return "Error: Missing file path";
        }
        return readFile(args[0]);
    } else if (cmd == "pwd") {
        return getCurrentDirectory();
    } else if (cmd == "fs-info") {
        std::string path = args.empty() ? "." : args[0];
        FSNode* node = getNodeAtPath(path);
        return node ? node->getInfo() : "Error: Path not found: " + path;
    }
    
    return "Unknown file system command: " + command;
}

void FileSystem::shutdown() {
    if (!isInitialized) {
        return;
    }
    
    std::cout << "Shutting down file system..." << std::endl;
    
    // Clear all nodes
    root.reset();
    currentDirectory = nullptr;
    
    isInitialized = false;
    std::cout << "File system shutdown complete" << std::endl;
}

FSNode* FileSystem::getNodeAtPath(const std::string& path, FSNode* startNode) const {
    if (!isInitialized) {
        return nullptr;
    }
    
    std::string normalizedPath = normalizePath(path);
    
    // Handle empty path
    if (normalizedPath.empty()) {
        return currentDirectory;
    }
    
    // Handle absolute vs. relative path
    FSNode* current = nullptr;
    if (normalizedPath[0] == '/') {
        current = root.get();
        normalizedPath = normalizedPath.substr(1);  // Remove leading slash
    } else {
        current = startNode ? startNode : currentDirectory;
    }
    
    // Handle current directory
    if (normalizedPath.empty() || normalizedPath == ".") {
        return current;
    }
    
    // Split path into components
    std::vector<std::string> components;
    std::stringstream ss(normalizedPath);
    std::string component;
    
    while (std::getline(ss, component, '/')) {
        if (!component.empty() && component != ".") {
            components.push_back(component);
        }
    }
    
    // Traverse path
    for (const std::string& comp : components) {
        if (current->getType() != FSNode::DIRECTORY) {
            return nullptr;  // Not a directory
        }
        
        DirectoryNode* dir = dynamic_cast<DirectoryNode*>(current);
        current = dir->getChild(comp);
        
        if (!current) {
            return nullptr;  // Component not found
        }
    }
    
    return current;
}

DirectoryNode* FileSystem::getParentDirectory(const std::string& path) const {
    std::string normalizedPath = normalizePath(path);
    
    size_t lastSlash = normalizedPath.find_last_of('/');
    if (lastSlash == std::string::npos) {
        return currentDirectory;  // Relative path with no slashes
    }
    
    std::string parentPath = normalizedPath.substr(0, lastSlash);
    if (parentPath.empty() && normalizedPath[0] == '/') {
        return root.get();  // Parent is root
    }
    
    FSNode* parent = getNodeAtPath(parentPath);
    return dynamic_cast<DirectoryNode*>(parent);
}

std::string FileSystem::getAbsolutePath(const FSNode* node) const {
    if (!node) {
        return "";
    }
    
    std::vector<std::string> components;
    
    // Traverse up to root
    const FSNode* current = node;
    while (current && current != root.get()) {
        components.push_back(current->getName());
        current = current->getParent();
    }
    
    // Build path
    std::string path = "/";
    for (auto it = components.rbegin(); it != components.rend(); ++it) {
        path += *it;
        if (it != components.rend() - 1) {
            path += "/";
        }
    }
    
    return path;
}

std::string FileSystem::normalizePath(const std::string& path) const {
    if (path.empty()) {
        return ".";
    }
    
    // Handle absolute vs. relative path
    bool isAbsolute = (path[0] == '/');
    
    // Split path into components
    std::vector<std::string> components;
    std::stringstream ss(path);
    std::string component;
    
    while (std::getline(ss, component, '/')) {
        if (component.empty() || component == ".") {
            continue;  // Skip empty components and current directory
        } else if (component == "..") {
            if (!components.empty() && components.back() != "..") {
                components.pop_back();  // Go up one level
            } else if (!isAbsolute) {
                components.push_back("..");  // Keep .. in relative path
            }
        } else {
            components.push_back(component);
        }
    }
    
    // Build normalized path
    std::string normalizedPath;
    
    if (isAbsolute) {
        normalizedPath = "/";
    }
    
    for (size_t i = 0; i < components.size(); ++i) {
        normalizedPath += components[i];
        if (i < components.size() - 1) {
            normalizedPath += "/";
        }
    }
    
    return normalizedPath.empty() ? (isAbsolute ? "/" : ".") : normalizedPath;
}
