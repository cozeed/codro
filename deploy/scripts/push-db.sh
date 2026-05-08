#!/bin/bash

echo "⏳ Waiting for database..."

until docker compose exec db pg_isready -U postgres; do
  sleep 2
done

echo "🚀 Syncing database schema..."

docker compose run --rm drizzle node dist/push.mjs

echo "✅ Database synced"