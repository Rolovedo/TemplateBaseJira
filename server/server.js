import http from "http";
import { app } from "./app.js";
import { init } from "./socket.js";

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
