@echo off
REM Script para Windows - Construir y ejecutar solo el frontend

echo 🚀 Construyendo proyecto TableroPavas...

REM Construir imagen del frontend
echo 📦 Construyendo imagen del frontend...
docker build -t tablero-pavas-frontend .

REM Ejecutar contenedor del frontend
echo 🏃 Ejecutando contenedor del frontend...
docker run -d -p 80:80 --name tablero-frontend tablero-pavas-frontend

echo ✅ ¡Proyecto desplegado!
echo 🌐 Frontend disponible en: http://localhost
echo.
echo Para detener: docker stop tablero-frontend
echo Para eliminar: docker rm tablero-frontend

pause
