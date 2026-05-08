#!/bin/bash

echo "🧹 Cleaning containers + volumes..."

docker compose down -v --remove-orphans

echo "✅ Clean complete"