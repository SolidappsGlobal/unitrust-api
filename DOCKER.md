# 🐳 Docker Setup - PDF Extractor API

Este projeto está configurado para rodar em containers Docker, otimizado para deploy no Back4App.

## 📋 Pré-requisitos

- Docker instalado
- Node.js 18+ (para desenvolvimento local)
- Conta no Back4App

## 🚀 Como usar

### Desenvolvimento Local

```bash
# Build da imagem
docker build -t pdf-extractor-api .

# Rodar localmente
docker run -p 3000:80 pdf-extractor-api

# Ou usar docker-compose
docker-compose up --build
```

### Deploy no Back4App

1. **Build da imagem:**
   ```bash
   docker build -t pdf-extractor-api:latest .
   ```

2. **Tag para registry:**
   ```bash
   docker tag pdf-extractor-api:latest your-registry/pdf-extractor-api:latest
   ```

3. **Push para registry:**
   ```bash
   docker push your-registry/pdf-extractor-api:latest
   ```

4. **Configurar no Back4App:**
   - Use a imagem: `your-registry/pdf-extractor-api:latest`
   - Porta de entrada: `80`
   - Health check: `/health`

## 🏗️ Estrutura do Docker

### Multi-stage Build
- **Stage 1 (builder):** Instala dependências e faz build do Vite
- **Stage 2 (production):** Serve os arquivos estáticos com Nginx

### Otimizações
- ✅ Imagem Alpine (menor tamanho)
- ✅ Compressão Gzip habilitada
- ✅ Cache de assets estáticos
- ✅ Health check endpoint
- ✅ Headers de segurança
- ✅ Fallback para SPA

## 📊 Endpoints

- `GET /` - Aplicação principal
- `GET /health` - Health check
- `GET /assets/*` - Assets estáticos (com cache)

## 🔧 Configurações

### Variáveis de Ambiente
```bash
NODE_ENV=production
```

### Portas
- **Container:** 80 (Nginx)
- **Host:** 3000 (desenvolvimento)

## 🐛 Troubleshooting

### Build falha
```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild sem cache
docker build --no-cache -t pdf-extractor-api .
```

### Container não inicia
```bash
# Ver logs
docker logs <container_id>

# Verificar se a porta está livre
netstat -tulpn | grep :3000
```

### Performance
- A imagem final tem ~50MB
- Build time: ~2-3 minutos
- Startup time: ~5-10 segundos

## 📝 Scripts Úteis

```bash
# Build automático
chmod +x build.sh
./build.sh

# Limpeza completa
docker system prune -a --volumes

# Inspecionar imagem
docker inspect pdf-extractor-api:latest
```
