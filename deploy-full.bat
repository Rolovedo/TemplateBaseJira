@echo off
REM Script para Windows - Construir y ejecutar proyecto completo con docker-compose

echo 🚀 Construyendo proyecto completo TableroPavas...
echo.
echo ⚠️  IMPORTANTE: Asegúrate de que Docker Desktop esté ejecutándose
echo.

REM Verificar si Docker está funcionando
echo 🔍 Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está instalado o no está en el PATH
    echo 💡 Instala Docker Desktop desde https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker Desktop no está ejecutándose
    echo 💡 Inicia Docker Desktop y espera a que esté listo
    pause
    exit /b 1
)

echo ✅ Docker está funcionando correctamente
echo.

REM Detener contenedores existentes
echo 🛑 Deteniendo contenedores existentes...
docker-compose down

REM Construir y ejecutar con docker-compose
echo 📦 Construyendo y ejecutando servicios...
echo ⏱️  Este proceso puede tomar varios minutos...
docker-compose up --build -d

if %errorlevel% equ 0 (
    echo.
    echo ✅ ¡Proyecto completo desplegado exitosamente!
    echo 🌐 Frontend disponible en: http://localhost
    echo 🔧 Backend disponible en: http://localhost:5000
    echo 🗄️ Base de datos MySQL en puerto: 3306
    echo.
    echo 📋 Comandos útiles:
    echo    Ver logs: docker-compose logs -f
    echo    Detener: docker-compose down
    echo    Reiniciar: docker-compose restart
) else (
    echo.
    echo ❌ Error durante el despliegue
    echo 💡 Revisa los logs con: docker-compose logs
)

echo.
pause
