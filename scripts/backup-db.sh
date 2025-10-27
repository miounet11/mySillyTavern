#!/bin/bash

# SillyTavern Database Backup Script
# This script creates a PostgreSQL database backup

# Configuration
BACKUP_DIR="/www/wwwroot/jiuguanmama/mySillyTavern/backups"
DB_NAME="sillytavern_prod"
DB_USER="sillytavern_prod"
DB_PASSWORD="sillytavern2025!"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Keep backups for 30 days
RETENTION_DAYS=30

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send notification (optional)
send_notification() {
    local status=$1
    local message=$2
    # Add notification logic here (email, webhook, etc.)
    log "$message"
}

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    log "Created backup directory: $BACKUP_DIR"
fi

# Start backup
log "${GREEN}Starting database backup...${NC}"
echo -e "${YELLOW}Backing up database: $DB_NAME${NC}"

# Create backup using pg_dump
if PGPASSWORD="$DB_PASSWORD" pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE" 2>> "$LOG_FILE"; then
    # Compress the backup
    gzip "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    # Check if backup was created successfully
    if [ -f "$BACKUP_FILE" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log "${GREEN}✅ Backup completed successfully${NC}"
        log "Backup file: $BACKUP_FILE"
        log "Backup size: $BACKUP_SIZE"
        send_notification "success" "Database backup completed successfully. Size: $BACKUP_SIZE"
    else
        log "${RED}❌ Error: Backup file was not created${NC}"
        send_notification "error" "Database backup failed: File not created"
        exit 1
    fi
else
    log "${RED}❌ Error: pg_dump failed${NC}"
    send_notification "error" "Database backup failed: pg_dump error"
    exit 1
fi

# Clean up old backups (keep only last N days)
log "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete 2>> "$LOG_FILE"

# Count remaining backups
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -type f | wc -l)
log "Current backup count: $BACKUP_COUNT"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Total backup directory size: $TOTAL_SIZE"

log "${GREEN}✅ Backup process completed${NC}"
log "----------------------------------------"

exit 0

