#!/bin/bash

# DSA Learning Platform - Database Restore Script
# Restores PostgreSQL database from backup
# Usage: ./restore.sh <backup_file>

set -e

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file>"
  echo "Example: $0 /backups/dsa_backup_20240101_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME=${DB_NAME:-dsa_learning}
DB_USER=${DB_USER:-dsa_user}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging function
log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
  exit 1
}

warn() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Validate backup file
if [ ! -f "$BACKUP_FILE" ]; then
  error "Backup file not found: $BACKUP_FILE"
fi

if [ ! -r "$BACKUP_FILE" ]; then
  error "Backup file is not readable: $BACKUP_FILE"
fi

log "Starting database restore..."
log "Backup file: $BACKUP_FILE"
log "Database: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"

# Confirmation
echo -e "${YELLOW}WARNING: This will restore the database, potentially overwriting existing data.${NC}"
read -p "Are you sure you want to continue? (yes/no): " confirmation

if [ "$confirmation" != "yes" ]; then
  log "Restore cancelled"
  exit 0
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
  error "psql not found. Please install PostgreSQL client tools."
fi

# Drop existing database (optional - commented by default)
# log "Dropping existing database..."
# PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -U "$DB_USER" -p "$DB_PORT" "$DB_NAME" || true

# Create database if it doesn't exist
log "Creating database if it doesn't exist..."
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -p "$DB_PORT" \
  -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
PGPASSWORD="$DB_PASSWORD" createdb \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -p "$DB_PORT" \
  "$DB_NAME"

# Restore from backup
log "Restoring database from backup..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -p "$DB_PORT" \
    -d "$DB_NAME"
else
  PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -p "$DB_PORT" \
    -d "$DB_NAME" \
    -f "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
  log "Database restored successfully!"
  
  # Run migrations if needed
  if [ -f "prisma/schema.prisma" ]; then
    log "Running Prisma migrations..."
    npx prisma migrate deploy || warn "Could not run migrations"
  fi
else
  error "Failed to restore database"
fi

log "Restore process completed!"
