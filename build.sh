#!/bin/bash

# Script for build and deploy on Back4App
echo "🚀 Starting PDF Extractor API build..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Build image
echo "📦 Building Docker image..."
docker build -t pdf-extractor-api:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "🐳 Image created: pdf-extractor-api:latest"
    
    # Show image information
    echo "📊 Image information:"
    docker images pdf-extractor-api:latest
    
    echo ""
    echo "🚀 To run locally:"
    echo "docker run -p 3000:80 pdf-extractor-api:latest"
    echo ""
    echo "🌐 Access: http://localhost:3000"
    echo ""
    echo "📋 For Back4App deploy:"
    echo "1. Push image to a registry (Docker Hub, etc.)"
    echo "2. Configure Back4App to use the image"
    echo "3. Set port 80 as entry port"
    
else
    echo "❌ Docker image build error"
    exit 1
fi