# 🐳 Despliegue con Docker - TableroPavas

## 📋 Requisitos previos

- Docker Desktop instalado
- Docker Compose (incluido con Docker Desktop)

## 🚀 Opciones de despliegue

### Opción 1: Solo Frontend (Nginx)

Si solo quieres desplegar el frontend estático:

```bash
# Construir la imagen
docker build -t tablero-pavas-frontend .

# Ejecutar el contenedor
docker run -d -p 80:80 --name tablero-frontend tablero-pavas-frontend
```

O usar el script:
```bash
# Windows
deploy-frontend.bat

# Linux/Mac
chmod +x deploy-frontend.sh
./deploy-frontend.sh
```

### Opción 2: Proyecto Completo (Frontend + Backend + DB)

Para desplegar la aplicación completa con base de datos:

```bash
# Construir y ejecutar todos los servicios
docker-compose up --build -d
```

O usar el script:
```bash
# Windows
deploy-full.bat
```

## 🔧 Comandos útiles

### Ver contenedores activos
```bash
docker ps
```

### Ver logs
```bash
# Solo frontend
docker logs tablero-frontend

# Proyecto completo
docker-compose logs -f
```

### Detener servicios
```bash
# Solo frontend
docker stop tablero-frontend
docker rm tablero-frontend

# Proyecto completo
docker-compose down
```

### Reconstruir servicios
```bash
docker-compose up --build -d
```

## 🌐 URLs de acceso

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Base de datos**: localhost:3306

## 📁 Estructura de archivos Docker

```
TableroPavasCopia/
├── DockerFile              # Imagen del frontend con Nginx
├── nginx.conf              # Configuración de Nginx
├── docker-compose.yml      # Orquestación de servicios
├── .dockerignore          # Archivos a ignorar en el build
├── deploy-frontend.bat     # Script Windows - solo frontend
├── deploy-full.bat        # Script Windows - proyecto completo
└── server/
    └── Dockerfile         # Imagen del backend Node.js
```

## 🛠️ Configuración personalizada

### Variables de entorno (docker-compose)

Puedes modificar las variables en `docker-compose.yml`:

- `JWT_SECRET`: Clave secreta para JWT
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos

### Configuración de Nginx

Modifica `nginx.conf` para:
- Cambiar puertos
- Configurar proxy pass
- Ajustar configuración de cache
- Añadir headers de seguridad

## 🔒 Seguridad

- El backend corre con usuario no-root
- Nginx incluye headers de seguridad
- Variables sensibles están en archivos de entorno
- Base de datos con credenciales configurables

## 🐞 Troubleshooting

### Error de permisos
```bash
# Linux/Mac: dar permisos a scripts
chmod +x *.sh
```

### Limpiar Docker
```bash
# Eliminar imágenes sin usar
docker image prune -f

# Eliminar todo (cuidado)
docker system prune -a -f
```

### Ver logs detallados
```bash
docker-compose logs --tail=50 -f [servicio]
```
