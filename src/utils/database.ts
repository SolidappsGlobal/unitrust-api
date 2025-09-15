// Utilitários para gerenciar o banco de dados Back4App/Parse
let Parse: any = null;

// Configuração do Parse
const PARSE_CONFIG = {
  applicationId: 'mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK',
  javascriptKey: 'gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX',
  serverURL: 'https://parseapi.back4app.com'
};

// Função para inicializar Parse de forma segura
async function initializeParse() {
  if (!Parse) {
    try {
      const ParseModule = await import('parse');
      Parse = ParseModule.default;
      
      // Inicializar Parse
      Parse.initialize(PARSE_CONFIG.applicationId, PARSE_CONFIG.javascriptKey);
      Parse.serverURL = PARSE_CONFIG.serverURL;
      
      console.log('✅ Parse SDK inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Parse SDK:', error);
      console.log('🔄 Usando modo fallback (dados em memória)');
      throw error;
    }
  }
  return Parse;
}

// Função para usar fallback em caso de erro
async function useFallback() {
  const fallback = await import('./database-fallback');
  return fallback.default;
}

// Interface para definir estrutura de tabelas
export interface TableSchema {
  className: string;
  fields: {
    [key: string]: {
      type: 'String' | 'Number' | 'Boolean' | 'Date' | 'Array' | 'Object' | 'Pointer' | 'File';
      required?: boolean;
      defaultValue?: any;
    };
  };
}

// Schemas das tabelas para POC de Reliability Score & Matching
export const TABLE_SCHEMAS: TableSchema[] = [
  {
    className: 'APP',
    fields: {
      // Campos principais para matching
      policyNumber: { type: 'String', required: true },
      phone: { type: 'String' },
      dateOfBirth: { type: 'Date' },
      firstName: { type: 'String' },
      lastName: { type: 'String' },
      policyValue: { type: 'Number' },
      agentNumber: { type: 'String' },
      
      // Campos adicionais do CSV
      writingAgent: { type: 'String' },
      agentName: { type: 'String' },
      company: { type: 'String' },
      status: { type: 'String' },
      appDate: { type: 'Date' },
      policyDate: { type: 'Date' },
      paidToDate: { type: 'Date' },
      recvDate: { type: 'Date' },
      mi: { type: 'String' },
      plan: { type: 'String' },
      face: { type: 'Number' },
      form: { type: 'String' },
      mode: { type: 'String' },
      modePrem: { type: 'Number' },
      address1: { type: 'String' },
      address2: { type: 'String' },
      address3: { type: 'String' },
      address4: { type: 'String' },
      state: { type: 'String' },
      zip: { type: 'String' },
      email: { type: 'String' },
      wrtPct: { type: 'Number' },
      
      // Metadados
      createdAt: { type: 'Date', required: true },
      updatedAt: { type: 'Date', required: true }
    }
  },
  {
    className: 'CSVUpload',
    fields: {
      fileName: { type: 'String', required: true },
      uploadDate: { type: 'Date', required: true },
      totalRecords: { type: 'Number' },
      processedRecords: { type: 'Number', defaultValue: 0 },
      status: { type: 'String', required: true, defaultValue: 'pending' },
      rawData: { type: 'String' }, // JSON string dos dados do CSV
      processedAt: { type: 'Date' },
      errorMessage: { type: 'String' }
    }
  },
  {
    className: 'MatchingResult',
    fields: {
      csvUploadId: { type: 'Pointer', required: true },
      csvRecordId: { type: 'String', required: true }, // ID do registro no CSV
      appId: { type: 'Pointer' }, // ID do APP encontrado (se houver)
      
      // Dados do CSV para comparação
      csvPolicyNumber: { type: 'String' },
      csvPhone: { type: 'String' },
      csvDateOfBirth: { type: 'Date' },
      csvFirstName: { type: 'String' },
      csvLastName: { type: 'String' },
      csvPolicyValue: { type: 'Number' },
      csvAgentNumber: { type: 'String' },
      
      // Dados do APP encontrado
      appPolicyNumber: { type: 'String' },
      appPhone: { type: 'String' },
      appDateOfBirth: { type: 'Date' },
      appFirstName: { type: 'String' },
      appLastName: { type: 'String' },
      appPolicyValue: { type: 'Number' },
      appAgentNumber: { type: 'String' },
      
      // Resultado do matching
      score: { type: 'Number', required: true },
      classification: { type: 'String', required: true }, // 'auto_confirm', 'manual_review', 'new_record'
      confirmed: { type: 'Boolean', defaultValue: false },
      confirmedAt: { type: 'Date' },
      confirmedBy: { type: 'String' },
      
      // Detalhes do scoring
      matchingFields: { type: 'Object' }, // Campos que fizeram match
      scoreBreakdown: { type: 'Object' }, // Detalhamento dos pontos
      
      createdAt: { type: 'Date', required: true }
    }
  }
];

// Função para criar uma tabela (classe) no Parse
export async function createTable(schema: TableSchema): Promise<boolean> {
  try {
    const parse = await initializeParse();
    
    // No Parse, as classes são criadas automaticamente quando você salva o primeiro objeto
    // Mas podemos criar um objeto vazio para "inicializar" a classe
    const ParseObject = parse.Object.extend(schema.className);
    const object = new ParseObject();
    
    // Definir campos com valores padrão
    Object.entries(schema.fields).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.defaultValue !== undefined) {
        object.set(fieldName, fieldConfig.defaultValue);
      }
    });
    
    // Salvar o objeto (isso cria a classe se ela não existir)
    await object.save();
    
    // Deletar o objeto de inicialização
    await object.destroy();
    
    console.log(`✅ Tabela '${schema.className}' criada com sucesso!`);
    return true;
  } catch (error) {
    console.log(`🔄 Usando fallback para criar tabela '${schema.className}'`);
    const fallback = await useFallback();
    return await fallback.createTable(schema);
  }
}

// Função para criar todas as tabelas definidas nos schemas
export async function createAllTables(): Promise<void> {
  console.log('🚀 Iniciando criação de tabelas...');
  
  for (const schema of TABLE_SCHEMAS) {
    await createTable(schema);
  }
  
  console.log('✅ Todas as tabelas foram processadas!');
}

// Função para verificar se uma tabela existe
export async function tableExists(className: string): Promise<boolean> {
  try {
    const parse = await initializeParse();
    const query = new parse.Query(className);
    query.limit(1);
    const results = await query.find();
    return true; // Se não deu erro, a tabela existe
  } catch (error) {
    const fallback = await useFallback();
    return await fallback.tableExists(className);
  }
}

// Função para listar todas as tabelas (classes)
export async function listTables(): Promise<string[]> {
  try {
    // No Parse, não há uma API direta para listar classes
    // Mas podemos tentar consultar as classes conhecidas
    const knownClasses = TABLE_SCHEMAS.map(schema => schema.className);
    const existingClasses: string[] = [];
    
    for (const className of knownClasses) {
      if (await tableExists(className)) {
        existingClasses.push(className);
      }
    }
    
    return existingClasses;
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
    return [];
  }
}

// Função para inserir dados em uma tabela
export async function insertData(className: string, data: any): Promise<any> {
  try {
    const parse = await initializeParse();
    const ParseObject = parse.Object.extend(className);
    const object = new ParseObject();
    
    // Definir os dados
    Object.entries(data).forEach(([key, value]) => {
      object.set(key, value);
    });
    
    const result = await object.save();
    console.log(`✅ Dados inseridos na tabela '${className}':`, result.id);
    return result;
  } catch (error) {
    console.log(`🔄 Usando fallback para inserir dados na tabela '${className}'`);
    const fallback = await useFallback();
    return await fallback.insertData(className, data);
  }
}

// Função para consultar dados de uma tabela
export async function queryData(className: string, filters?: any): Promise<any[]> {
  try {
    const parse = await initializeParse();
    const query = new parse.Query(className);
    
    // Aplicar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query.equalTo(key, value);
      });
    }
    
    const results = await query.find();
    return results;
  } catch (error) {
    console.log(`🔄 Usando fallback para consultar dados da tabela '${className}'`);
    const fallback = await useFallback();
    return await fallback.queryData(className, filters);
  }
}

export default {
  createTable,
  createAllTables,
  tableExists,
  listTables,
  insertData,
  queryData,
  TABLE_SCHEMAS
};
