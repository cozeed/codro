#!/bin/bash

mkdir -p backups

FILE="backups/backup_$(date +%F_%H-%M-%S).sql"

docker compose exec db pg_dump -U postgres codro > $FILE

echo "Backup saved to $FILE"