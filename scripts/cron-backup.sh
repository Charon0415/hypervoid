#!/usr/bin/env bash
# Run via Vercel cron or manually to back up the production database.
# Add to Vercel: vercel cron add --path /api/admin/backup --schedule "0 4 * * *"
set -euo pipefail

echo "Triggering backup..."
# This script is meant to be run by Vercel cron hitting a backup endpoint.
# For local/manual backups, use scripts/backup-db.sh instead.
echo "Use scripts/backup-db.sh for local backups."
