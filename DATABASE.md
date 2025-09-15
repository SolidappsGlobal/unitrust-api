# 🗄️ Guia do Banco de Dados - PDF Extractor API

Este projeto usa o **Back4App** com **Parse Server** como banco de dados. O Back4App é uma plataforma de backend-as-a-service que oferece um banco de dados NoSQL baseado em MongoDB.

## 📋 Configuração

### Credenciais do Back4App
```json
{
  "applicationId": "mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK",
  "masterKey": "ZDYmU9PLUhJRhTscXJGBFlU8wThrKY6Q0alTtZu2",
  "javascriptKey": "gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX",
  "serverURL": "https://parseapi.back4app.com"
}
```

## 🏗️ Estrutura das Tabelas (Classes)

### 1. **Document** - Documentos
```typescript
{
  title: string,           // Título do documento
  content: string,         // Conteúdo extraído
  fileUrl: string,         // URL do arquivo
  fileSize: number,        // Tamanho em bytes
  uploadDate: Date,        // Data de upload
  isProcessed: boolean,    // Se foi processado
  tags: string[],          // Tags do documento
  metadata: object         // Metadados adicionais
}
```

### 2. **User** - Usuários
```typescript
{
  username: string,        // Nome de usuário
  email: string,           // Email
  fullName: string,        // Nome completo
  isActive: boolean,       // Se está ativo
  lastLogin: Date,         // Último login
  preferences: object      // Preferências do usuário
}
```

### 3. **Extraction** - Extrações
```typescript
{
  documentId: string,      // ID do documento (Pointer)
  extractedText: string,   // Texto extraído
  extractedData: object,   // Dados estruturados
  status: string,          // Status da extração
  createdAt: Date,         // Data de criação
  completedAt: Date        // Data de conclusão
}
```

## 🚀 Como Usar

### 1. **Via Interface Web**
- Acesse a aba "Database" na aplicação
- Clique em "Criar Todas as Tabelas" para criar as classes
- Use os botões para inserir dados de exemplo
- Consulte dados usando os botões de consulta

### 2. **Via Código**
```typescript
import { createAllTables, insertData, queryData } from './utils/database';

// Criar todas as tabelas
await createAllTables();

// Inserir dados
await insertData('Document', {
  title: 'Meu Documento',
  content: 'Conteúdo do documento...',
  uploadDate: new Date()
});

// Consultar dados
const documents = await queryData('Document');
```

### 3. **Via Dashboard Back4App**
- Acesse: https://console.back4app.com/
- Selecione o app: `pdf-extractor-api`
- Vá em "Database" → "Browser"
- Visualize e edite os dados diretamente

## 📊 Operações Disponíveis

### ✅ Criar Tabelas
```typescript
// Criar uma tabela específica
await createTable(schema);

// Criar todas as tabelas definidas
await createAllTables();
```

### 📝 Inserir Dados
```typescript
await insertData('Document', {
  title: 'Contrato',
  content: 'Conteúdo...',
  uploadDate: new Date()
});
```

### 🔍 Consultar Dados
```typescript
// Consultar todos os registros
const allDocs = await queryData('Document');

// Consultar com filtros
const filteredDocs = await queryData('Document', { 
  isProcessed: false 
});
```

### ✅ Verificar Status
```typescript
// Verificar se uma tabela existe
const exists = await tableExists('Document');

// Listar tabelas existentes
const tables = await listTables();
```

## 🎯 Exemplos Práticos

### Exemplo 1: Upload de Documento
```typescript
// 1. Criar registro do documento
const document = await insertData('Document', {
  title: file.name,
  fileUrl: uploadedFileUrl,
  fileSize: file.size,
  uploadDate: new Date(),
  isProcessed: false
});

// 2. Processar o documento (simulado)
const extraction = await insertData('Extraction', {
  documentId: document.id,
  extractedText: 'Texto extraído...',
  status: 'completed',
  createdAt: new Date()
});

// 3. Atualizar status do documento
// (usar updateData quando implementado)
```

### Exemplo 2: Consulta de Relatórios
```typescript
// Documentos processados hoje
const today = new Date();
today.setHours(0, 0, 0, 0);

const processedToday = await queryData('Extraction', {
  status: 'completed',
  completedAt: { $gte: today }
});
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```env
VITE_PARSE_APP_ID=mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK
VITE_PARSE_JS_KEY=gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX
VITE_PARSE_SERVER_URL=https://parseapi.back4app.com
```

### Cloud Code (Backend)
Para operações mais complexas, você pode criar Cloud Functions no Back4App:

```javascript
// cloud/main.js
Parse.Cloud.define("processDocument", async (request) => {
  const { documentId } = request.params;
  
  // Lógica de processamento
  const document = await new Parse.Query("Document")
    .get(documentId);
  
  // Atualizar status
  document.set("isProcessed", true);
  await document.save();
  
  return { success: true };
});
```

## 🚨 Limitações e Considerações

### Limitações do Parse/Back4App
- **Consultas complexas**: Limitadas comparado ao SQL
- **Joins**: Não suporta joins tradicionais (use Pointers)
- **Transações**: Limitadas
- **Índices**: Automáticos, mas limitados

### Boas Práticas
1. **Use Pointers** para relacionamentos
2. **Denormalize** dados quando necessário
3. **Use Arrays** para dados relacionados simples
4. **Implemente paginação** para grandes datasets
5. **Use Cloud Functions** para lógica complexa

## 🔍 Troubleshooting

### Erro: "Class does not exist"
- Execute `createAllTables()` primeiro
- Verifique se a classe foi criada no dashboard

### Erro: "Invalid session"
- Verifique as credenciais no `back4app-config.json`
- Confirme se o app está ativo no Back4App

### Erro: "Network request failed"
- Verifique a conexão com a internet
- Confirme se a URL do servidor está correta

## 📚 Recursos Adicionais

- [Documentação do Parse](https://docs.parseplatform.org/)
- [Back4App Documentation](https://www.back4app.com/docs)
- [Parse JavaScript SDK](https://docs.parseplatform.org/js/guide/)
- [Dashboard Back4App](https://console.back4app.com/)

## 🎉 Próximos Passos

1. **Implementar autenticação** de usuários
2. **Adicionar validação** de dados
3. **Criar Cloud Functions** para processamento
4. **Implementar upload** de arquivos
5. **Adicionar relatórios** e dashboards
