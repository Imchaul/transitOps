#!/bin/bash

echo "Cleaning up TransitOps..."

# Stop and remove containers
docker-compose -f docker-compose.dev.yml down -v

# Remove node_modules
echo "Removing node_modules..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove .env files
echo "Removing .env files..."
find . -name ".env" -type f -delete

echo "Cleanup complete!"