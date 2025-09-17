#!/usr/bin/env node

// Script to clean Back4App data
const BACK4APP_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Function to make queries via REST API
async function queryData(className) {
  try {
    const url = new URL(`/classes/${className}`, BACK4APP_CONFIG.serverURL);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
    
  } catch (error) {
    console.error(`❌ Error querying ${className}:`, error);
    throw error;
  }
}

// Function to delete a specific record
async function deleteData(className, objectId) {
  try {
    const url = new URL(`/classes/${className}/${objectId}`, BACK4APP_CONFIG.serverURL);
    
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error deleting record ${objectId} from ${className}:`, error);
    throw error;
  }
}

// Function to delete all records from a class
async function deleteAllData(className) {
  try {
    console.log(`🗑️ Starting cleanup of table ${className}...`);
    
    // First, fetch all records
    const allRecords = await queryData(className);
    console.log(`📊 Found ${allRecords.length} records in ${className}`);
    
    if (allRecords.length === 0) {
      console.log(`✅ Table ${className} is already empty`);
      return { deleted: 0, errors: 0 };
    }
    
    let deleted = 0;
    let errors = 0;
    
    // Delete each record individually
    for (const record of allRecords) {
      try {
        await deleteData(className, record.objectId);
        deleted++;
        console.log(`✅ Deleted ${deleted}/${allRecords.length}: ${record.objectId}`);
      } catch (error) {
        errors++;
        console.error(`❌ Error deleting ${record.objectId}:`, error);
      }
    }
    
    console.log(`✅ Table ${className} cleanup completed: ${deleted} deleted, ${errors} errors`);
    return { deleted, errors };
    
  } catch (error) {
    console.error(`❌ Error cleaning table ${className}:`, error);
    throw error;
  }
}

// Function to clean all system tables
async function clearAllTables() {
  const tables = ['AppStatusUpdate', 'AppStatusMatching', 'AppStatusLog', 'app_tests'];
  const results = [];
  
  console.log('🧹 Starting cleanup of all tables...');
  
  for (const tableName of tables) {
    try {
      const result = await deleteAllData(tableName);
      results.push({ table: tableName, ...result });
    } catch (error) {
      console.error(`❌ Error cleaning table ${tableName}:`, error);
      results.push({ table: tableName, deleted: 0, errors: 1, error: error.message });
    }
  }
  
  console.log('✅ All tables cleanup completed:', results);
  return results;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const tableName = args[0];
  
  try {
    if (tableName) {
      // Clean specific table
      console.log(`🎯 Cleaning specific table: ${tableName}`);
      const result = await deleteAllData(tableName);
      console.log(`✅ Completed: ${result.deleted} deleted, ${result.errors} errors`);
    } else {
      // Clean all tables
      console.log('🎯 Cleaning all tables...');
      const results = await clearAllTables();
      
      const totalDeleted = results.reduce((sum, r) => sum + (r.deleted || 0), 0);
      const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
      
      console.log(`✅ Cleanup completed: ${totalDeleted} records deleted, ${totalErrors} errors`);
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

module.exports = { clearAllTables, deleteAllData, queryData, deleteData };