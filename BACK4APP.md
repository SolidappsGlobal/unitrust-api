# 🚀 Back4App Configuration - PDF Extractor API

## 📋 App Criado com Sucesso!

**App Name:** `pdf-extractor-api`  
**Application ID:** `mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK`  
**Subdomain:** `wquespdf-extractor-api.b4a.app`  
**URL:** https://wquespdf-extractor-api.b4a.app

## 🔑 Chaves de Acesso

```json
{
  "applicationId": "mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK",
  "masterKey": "ZDYmU9PLUhJRhTscXJGBFlU8wThrKY6Q0alTtZu2",
  "javascriptKey": "gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX",
  "restKey": "T6yOY12KmtVG1KyvPgd8TaFf7fp41g1Ch9AKhsYy",
  "webhookKey": "q5ZpNCSYuHuSwdKtXmKSEOupxx0sOsblPMHBAZPH"
}
```

## 🌐 Web Hosting

- **Status:** ✅ Ativado
- **Subdomain:** `wquespdf-extractor-api.b4a.app`
- **URL:** https://wquespdf-extractor-api.b4a.app

## 📦 Deploy do Projeto

### Opção 1: Deploy Manual via Dashboard
1. Acesse: https://console.back4app.com/
2. Selecione o app `pdf-extractor-api`
3. Vá em "Web Hosting" → "Deploy"
4. Faça upload dos arquivos buildados

### Opção 2: Deploy via CLI (se disponível)
```bash
# Build do projeto
npm run build

# Deploy para Back4App
# (comandos específicos do Back4App CLI)
```

### Opção 3: Deploy via GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Back4App
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Back4App
        # Adicionar steps específicos do Back4App
```

## 🔧 Configuração do Projeto

### Variáveis de Ambiente
Crie um arquivo `.env` com:
```env
VITE_PARSE_APP_ID=mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK
VITE_PARSE_JS_KEY=gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX
VITE_PARSE_SERVER_URL=https://parseapi.back4app.com
VITE_PARSE_LIVE_QUERY_URL=wss://wquespdf-extractor-api.b4a.app
```

### Parse SDK (se necessário)
```bash
npm install parse
```

## 📊 Monitoramento

- **Dashboard:** https://console.back4app.com/
- **Logs:** Disponível no dashboard
- **Analytics:** Integrado no Back4App
- **Health Check:** https://wquespdf-extractor-api.b4a.app/health

## 🚀 Próximos Passos

1. **Configurar variáveis de ambiente** no projeto
2. **Fazer build** do projeto: `npm run build`
3. **Deploy** para o Back4App
4. **Testar** a aplicação em: https://wquespdf-extractor-api.b4a.app

## 📞 Suporte

- **Documentação:** https://docs.back4app.com/
- **Community:** https://community.back4app.com/
- **Status:** https://status.back4app.com/
