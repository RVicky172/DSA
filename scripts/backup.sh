#!/bin/bash

# DSA Learning Platform - Database Backup Script
# Backs up PostgreSQL database to local and cloud storage
# Usage: ./backup.sh [local|cloud|both]

set -e

# Configuration
BACKUP_TYPE=${1:-both}
BACKUP_DIR="/backups"
DB_NAME=${DB_NAME:-dsa_learning}
DB_USER=${DB_USER:-dsa_user}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/dsa_backup_$TIMESTAMP.sql.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if PostgreSQL is available
if ! command -v pg_dump &> /dev/null; then
  error "pg_dump not found. Please install PostgreSQL client tools."
fi

log "Starting database backup..."
log "Database: $DB_NAME"
log "Host: $DB_HOST:$DB_PORT"
log "Backup type: $BACKUP_TYPE"

# Perform backup
perform_backup() {
  log "Creating PostgreSQL dump..."
  PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -p "$DB_PORT" \
    -d "$DB_NAME" \
    --verbose \
    | gzip > "$BACKUP_FILE"
  
  if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup created successfully: $BACKUP_FILE (Size: $BACKUP_SIZE)"
  else
    error "Failed to create backup"
  fi
}

# Upload to cloud storage (AWS S3)
upload_to_s3() {
  if [ -z "$AWS_S3_BUCKET" ]; then
    warn "AWS_S3_BUCKET not set. Skipping S3 upload."
    return
  fi

  if ! command -v aws &> /dev/null; then
    warn "AWS CLI not found. Skipping S3 upload."
    return
  fi

  log "Uploading to AWS S3..."
  S3_KEY="backups/$(basename $BACKUP_FILE)"
  
  aws s3 cp "$BACKUP_FILE" "s3://$AWS_S3_BUCKET/$S3_KEY" \
    --storage-class STANDARD_IA \
    --metadata "backup-date=$(date +'%Y-%m-%d'),database=$DB_NAME"
  
  if [ $? -eq 0 ]; then
    log "Uploaded to S3: s3://$AWS_S3_BUCKET/$S3_KEY"
  else
    error "Failed to upload to S3"
  fi
}

# Cleanup old backups (keep last 7 days)
cleanup_old_backups() {
  log "Cleaning up old backups (keeping last 7 days)..."
  find "$BACKUP_DIR" -name "dsa_backup_*.sql.gz" -mtime +7 -delete
  log "Cleanup completed"
}

# Main execution
case "$BACKUP_TYPE" in
  local)
    perform_backup
    cleanup_old_backups
    ;;
  cloud)
    perform_backup
    upload_to_s3
    ;;
  both)
    perform_backup
    upload_to_s3
    cleanup_old_backups
    ;;
  *)
    error "Invalid backup type. Use: local, cloud, or both"
    ;;
esac

log "Backup process completed successfully!"
