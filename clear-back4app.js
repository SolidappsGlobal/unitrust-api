#!/usr/bin/env node

// Script para limpar dados do Back4App
const BACK4APP_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Função para fazer queries via REST API
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
    console.error(`❌ Erro ao query ${className}:`, error);
    throw error;
  }
}

// Função para deletar um registro específico
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
    console.error(`❌ Erro ao deletar registro ${objectId} de ${className}:`, error);
    throw error;
  }
}

// Função para deletar todos os registros de uma classe
async function deleteAllData(className) {
  try {
    console.log(`🗑️ Iniciando limpeza da tabela ${className}...`);
    
    // Primeiro, buscar todos os registros
    const allRecords = await queryData(className);
    console.log(`📊 Encontrados ${allRecords.length} registros em ${className}`);
    
    if (allRecords.length === 0) {
      console.log(`✅ Tabela ${className} já está vazia`);
      return { deleted: 0, errors: 0 };
    }
    
    let deleted = 0;
    let errors = 0;
    
    // Deletar cada registro individualmente
    for (const record of allRecords) {
      try {
        await deleteData(className, record.objectId);
        deleted++;
        console.log(`✅ Deletado ${deleted}/${allRecords.length}: ${record.objectId}`);
      } catch (error) {
        errors++;
        console.error(`❌ Erro ao deletar ${record.objectId}:`, error);
      }
    }
    
    console.log(`✅ Limpeza da tabela ${className} concluída: ${deleted} deletados, ${errors} erros`);
    return { deleted, errors };
    
  } catch (error) {
    console.error(`❌ Erro ao limpar tabela ${className}:`, error);
    throw error;
  }
}

// Função para limpar todas as tabelas do sistema
async function clearAllTables() {
  const tables = ['AppStatusUpdate', 'AppStatusMatching', 'AppStatusLog', 'app_tests'];
  const results = [];
  
  console.log('🧹 Iniciando limpeza de todas as tabelas...');
  
  for (const tableName of tables) {
    try {
      const result = await deleteAllData(tableName);
      results.push({ table: tableName, ...result });
    } catch (error) {
      console.error(`❌ Erro ao limpar tabela ${tableName}:`, error);
      results.push({ table: tableName, deleted: 0, errors: 1, error: error.message });
    }
  }
  
  console.log('✅ Limpeza de todas as tabelas concluída:', results);
  return results;
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const tableName = args[0];
  
  try {
    if (tableName) {
      // Limpar tabela específica
      console.log(`🎯 Limpando tabela específica: ${tableName}`);
      const result = await deleteAllData(tableName);
      console.log(`✅ Concluído: ${result.deleted} deletados, ${result.errors} erros`);
    } else {
      // Limpar todas as tabelas
      console.log('🎯 Limpando todas as tabelas...');
      const results = await clearAllTables();
      
      const totalDeleted = results.reduce((sum, r) => sum + (r.deleted || 0), 0);
      const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
      
      console.log(`✅ Limpeza concluída: ${totalDeleted} registros deletados, ${totalErrors} erros`);
    }
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { clearAllTables, deleteAllData, queryData, deleteData };
