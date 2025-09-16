# 🗑️ Instruções para Limpeza do Back4App

## Opções de Limpeza

### 1. Via Interface Web (Recomendado)
1. Abra a aplicação no navegador
2. Na página "Matching List", você verá os seguintes botões:
   - **Clear AppStatusUpdate**: Limpa apenas a tabela AppStatusUpdate
   - **Clear app_tests**: Limpa apenas a tabela app_tests
   - **Clear All Tables**: Limpa todas as tabelas do sistema

### 2. Via Script Node.js
```bash
# Limpar todas as tabelas
node clear-back4app.js

# Limpar tabela específica
node clear-back4app.js AppStatusUpdate
node clear-back4app.js app_tests
node clear-back4app.js AppStatusMatching
node clear-back4app.js AppStatusLog
```

## Tabelas que serão limpas

- **AppStatusUpdate**: Dados de atualização de status dos apps
- **AppStatusMatching**: Dados de matching de status
- **AppStatusLog**: Logs de auditoria
- **app_tests**: Dados dos apps de teste

## ⚠️ Avisos Importantes

1. **Esta ação é IRREVERSÍVEL** - Todos os dados serão permanentemente deletados
2. **Confirmação obrigatória** - O sistema pedirá confirmação antes de executar
3. **Backup recomendado** - Faça backup dos dados importantes antes de limpar
4. **Teste primeiro** - Use dados de exemplo para testar antes de limpar dados reais

## Logs e Monitoramento

- Todos os processos de limpeza são logados no console
- A interface mostra resultados detalhados de cada operação
- Contadores de registros deletados e erros são exibidos

## Recuperação de Dados

Após a limpeza, você pode:
1. Usar o botão "Load Example Data" para carregar dados de teste
2. Fazer upload de novos dados CSV
3. Importar dados de backup (se disponível)

## Troubleshooting

Se houver erros durante a limpeza:
1. Verifique a conexão com o Back4App
2. Confirme as credenciais de API
3. Verifique se as tabelas existem
4. Consulte os logs para detalhes específicos
