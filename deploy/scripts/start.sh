#!/bin/bash

echo "🚀 Starting services..."

docker compose up -d --build

echo "✅ Services started"
echo "🌐 Web: http://localhost:8085"
echo "🔧 Server: http://localhost:3035"