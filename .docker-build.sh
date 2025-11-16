#!/bin/bash

# Docker build and run script for DSA Learning Platform

set -e

echo "🐳 DSA Docker Helper"
echo ""

case "${1:-help}" in
  build)
    echo "Building production image..."
    docker build -t dsa-app:latest .
    echo "✅ Build complete. Run with: docker run -p 4000:4000 dsa-app:latest"
    ;;
  
  build-dev)
    echo "Building development image..."
    docker build -f Dockerfile.dev -t dsa-app:dev .
    echo "✅ Dev build complete."
    ;;
  
  run)
    echo "Running production container..."
    docker run -p 4000:4000 --rm dsa-app:latest
    ;;
  
  run-dev)
    echo "Running development container with compose..."
    docker compose -f docker-compose.dev.yml up
    ;;
  
  compose)
    echo "Running with docker-compose (production)..."
    docker compose up
    ;;
  
  clean)
    echo "Cleaning up containers and images..."
    docker compose down
    docker rmi dsa-app:latest dsa-app:dev 2>/dev/null || true
    echo "✅ Cleanup complete."
    ;;
  
  help|*)
    echo "Usage: .docker-build.sh [command]"
    echo ""
    echo "Commands:"
    echo "  build        - Build production Docker image"
    echo "  build-dev    - Build development Docker image"
    echo "  run          - Run production container"
    echo "  run-dev      - Run development with docker-compose"
    echo "  compose      - Run production with docker-compose"
    echo "  clean        - Remove containers and images"
    echo "  help         - Show this help message"
    ;;
esac
