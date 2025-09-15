# Back4App Import - Unitrust API Database Schema

Este diretório contém os arquivos necessários para importar manualmente as tabelas do sistema Unitrust API no Back4App.

## 📁 Arquivos Incluídos

### Schemas das Tabelas
- `AppStatusMatching_schema.json` - Schema da tabela AppStatusMatching (matching de status de carriers)
- `AppStatusUpdate_schema.json` - Schema da tabela AppStatusUpdate (atualizações de status)
- `APPStatus_schema.json` - Schema da tabela APPStatus (status disponíveis)
- `AppStatusLog_schema.json` - Schema da tabela AppStatusLog (log de mudanças de status)

### Dados de Exemplo
- `APPStatus_sample_data.json` - Dados de exemplo para popular a tabela APPStatus

## 🚀 Como Importar no Back4App

### 1. Criar as Classes (Tabelas)

1. Acesse o [Back4App Dashboard](https://dashboard.back4app.com)
2. Selecione seu app
3. Vá em **Database** > **Browser**
4. Clique em **Create a class**
5. Para cada schema:
   - Nome da classe: `APP`, `CSVUpload`, `MatchingResult`
   - Copie os campos do arquivo JSON correspondente
   - Configure as permissões conforme o schema

### 2. Configurar Campos

Para cada classe, adicione os campos conforme o schema:

#### AppStatusMatching Class
- `objectId` (String)
- `createdAt` (Date)
- `updatedAt` (Date)
- `ACL` (ACL)
- `carrier` (String)
- `carrier_status_raw` (String)
- `carrier_status_matching` (Pointer to APPStatus, Required)
- `carrier_status_match` (String)

#### AppStatusUpdate Class
- `objectId` (String)
- `createdAt` (Date)
- `updatedAt` (Date)
- `ACL` (ACL)
- `APP` (String)
- `carrier_status_raw` (String)
- `confirmed` (Boolean)
- `date_confirmed` (Date)
- `full_data` (String)
- `ranked_apps` (Array)
- `received_data` (String)
- `carrier_status_match` (Pointer to APPStatus, Required)

#### APPStatus Class
- `objectId` (String)
- `createdAt` (Date)
- `updatedAt` (Date)
- `ACL` (ACL)
- `name` (String)
- `display` (String)
- `statusGroup` (String)

#### AppStatusLog Class
- `objectId` (String)
- `createdAt` (Date)
- `updatedAt` (Date)
- `ACL` (ACL)
- `APP` (String)
- `status_before` (String)
- `status_change_date` (Date)
- `status_now` (Pointer to APPStatus)

### 3. Importar Dados de Exemplo

1. Vá em **Database** > **Browser**
2. Selecione a classe **APPStatus**
3. Clique em **Add Row**
4. Use os dados do arquivo `APPStatus_sample_data.json` para criar registros de exemplo

### 4. Configurar Permissões

Para cada classe, configure as permissões:
- **find**: `*` (todos)
- **get**: `*` (todos)
- **create**: `*` (todos)
- **update**: `*` (todos)
- **delete**: `*` (todos)

## 🔧 Configuração da Aplicação

Após importar as tabelas, configure as credenciais no seu app:

```javascript
const PARSE_CONFIG = {
  applicationId: 'SEU_APP_ID',
  javascriptKey: 'SUA_JAVASCRIPT_KEY',
  serverURL: 'https://parseapi.back4app.com'
};
```

## 📊 Funcionalidades do Sistema

- **Status Management**: Gerenciamento de status de aplicações
- **Carrier Matching**: Matching de status entre carriers e sistema interno
- **Status Updates**: Atualizações de status com confirmação
- **Status Logging**: Log de mudanças de status para auditoria
- **Status Groups**: Agrupamento de status por categorias (Active, Pending, Closed, etc.)

## 🎯 Próximos Passos

1. Importar as tabelas no Back4App
2. Configurar as credenciais na aplicação
3. Testar o upload de CSV
4. Verificar os resultados do matching
5. Expandir com novas funcionalidades
