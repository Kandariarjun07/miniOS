#ifndef FILESYSTEM_H
#define FILESYSTEM_H

#include <string>
#include <vector>
#include <map>
#include <memory>
#include <functional>

/**
 * @brief File system node base class
 * 
 * Represents a node in the file system (file or directory)
 */
class FSNode {
public:
    enum Type {
        FILE,
        DIRECTORY
    };
    
    FSNode(const std::string& name, Type type, FSNode* parent = nullptr);
    virtual ~FSNode() = default;
    
    std::string getName() const;
    Type getType() const;
    FSNode* getParent() const;
    void setParent(FSNode* parent);
    
    virtual size_t getSize() const = 0;
    virtual std::string getInfo() const = 0;
    
protected:
    std::string name;
    Type type;
    FSNode* parent;
};

/**
 * @brief File node class
 * 
 * Represents a file in the file system
 */
class FileNode : public FSNode {
public:
    FileNode(const std::string& name, FSNode* parent = nullptr);
    
    void setContent(const std::string& content);
    std::string getContent() const;
    size_t getSize() const override;
    std::string getInfo() const override;
    
private:
    std::string content;
};

/**
 * @brief Directory node class
 * 
 * Represents a directory in the file system
 */
class DirectoryNode : public FSNode {
public:
    DirectoryNode(const std::string& name, FSNode* parent = nullptr);
    ~DirectoryNode() override;
    
    bool addChild(std::unique_ptr<FSNode> node);
    bool removeChild(const std::string& name);
    FSNode* getChild(const std::string& name) const;
    std::vector<FSNode*> getChildren() const;
    size_t getSize() const override;
    std::string getInfo() const override;
    
private:
    std::map<std::string, std::unique_ptr<FSNode>> children;
};

/**
 * @brief File system class
 * 
 * Manages the file system structure and operations
 */
class FileSystem {
public:
    /**
     * @brief Construct a new File System object
     */
    FileSystem();
    
    /**
     * @brief Destroy the File System object
     */
    ~FileSystem();
    
    /**
     * @brief Initialize the file system
     * 
     * @return true if initialization was successful
     * @return false if initialization failed
     */
    bool initialize();
    
    /**
     * @brief Create a file at the specified path
     * 
     * @param path Path to create the file
     * @param content Initial content of the file
     * @return true if file was created successfully
     * @return false if file creation failed
     */
    bool createFile(const std::string& path, const std::string& content = "");
    
    /**
     * @brief Create a directory at the specified path
     * 
     * @param path Path to create the directory
     * @return true if directory was created successfully
     * @return false if directory creation failed
     */
    bool createDirectory(const std::string& path);
    
    /**
     * @brief Delete a file or directory at the specified path
     * 
     * @param path Path to delete
     * @return true if deletion was successful
     * @return false if deletion failed
     */
    bool deleteNode(const std::string& path);
    
    /**
     * @brief Read a file at the specified path
     * 
     * @param path Path to the file
     * @return std::string Content of the file, or error message if read failed
     */
    std::string readFile(const std::string& path) const;
    
    /**
     * @brief Write to a file at the specified path
     * 
     * @param path Path to the file
     * @param content Content to write
     * @return true if write was successful
     * @return false if write failed
     */
    bool writeFile(const std::string& path, const std::string& content);
    
    /**
     * @brief List contents of a directory
     * 
     * @param path Path to the directory
     * @return std::string Formatted list of directory contents
     */
    std::string listDirectory(const std::string& path) const;
    
    /**
     * @brief Get the current working directory
     * 
     * @return std::string Current working directory path
     */
    std::string getCurrentDirectory() const;
    
    /**
     * @brief Change the current working directory
     * 
     * @param path Path to change to
     * @return true if directory change was successful
     * @return false if directory change failed
     */
    bool changeDirectory(const std::string& path);
    
    /**
     * @brief Handle a file system command
     * 
     * @param command Command to handle
     * @param args Command arguments
     * @return std::string Result of the command
     */
    std::string handleCommand(const std::string& command, const std::vector<std::string>& args);
    
    /**
     * @brief Shutdown the file system
     */
    void shutdown();

private:
    std::unique_ptr<DirectoryNode> root;
    DirectoryNode* currentDirectory;
    bool isInitialized;
    
    /**
     * @brief Get a node at the specified path
     * 
     * @param path Path to the node
     * @param startNode Node to start the search from
     * @return FSNode* Pointer to the node, or nullptr if not found
     */
    FSNode* getNodeAtPath(const std::string& path, FSNode* startNode = nullptr) const;
    
    /**
     * @brief Get the parent directory of a path
     * 
     * @param path Path to get the parent of
     * @return DirectoryNode* Pointer to the parent directory, or nullptr if not found
     */
    DirectoryNode* getParentDirectory(const std::string& path) const;
    
    /**
     * @brief Get the absolute path of a node
     * 
     * @param node Node to get the path of
     * @return std::string Absolute path of the node
     */
    std::string getAbsolutePath(const FSNode* node) const;
    
    /**
     * @brief Normalize a path (resolve . and .. components)
     * 
     * @param path Path to normalize
     * @return std::string Normalized path
     */
    std::string normalizePath(const std::string& path) const;
};

#endif // FILESYSTEM_H
