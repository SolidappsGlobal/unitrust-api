// Exemplos de uso das funções de banco de dados
import { 
  createTable, 
  createAllTables, 
  insertData, 
  queryData, 
  TABLE_SCHEMAS 
} from '../utils/database';

// Exemplo 1: Criar uma tabela específica
export async function createDocumentTable() {
  const documentSchema = TABLE_SCHEMAS.find(schema => schema.className === 'Document');
  if (documentSchema) {
    const success = await createTable(documentSchema);
    console.log('Tabela Document criada:', success);
  }
}

// Exemplo 2: Inserir dados em uma tabela
export async function insertSampleDocument() {
  const documentData = {
    title: 'Contrato de Serviços',
    content: 'Este é um contrato de prestação de serviços...',
    fileUrl: 'https://exemplo.com/contrato.pdf',
    fileSize: 2048,
    uploadDate: new Date(),
    isProcessed: false,
    tags: ['contrato', 'serviços', '2024'],
    metadata: {
      author: 'João Silva',
      department: 'Jurídico',
      version: '1.0'
    }
  };

  try {
    const result = await insertData('Document', documentData);
    console.log('Documento inserido:', result.id);
    return result;
  } catch (error) {
    console.error('Erro ao inserir documento:', error);
  }
}

// Exemplo 3: Consultar dados com filtros
export async function queryDocumentsByTag(tag: string) {
  try {
    const documents = await queryData('Document', { tags: tag });
    console.log(`Documentos com tag '${tag}':`, documents);
    return documents;
  } catch (error) {
    console.error('Erro ao consultar documentos:', error);
    return [];
  }
}

// Exemplo 4: Consultar todos os documentos
export async function getAllDocuments() {
  try {
    const documents = await queryData('Document');
    console.log('Todos os documentos:', documents);
    return documents;
  } catch (error) {
    console.error('Erro ao consultar todos os documentos:', error);
    return [];
  }
}

// Exemplo 5: Inserir usuário
export async function insertSampleUser() {
  const userData = {
    username: 'maria.silva',
    email: 'maria.silva@empresa.com',
    fullName: 'Maria Silva',
    isActive: true,
    lastLogin: new Date(),
    preferences: {
      theme: 'dark',
      language: 'pt-BR',
      notifications: true
    }
  };

  try {
    const result = await insertData('User', userData);
    console.log('Usuário inserido:', result.id);
    return result;
  } catch (error) {
    console.error('Erro ao inserir usuário:', error);
  }
}

// Exemplo 6: Inserir extração
export async function insertSampleExtraction(documentId: string) {
  const extractionData = {
    documentId: documentId, // ID do documento relacionado
    extractedText: 'Texto extraído do documento...',
    extractedData: {
      entities: ['João Silva', 'Empresa ABC', 'R$ 1.000,00'],
      dates: ['2024-01-15'],
      amounts: [1000.00]
    },
    status: 'completed',
    createdAt: new Date(),
    completedAt: new Date()
  };

  try {
    const result = await insertData('Extraction', extractionData);
    console.log('Extração inserida:', result.id);
    return result;
  } catch (error) {
    console.error('Erro ao inserir extração:', error);
  }
}

// Exemplo 7: Consultar extrações por status
export async function getExtractionsByStatus(status: string) {
  try {
    const extractions = await queryData('Extraction', { status });
    console.log(`Extrações com status '${status}':`, extractions);
    return extractions;
  } catch (error) {
    console.error('Erro ao consultar extrações:', error);
    return [];
  }
}

// Exemplo 8: Fluxo completo - criar tabelas e inserir dados
export async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...');
  
  try {
    // 1. Criar todas as tabelas
    await createAllTables();
    
    // 2. Inserir dados de exemplo
    const document = await insertSampleDocument();
    const user = await insertSampleUser();
    
    if (document) {
      await insertSampleExtraction(document.id);
    }
    
    console.log('✅ Banco de dados configurado com sucesso!');
  } catch (error) {
    console.error('❌ Erro na configuração do banco:', error);
  }
}

// Exemplo 9: Consultas avançadas (usando Parse Query)
export async function advancedQueries() {
  try {
    // Consultar documentos não processados
    const unprocessedDocs = await queryData('Document', { isProcessed: false });
    console.log('Documentos não processados:', unprocessedDocs);
    
    // Consultar usuários ativos
    const activeUsers = await queryData('User', { isActive: true });
    console.log('Usuários ativos:', activeUsers);
    
    // Consultar extrações completadas
    const completedExtractions = await queryData('Extraction', { status: 'completed' });
    console.log('Extrações completadas:', completedExtractions);
    
  } catch (error) {
    console.error('Erro nas consultas avançadas:', error);
  }
}

// Exportar todas as funções para uso
export default {
  createDocumentTable,
  insertSampleDocument,
  queryDocumentsByTag,
  getAllDocuments,
  insertSampleUser,
  insertSampleExtraction,
  getExtractionsByStatus,
  setupDatabase,
  advancedQueries
};
