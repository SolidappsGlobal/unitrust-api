# Prompt para IA do Back4App - Criação da Tabela APP/Clients

## Instruções para a IA do Back4App

Crie a tabela **APP** (ou **Clients**) no meu app Back4App com o schema especificado abaixo. Esta tabela será usada para o sistema de Reliability Score & Matching.

### Tabela: APP

**Campos:**
- `objectId` (String) - ID único do objeto
- `createdAt` (Date) - Data de criação
- `updatedAt` (Date) - Data de atualização
- `ACL` (ACL) - Controle de acesso

**Campos de Identificação (Core Fields - 80 pontos):**
- `policyNumber` (String, Required) - Número da apólice (20 pontos)
- `phone` (String) - Telefone do cliente (20 pontos)
- `dateOfBirth` (Date) - Data de nascimento (20 pontos)
- `firstName` (String) - Primeiro nome (10 pontos)
- `lastName` (String) - Sobrenome (10 pontos)

**Campos Condicionais (20 pontos extras se todos os core fields coincidirem):**
- `policyValue` (Number) - Valor da apólice (10 pontos)
- `agentNumber` (String) - Número do agente (10 pontos)

**Campos Adicionais (Informações do Cliente):**
- `writingAgent` (String) - Agente que escreveu a apólice
- `agentName` (String) - Nome do agente
- `company` (String) - Companhia de seguros
- `status` (String) - Status da apólice
- `appDate` (Date) - Data da aplicação
- `policyDate` (Date) - Data da apólice
- `paidToDate` (Date) - Data do último pagamento
- `recvDate` (Date) - Data de recebimento
- `mi` (String) - Middle initial
- `plan` (String) - Plano de seguro
- `face` (Number) - Valor facial
- `form` (String) - Formulário
- `mode` (String) - Modalidade de pagamento
- `modePrem` (Number) - Prêmio modal
- `address1` (String) - Endereço linha 1
- `address2` (String) - Endereço linha 2
- `address3` (String) - Endereço linha 3
- `address4` (String) - Endereço linha 4
- `state` (String) - Estado
- `zip` (String) - CEP
- `email` (String) - Email do cliente
- `wrtPct` (Number) - Percentual de escrita

**Permissões:**
- find: todos (*)
- count: todos (*)
- get: todos (*)
- create: todos (*)
- update: todos (*)
- delete: todos (*)
- addField: todos (*)

**Dados de Exemplo para Inserir:**
```json
[
  {
    "policyNumber": "POL001",
    "phone": "(555) 123-4567",
    "dateOfBirth": "1985-03-15T00:00:00.000Z",
    "firstName": "John",
    "lastName": "Smith",
    "policyValue": 100000,
    "agentNumber": "AG001",
    "writingAgent": "WA001",
    "agentName": "Jane Doe",
    "company": "Insurance Co",
    "status": "active",
    "appDate": "2024-01-15T00:00:00.000Z",
    "policyDate": "2024-01-15T00:00:00.000Z",
    "paidToDate": "2024-12-15T00:00:00.000Z",
    "recvDate": "2024-01-15T00:00:00.000Z",
    "mi": "M",
    "plan": "Standard",
    "face": 100000,
    "form": "Term",
    "mode": "Annual",
    "modePrem": 1200,
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "address3": "",
    "address4": "",
    "state": "CA",
    "zip": "90210",
    "email": "john.smith@email.com",
    "wrtPct": 0.05
  },
  {
    "policyNumber": "POL002",
    "phone": "(555) 987-6543",
    "dateOfBirth": "1990-07-22T00:00:00.000Z",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "policyValue": 250000,
    "agentNumber": "AG002",
    "writingAgent": "WA002",
    "agentName": "Mike Wilson",
    "company": "Life Insurance Inc",
    "status": "active",
    "appDate": "2024-02-10T00:00:00.000Z",
    "policyDate": "2024-02-10T00:00:00.000Z",
    "paidToDate": "2025-02-10T00:00:00.000Z",
    "recvDate": "2024-02-10T00:00:00.000Z",
    "mi": "F",
    "plan": "Premium",
    "face": 250000,
    "form": "Whole Life",
    "mode": "Monthly",
    "modePrem": 250,
    "address1": "456 Oak Ave",
    "address2": "",
    "address3": "",
    "address4": "",
    "state": "NY",
    "zip": "10001",
    "email": "sarah.johnson@email.com",
    "wrtPct": 0.08
  },
  {
    "policyNumber": "POL003",
    "phone": "(555) 456-7890",
    "dateOfBirth": "1978-11-08T00:00:00.000Z",
    "firstName": "Robert",
    "lastName": "Brown",
    "policyValue": 500000,
    "agentNumber": "AG003",
    "writingAgent": "WA003",
    "agentName": "Lisa Garcia",
    "company": "Premium Life",
    "status": "active",
    "appDate": "2024-03-05T00:00:00.000Z",
    "policyDate": "2024-03-05T00:00:00.000Z",
    "paidToDate": "2025-03-05T00:00:00.000Z",
    "recvDate": "2024-03-05T00:00:00.000Z",
    "mi": "M",
    "plan": "Elite",
    "face": 500000,
    "form": "Universal",
    "mode": "Quarterly",
    "modePrem": 1500,
    "address1": "789 Pine St",
    "address2": "Suite 200",
    "address3": "",
    "address4": "",
    "state": "TX",
    "zip": "75001",
    "email": "robert.brown@email.com",
    "wrtPct": 0.12
  }
]
```

## Contexto do Sistema de Matching:

Esta tabela será usada para:

1. **Reliability Score & Matching** - Comparar dados de CSV com registros existentes
2. **Scoring System** - Calcular pontuação de confiabilidade baseada em:
   - **Core Fields (80 pontos):** policyNumber, phone, dateOfBirth, firstName, lastName
   - **Conditional Fields (20 pontos):** policyValue, agentNumber (só se todos os core fields coincidirem)
3. **Classificação Automática:**
   - **Auto Confirm (>80 pontos):** Confirmação automática
   - **Manual Review (50-80 pontos):** Revisão manual necessária
   - **New Record (<50 pontos):** Novo registro
4. **Integração com AppStatusUpdate** - Para atualizações de status
5. **Auditoria e Logs** - Rastreamento de mudanças

## Instruções Específicas:

1. **Crie a tabela APP** com todos os campos especificados
2. **Configure as permissões** exatamente como indicado
3. **Insira os dados de exemplo** para testes
4. **Configure índices** nos campos principais (policyNumber, phone, firstName, lastName)
5. **Use os tipos de dados corretos** (String, Date, Number, Boolean)

Por favor, crie a tabela APP com o schema e dados especificados.
