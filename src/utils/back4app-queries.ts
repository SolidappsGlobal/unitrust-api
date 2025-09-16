// Utilitários para queries no Back4App
import { BACK4APP_CONFIG } from '../config/back4app-rest';

// Função para fazer queries via REST API
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
    console.log(`✅ Query ${className} executada com sucesso`);
    return data.results || [];
    
  } catch (error) {
    console.error(`❌ Erro ao query ${className}:`, error);
    throw error;
  }
}

// Função para inserir dados via REST API
export async function insertData(className: string, data: any) {
  try {
    const url = new URL(`/classes/${className}`, BACK4APP_CONFIG.serverURL);
    
    console.log(`📤 Enviando dados para ${className}:`, data);
    
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
      console.error(`❌ Erro HTTP ${response.status} para ${className}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Dados inseridos em ${className} com sucesso:`, result);
    return result;
    
  } catch (error) {
    console.error(`❌ Erro ao inserir dados em ${className}:`, error);
    throw error;
  }
}

// Função para atualizar dados via REST API
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
    console.log(`✅ Dados atualizados em ${className} com sucesso`);
    return result;
    
  } catch (error) {
    console.error(`❌ Erro ao atualizar dados em ${className}:`, error);
    throw error;
  }
}

// Função para deletar um registro específico via REST API
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
    
    console.log(`✅ Registro ${objectId} deletado de ${className} com sucesso`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro ao deletar registro ${objectId} de ${className}:`, error);
    throw error;
  }
}

// Função para deletar todos os registros de uma classe
export async function deleteAllData(className: string) {
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
export async function clearAllTables() {
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

// Função para buscar todas as tabelas disponíveis
export async function getAvailableTables() {
  try {
    // Lista de tabelas conhecidas do sistema
    const knownTables = [
      'APP',
      'APPStatus', 
      'AppStatusUpdate',
      'AppStatusMatching',
      'AppStatusLog'
    ];
    
    const tables = [];
    
    // Verificar cada tabela conhecida
    for (const tableName of knownTables) {
      try {
        // Tentar fazer uma query simples para verificar se a tabela existe
        const data = await queryData(tableName, undefined, { limit: 1 });
        tables.push({
          className: tableName,
          fields: {}, // Não temos acesso aos schemas
          classLevelPermissions: {},
          recordCount: data.length
        });
        console.log(`✅ Tabela ${tableName} encontrada com ${data.length} registros`);
      } catch (error) {
        // Tabela não existe ou não acessível
        console.log(`⚠️ Tabela ${tableName} não encontrada ou não acessível:`, error);
      }
    }
    
    // Se nenhuma tabela foi encontrada, retornar pelo menos as tabelas esperadas
    if (tables.length === 0) {
      console.log('⚠️ Nenhuma tabela encontrada, retornando lista esperada');
      return knownTables.map(tableName => ({
        className: tableName,
        fields: {},
        classLevelPermissions: {},
        recordCount: 0
      }));
    }
    
    console.log(`✅ ${tables.length} tabelas verificadas com sucesso`);
    return tables;
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
    
    // Fallback: retornar lista básica
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
