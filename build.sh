#!/bin/bash

# Script para build e deploy no Back4App
echo "🚀 Iniciando build do PDF Extractor API..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Build da imagem
echo "📦 Construindo imagem Docker..."
docker build -t pdf-extractor-api:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "🐳 Imagem criada: pdf-extractor-api:latest"
    
    # Mostrar informações da imagem
    echo "📊 Informações da imagem:"
    docker images pdf-extractor-api:latest
    
    echo ""
    echo "🚀 Para rodar localmente:"
    echo "docker run -p 3000:80 pdf-extractor-api:latest"
    echo ""
    echo "🌐 Acesse: http://localhost:3000"
    echo ""
    echo "📋 Para deploy no Back4App:"
    echo "1. Faça push da imagem para um registry (Docker Hub, etc.)"
    echo "2. Configure o Back4App para usar a imagem"
    echo "3. Defina a porta 80 como porta de entrada"
    
else
    echo "❌ Erro no build da imagem Docker"
    exit 1
fi
