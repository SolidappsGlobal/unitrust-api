// Utilities for Back4App queries
import { BACK4APP_CONFIG } from '../config/back4app-rest';

// Function to make queries via REST API
export async function queryData(className: string, include?: string, where?: any) {
  try {
    const url = new URL(`/classes/${className}`, BACK4APP_CONFIG.serverURL);
    
    if (include) {
      url.searchParams.append('include', include);
    }
    
    if (where) {
      url.searchParams.append('where', JSON.stringify(where));
    }
    
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
    console.log(`✅ Query ${className} executed successfully`);
    return data.results || [];
    
  } catch (error) {
    console.error(`❌ Error querying ${className}:`, error);
    throw error;
  }
}

// Function to insert data via REST API
export async function insertData(className: string, data: any) {
  try {
    const url = new URL(`/classes/${className}`, BACK4APP_CONFIG.serverURL);
    
    console.log(`📤 Sending data to ${className}:`, data);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP error ${response.status} for ${className}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Data inserted into ${className} successfully:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Error inserting data into ${className}:`, error);
    throw error;
  }
}

// Function to update data via REST API
export async function updateData(className: string, objectId: string, data: any) {
  try {
    const url = new URL(`/classes/${className}/${objectId}`, BACK4APP_CONFIG.serverURL);
    
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'X-Parse-Application-Id': BACK4APP_CONFIG.applicationId,
        'X-Parse-JavaScript-Key': BACK4APP_CONFIG.javascriptKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`✅ Data updated in ${className} successfully`);
    return result;
    
  } catch (error) {
    console.error(`❌ Error updating data in ${className}:`, error);
    throw error;
  }
}

// Function to delete a specific record via REST API
export async function deleteData(className: string, objectId: string) {
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
    
    console.log(`✅ Record ${objectId} deleted from ${className} successfully`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error deleting record ${objectId} from ${className}:`, error);
    throw error;
  }
}

// Function to delete all records from a class
export async function deleteAllData(className: string) {
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
export async function clearAllTables() {
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

// Function to fetch all available tables
export async function getAvailableTables() {
  try {
    // List of known system tables
    const knownTables = [
      'APP',
      'APPStatus', 
      'AppStatusUpdate',
      'AppStatusMatching',
      'AppStatusLog'
    ];
    
    const tables = [];
    
    // Check each known table
    for (const tableName of knownTables) {
      try {
        // Try to make a simple query to check if the table exists
        const data = await queryData(tableName, undefined, { limit: 1 });
        tables.push({
          className: tableName,
          fields: {}, // We don't have access to schemas
          classLevelPermissions: {},
          recordCount: data.length
        });
        console.log(`✅ Table ${tableName} found with ${data.length} records`);
      } catch (error) {
        // Table does not exist or is not accessible
        console.log(`⚠️ Table ${tableName} not found or not accessible:`, error);
      }
    }
    
    // If no table was found, return at least the expected tables
    if (tables.length === 0) {
      console.log('⚠️ No tables found, returning expected list');
      return knownTables.map(tableName => ({
        className: tableName,
        fields: {},
        classLevelPermissions: {},
        recordCount: 0
      }));
    }
    
    console.log(`✅ ${tables.length} tables verified successfully`);
    return tables;
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    
    // Fallback: return basic list
    return [
      'APP',
      'APPStatus', 
      'AppStatusUpdate',
      'AppStatusMatching',
      'AppStatusLog'
    ].map(tableName => ({
      className: tableName,
      fields: {},
      classLevelPermissions: {},
      recordCount: 0
    }));
  }
}
