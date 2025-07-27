// Middleware de autenticación para las rutas de Tablero
import jwt from "jsonwebtoken";
import { pool } from "../configs/database.config.js";

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_para_tablero_2024';

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

        console.log('🔑 Token recibido:', token.substring(0, 20) + '...');

        // Verificar el token JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token decodificado:', decoded);

        // Verificar que el usuario existe en la base de datos
        const [users] = await pool.execute(
            'SELECT usu_id, usu_nombre, usu_email, usu_estado FROM usuarios WHERE usu_id = ? AND usu_estado = 1',
            [decoded.usu_id]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido o inactivo'
            });
        }

        // Agregar información del usuario a la request
        req.user = {
            usu_id: users[0].usu_id,
            nombre: users[0].usu_nombre,
            email: users[0].usu_email,
            ...decoded
        };

        console.log('👤 Usuario autenticado:', req.user);
        next();

    } catch (error) {
        console.error('❌ Error en verificación de token:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware para desarrollo (sin verificación estricta)
 */
export const devAuth = (req, res, next) => {
    console.log('🔧 Modo desarrollo - Autenticación simulada');
    
    req.user = {
        usu_id: 1,
        nombre: 'Administrador Sistema',
        email: 'admin@tablero.com'
    };
    
    console.log('👤 Usuario simulado:', req.user);
    next();
};

/**
 * Middleware principal para verificar token JWT
 */
export const verifyToken = async (req, res, next) => {
    try {
        console.log('🔐 Verificando token de autenticación...');
        
        const authHeader = req.headers.authorization;
        console.log('📋 Authorization Header:', authHeader);
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de autorización requerido'
            });
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        console.log('🔑 Token recibido:', token.substring(0, 20) + '...');

        // Verificar el token JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token decodificado:', decoded);

        // Agregar información del usuario a la request
        req.user = {
            usu_id: decoded.usu_id || decoded.id,
            nombre: decoded.nombre || decoded.name,
            email: decoded.email,
            ...decoded
        };

        console.log('👤 Usuario autenticado:', req.user);
        next();

    } catch (error) {
        console.error('❌ Error en verificación de token:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

/**
 * Middleware que decide entre verificación real y desarrollo
 */
export const authMiddleware = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        return devAuth(req, res, next);
    } else {
        return authenticateToken(req, res, next);
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
                [req.user.usu_id]
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
            console.error('Error verificando rol:', error);
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
        const userId = req.user.usu_id;

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
        console.error('Error verificando permisos de tarea:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
