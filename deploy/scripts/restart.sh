#!/bin/bash

echo "🔄 Restarting services..."

docker compose down
docker compose up -d --build

echo "✅ Restart complete"