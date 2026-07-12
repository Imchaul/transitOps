#!/bin/bash

echo "Setting up TransitOps Microservices..."

# Create .env files for each service
for service in auth-service fleet-service trip-service analytics-service; do
    echo "Creating .env for $service..."
    cat > services/$service/.env << EOF
NODE_ENV=development
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=transitops_$(echo $service | cut -d- -f1)
DB_USER=transitops
DB_PASSWORD=transitops123
JWT_SECRET=your-secret-key-change-in-production
EOF
done

# Create .env for gateway
echo "Creating .env for gateway..."
cat > gateway/.env << EOF
NODE_ENV=development
PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001
FLEET_SERVICE_URL=http://fleet-service:3002
TRIP_SERVICE_URL=http://trip-service:3003
ANALYTICS_SERVICE_URL=http://analytics-service:3004
JWT_SECRET=your-secret-key-change-in-production
EOF

# Make init script executable
chmod +x infrastructure/database/init-multiple-db.sh

echo "Setup complete!"