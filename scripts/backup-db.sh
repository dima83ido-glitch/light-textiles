#!/usr/bin/env bash
# Backs up the database DATABASE_URL points at, using pg_dump's custom format
# (works with pg_restore, supports selective/parallel restore unlike plain SQL).
# Requires the postgresql-client tools (pg_dump) to be installed separately —
# not bundled with this app. See DEVELOPER_HANDBOOK.md §14 for the manual
# command this wraps, and scripts/restore-db.sh for the matching restore.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Export it (or run via 'npm run db:backup' with a .env loaded) and try again." >&2
  exit 1
fi

mkdir -p backups
OUT="backups/light-textiles-$(date +%Y%m%d-%H%M%S).dump"

pg_dump "$DATABASE_URL" -Fc -f "$OUT"

echo "Backup written to $OUT"
echo "Restore with: npm run db:restore -- $OUT"
