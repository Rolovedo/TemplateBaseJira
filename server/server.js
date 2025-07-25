import http from "http";
import { app } from "./app.js";
import { init } from "./socket.js";

// Importar rutas
import authRoutes from './src/modules/auth/auth.routes.js';
import tableroRoutes from './src/modules/tablero/tablero.routes.js';

// Configurar rutas ANTES de crear el servidor
app.use('/api/auth', authRoutes);
app.use('/api/tablero', tableroRoutes);

console.log('✅ Rutas de autenticación registradas en /api/auth');
console.log('✅ Rutas del tablero registradas en /api/tablero');

// Crear servidor HTTP
const server = http.createServer(app);

// Inicializar Socket.IO
init(server);

// Configurar puerto y escuchar
const PORT = process.env.PORT || 5037;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

export { server };
