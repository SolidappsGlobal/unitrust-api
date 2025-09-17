# 🗑️ Back4App Cleanup Instructions

## Cleanup Options

### 1. Via Web Interface (Recommended)
1. Open the application in your browser
2. On the "Matching List" page, you will see the following buttons:
   - **Clear AppStatusUpdate**: Clears only the AppStatusUpdate table
   - **Clear app_tests**: Clears only the app_tests table
   - **Clear All Tables**: Clears all system tables

### 2. Via Node.js Script
```bash
# Clear all tables
node clear-back4app.js

# Clear specific table
node clear-back4app.js AppStatusUpdate
node clear-back4app.js app_tests
node clear-back4app.js AppStatusMatching
node clear-back4app.js AppStatusLog
```

## Tables that will be cleared

- **AppStatusUpdate**: App status update data
- **AppStatusMatching**: Status matching data
- **AppStatusLog**: Audit logs
- **app_tests**: Test app data

## ⚠️ Important Warnings

1. **This action is IRREVERSIBLE** - All data will be permanently deleted
2. **Mandatory confirmation** - The system will ask for confirmation before executing
3. **Backup recommended** - Backup important data before cleaning
4. **Test first** - Use sample data to test before cleaning real data

## Logs and Monitoring

- All cleanup processes are logged to console
- The interface shows detailed results of each operation
- Counters of deleted records and errors are displayed

## Data Recovery

After cleanup, you can:
1. Use the "Load Example Data" button to load test data
2. Upload new CSV data
3. Import backup data (if available)

## Troubleshooting

If there are errors during cleanup:
1. Check Back4App connection
2. Confirm API credentials
3. Verify that tables exist
4. Check logs for specific details