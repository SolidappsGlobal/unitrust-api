# 🚀 Back4App Configuration - PDF Extractor API

## 📋 App Created Successfully!

**App Name:** `pdf-extractor-api`  
**Application ID:** `mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK`  
**Subdomain:** `wquespdf-extractor-api.b4a.app`  
**URL:** https://wquespdf-extractor-api.b4a.app

## 🔑 Access Keys

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

- **Status:** ✅ Enabled
- **Subdomain:** `wquespdf-extractor-api.b4a.app`
- **URL:** https://wquespdf-extractor-api.b4a.app

## 📦 Project Deploy

### Option 1: Manual Deploy via Dashboard
1. Access: https://console.back4app.com/
2. Select the app `pdf-extractor-api`
3. Go to "Web Hosting" → "Deploy"
4. Upload built files

### Option 2: Deploy via CLI (if available)
```bash
# Build project
npm run build

# Deploy to Back4App
# (specific Back4App CLI commands)
```

### Option 3: Deploy via GitHub Actions
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
        # Add specific Back4App steps
```

## 🔧 Project Configuration

### Environment Variables
Create a `.env` file with:
```env
VITE_PARSE_APP_ID=mK60GEj1uzfoICD3dFxW75KZ5K77bbBoaWeeENeK
VITE_PARSE_JS_KEY=gOSZEC3DvriLcA6lUoPWULQEjTz04teaNt3yieOX
VITE_PARSE_SERVER_URL=https://parseapi.back4app.com
VITE_PARSE_LIVE_QUERY_URL=wss://wquespdf-extractor-api.b4a.app
```

### Parse SDK (if needed)
```bash
npm install parse
```

## 📊 Monitoring

- **Dashboard:** https://console.back4app.com/
- **Logs:** Available in dashboard
- **Analytics:** Integrated in Back4App
- **Health Check:** https://wquespdf-extractor-api.b4a.app/health

## 🚀 Next Steps

1. **Configure environment variables** in the project
2. **Build** the project: `npm run build`
3. **Deploy** to Back4App
4. **Test** the application at: https://wquespdf-extractor-api.b4a.app

## 📞 Support

- **Documentation:** https://docs.back4app.com/
- **Community:** https://community.back4app.com/
- **Status:** https://status.back4app.com/