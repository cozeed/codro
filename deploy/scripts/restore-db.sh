#!/bin/bash
# Usage example: bash scripts/restore-db.sh backups/backup_2026-04-27.sql

FILE=$1

if [ -z "$FILE" ]; then
  echo "❌ Please provide backup file"
  exit 1
fi

echo "♻ Restoring database from $FILE"

cat $FILE | docker compose exec -T db psql -U postgres codro

echo "✅ Restore completed"