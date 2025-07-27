# Multi-stage build para optimizar la imagen final
# Etapa 1: Construir el frontend React
FROM node:16-alpine AS build-frontend

# Establecer directorio de trabajo
WORKDIR /app/client

# Copiar archivos de dependencias del frontend
COPY client/package*.json ./

# Configurar variables de entorno para evitar problemas de OpenSSL
ENV NODE_OPTIONS=--openssl-legacy-provider

# Instalar dependencias con legacy peer deps para evitar conflictos
RUN npm install --legacy-peer-deps

# Copiar código fuente del frontend
COPY client/ ./

# Construir la aplicación React para producción
RUN npm run build

# Etapa 2: Configurar Nginx para servir la aplicación
FROM nginx:alpine

# Remover la configuración default de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos construidos del frontend desde la etapa anterior
COPY --from=build-frontend /app/client/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx (la crearemos después)
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]