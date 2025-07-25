import express from 'express';
import { verifyToken, devAuth } from '../../common/middlewares/auth.middleware.js';
import {
    getTasks,
    createTask,
    updateTaskStatus
} from './tablero.controller.js';

const tableroRoutes = express.Router();

console.log('📋 Configurando rutas del tablero...');

// Decidir qué middleware usar basado en el entorno
const authMiddleware = process.env.NODE_ENV === 'production' ? verifyToken : devAuth;

// Rutas del tablero con autenticación
tableroRoutes.get('/tasks', authMiddleware, getTasks);
tableroRoutes.post('/tasks', authMiddleware, createTask);
tableroRoutes.put('/tasks/:taskId/status', authMiddleware, updateTaskStatus);

console.log('✅ Rutas del tablero configuradas');

export default tableroRoutes;