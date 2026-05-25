#!/usr/bin/env bash
# Database backup script for Hypervoid
# Usage: bash scripts/backup-db.sh
# Exports all tables as JSON to ./backups/ directory (gitignored)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
OUT_FILE="$BACKUP_DIR/hypervoid-$TIMESTAMP.json"

cd "$PROJECT_DIR"
mkdir -p "$BACKUP_DIR"

echo "Backing up database to $OUT_FILE ..."
pnpm exec tsx scripts/backup-db.ts --out "$OUT_FILE"

echo "Done — $(du -h "$OUT_FILE" | cut -f1)"

# Keep only the 30 most recent backups
ls -t "$BACKUP_DIR"/hypervoid-*.json 2>/dev/null | tail -n +31 | xargs -r rm -f
echo "Retained up to 30 most recent backups."
