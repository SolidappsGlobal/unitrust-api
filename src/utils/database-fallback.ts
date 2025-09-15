// Fallback para quando o Parse SDK não está disponível
// Simula as funções do banco de dados para desenvolvimento

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

export const TABLE_SCHEMAS: TableSchema[] = [
  {
    className: 'APP',
    fields: {
      policyNumber: { type: 'String', required: true },
      phone: { type: 'String' },
      dateOfBirth: { type: 'Date' },
      firstName: { type: 'String' },
      lastName: { type: 'String' },
      policyValue: { type: 'Number' },
      agentNumber: { type: 'String' },
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
      rawData: { type: 'String' },
      processedAt: { type: 'Date' },
      errorMessage: { type: 'String' }
    }
  },
  {
    className: 'MatchingResult',
    fields: {
      csvUploadId: { type: 'Pointer', required: true },
      csvRecordId: { type: 'String', required: true },
      appId: { type: 'Pointer' },
      score: { type: 'Number', required: true },
      classification: { type: 'String', required: true },
      confirmed: { type: 'Boolean', defaultValue: false },
      confirmedAt: { type: 'Date' },
      confirmedBy: { type: 'String' },
      matchingFields: { type: 'Object' },
      scoreBreakdown: { type: 'Object' },
      createdAt: { type: 'Date', required: true }
    }
  }
];

// Simular dados em memória
const mockData: { [key: string]: any[] } = {
  APP: [],
  CSVUpload: [],
  MatchingResult: []
};

export async function createTable(schema: TableSchema): Promise<boolean> {
  console.log(`✅ [MOCK] Tabela '${schema.className}' criada com sucesso!`);
  return true;
}

export async function createAllTables(): Promise<void> {
  console.log('🚀 [MOCK] Iniciando criação de tabelas...');
  
  for (const schema of TABLE_SCHEMAS) {
    await createTable(schema);
  }
  
  console.log('✅ [MOCK] Todas as tabelas foram processadas!');
}

export async function tableExists(className: string): Promise<boolean> {
  return mockData[className] !== undefined;
}

export async function listTables(): Promise<string[]> {
  return Object.keys(mockData);
}

export async function insertData(className: string, data: any): Promise<any> {
  const id = `${className}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const record = { ...data, id, objectId: id };
  
  if (!mockData[className]) {
    mockData[className] = [];
  }
  
  mockData[className].push(record);
  console.log(`✅ [MOCK] Dados inseridos na tabela '${className}':`, id);
  return record;
}

export async function queryData(className: string, filters?: any): Promise<any[]> {
  if (!mockData[className]) {
    return [];
  }
  
  let results = [...mockData[className]];
  
  // Aplicar filtros se fornecidos
  if (filters) {
    results = results.filter(record => {
      return Object.entries(filters).every(([key, value]) => {
        return record[key] === value;
      });
    });
  }
  
  return results;
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
