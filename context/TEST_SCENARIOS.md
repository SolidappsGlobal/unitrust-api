# Cenários de Teste - Sistema CSV Upload

## 📋 **Arquivo de Teste: `example.csv`**

Este arquivo contém **20 registros** que testam todos os cenários possíveis do sistema de matching com dados reais da tabela `app_tests`:

### 🎯 **Cenários Implementados:**

#### **1. Auto Confirm (Score > 80% + Campos Mandatórios) - 6 registros**
- **Linhas 1-2, 11-12, 17-18**: Matches perfeitos com PolicyNumber + AgentNumber + outros campos
- **PolicyNumbers**: `0104230020`, `0104230023`, `0104230021` (existem na tabela app_tests)
- **AgentNumbers**: `1015228`, `1015234`, `1015211` (existem na tabela app_tests)
- **Pontuação**: 100 pontos (todos os campos coincidem)
- **Campos Mandatórios**: ✅ PolicyNumber + AgentNumber
- **Resultado**: ✅ **Auto Confirm**

#### **2. Manual Review (Score 50-80%) - 8 registros**
- **Linhas 3, 12, 19**: PolicyNumber + AgentNumber corretos, mas phone diferente
- **Linhas 4, 13, 20**: PolicyNumber + AgentNumber corretos, mas DOB diferente  
- **Linhas 5, 14**: PolicyNumber + AgentNumber corretos, mas name diferente
- **Linhas 6, 15**: PolicyNumber + AgentNumber corretos, mas policyValue diferente
- **Pontuação**: 60-80 pontos (campos principais + condicionais parciais)
- **Resultado**: ⚠️ **Manual Review**

#### **3. New Record (Score < 50%) - 6 registros**
- **Linhas 7-8, 16**: PolicyNumber correto, mas agentNumber diferente
- **Linhas 9-10**: PolicyNumber não existe na base (999999999, 888888888)
- **Pontuação**: 0-40 pontos
- **Resultado**: ❌ **New Record**

### 📊 **Sistema de Pontuação Atualizado:**

| Campo | Pontos | Tipo | Descrição |
|-------|--------|------|-----------|
| PolicyNumber | 20 | Principal | Campo obrigatório para auto-confirmação |
| Phone | 20 | Principal | Identificação secundária |
| Date of Birth | 20 | Principal | Verificação de identidade |
| Name (First+Last) | 20 | Principal | Confirmação de identidade |
| Policy Value | 20 | Condicional | Só conta se algum principal coincidir |
| AgentNumber | 20 | Condicional | Campo obrigatório para auto-confirmação |

**Pontuação Máxima**: 100 pontos

### 🔍 **Classificação por Score:**

- **> 80 pontos + PolicyNumber + AgentNumber** → ✅ **Auto Confirm**
- **50-80 pontos** → ⚠️ **Manual Review**  
- **< 50 pontos** → ❌ **New Record**

### 🚀 **Como Testar:**

1. **Faça upload** do arquivo `example.csv`
2. **Verifique os logs** no console do navegador
3. **Confirme os resultados** na interface:
   - 6 registros em verde (Auto Confirm)
   - 8 registros em amarelo (Manual Review)
   - 6 registros em vermelho (New Record)
4. **Verifique na aba "Status Updates"** os registros criados

### 📝 **Logs Esperados:**

```
📊 CSV parseado: 20 registros
📊 APP records encontrados: 15
🔍 Processando registro 1: {policyNumber: "0104230020", ...}
✅ Resultado para registro 1: {status: "auto_confirm", score: 100, matches: 1}
🔍 Processando registro 3: {policyNumber: "0104230020", ...}
✅ Resultado para registro 3: {status: "manual_review", score: 60, matches: 1}
🔍 Processando registro 9: {policyNumber: "999999999", ...}
✅ Resultado para registro 9: {status: "new_record", score: 0, matches: 0}
```

### 🎯 **Objetivo:**

Este arquivo de teste garante que todos os cenários do sistema de matching sejam testados:
- ✅ **Auto Confirm**: Score > 80% + campos mandatórios
- ⚠️ **Manual Review**: Score 50-80%
- ❌ **New Record**: Score < 50% ou sem campos mandatórios
- 🔄 **Campos Condicionais**: Só contam se algum principal coincidir
