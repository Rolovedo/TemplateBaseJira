# Guía para Ejecutar Backend y Frontend - Sistema Jira

## 📋 Requisitos Previos

### Software necesario:
- ✅ **Node.js** (versión 14 o superior)
- ✅ **MySQL Server** funcionando
- ✅ **Base de datos** instalada (seguir INSTALACION_BD.md)
- ✅ **Git** (opcional)

### Verificar instalaciones:
```bash
node --version
npm --version
mysql --version
```

---

## 🗄️ PARTE 1: CONFIGURAR Y EJECUTAR BACKEND

### Paso 1: Navegar al directorio del servidor
```bash
cd server
```

### Paso 2: Instalar dependencias del backend
```bash
npm install
```

### Paso 3: Configurar variables de entorno

#### 3.1 Crear archivo `.env` en la carpeta `server/`
```bash
# En Windows (PowerShell)
New-Item -Path ".env" -ItemType File

# En Linux/Mac
touch .env
```

#### 3.2 Configurar el archivo `.env`
Abrir el archivo `.env` y agregar:

```env
# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tu_nombre_base_datos
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_CONNECTION_LIMIT=10

# Configuración del servidor
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=tu_clave_secreta_super_segura_aqui_2024
JWT_EXPIRES_IN=24h

# WhatsApp Configuration (opcional por ahora)
WHATSAPP_TOKEN=tu_token_whatsapp
WHATSAPP_PHONE_ID=tu_phone_id

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Logs
LOG_LEVEL=info
```

### Paso 4: Verificar estructura de archivos
Asegurar que existen estos archivos en `server/`:
- ✅ `package.json`
- ✅ `server.js` o `app.js`
- ✅ `src/modules/main.routes.js`
- ✅ `src/common/configs/database.config.js`

### Paso 5: Actualizar configuración de base de datos

#### 5.1 Verificar `database.config.js`
El archivo debería verse así:
```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});
```

### Paso 6: Ejecutar el backend
```bash
# Opción 1: Modo desarrollo (con nodemon)
npm run dev

# Opción 2: Modo producción
npm start

# Opción 3: Si no funcionan los anteriores
node server.js
```

### Paso 7: Verificar que el backend funciona
- ✅ Ver mensaje: `"Servidor corriendo en puerto 5000"`
- ✅ Probar endpoint: `http://localhost:5000/api/health`
- ✅ Verificar conexión a BD en los logs

---

## 🖥️ PARTE 2: CONFIGURAR Y EJECUTAR FRONTEND

### Paso 1: Abrir nueva terminal
Mantener el backend corriendo y abrir nueva terminal/consola

### Paso 2: Navegar al directorio del cliente
```bash
cd client
```

### Paso 3: Instalar dependencias del frontend
```bash
npm install
```

### Paso 4: Verificar dependencias adicionales para Jira
Verificar que estas dependencias estén en `package.json`:
```json
{
  "dependencies": {
    "react-beautiful-dnd": "^13.1.1",
    "react-router-dom": "^6.0.0",
    "primereact": "^7.2.0",
    "primeicons": "^5.0.0",
    "primeflex": "^3.1.0",
    "chart.js": "^3.9.1",
    "react-chartjs-2": "^4.3.1"
  }
}
```

Si falta alguna, instalarla:
```bash
npm install react-beautiful-dnd react-router-dom chart.js react-chartjs-2
```

### Paso 5: Configurar variables de entorno del frontend

#### 5.1 Crear archivo `.env` en la carpeta `client/`
```bash
# Crear archivo .env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
REACT_APP_APP_NAME=Sistema Jira
```

### Paso 6: Verificar archivo `src/routes.js`
Confirmar que incluye las rutas de Jira:
```javascript
// Importaciones Jira
import JiraBoard from './pages/jira/JiraBoard';
import TaskManagement from './pages/jira/TaskManagement';
import DeveloperManagement from './pages/jira/DeveloperManagement';
import TaskAssignment from './pages/jira/TaskAssignment';
import JiraGuide from './pages/jira/JiraGuide';

// Rutas Jira
{ path: '/jira/board', component: JiraBoard },
{ path: '/jira/tasks', component: TaskManagement },
{ path: '/jira/developers', component: DeveloperManagement },
{ path: '/jira/assignment', component: TaskAssignment },
{ path: '/jira/guide', component: JiraGuide },
```

### Paso 7: Ejecutar el frontend
```bash
# Ejecutar en modo desarrollo
npm start
```

### Paso 8: Verificar que el frontend funciona
- ✅ Browser abre automáticamente en `http://localhost:3000`
- ✅ Aplicación carga sin errores
- ✅ Menu de navegación muestra opciones de Jira

---

## 🔄 PARTE 3: VERIFICAR INTEGRACIÓN COMPLETA

### Paso 1: Probar navegación a Jira
1. Ir a `http://localhost:3000`
2. Login con usuario existente
3. Navegar a secciones Jira:
   - `/jira/board` - Tablero Kanban
   - `/jira/tasks` - Gestión de Tareas
   - `/jira/developers` - Gestión de Desarrolladores
   - `/jira/assignment` - Asignación de Tareas
   - `/jira/guide` - Guía de Usuario

### Paso 2: Probar APIs del backend
Usar Postman o navegador para probar:
```
GET  http://localhost:5000/api/jira/tasks
GET  http://localhost:5000/api/jira/developers
POST http://localhost:5000/api/jira/tasks
```

### Paso 3: Verificar logs
- ✅ Backend: logs de conexión a BD y requests
- ✅ Frontend: sin errores en consola del navegador

---

## 🛠️ SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Cannot connect to database"
```bash
# Verificar que MySQL está corriendo
# Windows
net start mysql

# Verificar credenciales en .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
```

### Error: "Port 5000 already in use"
```bash
# Cambiar puerto en .env
PORT=5001

# O matar proceso en puerto 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID [número_proceso] /F
```

### Error: "Module not found" en frontend
```bash
# Instalar dependencias faltantes
npm install

# Limpiar cache si es necesario
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Error: "Cannot find module" en backend
```bash
# Verificar que existe el archivo .env
# Copiar desde .env.example si no existe
cp .env.example .env

# Verificar la estructura de archivos del proyecto
# Asegurar que existen los middlewares y configuraciones

# Si falta algún archivo, verificar que se crearon todos los archivos necesarios
```

### Error: CORS en el frontend
Verificar en `server/.env`:
```env
FRONTEND_URL=http://localhost:3000
```

Y en la configuración de CORS del backend:
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
```

### Error: "Cannot read property of undefined" en componentes Jira
Verificar que:
1. ✅ Todas las páginas Jira existen en `client/src/pages/jira/`
2. ✅ Los estilos SCSS existen en `client/src/pages/jira/styles/`
3. ✅ Las rutas están correctamente configuradas

---

## 📝 SCRIPTS ÚTILES

### Backend (server/)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  }
}
```

### Frontend (client/)
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

---

## 🚀 COMANDOS DE INICIO RÁPIDO

### Terminal 1 (Backend):
```bash
cd server
npm install
npm run dev
```

### Terminal 2 (Frontend):
```bash
cd client
npm install
npm start
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Backend ✅
- [ ] MySQL corriendo
- [ ] Base de datos Jira instalada
- [ ] Archivo `.env` configurado
- [ ] `npm install` ejecutado
- [ ] Servidor corriendo en puerto 5000
- [ ] APIs respondiendo

### Frontend ✅
- [ ] Dependencias instaladas
- [ ] Archivo `.env` configurado
- [ ] Rutas Jira configuradas
- [ ] Aplicación corriendo en puerto 3000
- [ ] Sin errores en consola
- [ ] Navegación a páginas Jira funciona

### Integración ✅
- [ ] Frontend conecta con Backend
- [ ] Datos se cargan desde la BD
- [ ] Autenticación funciona
- [ ] CRUD de tareas funciona
- [ ] Sistema completo operativo

---

¡Una vez completados todos los pasos, tu sistema Jira estará completamente funcional! 🎉
