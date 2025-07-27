#!/bin/bash

# Script para construir y ejecutar el proyecto completo

echo "🚀 Construyendo proyecto TableroPavas..."

# Construir solo el frontend con Nginx
echo "📦 Construyendo imagen del frontend..."
docker build -t tablero-pavas-frontend .

# Ejecutar solo el frontend
echo "🏃 Ejecutando contenedor del frontend..."
docker run -d -p 80:80 --name tablero-frontend tablero-pavas-frontend

echo "✅ ¡Proyecto desplegado!"
echo "🌐 Frontend disponible en: http://localhost"
echo ""
echo "Para detener: docker stop tablero-frontend"
echo "Para eliminar: docker rm tablero-frontend"
