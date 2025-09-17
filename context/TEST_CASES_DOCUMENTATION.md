# 📊 Test Cases Documentation - example.csv

## 🎯 **Objetivo**
O arquivo `example.csv` foi criado para testar todos os cenários diferentes do sistema de matching e classificação, incluindo casos de Auto Confirm, Manual Review e New Record.

## 📋 **Estrutura do CSV**
```csv
policyNumber,status,firstName,lastName,phone,dateOfBirth,policyValue,agentNumber,carrier
```

## 🔍 **Casos de Teste Incluídos**

### ✅ **1. Auto Confirm Cases (Score ≥ 60%)**

#### **1.1 Perfect Match (Score: 100%)**
- **Registros:** 1-15 (primeiros 15 registros)
- **Características:** Todos os campos coincidem perfeitamente com os dados em `app_tests`
- **Resultado Esperado:** `auto_confirm`
- **Exemplo:**
  ```csv
  0104230036,Active,BRUNO,ALMEIDA,351-888-4321,1989-03-11,22000,1015489,AMERICAN AMICABLE
  ```

#### **1.2 Policy + Agent Match (Score: 80%)**
- **Registros:** 16-19, 20-23, 24-27, 28-31, 32-35, 36-39, 40-43, 44-47
- **Características:** PolicyNumber e AgentNumber coincidem, outros campos podem variar
- **Resultado Esperado:** `auto_confirm`
- **Exemplo:**
  ```csv
  0104230036,Active,BRUNO,ALMEIDA,555-111-2222,1989-03-11,22000,1015489,AMERICAN AMICABLE
  ```

### ⚠️ **2. Manual Review Cases (Score: 40-59%)**

#### **2.1 Partial Matches**
- **Registros:** 48-51 (últimos 4 registros com dados conhecidos)
- **Características:** Alguns campos coincidem, mas não suficientes para auto-confirmação
- **Resultado Esperado:** `manual_review`
- **Exemplo:**
  ```csv
  0104230036,Active,BRUNO,ALMEIDA,351-888-4321,1991-01-01,22000,1015489,AMERICAN AMICABLE
  ```

### 🆕 **3. New Record Cases (Score < 40%)**

#### **3.1 Completely New Records**
- **Registros:** 52-60 (registros com policyNumbers únicos)
- **Características:** Nenhum campo coincide com dados existentes
- **Resultado Esperado:** `new_record`
- **Exemplo:**
  ```csv
  999999999,Active,UNKNOWN,USER,555-000-0000,1990-01-01,10000,9999999,AMERICAN AMICABLE
  666666666,Active,NEW,CLIENT,555-111-1111,1985-05-15,50000,1111111,AMERICAN AMICABLE
  ```

## 🎨 **Variações de Status**

### **Status Types:**
- **Active:** Registros ativos
- **Pending:** Registros pendentes
- **Inactive:** Registros inativos

### **Distribuição:**
- **Active:** ~40% dos registros
- **Pending:** ~35% dos registros  
- **Inactive:** ~25% dos registros

## 🔧 **Campos de Teste**

### **Core Fields (80 pontos):**
1. **PolicyNumber:** Variações para testar matching
2. **Phone:** Diferentes formatos e números
3. **DateOfBirth:** Datas corretas e incorretas
4. **Name:** Nomes completos e parciais

### **Conditional Fields (20 pontos):**
1. **PolicyValue:** Valores corretos e incorretos
2. **AgentNumber:** Números de agente válidos e inválidos

### **Carrier Field:**
- **Valor:** "AMERICAN AMICABLE" (consistente em todos os registros)

## 📊 **Resultados Esperados por Classificação**

### **Auto Confirm (≥60%):**
- Registros 1-51: ~85% dos casos
- **Critérios:** Perfect match ou Policy+Agent match

### **Manual Review (40-59%):**
- Registros com matches parciais: ~10% dos casos
- **Critérios:** Alguns campos coincidem

### **New Record (<40%):**
- Registros completamente novos: ~5% dos casos
- **Critérios:** Nenhum match significativo

## 🧪 **Como Usar para Testes**

1. **Upload do CSV:** Faça upload do `example.csv` no sistema
2. **Verificar Classificação:** Confirme se os registros são classificados corretamente
3. **Testar Ações:** Teste as ações de Auto Confirm, Manual Review e Create
4. **Verificar Logs:** Confirme se os logs de auditoria são criados

## 📈 **Métricas de Teste**

- **Total de Registros:** 60
- **Auto Confirm Esperado:** ~51 registros (85%)
- **Manual Review Esperado:** ~6 registros (10%)
- **New Record Esperado:** ~3 registros (5%)

## 🔍 **Casos Especiais**

### **Edge Cases:**
1. **Phone Variations:** Diferentes formatos de telefone
2. **Date Variations:** Datas ligeiramente diferentes
3. **Value Variations:** Valores de policy ligeiramente diferentes
4. **Agent Variations:** Números de agente diferentes

### **Boundary Cases:**
1. **Score 60%:** Limite entre Auto Confirm e Manual Review
2. **Score 40%:** Limite entre Manual Review e New Record
3. **Empty Fields:** Campos vazios ou nulos

Este arquivo de teste garante que todos os cenários do sistema sejam cobertos e testados adequadamente.
