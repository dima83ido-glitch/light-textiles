#!/usr/bin/env bash
# Restores a pg_dump custom-format backup (see scripts/backup-db.sh) into whatever
# database DATABASE_URL currently points at. --clean --if-exists drops existing
# objects first, so this OVERWRITES the target database — always point DATABASE_URL
# at a fresh/scratch database first and verify before ever pointing this at production.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Export it and try again." >&2
  exit 1
fi

DUMP_FILE="${1:-}"
if [ -z "$DUMP_FILE" ]; then
  echo "Usage: npm run db:restore -- path/to/backup.dump" >&2
  exit 1
fi
if [ ! -f "$DUMP_FILE" ]; then
  echo "File not found: $DUMP_FILE" >&2
  exit 1
fi

echo "About to restore '$DUMP_FILE' into the database at DATABASE_URL, dropping existing objects first."
read -r -p "Type 'yes' to continue: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

pg_restore --clean --if-exists -d "$DATABASE_URL" "$DUMP_FILE"

echo "Restore complete."
