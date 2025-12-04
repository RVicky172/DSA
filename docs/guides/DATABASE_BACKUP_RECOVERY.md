# Database Backup & Recovery Plan

This document outlines the backup strategy, recovery procedures, and disaster recovery plan for the DSA Learning Platform.

## Overview

The DSA Learning Platform uses PostgreSQL for data storage. This guide covers:
- Backup strategies (local and cloud)
- Automated backup scheduling
- Recovery procedures
- Disaster recovery testing
- Data retention policies

## Backup Strategy

### Three-Tier Backup Approach

**Tier 1: Local Backups** (Docker Volume)
- Location: `/backups` directory in Docker container
- Frequency: Daily
- Retention: 7 days
- Use case: Quick recovery from data corruption

**Tier 2: Cloud Backups** (AWS S3)
- Location: S3 bucket with versioning enabled
- Frequency: Daily
- Retention: 90 days
- Use case: Protection against server failure

**Tier 3: Managed Database Backups** (AWS RDS)
- Location: AWS RDS automated backups
- Frequency: Daily
- Retention: 35 days
- Use case: Enterprise-grade disaster recovery

### Backup Schedule

```
Daily Backup: 2:00 AM UTC
- Local backup to /backups
- Cloud backup to S3
- Cleanup backups older than 7 days
- Verify backup integrity
```

## Local Backups

### Configuration

Backups are stored in Docker volume:

```yaml
# docker-compose.yml
volumes:
  postgres_data:
    driver: local
  backups:
    driver: local
```

Map to host directory:

```bash
-v /var/backups:/backups
```

### Create Local Backup

```bash
# Manual backup
./scripts/backup.sh local

# Output
[2024-12-04 02:00:00] Starting database backup...
[2024-12-04 02:00:05] Backup created successfully: /backups/dsa_backup_20241204_020000.sql.gz (Size: 156M)
```

### Restore from Local Backup

```bash
# List available backups
ls -lh /backups/

# Restore from backup
./scripts/restore.sh /backups/dsa_backup_20241204_020000.sql.gz

# Verify restore
psql -U dsa_user -d dsa_learning -c "SELECT COUNT(*) FROM users;"
```

## Cloud Backups (AWS S3)

### Setup

1. **Create S3 Bucket**:
```bash
aws s3 mb s3://dsa-backups-${ENVIRONMENT} --region us-east-1
```

2. **Enable Versioning**:
```bash
aws s3api put-bucket-versioning \
  --bucket dsa-backups-${ENVIRONMENT} \
  --versioning-configuration Status=Enabled
```

3. **Set Lifecycle Policy** (archive after 30 days):
```json
{
  "Rules": [
    {
      "Id": "ArchiveOldBackups",
      "Status": "Enabled",
      "Prefix": "backups/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
```

4. **Configure IAM Permissions**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::dsa-backups-${ENVIRONMENT}/backups/*"
    }
  ]
}
```

### Environment Variables

```bash
# Set in your CI/CD or deployment platform
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET=dsa-backups-production
AWS_REGION=us-east-1
```

### Upload to S3

```bash
# Automatic (via backup script)
./scripts/backup.sh cloud

# Manual upload
aws s3 cp /backups/dsa_backup_20241204_020000.sql.gz \
  s3://dsa-backups-production/backups/ \
  --storage-class STANDARD_IA \
  --metadata "backup-date=2024-12-04,database=dsa_learning"
```

### Download from S3

```bash
# List backups
aws s3 ls s3://dsa-backups-production/backups/

# Download specific backup
aws s3 cp s3://dsa-backups-production/backups/dsa_backup_20241204_020000.sql.gz \
  ./dsa_backup_20241204_020000.sql.gz

# Restore
./scripts/restore.sh ./dsa_backup_20241204_020000.sql.gz
```

## Automated Backup Scheduling

### Using Docker + Cron (Self-Hosted)

1. **Create backup service**:
```bash
# Create a backup container
docker run -d \
  --name dsa-backup \
  --volumes-from dsa-db-prod \
  -v /var/backups:/backups \
  -e DB_NAME=dsa_learning \
  -e DB_USER=dsa_user \
  -e DB_PASSWORD=${DB_PASSWORD} \
  -e AWS_S3_BUCKET=dsa-backups-production \
  dsa-backup:latest
```

2. **Setup cron job**:
```bash
# /etc/cron.d/dsa-backup
0 2 * * * root /app/scripts/backup.sh both >> /var/log/dsa-backup.log 2>&1
```

### Using AWS RDS Automated Backups

```bash
# Create RDS instance with backups enabled
aws rds create-db-instance \
  --db-instance-identifier dsa-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --backup-retention-period 35 \
  --preferred-backup-window "02:00-03:00" \
  --preferred-maintenance-window "sun:03:00-sun:04:00"
```

### Using GitHub Actions (Recommended)

Create `.github/workflows/backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC daily

jobs:
  backup:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Create database backup
        env:
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
          DB_HOST: ${{ secrets.DB_HOST }}
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
        run: |
          ./scripts/backup.sh cloud
      
      - name: Upload to S3
        run: |
          LATEST_BACKUP=$(ls -t /backups/dsa_backup_*.sql.gz | head -1)
          aws s3 cp "$LATEST_BACKUP" s3://${{ secrets.AWS_S3_BUCKET }}/backups/
      
      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Database backup failed!'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Recovery Procedures

### Data Corruption Recovery (Low Priority)

**Scenario**: Corrupted records in database

**RTO**: 1-4 hours
**RPO**: < 1 day

**Steps**:
1. Identify when corruption occurred
2. Find backup before corruption
3. Restore to separate test database
4. Verify data integrity
5. Restore to production (with downtime)

```bash
# Restore to test environment
./scripts/restore.sh /backups/dsa_backup_20241203_020000.sql.gz

# Verify
psql -U dsa_user -d dsa_learning -c "SELECT * FROM lessons LIMIT 5;"

# If OK, restore to production
# (Database must be stopped)
docker stop dsa-db-prod
./scripts/restore.sh /backups/dsa_backup_20241203_020000.sql.gz
docker start dsa-db-prod
```

### Accidental Deletion Recovery (Medium Priority)

**Scenario**: User accidentally deletes important data

**RTO**: 2-4 hours
**RPO**: < 4 hours

**Steps**:
1. Stop application from writing to database
2. Identify what was deleted
3. Restore data from backup
4. Merge with recent changes if needed

```bash
# Check recent backups
ls -lh /backups/ | tail -5

# Create temporary database for recovery
createdb dsa_learning_recovery

# Restore to temporary database
gunzip -c /backups/dsa_backup_20241204_015900.sql.gz | \
  psql -d dsa_learning_recovery

# Compare and merge
psql -d dsa_learning_recovery -c "SELECT * FROM users WHERE id = 123;"

# Restore if confirmed
./scripts/restore.sh /backups/dsa_backup_20241204_015900.sql.gz
```

### Server Failure Recovery (High Priority)

**Scenario**: Database server fails completely

**RTO**: 15-30 minutes
**RPO**: < 24 hours

**Steps**:
1. Provision new server/RDS instance
2. Restore from S3 backup
3. Verify data integrity
4. Update application connection string
5. Run migrations if needed

```bash
# Download backup from S3
aws s3 cp s3://dsa-backups-production/backups/dsa_backup_20241204_020000.sql.gz \
  ./dsa_backup_20241204_020000.sql.gz

# Restore to new server
./scripts/restore.sh ./dsa_backup_20241204_020000.sql.gz

# Verify
psql -h new-db-host -U dsa_user -d dsa_learning -c "SELECT COUNT(*) FROM users;"

# Update connection string in environment
export DATABASE_URL="postgresql://dsa_user:password@new-db-host:5432/dsa_learning"

# Run migrations
npx prisma migrate deploy

# Update application and restart
docker-compose up -d
```

### Ransomware/Security Breach Recovery (Critical)

**Scenario**: Database compromised by ransomware/unauthorized access

**RTO**: < 1 hour
**RPO**: < 24 hours

**Steps**:
1. Isolate affected systems immediately
2. Revoke all database credentials
3. Restore from clean, verified backup
4. Regenerate all secrets and tokens
5. Audit access logs
6. Notify affected users

```bash
# Isolate: Stop all connections
docker stop dsa-backend-prod
docker stop dsa-frontend-prod

# Backup infected database for forensics
cp -r /var/lib/postgresql/data /backups/infected_backup_$(date +%s)

# Restore from trusted backup
./scripts/restore.sh /backups/dsa_backup_20241203_020000.sql.gz

# Regenerate secrets
export JWT_SECRET=$(openssl rand -hex 32)
export DB_PASSWORD=$(openssl rand -base64 32)

# Reset user passwords in database
psql -d dsa_learning -c "UPDATE users SET password = '$(echo 'reset' | bcrypt)' WHERE id != 1;"

# Restart with new credentials
docker-compose up -d

# Audit logs
docker logs dsa-backend-prod | grep "authentication" | tail -20
```

## Backup Verification

### Weekly Verification (Production)

Run every Sunday at 3 AM UTC:

```bash
#!/bin/bash
# Test restore to temporary database
BACKUP_FILE=$(ls -t /backups/dsa_backup_*.sql.gz | head -1)
TEST_DB="dsa_learning_test_$(date +%s)"

log "Verifying backup: $BACKUP_FILE"

# Create test database
createdb "$TEST_DB"

# Restore
gunzip -c "$BACKUP_FILE" | psql -d "$TEST_DB"

# Run integrity checks
psql -d "$TEST_DB" -c "ANALYZE;"
psql -d "$TEST_DB" -c "SELECT COUNT(*) FROM users;"
psql -d "$TEST_DB" -c "SELECT COUNT(*) FROM lessons;"
psql -d "$TEST_DB" -c "SELECT COUNT(*) FROM problems;"

# Cleanup
dropdb "$TEST_DB"

log "Backup verification successful!"
```

### Automated Verification

Add to backup script:

```bash
verify_backup() {
  local backup_file=$1
  local test_db="dsa_verify_$RANDOM"
  
  createdb "$test_db"
  gunzip -c "$backup_file" | psql -d "$test_db" > /dev/null 2>&1
  
  local user_count=$(psql -d "$test_db" -tc "SELECT COUNT(*) FROM users;")
  dropdb "$test_db"
  
  if [ "$user_count" -gt 0 ]; then
    return 0
  else
    return 1
  fi
}
```

## Data Retention Policy

| Tier | Location | Frequency | Retention | Purpose |
|------|----------|-----------|-----------|---------|
| Local | /backups | Daily | 7 days | Quick recovery |
| Cloud | S3 Standard | Daily | 30 days | Redundancy |
| Cloud | S3 Glacier | Automatic | 60 days | Compliance |
| RDS | AWS RDS | Daily | 35 days | Managed backups |

### Cleanup Policy

```bash
# Keep last 7 local backups
find /backups -name "dsa_backup_*.sql.gz" -mtime +7 -delete

# S3 lifecycle transitions to Glacier after 30 days
# S3 lifecycle deletes after 90 days

# Compliance: Retain one backup per month indefinitely
aws s3 cp /backups/dsa_backup_20241201_020000.sql.gz \
  s3://dsa-backups-archive/monthly/dsa_backup_202412.sql.gz
```

## Disaster Recovery Testing

### Monthly DR Test

1. **Schedule**: First Sunday of each month, 8 AM UTC
2. **Duration**: 2-4 hours
3. **Participants**: 2+ team members

**Test Checklist**:
- [ ] Start with latest backup
- [ ] Restore to test environment
- [ ] Verify all data integrity checks pass
- [ ] Run application against test database
- [ ] Execute smoke tests
- [ ] Document time to recovery
- [ ] Identify and fix issues
- [ ] Update documentation

### Annual Full-Scale DR Exercise

**Objective**: Simulate complete data center failure

**Scope**: 
- Restore to completely new server
- Verify all services startup correctly
- Confirm user access works
- Test failover procedures

**Success Criteria**:
- Recovery completed within 30 minutes
- 100% data integrity
- All services operational
- Users can log in and access data

## Monitoring & Alerts

### Backup Status Monitoring

```bash
#!/bin/bash
# Check backup completion
LATEST_BACKUP=$(ls -t /backups/dsa_backup_*.sql.gz 2>/dev/null | head -1)
LAST_MODIFIED=$(($(date +%s) - $(stat -f%m "$LATEST_BACKUP" 2>/dev/null || echo 0)))

if [ "$LAST_MODIFIED" -gt 86400 ]; then
  # Alert if no backup in 24 hours
  send_alert "No recent backup found"
fi
```

### Set Up Alerts

- **CloudWatch** (AWS): Monitor S3 uploads
- **Slack**: Notify on backup success/failure
- **PagerDuty**: Alert on missing backups

## Disaster Recovery Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Database Admin | [Name] | [Email] | [Phone] |
| DevOps Lead | [Name] | [Email] | [Phone] |
| On-Call | [Name] | [Email] | [Phone] |

## Related Documentation

- [Security Hardening Guide](./SECURITY_HARDENING.md)
- [Logging & Error Tracking](./LOGGING_ERROR_TRACKING.md)
- [Environment Management](./ENVIRONMENT_MANAGEMENT.md)
- [Database Setup Guide](./DATABASE_SETUP_GUIDE.md)

## Compliance

**Standards**:
- SOC2 Type II: Annual backup verification
- GDPR: Right to data portability maintained
- HIPAA (if applicable): Encrypted backups, audit logs

**Audit Trail**:
All backup operations are logged:
```
- Backup start/end time
- Backup size
- Backup location
- Verification status
- Restore operations
```

---

**Last Updated**: December 4, 2025
**Next Review**: June 4, 2025
**Maintained By**: DevOps Team
**Approval**: Database Administrator
