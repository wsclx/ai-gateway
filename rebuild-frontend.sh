#!/bin/bash

echo "🔄 Rebuilding Frontend with correct API URL..."

cd /Users/mario/DEV/ai-gateway

# Stop only frontend
docker stop aigateway-frontend
docker rm aigateway-frontend

# Rebuild frontend with correct env
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:5555/api/v1 \
  -t aigateway-frontend:latest \
  ./frontend

# Start frontend
docker run -d \
  --name aigateway-frontend \
  --network aigateway-network \
  -p 5556:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5555/api/v1 \
  aigateway-frontend:latest

echo "⏳ Waiting for frontend to be ready..."
sleep 5

# Test
echo "🧪 Testing frontend..."
curl -s http://localhost:5556 | grep -o "<title>.*</title>"

echo "✅ Frontend rebuilt! Check http://localhost:5556 now"
