cmake_minimum_required(VERSION 3.10)
project(MiniOS)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include directories
include_directories(${CMAKE_CURRENT_SOURCE_DIR})

# Source files
set(SOURCES
    kernel/kernel.cpp
    process/process.cpp
    filesystem/filesystem.cpp
    memory/memory_manager.cpp
)

# Create a shared library
add_library(minios SHARED ${SOURCES})

# Create an executable for testing
add_executable(minios_test main.cpp ${SOURCES})

# Install targets
install(TARGETS minios
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib
        RUNTIME DESTINATION bin)

# Install headers
install(FILES
        kernel/kernel.h
        process/process.h
        filesystem/filesystem.h
        memory/memory_manager.h
        DESTINATION include/minios)
