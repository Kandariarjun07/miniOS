#!/bin/bash

# Mini OS Build Script

echo "Building Mini OS..."

# Create build directory
mkdir -p build

# Build C++ core
echo "Building C++ core components..."
cd core
mkdir -p build
cd build
cmake ..
make
cd ../..

# Build JavaScript shell
echo "Building JavaScript shell..."
cd shell
npm install
cd ..

echo "Build complete!"
echo "To run Mini OS, execute: ./run.sh"
