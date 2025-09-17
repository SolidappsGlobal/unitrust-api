# 🐳 Docker Setup - PDF Extractor API

This project is configured to run in Docker containers, optimized for deployment on Back4App.

## 📋 Prerequisites

- Docker installed
- Node.js 18+ (for local development)
- Back4App account

## 🚀 How to use

### Local Development

```bash
# Build image
docker build -t pdf-extractor-api .

# Run locally
docker run -p 3000:80 pdf-extractor-api

# Or use docker-compose
docker-compose up --build
```

### Deploy to Back4App

1. **Build image:**
   ```bash
   docker build -t pdf-extractor-api:latest .
   ```

2. **Tag for registry:**
   ```bash
   docker tag pdf-extractor-api:latest your-registry/pdf-extractor-api:latest
   ```

3. **Push to registry:**
   ```bash
   docker push your-registry/pdf-extractor-api:latest
   ```

4. **Configure in Back4App:**
   - Use image: `your-registry/pdf-extractor-api:latest`
   - Entry port: `80`
   - Health check: `/health`

## 🏗️ Docker Structure

### Multi-stage Build
- **Stage 1 (builder):** Installs dependencies and builds with Vite
- **Stage 2 (production):** Serves static files with Nginx

### Optimizations
- ✅ Alpine image (smaller size)
- ✅ Gzip compression enabled
- ✅ Static assets caching
- ✅ Health check endpoint
- ✅ Security headers
- ✅ SPA fallback

## 📊 Endpoints

- `GET /` - Main application
- `GET /health` - Health check
- `GET /assets/*` - Static assets (with cache)

## 🔧 Configurations

### Environment Variables
```bash
NODE_ENV=production
```

### Ports
- **Container:** 80 (Nginx)
- **Host:** 3000 (development)

## 🐛 Troubleshooting

### Build fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t pdf-extractor-api .
```

### Container doesn't start
```bash
# Check logs
docker logs <container_id>

# Check if port is free
netstat -tulpn | grep :3000
```

### Performance
- Final image size: ~50MB
- Build time: ~2-3 minutes
- Startup time: ~5-10 seconds

## 📝 Useful Scripts

```bash
# Automatic build
chmod +x build.sh
./build.sh

# Complete cleanup
docker system prune -a --volumes

# Inspect image
docker inspect pdf-extractor-api:latest
```