// Middleware de autenticación para las rutas de Tablero
import jwt from "jsonwebtoken";
import { pool } from "../configs/database.config.js";
import { logger } from "../utils/logger.js";

/**
 * Middleware de autenticación usando JWT
 */
export const authenticateToken = async (req, res, next) => {
    try {
        // Obtener token del header Authorization o de cookies
        let token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            token = req.cookies?.tokenPONTO || req.cookies?.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Obtener información del usuario desde la base de datos
        const [userRows] = await pool.execute(
            'SELECT id, name, email FROM users WHERE id = ? AND active = 1',
            [decoded.userId || decoded.id]
        );

        if (userRows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        // Agregar información del usuario a la request
        req.user = {
            id: userRows[0].id,
            name: userRows[0].name,
            email: userRows[0].email
        };

        next();

    } catch (error) {
        logger.error('Error en middleware de autenticación:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para verificar roles específicos
 */
export const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            // Verificar si el usuario tiene perfil de desarrollador en tablero
            const [developerRows] = await pool.execute(
                'SELECT rol FROM tablero_desarrolladores WHERE usuario_id = ? AND esta_activo = 1',
                [req.user.id]
            );

            if (developerRows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario sin acceso al sistema del tablero'
                });
            }

            const userRole = developerRows[0].rol;

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a este recurso'
                });
            }

            req.user.tableroRole = userRole;
            next();

        } catch (error) {
            logger.error('Error verificando rol:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};

/**
 * Middleware para verificar si el usuario puede modificar una tarea
 */
export const canModifyTask = async (req, res, next) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;

        // Obtener información de la tarea
        const [taskRows] = await pool.execute(
            `SELECT 
                asignado_a, 
                creado_por,
                estado
            FROM tablero_tareas 
            WHERE id = ?`,
            [taskId]
        );

        if (taskRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tarea no encontrada'
            });
        }

        const task = taskRows[0];
        const userRole = req.user.tableroRole;

        // Verificar permisos
        const canModify = 
            userRole === 'administrador' || 
            userRole === 'supervisor' ||
            task.asignado_a === userId ||
            task.creado_por === userId;

        if (!canModify) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para modificar esta tarea'
            });
        }

        req.task = task;
        next();

    } catch (error) {
        logger.error('Error verificando permisos de tarea:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Alias para compatibilidad
export const authMiddleware = authenticateToken;
